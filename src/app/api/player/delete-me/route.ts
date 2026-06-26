import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { uuidSchema, roomCodeSchema } from '@/lib/schemas/api';
import { deletePlayerAccount } from '@/services/playerService';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { deleteMeIpLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

const deleteMeSchema = z.object({
  playerId: uuidSchema,
  roomCode: roomCodeSchema,
});

export const POST = withApiHandler({
  bodySchema: deleteMeSchema,
  rateLimit: deleteMeIpLimiter,
  async handler({ req, body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const { playerId, roomId } = await getAuthenticatedPlayer(req, {
      playerId: body.playerId,
      roomCode: body.roomCode,
    });

    await deletePlayerAccount(playerId, roomId);

    const response = NextResponse.json({
      success: true,
      message: 'Vos données de jeu ont été supprimées de cette salle.',
    });

    response.cookies.set('koze_player_session', '', {
      path: '/',
      maxAge: 0,
    });

    return response;
  },
});
