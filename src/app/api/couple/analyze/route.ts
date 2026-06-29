import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { AppError } from '@/lib/errors';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateContent, getEmbedding } from '@/lib/gemini';
import { safeJsonParse } from '@/lib/json';
import { createLogger } from '@/lib/logger';
import { dbRetry } from '@/lib/db/withRetry';
import { getAuthenticatedCoupleUser } from '@/lib/auth/couple';
import { Couple, DailyQuestion, TreeNode, TreeConnection } from '@/lib/db/types';
import { mapAnswerToOrbe } from '@/services/totemMappingService';

export const runtime = 'edge';

const bodySchema = z.object({
  coupleId: z.string().min(1),
  dailyQuestionId: z.string().min(1),
  userId: z.string().min(1),
  answer: z.string().min(1).max(2000),
});

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const POST = withApiHandler({
  bodySchema,
  async handler({ req, body }) {
    const logger = createLogger({ route: '/api/couple/analyze' });
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const authUser = await getAuthenticatedCoupleUser(req);
    const { coupleId, dailyQuestionId, userId, answer } = body;

    if (userId !== authUser.id) {
      throw new AppError('FORBIDDEN', 'Vous ne pouvez pas soumettre de réponse pour un autre utilisateur.');
    }

    // 1. Fetch the DailyQuestion and verify coupleId
    const { data: dailyQuestion, error: dqError } = await dbRetry<DailyQuestion>(async () =>
      supabaseAdmin
        .from('DailyQuestion')
        .select('*')
        .eq('id', dailyQuestionId)
        .single()
    );

    if (dqError || !dailyQuestion) {
      throw new AppError('NOT_FOUND', 'Question quotidienne introuvable.');
    }
    if (dailyQuestion.coupleId !== coupleId) {
      throw new AppError('FORBIDDEN', 'Cette question ne correspond pas à votre couple.');
    }

    // 2. Fetch the Couple to determine partner role
    const { data: couple, error: coupleError } = await dbRetry<Couple>(async () =>
      supabaseAdmin
        .from('Couple')
        .select('*')
        .eq('id', coupleId)
        .single()
    );

    if (coupleError || !couple) {
      throw new AppError('COUPLE_NOT_FOUND', 'Couple introuvable.');
    }

    const isUser1 = couple.user1Id === userId;
    const isUser2 = couple.user2Id === userId;
    if (!isUser1 && !isUser2) {
      throw new AppError('FORBIDDEN', "Vous ne faites pas partie de ce couple.");
    }

    // Check if this partner already answered
    if ((isUser1 && dailyQuestion.user1Answered) || (isUser2 && dailyQuestion.user2Answered)) {
      throw new AppError('BAD_REQUEST', 'Vous avez déjà répondu à cette question.');
    }

    // 3. Calculate embedding of the answer
    const embedding = await getEmbedding(answer);

    // 4. Update the DailyQuestion with the answer
    const updateFields: Record<string, unknown> = {};
    if (isUser1) {
      updateFields.user1Answer = answer;
      updateFields.user1Answered = true;
    } else {
      updateFields.user2Answer = answer;
      updateFields.user2Answered = true;
    }

    const { error: updateError } = await dbRetry<DailyQuestion>(async () =>
      supabaseAdmin
        .from('DailyQuestion')
        .update(updateFields)
        .eq('id', dailyQuestionId)
    );

    if (updateError) {
      logger.error('Échec de la mise à jour de la DailyQuestion', { dailyQuestionId }, updateError);
      throw new AppError('INTERNAL_ERROR', 'Impossible de sauvegarder votre réponse.');
    }

    // 4b. Update Totem Orbe based on answer content (fire-and-forget)
    mapAnswerToOrbe(coupleId, userId, couple.user1Id, answer).catch((err) => {
      logger.warn('Totem orbe mapping failed (non-blocking)', {}, err);
    });

    // 5. Get or create a Tree for this couple
    let tree: { id: string };
    const { data: existingTree } = await dbRetry<{ id: string }>(async () =>
      supabaseAdmin
        .from('Tree')
        .select('id')
        .eq('coupleId', coupleId)
        .maybeSingle()
    );

    if (existingTree) {
      tree = existingTree;
    } else {
      const { data: newTree, error: treeError } = await dbRetry<{ id: string }>(async () =>
        supabaseAdmin
          .from('Tree')
          .insert({ coupleId })
          .select('id')
          .single()
      );

      if (treeError || !newTree) {
        logger.error('Échec de la création du Tree', { coupleId }, treeError);
        throw new AppError('INTERNAL_ERROR', "Impossible de créer l'arbre neuronal.");
      }
      tree = newTree;
    }

    // 6. Create a TreeNode with the embedding
    const questionText = dailyQuestion.customText || '';
    const { data: newNode, error: nodeError } = await dbRetry<{ id: string }>(async () =>
      supabaseAdmin
        .from('TreeNode')
        .insert({
          treeId: tree.id,
          questionId: dailyQuestion.questionId,
          customText: questionText,
          intensity: 1,
          category: 'daily',
          answeredAt: new Date().toISOString(),
          answeredBy: [userId],
          embedding,
        })
        .select('id')
        .single()
    );

    if (nodeError || !newNode) {
      logger.error('Échec de la création du TreeNode', { treeId: tree.id }, nodeError);
      throw new AppError('INTERNAL_ERROR', 'Impossible de sauvegarder le nœud de réponse.');
    }

    // 7. Check if BOTH partners have now answered
    const bothAnswered = isUser1
      ? dailyQuestion.user2Answered === true
      : dailyQuestion.user1Answered === true;

    if (!bothAnswered) {
      return NextResponse.json({
        success: true,
        status: 'WAITING',
        isRevealed: false,
      });
    }

    // Both answered — run the analysis pipeline
    logger.info(`Les deux partenaires ont répondu, lancement de l'analyse`, { dailyQuestionId });

    // 7a. Fetch both TreeNodes for this question to get embeddings
    const otherAnswer = isUser1 ? dailyQuestion.user2Answer : dailyQuestion.user1Answer;
    const currentAnswer = answer;

    // Get the partner's TreeNode (latest node for this question by the other user)
    const { data: partnerNodes } = await dbRetry<TreeNode[]>(async () =>
      supabaseAdmin
        .from('TreeNode')
        .select('id, embedding')
        .eq('treeId', tree.id)
        .eq('questionId', dailyQuestion.questionId)
        .order('answeredAt', { ascending: false })
        .limit(10)
    );

    // Find the partner's node (not the one we just created)
    const partnerNode = partnerNodes?.find((n: { id: string }) => n.id !== newNode.id);

    let resonanceScore = 0;
    if (partnerNode?.embedding && embedding) {
      resonanceScore = cosineSimilarity(embedding, partnerNode.embedding);
      resonanceScore = Math.max(0, Math.min(1, resonanceScore)); // clamp [0,1]
    }

    // 7b. Create a TreeConnection
    const sourceId = isUser1 ? newNode.id : partnerNode?.id || newNode.id;
    const targetId = isUser1 ? partnerNode?.id || newNode.id : newNode.id;

    const { error: connError } = await dbRetry<TreeConnection>(async () =>
      supabaseAdmin
        .from('TreeConnection')
        .insert({
          treeId: tree.id,
          sourceId,
          targetId,
          resonance: resonanceScore,
          type: 'daily_sync',
        })
    );

    if (connError) {
      logger.warn('Échec de la création de la TreeConnection', { treeId: tree.id }, connError);
    }

    // 7c. Generate AI analysis via Gemini
    const prompt = `Tu es un expert bienveillant et chaleureux en dynamique de couple. Analyse ces deux réponses à la question "${questionText}".

Réponse A : "${isUser1 ? currentAnswer : otherAnswer}"
Réponse B : "${isUser1 ? otherAnswer : currentAnswer}"

Génère un JSON avec les champs suivants :
- alignmentScore : un score de 0 à 1 reflétant leur alignement émotionnel
- resonanceInsight : une phrase poétique et tendre sur leur connexion (pas clinique !)
- partnerAProfile : un objet avec les traits dominants du partenaire A (valeurs, besoins, style de communication)
- partnerBProfile : un objet avec les traits dominants du partenaire B (valeurs, besoins, style de communication)
- actionSuggestion : une micro-action concrète, douce et réaliste pour renforcer leur lien aujourd'hui

Sois poétique, pas psychologue. Parle avec le cœur.`;

    let analysisJson: Record<string, unknown> | null = null;

    try {
      const rawAnalysis = await generateContent(prompt, 'application/json');
      analysisJson = safeJsonParse<Record<string, unknown> | null>(rawAnalysis, null);

      if (!analysisJson) {
        logger.warn('Réponse Gemini non parsable', { rawAnalysis: rawAnalysis.substring(0, 200) });
        throw new AppError('ANALYSIS_FAILED', "L'analyse n'a pas pu être interprétée.");
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Échec de la génération Gemini', {}, error);
      throw new AppError('ANALYSIS_FAILED', "L'analyse IA a échoué. Veuillez réessayer plus tard.");
    }

    // Use Gemini's alignmentScore if available, otherwise keep cosine similarity
    const finalScore =
      typeof analysisJson.alignmentScore === 'number'
        ? analysisJson.alignmentScore
        : resonanceScore;

    // 7d. Update DailyQuestion with analysis results
    const { error: analysisUpdateError } = await dbRetry<DailyQuestion>(async () =>
      supabaseAdmin
        .from('DailyQuestion')
        .update({
          resonanceScore: finalScore,
          analysisJson,
          analysisStatus: 'COMPUTED',
          isAnswered: true,
          isRevealed: false, // Stays locked until 20h
        })
        .eq('id', dailyQuestionId)
    );

    if (analysisUpdateError) {
      logger.error(`Échec de la mise à jour de l'analyse`, { dailyQuestionId }, analysisUpdateError);
      throw new AppError('INTERNAL_ERROR', "Impossible de sauvegarder l'analyse.");
    }

    logger.info('Analyse couple terminée', {
      dailyQuestionId,
      resonanceScore: finalScore,
    });

    return NextResponse.json({
      success: true,
      status: 'COMPUTED',
      isRevealed: false,
    });
  },
});
