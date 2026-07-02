import { AppError } from '@/lib/errors';
import {
  getDailyQuestionById,
  updateMood,
  updateDailyQuestion,
} from '@/lib/db/repositories/dailyQuestionRepository';
import { requireCoupleMembership } from '@/lib/auth/coupleMembership';
import type { DailyQuestion } from '@/lib/db/types';

export interface MoodInput {
  energy: number;
  stress: number;
  feeling?: string;
}

const GRATITUDE_PROMPT =
  "Micro-gratitude : partagez une petite attention ou une qualité que vous appréciez particulièrement chez votre partenaire aujourd'hui.";

function buildCustomText(active: MoodInput, partner: MoodInput): string | null {
  const stressGap = Math.abs(active.stress - partner.stress);
  const energyGap = Math.abs(active.energy - partner.energy);

  if (active.stress >= 4 || partner.stress >= 4 || active.energy <= 2 || partner.energy <= 2) {
    return GRATITUDE_PROMPT;
  }

  if (stressGap >= 3 || energyGap >= 3) {
    const isActiveLower = active.stress > partner.stress;
    return isActiveLower
      ? "Ton partenaire semble traverser un moment plus difficile que toi. Prends un instant pour lui demander comment tu peux l'alléger ce soir — sans obligation de réponse."
      : "Tu traverses un moment plus tendu que ton partenaire. Partage-lui une chose simple dont tu aurais besoin ce soir — confort, silence ou présence.";
  }

  return null;
}

function detectMoodGap(active: MoodInput, partner: MoodInput): boolean {
  return Math.abs(active.stress - partner.stress) >= 3 || Math.abs(active.energy - partner.energy) >= 3;
}

export async function submitMood(
  coupleId: string,
  dailyQuestionId: string,
  userId: string,
  mood: MoodInput
): Promise<{ dailyQuestion: DailyQuestion; moodGapDetected: boolean }> {
  await requireCoupleMembership(coupleId, userId);

  const dailyQuestion = await getDailyQuestionById(dailyQuestionId);
  if (!dailyQuestion) {
    throw new AppError('NOT_FOUND', 'Question quotidienne introuvable.');
  }
  if (dailyQuestion.coupleId !== coupleId) {
    throw new AppError('FORBIDDEN', 'Cette question ne correspond pas à votre couple.');
  }

  const { getCoupleById } = await import('@/lib/db/repositories/coupleRepository');
  const coupleData = await getCoupleById(coupleId);
  if (!coupleData) {
    throw new AppError('COUPLE_NOT_FOUND', 'Couple introuvable.');
  }

  const isUser1 = coupleData.user1Id === userId;
  let updated = await updateMood(dailyQuestionId, isUser1, mood);

  const otherMoodRecord = isUser1 ? updated.user2Mood : updated.user1Mood;
  let customText: string | null = null;

  if (otherMoodRecord) {
    const partnerMood = otherMoodRecord as unknown as MoodInput;
    customText = buildCustomText(mood, partnerMood);
  }

  if (customText) {
    updated = await updateDailyQuestion(dailyQuestionId, { customText, questionId: null });
  }

  const moodGapDetected = otherMoodRecord
    ? detectMoodGap(mood, otherMoodRecord as unknown as MoodInput)
    : false;

  return { dailyQuestion: updated, moodGapDetected };
}
