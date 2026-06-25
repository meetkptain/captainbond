import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { playerIdQuerySchema } from '@/lib/schemas/api';
import { ipLimiter, rateLimiters } from '@/lib/rate-limit';
import { getUserStats } from '@/services/statsService';
import { getPlayerById } from '@/lib/db/repositories/playerRepository';

export const runtime = 'edge';

const meStatsQuerySchema = playerIdQuerySchema.extend({
  roomCode: z.string().min(4).max(10).optional(),
});

export const GET = withApiHandler({
  querySchema: meStatsQuerySchema,
  rateLimit: ipLimiter(rateLimiters.ip),
  async handler({ req, query }) {
    const { playerId, roomCode } = query;

    const { playerId: authenticatedPlayerId } = await getAuthenticatedPlayer(req, {
      playerId,
      roomCode,
    });

    const player = await getPlayerById(authenticatedPlayerId);
    if (!player?.userId) {
      return NextResponse.json({
        totalGamesPlayed: 0,
        totalBetrayals: 0,
        currentStreak: 0,
        gamesPlayedToday: 0,
        lastPlayedAt: null,
      });
    }

    const stats = await getUserStats(player.userId);
    return NextResponse.json(stats);
  },
});
