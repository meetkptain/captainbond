import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { uuidSchema, roomCodeSchema } from '@/lib/schemas/api';
import { setPlayerReady } from '@/services/playerService';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { playerActionIpLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

const readySchema = z.object({
  playerId: uuidSchema,
  isReady: z.boolean(),
  roomCode: roomCodeSchema.optional(),
});

export const POST = withApiHandler({
  bodySchema: readySchema,
  rateLimit: playerActionIpLimiter,
  async handler({ req, body }) {
    const { playerId } = await getAuthenticatedPlayer(req, {
      playerId: body.playerId,
      roomCode: body.roomCode,
    });

    await setPlayerReady(playerId, body.isReady);
    return NextResponse.json({ success: true });
  },
});
