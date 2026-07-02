import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { coupleActionLimiter } from '@/lib/rate-limit';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { AppError } from '@/lib/errors';
import { submitMood } from '@/services/coupleMoodService';

export const runtime = 'edge';

const bodySchema = z.object({
  coupleId: z.string().min(1),
  dailyQuestionId: z.string().min(1),
  mood: z.object({
    energy: z.number().min(1).max(5),
    stress: z.number().min(1).max(5),
    feeling: z.string().optional(),
  }),
});

export const POST = withApiHandler({
  bodySchema,
  rateLimit: coupleActionLimiter,
  async handler({ req, body }) {
    if (!body) {
      throw new AppError('BAD_REQUEST', 'Corps de requête manquant');
    }
    const authUser = await getAuthenticatedUser(req);
    const { coupleId, dailyQuestionId, mood } = body;

    const result = await submitMood(coupleId, dailyQuestionId, authUser.id, mood);

    return NextResponse.json({
      success: true,
      dailyQuestion: result.dailyQuestion,
      moodGapDetected: result.moodGapDetected,
    });
  },
});
