import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { uuidSchema, roomCodeSchema } from '@/lib/schemas/api';
import { removePlayerById } from '@/services/playerService';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { playerActionIpLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

const leaveSchema = z.object({
  playerId: uuidSchema,
  roomCode: roomCodeSchema,
});

export const POST = withApiHandler({
  bodySchema: leaveSchema,
  rateLimit: playerActionIpLimiter,
  async handler({ req, body }) {
    const { playerId, roomId } = await getAuthenticatedPlayer(req, {
      playerId: body.playerId,
      roomCode: body.roomCode,
    });

    await removePlayerById(playerId, roomId);
    return NextResponse.json({ success: true });
  },
});
