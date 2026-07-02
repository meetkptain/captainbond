import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { roomCodeSchema } from '@/lib/schemas/api';
import { getPlayerEntitlementsSummary } from '@/services/playerService';
import { getRoomPassInfo } from '@/lib/monetization/entitlements';
import { getRoomByCode } from '@/lib/db/repositories';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';

export const runtime = 'edge';

const meQuerySchema = z.object({
  roomCode: roomCodeSchema.optional(),
});

export const GET = withApiHandler({
  querySchema: meQuerySchema,
  async handler({ req, query }) {
    const { playerId } = await getAuthenticatedPlayer(req);

    const entitlements = await getPlayerEntitlementsSummary(playerId);

    let roomPassActive = false;
    if (query.roomCode) {
      const room = await getRoomByCode(query.roomCode);
      if (room) {
        const info = await getRoomPassInfo(room.id);
        roomPassActive = info.isActive;
      }
    }

    if (!entitlements) {
      return NextResponse.json({
        hasActivePass: roomPassActive,
        passExpiresAt: null,
        hasPurchasedProfile: false,
        hasActiveSubscription: false,
        hasPurchasedPack: false,
        accessibleModes: roomPassActive ? ['DEEP_CONNECTION', 'DATE_NIGHT'] : [],
        accessibleFeatures: roomPassActive ? ['profiles'] : [],
      });
    }

    return NextResponse.json({
      hasActivePass: entitlements.hasActivePass || roomPassActive,
      passExpiresAt: entitlements.passExpiresAt,
      hasPurchasedProfile:
        entitlements.accessibleFeatures.includes('profile') ||
        entitlements.accessibleFeatures.includes('profiles'),
      hasActiveSubscription: entitlements.hasActiveSubscription,
      hasPurchasedPack: entitlements.hasPurchasedPack,
      accessibleModes: entitlements.accessibleModes,
      accessibleFeatures: entitlements.accessibleFeatures,
    });
  },
});
