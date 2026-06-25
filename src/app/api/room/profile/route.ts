import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { uuidSchema, roomCodeSchema } from '@/lib/schemas/api';
import { getPlayerGameProfile } from '@/services/roomGameService';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';

export const runtime = 'edge';

const profileQuerySchema = z.object({
  playerId: uuidSchema,
  roomCode: roomCodeSchema,
});

export const GET = withApiHandler({
  querySchema: profileQuerySchema,
  async handler({ req, query }) {
    const { playerId } = await getAuthenticatedPlayer(req, {
      playerId: query.playerId,
      roomCode: query.roomCode,
    });

    const result = await getPlayerGameProfile(playerId, query.roomCode);
    return NextResponse.json(result);
  },
});
