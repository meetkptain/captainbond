import { AppError } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { safeJsonParse } from '@/lib/json';
import { generateContent, getEmbedding } from '@/lib/gemini';
import { requireCoupleMembership } from '@/lib/auth/coupleMembership';
import {
  getDailyQuestionById,
  recordAnswer,
  claimAnalysisComputation,
  updateDailyQuestion,
} from '@/lib/db/repositories/dailyQuestionRepository';
import {
  createTree,
  createTreeNode,
  createTreeConnection,
  listTreeNodesByQuestion,
} from '@/lib/db/repositories/treeRepository';
import { getTreeByCouple } from '@/lib/db/repositories/coupleTreeRepository';
import { getCoupleById } from '@/lib/db/repositories/coupleRepository';
import { mapAnswerToOrbe } from '@/services/totemMappingService';
import type { Couple, DailyQuestion, TreeNode } from '@/lib/db/types';

const logger = createLogger({ route: 'coupleAnswerService' });

export type SubmitAnswerResult =
  | { status: 'WAITING'; dailyQuestion: DailyQuestion }
  | { status: 'COMPUTED'; dailyQuestion: DailyQuestion }
  | { status: 'ALREADY_ANSWERED' };

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

async function getOrCreateCoupleTree(coupleId: string): Promise<{ id: string }> {
  const existing = await getTreeByCouple(coupleId);
  if (existing) return existing;
  return createTree({ coupleId });
}

async function runAnalysisPipeline(
  dailyQuestion: DailyQuestion,
  couple: Couple,
  userId: string,
  answer: string,
  embedding: number[],
  newNode: TreeNode
): Promise<void> {
  const tree = await getOrCreateCoupleTree(dailyQuestion.coupleId);

  const allNodes = await listTreeNodesByQuestion(tree.id, dailyQuestion.questionId, 10);
  const partnerNode = allNodes.find((n) => n.id !== newNode.id);

  let resonanceScore = 0;
  if (partnerNode?.embedding && embedding) {
    resonanceScore = cosineSimilarity(embedding, partnerNode.embedding);
    resonanceScore = Math.max(0, Math.min(1, resonanceScore));
  }

  const isUser1 = userId === couple.user1Id;
  const sourceId = isUser1 ? newNode.id : partnerNode?.id || newNode.id;
  const targetId = isUser1 ? partnerNode?.id || newNode.id : newNode.id;

  await createTreeConnection({
    treeId: tree.id,
    sourceId,
    targetId,
    resonance: resonanceScore,
    type: 'daily_sync',
  }).catch((err) => {
    logger.warn('TreeConnection creation failed (non-blocking)', {}, err);
  });

  const prompt = buildAnalysisPrompt(dailyQuestion.customText || '', couple, userId, answer, dailyQuestion);

  let analysisJson: Record<string, unknown> | null = null;
  try {
    const rawAnalysis = await generateContent(prompt, 'application/json');
    analysisJson = safeJsonParse<Record<string, unknown> | null>(rawAnalysis, null);
    if (!analysisJson) {
      logger.warn('Gemini analysis not parseable');
      throw new AppError('ANALYSIS_FAILED', "L'analyse n'a pas pu être interprétée.");
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Gemini analysis generation failed', {}, error);
    throw new AppError('ANALYSIS_FAILED', "L'analyse IA a échoué. Veuillez réessayer plus tard.");
  }

  const finalScore =
    typeof analysisJson.alignmentScore === 'number' ? analysisJson.alignmentScore : resonanceScore;

  await updateDailyQuestion(dailyQuestion.id, {
    resonanceScore: finalScore,
    analysisJson,
    analysisStatus: 'COMPUTED',
    isAnswered: true,
    isRevealed: false,
  });
}

function buildAnalysisPrompt(
  questionText: string,
  couple: Couple,
  userId: string,
  answer: string,
  dailyQuestion: DailyQuestion
): string {
  const isUser1 = userId === couple.user1Id;
  const otherAnswer = isUser1 ? dailyQuestion.user2Answer : dailyQuestion.user1Answer;
  const currentAnswer = answer;

  return `Tu es un expert bienveillant et chaleureux en dynamique de couple. Analyse ces deux réponses à la question "${questionText}".

Réponse A : "${isUser1 ? currentAnswer : otherAnswer}"
Réponse B : "${isUser1 ? otherAnswer : currentAnswer}"

Génère un JSON avec les champs suivants :
- alignmentScore : un score de 0 à 1 reflétant leur alignement émotionnel
- resonanceInsight : une phrase poétique et tendre sur leur connexion (pas clinique !)
- partnerAProfile : un objet avec les traits dominants du partenaire A (valeurs, besoins, style de communication)
- partnerBProfile : un objet avec les traits dominants du partenaire B (valeurs, besoins, style de communication)
- actionSuggestion : une micro-action concrète, douce et réaliste pour renforcer leur lien aujourd'hui

Sois poétique, pas psychologue. Parle avec le cœur.`;
}

export async function submitAnswer(
  coupleId: string,
  dailyQuestionId: string,
  userId: string,
  answer: string
): Promise<SubmitAnswerResult> {
  await requireCoupleMembership(coupleId, userId);

  const dailyQuestion = await getDailyQuestionById(dailyQuestionId);
  if (!dailyQuestion) {
    throw new AppError('NOT_FOUND', 'Rituel introuvable.');
  }
  if (dailyQuestion.coupleId !== coupleId) {
    throw new AppError('FORBIDDEN', 'Ce rituel ne correspond pas à votre couple.');
  }

  const couple = await getCoupleById(coupleId);
  if (!couple) {
    throw new AppError('COUPLE_NOT_FOUND', 'Couple introuvable.');
  }

  const isUser1 = couple.user1Id === userId;
  const isUser2 = couple.user2Id === userId;
  if (!isUser1 && !isUser2) {
    throw new AppError('FORBIDDEN', "Vous ne faites pas partie de ce couple.");
  }

  // Embedding is computed before writing so the TreeNode can be created even if
  // the answer was already recorded by a concurrent request.
  const embedding = await getEmbedding(answer);

  // Atomic answer recording: fails silently if this partner already answered.
  const updated = await recordAnswer(dailyQuestionId, isUser1, answer);
  if (!updated) {
    return { status: 'ALREADY_ANSWERED' };
  }

  // Fire-and-forget totem update
  mapAnswerToOrbe(coupleId, userId, couple.user1Id, answer).catch((err) => {
    logger.warn('Totem orbe mapping failed (non-blocking)', {}, err);
  });

  // Create TreeNode for this answer
  const tree = await getOrCreateCoupleTree(coupleId);
  const newNode = await createTreeNode({
    treeId: tree.id,
    questionId: dailyQuestion.questionId,
    customText: dailyQuestion.customText || '',
    intensity: 1,
    category: 'daily',
    answeredAt: new Date().toISOString(),
    answeredBy: [userId],
    embedding,
  });

  const bothAnswered = updated.user1Answered && updated.user2Answered;
  if (!bothAnswered) {
    return { status: 'WAITING', dailyQuestion: updated };
  }

  // Only one concurrent request will win the right to compute the analysis.
  const canCompute = await claimAnalysisComputation(dailyQuestionId);
  if (!canCompute) {
    // Another request is computing; refetch the latest state.
    const latest = await getDailyQuestionById(dailyQuestionId);
    return { status: latest?.analysisStatus === 'COMPUTED' ? 'COMPUTED' : 'WAITING', dailyQuestion: latest ?? updated };
  }

  await runAnalysisPipeline(dailyQuestion, couple, userId, answer, embedding, newNode);

  const final = await getDailyQuestionById(dailyQuestionId);
  return { status: 'COMPUTED', dailyQuestion: final ?? updated };
}
