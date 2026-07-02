import { AppError } from '@/lib/errors';
import { requireCoupleMembership } from '@/lib/auth/coupleMembership';
import { getUserEntitlements } from '@/lib/monetization/entitlements';
import { getCoupleById } from '@/lib/db/repositories/coupleRepository';
import {
  getDailyQuestionById,
  updateDailyQuestion,
  countOpenedProtocolsSince,
} from '@/lib/db/repositories/dailyQuestionRepository';
import { generateContent } from '@/lib/gemini';
import { safeJsonParse } from '@/lib/json';
import { createLogger } from '@/lib/logger';

export type ProtocolStep = 'COMPRENDRE' | 'QUESTIONNER' | 'AGIR';

interface ProcessCoupleProtocolInput {
  userId: string;
  coupleId: string;
  dailyQuestionId: string;
  step: ProtocolStep;
}

type CoupleProtocolResult =
  | { step: 'COMPRENDRE'; analysis: Record<string, unknown> }
  | {
      step: 'QUESTIONNER';
      questions: Array<{ id: string; text: string; category: string }>;
    }
  | { step: 'AGIR'; action: { text: string; difficulty: string } };

const logger = createLogger({ service: 'coupleProtocolService' });

export async function processCoupleProtocol(
  input: ProcessCoupleProtocolInput
): Promise<CoupleProtocolResult> {
  const { userId, coupleId, dailyQuestionId, step } = input;

  const couple = await getCoupleById(coupleId);
  if (!couple) {
    throw new AppError('COUPLE_NOT_FOUND', 'Couple introuvable.');
  }
  await requireCoupleMembership(coupleId, userId);

  const dailyQuestion = await getDailyQuestionById(dailyQuestionId);
  if (!dailyQuestion) {
    throw new AppError('NOT_FOUND', 'Question quotidienne introuvable.');
  }
  if (dailyQuestion.coupleId !== coupleId) {
    throw new AppError('FORBIDDEN', 'Cette question ne correspond pas à votre couple.');
  }
  if (!dailyQuestion.isRevealed) {
    throw new AppError(
      'FORBIDDEN',
      "L'analyse n'est pas encore révélée. Patience jusqu'à 20h !"
    );
  }

  const analysisJson = dailyQuestion.analysisJson as Record<string, unknown> | null;
  if (!analysisJson) {
    throw new AppError('NOT_FOUND', 'Aucune analyse disponible pour cette question.');
  }

  if (step === 'QUESTIONNER' || step === 'AGIR') {
    const entitlements = await getUserEntitlements(userId);
    const hasPremium = !!(
      entitlements?.hasActiveSubscription ||
      entitlements?.hasActivePass ||
      entitlements?.accessibleFeatures?.includes('profiles')
    );

    if (!hasPremium) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const openedCount = await countOpenedProtocolsSince(
        coupleId,
        sevenDaysAgo,
        dailyQuestionId
      );

      if (openedCount >= 1) {
        throw new AppError(
          'PAYMENT_FAILED',
          'Vous avez atteint la limite de 1 protocole gratuit par semaine. Abonnez-vous pour un accès illimité.'
        );
      }

      if (!dailyQuestion.protocolOpened) {
        try {
          await updateDailyQuestion(dailyQuestionId, { protocolOpened: true });
        } catch (updateError) {
          logger.warn('Failed to mark protocolOpened', { dailyQuestionId }, updateError);
        }
      }
    }
  }

  switch (step) {
    case 'COMPRENDRE':
      return { step: 'COMPRENDRE', analysis: analysisJson };
    case 'QUESTIONNER':
      return generateQuestions(dailyQuestionId, analysisJson);
    case 'AGIR':
      return generateAction(dailyQuestionId, analysisJson);
    default:
      throw new AppError('VALIDATION_ERROR', 'Étape de protocole invalide.');
  }
}

async function generateQuestions(
  dailyQuestionId: string,
  analysisJson: Record<string, unknown>
): Promise<Extract<CoupleProtocolResult, { step: 'QUESTIONNER' }>> {
  const resonanceInsight = String(analysisJson.resonanceInsight || '');
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
      const text =
        typeof unknownQ === 'string'
          ? unknownQ
          : String((q?.text as string) || '');
      const category =
        typeof unknownQ === 'string'
          ? idx === 0
            ? 'Curiosité'
            : idx === 1
              ? 'Partage'
              : 'Profond'
          : String(
              (q?.category as string) ||
                (idx === 0 ? 'Curiosité' : idx === 1 ? 'Partage' : 'Profond')
            );

      return {
        id: `proto-q-${dailyQuestionId}-${idx}`,
        text,
        category,
      };
    });

    return { step: 'QUESTIONNER', questions: questionsWithIds };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Échec de la génération des questions', {}, error);
    throw new AppError('GENERATION_FAILED', 'Impossible de générer les questions de suivi.');
  }
}

async function generateAction(
  dailyQuestionId: string,
  analysisJson: Record<string, unknown>
): Promise<Extract<CoupleProtocolResult, { step: 'AGIR' }>> {
  const resonanceInsight = String(analysisJson.resonanceInsight || '');
  const actionSuggestion = String(analysisJson.actionSuggestion || '');
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

    return {
      step: 'AGIR',
      action: {
        text: parsed.action,
        difficulty,
      },
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Échec de la génération de la micro-action', {}, error);
    throw new AppError('GENERATION_FAILED', 'Impossible de générer la micro-action.');
  }
}
