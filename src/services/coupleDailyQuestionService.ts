import { AppError } from '@/lib/errors';
import { requireCoupleMembership } from '@/lib/auth/coupleMembership';
import {
  getDailyQuestionById,
  skipDailyQuestion as repositorySkipDailyQuestion,
  markSafeZone,
} from '@/lib/db/repositories/dailyQuestionRepository';
import type { DailyQuestion } from '@/lib/db/types';

async function verifyOwnership(
  coupleId: string,
  dailyQuestionId: string,
  userId: string
): Promise<DailyQuestion> {
  await requireCoupleMembership(coupleId, userId);

  const dailyQuestion = await getDailyQuestionById(dailyQuestionId);
  if (!dailyQuestion) {
    throw new AppError('NOT_FOUND', 'Question quotidienne introuvable.');
  }
  if (dailyQuestion.coupleId !== coupleId) {
    throw new AppError('FORBIDDEN', 'Cette question ne correspond pas à votre couple.');
  }
  return dailyQuestion;
}

export async function skipDailyQuestion(
  coupleId: string,
  dailyQuestionId: string,
  userId: string
): Promise<DailyQuestion> {
  await verifyOwnership(coupleId, dailyQuestionId, userId);
  return repositorySkipDailyQuestion(dailyQuestionId);
}

export async function toggleSafeZone(
  coupleId: string,
  dailyQuestionId: string,
  userId: string,
  active: boolean
): Promise<DailyQuestion> {
  await verifyOwnership(coupleId, dailyQuestionId, userId);
  return markSafeZone(dailyQuestionId, active);
}
