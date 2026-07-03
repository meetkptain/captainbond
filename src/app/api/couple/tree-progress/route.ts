import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { AppError } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { getCoupleById } from '@/lib/db/repositories/coupleRepository';
import { getCoupleTreeProgress } from '@/services/treeProgressService';

export const runtime = 'edge';

const querySchema = z.object({
  coupleId: z.string().min(1),
  limit: z.coerce.number().min(1).max(12).optional().default(6),
});

export const GET = withApiHandler({
  querySchema,
  async handler({ req, query }) {
    const authUser = await getAuthenticatedUser(req);
    const { coupleId, limit } = query;

    const couple = await getCoupleById(coupleId);
    if (!couple || (couple.user1Id !== authUser.id && couple.user2Id !== authUser.id)) {
      throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
    }

    const progress = await getCoupleTreeProgress(coupleId, limit);
    return NextResponse.json({ progress });
  },
});
