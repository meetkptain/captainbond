import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { uuidSchema } from '@/lib/schemas/api';
import { getImposteurRole } from '@/services/gamePlayService';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';

export const runtime = 'edge';

const roleQuerySchema = z.object({
  roomId: uuidSchema,
});

export const GET = withApiHandler({
  querySchema: roleQuerySchema,
  async handler({ req, query }) {
    const { playerId } = await getAuthenticatedPlayer(req);

    const result = await getImposteurRole(playerId, query.roomId);
    return NextResponse.json({ success: true, ...result });
  },
});
