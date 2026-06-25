import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getTreeById, getTreeByCouple, getTreeByRoom, listTreeNodes, listTreeConnections } from '@/lib/db/repositories';

export const runtime = 'edge';

const getTreeQuerySchema = z.object({
  id: z.string().cuid().optional(),
  coupleId: z.string().optional(),
  roomId: z.string().cuid().optional(),
});

export const GET = withApiHandler({
  querySchema: getTreeQuerySchema,
  async handler({ query }) {
    let tree = null;

    if (query.id) {
      tree = await getTreeById(query.id);
    } else if (query.coupleId) {
      tree = await getTreeByCouple(query.coupleId);
    } else if (query.roomId) {
      tree = await getTreeByRoom(query.roomId);
    }

    if (!tree) {
      return NextResponse.json({ error: 'Arbre introuvable' }, { status: 404 });
    }

    const [nodes, connections] = await Promise.all([
      listTreeNodes(tree.id),
      listTreeConnections(tree.id),
    ]);

    return NextResponse.json({ tree, nodes, connections });
  },
});
