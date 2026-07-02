import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { roomCodeSchema } from '@/lib/schemas/api';
import { getPlayerById } from '@/lib/db/repositories';
import { getRoomPassInfo, getUserEntitlements, getPlayerEntitlements } from '@/lib/monetization/entitlements';
import { getRoomByCode } from '@/lib/db/repositories';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { AppError } from '@/lib/errors';
import { ipLimiter, rateLimiters } from '@/lib/rate-limit';

export const runtime = 'edge';

const entitlementsQuerySchema = z.object({
  roomCode: roomCodeSchema.optional(),
});

export const GET = withApiHandler({
  querySchema: entitlementsQuerySchema,
  rateLimit: ipLimiter(rateLimiters.ip),
  async handler({ req, query }) {
    const ctx = await getAuthenticatedPlayer(req);
    const player = await getPlayerById(ctx.playerId);
    if (!player) {
      throw new AppError('NOT_FOUND', 'Joueur introuvable');
    }

    const targetUserId = player.userId || null;
    let roomId = player.roomId;

    if (query.roomCode) {
      const room = await getRoomByCode(query.roomCode);
      if (room) roomId = room.id;
    }

    let entitlements = (await getPlayerEntitlements(ctx.playerId)) || null;
    if (!entitlements && targetUserId) {
      entitlements = await getUserEntitlements(targetUserId);
    }

    let roomPassActive = false;
    let roomPassPaidByUserId: string | null = null;
    if (roomId) {
      const roomPass = await getRoomPassInfo(roomId);
      roomPassActive = roomPass.isActive;
      roomPassPaidByUserId = roomPass.paidByUserId;
    }

    const effectiveEntitlements = entitlements
      ? {
          ...entitlements,
          hasActivePass: entitlements.hasActivePass || roomPassActive,
          roomPassActive,
          roomPassPaidByUserId,
          accessibleModes: roomPassActive
            ? Array.from(new Set([...entitlements.accessibleModes, 'DEEP_CONNECTION', 'DATE_NIGHT']))
            : entitlements.accessibleModes,
          accessibleFeatures: roomPassActive
            ? Array.from(new Set([...entitlements.accessibleFeatures, 'profiles']))
            : entitlements.accessibleFeatures,
        }
      : {
          userId: targetUserId || null,
          hasActivePass: roomPassActive,
          passExpiresAt: null,
          hasActiveSubscription: false,
          subscriptionStatus: 'NONE',
          hasPurchasedPack: false,
          purchasedPackIds: [],
          accessibleModes: roomPassActive ? ['DEEP_CONNECTION', 'DATE_NIGHT'] : [],
          accessibleFeatures: roomPassActive ? ['profiles'] : [],
          roomPassActive,
          roomPassPaidByUserId,
        };

    return NextResponse.json(effectiveEntitlements);
  },
});
