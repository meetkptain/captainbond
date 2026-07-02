import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { coupleActionLimiter } from '@/lib/rate-limit';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { AppError } from '@/lib/errors';
import { toggleSafeZone } from '@/services/coupleDailyQuestionService';

export const runtime = 'edge';

const bodySchema = z.object({
  coupleId: z.string().min(1),
  dailyQuestionId: z.string().min(1),
  action: z.enum(['ACTIVATE', 'DEACTIVATE']),
});

export const POST = withApiHandler({
  bodySchema,
  rateLimit: coupleActionLimiter,
  async handler({ req, body }) {
    if (!body) {
      throw new AppError('BAD_REQUEST', 'Corps de requête manquant');
    }
    const authUser = await getAuthenticatedUser(req);
    const { coupleId, dailyQuestionId, action } = body;

    const updated = await toggleSafeZone(coupleId, dailyQuestionId, authUser.id, action === 'ACTIVATE');

    return NextResponse.json({ success: true, dailyQuestion: updated });
  },
});
