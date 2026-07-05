import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { roomJoinSchema } from '@/lib/schemas/api';
import { joinRoom } from '@/services/roomService';
import { signPlayerSession, signPlayerRefreshToken, PLAYER_COOKIE_NAME, PLAYER_REFRESH_COOKIE_NAME, getPlayerCookieOptions, getPlayerRefreshCookieOptions } from '@/lib/auth/player';
import { ipLimiter, rateLimiters } from '@/lib/rate-limit';

export const runtime = 'edge';

export const POST = withApiHandler({
  bodySchema: roomJoinSchema,
  rateLimit: ipLimiter(rateLimiters.ip),
  async handler({ body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const { player, roomId, roomCode } = await joinRoom({
      roomCode: body.roomCode,
      playerName: body.playerName,
    });

    const playerToken = await signPlayerSession({ playerId: player.id, roomId });
    const refreshToken = await signPlayerRefreshToken({ playerId: player.id, roomId });

    const response = NextResponse.json({
      playerId: player.id,
      playerName: player.name,
      roomId,
      roomCode,
    });

    response.cookies.set(PLAYER_COOKIE_NAME, playerToken, getPlayerCookieOptions());
    response.cookies.set(PLAYER_REFRESH_COOKIE_NAME, refreshToken, getPlayerRefreshCookieOptions());

    return response;
  },
});
