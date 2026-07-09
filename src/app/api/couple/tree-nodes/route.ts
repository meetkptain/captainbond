import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { AppError } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { getCoupleById } from '@/lib/db/repositories/coupleRepository';
import { getTreeByCouple, listNodes, listConnections } from '@/lib/db/repositories/coupleTreeRepository';

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

    const tree = await getTreeByCouple(coupleId);
    if (!tree) return NextResponse.json({ nodes: [], connections: [] });

    const [nodes, connections] = await Promise.all([
      listNodes(tree.id),
      listConnections(tree.id),
    ]);

    return NextResponse.json({ nodes, connections });
  },
});
