import { AppError } from '@/lib/errors';
import { requireCoupleMembership } from '@/lib/auth/coupleMembership';
import { getDailyQuestionById, updateDailyQuestion } from '@/lib/db/repositories/dailyQuestionRepository';
import { findRandomCoupleQuestion } from '@/lib/db/repositories/questionRepository';
import type { DailyQuestion } from '@/lib/db/types';

const FALLBACK_QUESTIONS = [
  'Quel est le plus grand point commun inattendu entre vous deux ?',
  'Quelle petite attention du quotidien chez ton partenaire te touche le plus ?',
  'Quelle habitude de l\'autre as-tu fini par adopter avec le temps ?',
  'Si votre couple était un genre de film ou une chanson, lequel serait-ce et pourquoi ?',
  'Quel voyage ou projet aimeriez-vous réaliser ensemble dans les 12 prochains mois ?',
];

export async function passDailyQuestion(
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
  if (dailyQuestion.user1Answered || dailyQuestion.user2Answered || dailyQuestion.isAnswered) {
    throw new AppError('BAD_REQUEST', 'Impossible de passer une question déjà commencée ou répondue.');
  }

  const candidate = await findRandomCoupleQuestion(30);
  let newQuestionText: string;
  let newQuestionId: string | null;

  if (candidate && candidate.id !== dailyQuestion.questionId) {
    newQuestionText = candidate.text;
    newQuestionId = candidate.id;
  } else if (candidate) {
    newQuestionText = candidate.text;
    newQuestionId = candidate.id;
  } else {
    newQuestionText = FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)];
    newQuestionId = null;
  }

  return updateDailyQuestion(dailyQuestionId, {
    questionId: newQuestionId,
    customText: newQuestionText,
    releasedAt: new Date().toISOString(),
  });
}
