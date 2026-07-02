import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { roomCodeSchema } from '@/lib/schemas/api';
import { setPlayerReady } from '@/services/playerService';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { playerActionIpLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

const readySchema = z.object({
  isReady: z.boolean(),
  roomCode: roomCodeSchema.optional(),
});

export const POST = withApiHandler({
  bodySchema: readySchema,
  rateLimit: playerActionIpLimiter,
  async handler({ req, body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const { playerId } = await getAuthenticatedPlayer(req);

    await setPlayerReady(playerId, body.isReady);
    return NextResponse.json({ success: true });
  },
});
