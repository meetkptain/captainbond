import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { coupleAnalyzeLimiter } from '@/lib/rate-limit';
import { AppError } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { submitAnswer } from '@/services/coupleAnswerService';

export const runtime = 'edge';

const bodySchema = z.object({
  coupleId: z.string().min(1),
  dailyQuestionId: z.string().min(1),
  userId: z.string().min(1),
  answer: z.string().min(1).max(2000),
});

export const POST = withApiHandler({
  bodySchema,
  rateLimit: coupleAnalyzeLimiter,
  async handler({ req, body }) {
    const logger = createLogger({ route: '/api/couple/analyze' });
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const authUser = await getAuthenticatedUser(req);
    const { coupleId, dailyQuestionId, userId, answer } = body;

    if (userId !== authUser.id) {
      throw new AppError('FORBIDDEN', 'Vous ne pouvez pas soumettre de réponse pour un autre utilisateur.');
    }

    const result = await submitAnswer(coupleId, dailyQuestionId, userId, answer);

    if (result.status === 'ALREADY_ANSWERED') {
      throw new AppError('CONFLICT', 'Vous avez déjà répondu à cette question.');
    }

    logger.info('Réponse couple traitée', {
      coupleId,
      dailyQuestionId,
      status: result.status,
    });

    return NextResponse.json({
      success: true,
      status: result.status,
      isRevealed: result.dailyQuestion.isRevealed,
    });
  },
});
