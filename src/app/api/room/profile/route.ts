import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { roomCodeSchema } from '@/lib/schemas/api';
import { getPlayerGameProfile } from '@/services/roomGameService';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';

export const runtime = 'edge';

const profileQuerySchema = z.object({
  roomCode: roomCodeSchema,
});

export const GET = withApiHandler({
  querySchema: profileQuerySchema,
  async handler({ req, query }) {
    const { playerId } = await getAuthenticatedPlayer(req);

    const result = await getPlayerGameProfile(playerId, query.roomCode);
    return NextResponse.json(result);
  },
});
