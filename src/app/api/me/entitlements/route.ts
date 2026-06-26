import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { uuidSchema, roomCodeSchema } from '@/lib/schemas/api';
import { getPlayerById } from '@/lib/db/repositories';
import { getRoomPassInfo, getUserEntitlements, getPlayerEntitlements } from '@/lib/monetization/entitlements';
import { getRoomByCode } from '@/lib/db/repositories';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { AppError } from '@/lib/errors';
import { ipLimiter, rateLimiters } from '@/lib/rate-limit';

export const runtime = 'edge';

const entitlementsQuerySchema = z.object({
  playerId: uuidSchema.optional(),
  roomCode: roomCodeSchema.optional(),
}).refine((data) => data.playerId || data.roomCode, {
  message: 'playerId ou roomCode requis',
});

export const GET = withApiHandler({
  querySchema: entitlementsQuerySchema,
  rateLimit: ipLimiter(rateLimiters.ip),
  async handler({ req, query }) {
    let targetUserId: string | null = null;
    let roomId: string | null = null;

    if (query.playerId) {
      const ctx = await getAuthenticatedPlayer(req, {
        playerId: query.playerId,
        roomCode: query.roomCode,
      });
      const player = await getPlayerById(ctx.playerId);
      if (!player) {
        throw new AppError('NOT_FOUND', 'Joueur introuvable');
      }
      targetUserId = player.userId || null;
      roomId = player.roomId;
    }

    if (query.roomCode && !roomId) {
      const room = await getRoomByCode(query.roomCode);
      if (room) roomId = room.id;
    }

    let entitlements = null;
    if (query.playerId) {
      entitlements = (await getPlayerEntitlements(query.playerId)) || null;
    }
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
