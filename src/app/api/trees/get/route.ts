import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getTreeById, getTreeByCouple, getTreeByRoom, listTreeNodes, listTreeConnections } from '@/lib/db/repositories';
import { getAuthenticatedCoupleUser } from '@/lib/auth/couple';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { AppError } from '@/lib/errors';
import { getUserEntitlements } from '@/lib/monetization/entitlements';

export const runtime = 'edge';

const getTreeQuerySchema = z.object({
  id: z.string().cuid().optional(),
  coupleId: z.string().optional(),
  roomId: z.string().cuid().optional(),
});

export const GET = withApiHandler({
  querySchema: getTreeQuerySchema,
  async handler({ req, query }) {
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

    let isPremium = false;

    // Verify couple membership if it's a couple tree
    if (tree.coupleId) {
      const authUser = await getAuthenticatedCoupleUser(req);
      const { data: couple, error: coupleError } = await supabaseAdmin
        .from('Couple')
        .select('*')
        .eq('id', tree.coupleId)
        .single();

      if (coupleError || !couple || (couple.user1Id !== authUser.id && couple.user2Id !== authUser.id)) {
        throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
      }

      const entitlements = await getUserEntitlements(authUser.id);
      isPremium = !!(entitlements?.hasActiveSubscription || entitlements?.hasActivePass || entitlements?.accessibleFeatures?.includes('profiles'));
    }

    const [nodes, connections] = await Promise.all([
      listTreeNodes(tree.id),
      listTreeConnections(tree.id),
    ]);

    let finalNodes = nodes;
    let finalConnections = connections;

    // Apply 5-day limit for free couple trees
    if (tree.coupleId && !isPremium) {
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      finalNodes = nodes.filter(n => n.answeredAt && new Date(n.answeredAt) >= fiveDaysAgo);
      const filteredNodeIds = new Set(finalNodes.map(n => n.id));
      finalConnections = connections.filter(
        c => filteredNodeIds.has(c.sourceId) && filteredNodeIds.has(c.targetId)
      );
    }

    return NextResponse.json({ tree, nodes: finalNodes, connections: finalConnections });
  },
});
