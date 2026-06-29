import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { AppError } from '@/lib/errors';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateContent } from '@/lib/gemini';
import { safeJsonParse } from '@/lib/json';
import { createLogger } from '@/lib/logger';
import { dbRetry } from '@/lib/db/withRetry';
import { getAuthenticatedCoupleUser } from '@/lib/auth/couple';
import { Couple, DailyQuestion } from '@/lib/db/types';
import { getUserEntitlements } from '@/lib/monetization/entitlements';

export const runtime = 'edge';

const bodySchema = z.object({
  coupleId: z.string().min(1),
  dailyQuestionId: z.string().min(1),
  step: z.enum(['COMPRENDRE', 'QUESTIONNER', 'AGIR', 'questions', 'action']),
});

export const POST = withApiHandler({
  bodySchema,
  async handler({ req, body }) {
    const logger = createLogger({ route: '/api/couple/protocol' });
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const authUser = await getAuthenticatedCoupleUser(req);
    const { coupleId, dailyQuestionId, step } = body;

    // Normalize step input to match uppercase internally
    let normalizedStep = step.toUpperCase();
    if (normalizedStep === 'QUESTIONS') normalizedStep = 'QUESTIONNER';
    if (normalizedStep === 'ACTION') normalizedStep = 'AGIR';

    // Verify couple membership
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

    if (couple.user1Id !== authUser.id && couple.user2Id !== authUser.id) {
      throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
    }

    // 1. Fetch the DailyQuestion (must be revealed)
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

    if (!dailyQuestion.isRevealed) {
      throw new AppError('FORBIDDEN', "L'analyse n'est pas encore révélée. Patience jusqu'à 20h !");
    }

    const analysisJson = dailyQuestion.analysisJson as Record<string, unknown> | null;
    if (!analysisJson) {
      throw new AppError('NOT_FOUND', "Aucune analyse disponible pour cette question.");
    }

    // Check entitlements and limit free tier to 1 protocol/week
    if (normalizedStep === 'QUESTIONNER' || normalizedStep === 'AGIR') {
      const entitlements = await getUserEntitlements(authUser.id);
      const hasPremium = !!(entitlements?.hasActiveSubscription || entitlements?.hasActivePass || entitlements?.accessibleFeatures?.includes('profiles'));

      if (!hasPremium) {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: unlockedQuestions, error: checkError } = await dbRetry<DailyQuestion[]>(async () =>
          supabaseAdmin
            .from('DailyQuestion')
            .select('id')
            .eq('coupleId', coupleId)
            .eq('protocolOpened', true)
            .neq('id', dailyQuestionId)
            .gt('releasedAt', sevenDaysAgo)
        );

        if (checkError) {
          logger.error('Failed to check protocol opened questions', { coupleId }, checkError);
          throw new AppError('INTERNAL_ERROR', 'Impossible de valider vos accès.');
        }

        if (unlockedQuestions && unlockedQuestions.length >= 1) {
          throw new AppError('PAYMENT_FAILED', 'Vous avez atteint la limite de 1 protocole gratuit par semaine. Abonnez-vous pour un accès illimité.');
        }

        // Mark as opened if not already
        if (!dailyQuestion.protocolOpened) {
          const { error: updateError } = await dbRetry(async () =>
            supabaseAdmin
              .from('DailyQuestion')
              .update({ protocolOpened: true })
              .eq('id', dailyQuestionId)
          );
          if (updateError) {
            logger.warn('Failed to mark protocolOpened', { dailyQuestionId }, updateError);
          }
        }
      }
    }

    // 2. Handle each step
    switch (normalizedStep) {
      case 'COMPRENDRE': {
        return NextResponse.json({
          step: 'COMPRENDRE',
          analysis: analysisJson,
        });
      }

      case 'QUESTIONNER': {
        const resonanceInsight = analysisJson.resonanceInsight || '';
        const partnerAProfile = JSON.stringify(analysisJson.partnerAProfile || {});
        const partnerBProfile = JSON.stringify(analysisJson.partnerBProfile || {});
        const alignmentScore = analysisJson.alignmentScore ?? 0;

        const prompt = `Tu es un guide bienveillant pour les couples. Voici l'analyse d'une question quotidienne :

Score d'alignement : ${alignmentScore}
Insight de résonance : "${resonanceInsight}"
Profil partenaire A : ${partnerAProfile}
Profil partenaire B : ${partnerBProfile}

À partir des écarts et des complémentarités identifiés, génère exactement 3 questions de suivi que le couple pourrait se poser pour mieux se comprendre.

Les questions doivent être :
- Ouvertes et non-jugeantes
- Formulées avec tendresse et curiosité
- Progressives (de la plus douce à la plus profonde)

Réponds en JSON avec le format :
{
  "questions": [
    { "text": "La question 1", "category": "Curiosité" },
    { "text": "La question 2", "category": "Partage" },
    { "text": "La question 3", "category": "Profond" }
  ]
}`;

        try {
          const rawResponse = await generateContent(prompt, 'application/json');
          const parsed = safeJsonParse<{ questions: unknown[] }>(rawResponse, { questions: [] });

          if (!parsed.questions || parsed.questions.length === 0) {
            logger.warn('Gemini a renvoyé un format inattendu pour QUESTIONNER', {
              rawResponse: rawResponse.substring(0, 200),
            });
            throw new AppError('GENERATION_FAILED', 'Impossible de générer les questions de suivi.');
          }

          const questionsWithIds = (parsed.questions ?? []).map((unknownQ, idx) => {
            const q = unknownQ as Record<string, unknown>;
            const text = typeof unknownQ === 'string' ? unknownQ : ((q?.text as string) || '');
            const category = typeof unknownQ === 'string' 
              ? (idx === 0 ? 'Curiosité' : idx === 1 ? 'Partage' : 'Profond') 
              : ((q?.category as string) || (idx === 0 ? 'Curiosité' : idx === 1 ? 'Partage' : 'Profond'));
            
            return {
              id: `proto-q-${dailyQuestionId}-${idx}`,
              text,
              category,
            };
          });

          return NextResponse.json({
            step: 'QUESTIONNER',
            questions: questionsWithIds,
          });
        } catch (error) {
          if (error instanceof AppError) throw error;
          logger.error('Échec de la génération des questions', {}, error);
          throw new AppError('GENERATION_FAILED', 'Impossible de générer les questions de suivi.');
        }
      }

      case 'AGIR': {
        const resonanceInsight = analysisJson.resonanceInsight || '';
        const actionSuggestion = analysisJson.actionSuggestion || '';
        const alignmentScore = analysisJson.alignmentScore ?? 0;

        const prompt = `Tu es un coach de couple doux et pragmatique. Voici le contexte :

Score d'alignement : ${alignmentScore}
Insight : "${resonanceInsight}"
Suggestion initiale : "${actionSuggestion}"

Propose UNE micro-action concrète, spécifique et réalisable aujourd'hui pour renforcer le lien du couple.

La micro-action doit être :
- Simple et immédiate (pas de planification complexe)
- Sensorielle ou émotionnelle (pas intellectuelle)
- Adaptée au niveau d'alignement du couple

Réponds en JSON avec le format :
{
  "action": "description détaillée de la micro-action",
  "difficulty": "facile" | "moyen" | "engagé"
}`;

        try {
          const rawResponse = await generateContent(prompt, 'application/json');
          const parsed = safeJsonParse<{
            action: string;
            difficulty: string;
          }>(rawResponse, { action: '', difficulty: 'moyen' });

          if (!parsed.action) {
            logger.warn('Gemini a renvoyé un format inattendu pour AGIR', {
              rawResponse: rawResponse.substring(0, 200),
            });
            throw new AppError('GENERATION_FAILED', 'Impossible de générer la micro-action.');
          }

          const difficulty = ['facile', 'moyen', 'engagé'].includes(parsed.difficulty)
            ? parsed.difficulty
            : 'moyen';

          return NextResponse.json({
            step: 'AGIR',
            action: {
              text: parsed.action,
              difficulty,
            },
          });
        } catch (error) {
          if (error instanceof AppError) throw error;
          logger.error('Échec de la génération de la micro-action', {}, error);
          throw new AppError('GENERATION_FAILED', 'Impossible de générer la micro-action.');
        }
      }

      default: {
        throw new AppError('VALIDATION_ERROR', 'Étape de protocole invalide.');
      }
    }
  },
});

