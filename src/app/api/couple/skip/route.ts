import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { coupleActionLimiter } from '@/lib/rate-limit';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { AppError } from '@/lib/errors';
import { skipDailyQuestion } from '@/services/coupleDailyQuestionService';

export const runtime = 'edge';

const bodySchema = z.object({
  coupleId: z.string().min(1),
  dailyQuestionId: z.string().min(1),
});

export const POST = withApiHandler({
  bodySchema,
  rateLimit: coupleActionLimiter,
  async handler({ req, body }) {
    if (!body) {
      throw new AppError('BAD_REQUEST', 'Corps de requête manquant');
    }
    const authUser = await getAuthenticatedUser(req);
    const { coupleId, dailyQuestionId } = body;

    const updated = await skipDailyQuestion(coupleId, dailyQuestionId, authUser.id);

    return NextResponse.json({ success: true, dailyQuestion: updated });
  },
});
