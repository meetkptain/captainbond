import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { AppError } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { getCoupleById } from '@/lib/db/repositories/coupleRepository';
import { getCurrentRitual } from '@/lib/db/repositories/dailyQuestionRepository';

export const runtime = 'edge';

const querySchema = z.object({
  coupleId: z.string().min(1),
});

export const GET = withApiHandler({
  querySchema,
  async handler({ req, query }) {
    const authUser = await getAuthenticatedUser(req);
    const { coupleId } = query;

    const couple = await getCoupleById(coupleId);
    if (!couple || (couple.user1Id !== authUser.id && couple.user2Id !== authUser.id)) {
      throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
    }

    const ritual = await getCurrentRitual(coupleId, couple.timezone || 'Europe/Paris');

    const isUser1 = couple.user1Id === authUser.id;
    const hasAnswered = isUser1 ? ritual?.user1Answered : ritual?.user2Answered;
    const partnerAnswered = isUser1 ? ritual?.user2Answered : ritual?.user1Answered;

    return NextResponse.json({
      ritual,
      me: { hasAnswered },
      partner: { hasAnswered: partnerAnswered },
      isRevealed: ritual?.isRevealed ?? false,
    });
  },
});
