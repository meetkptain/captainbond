import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { ipLimiter, rateLimiters } from '@/lib/rate-limit';
import { getUserStats } from '@/services/statsService';
import { getPlayerById } from '@/lib/db/repositories/playerRepository';

export const runtime = 'edge';

export const GET = withApiHandler({
  rateLimit: ipLimiter(rateLimiters.ip),
  async handler({ req }) {
    const { playerId: authenticatedPlayerId } = await getAuthenticatedPlayer(req);

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
