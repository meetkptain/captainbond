import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { checkoutSessionSchema } from '@/lib/schemas/api';
import { createCheckoutSession } from '@/services/paymentService';
import { getRoomByCode } from '@/lib/db/repositories';
import { checkoutLimiter } from '@/lib/rate-limit';
import { requirePlayerSessionFor } from '@/lib/auth/player-session';
import { AppError } from '@/lib/errors';

export const runtime = 'edge';

export const POST = withApiHandler({
  bodySchema: checkoutSessionSchema,
  rateLimit: checkoutLimiter,
  async handler({ req, body }) {
    await requirePlayerSessionFor(req, body.playerId, body.roomCode);
    const room = await getRoomByCode(body.roomCode);
    if (!room) {
      throw new AppError('NOT_FOUND', 'Salle introuvable');
    }
    const isCouple = room.currentMode === 'DATE_NIGHT';
    const sku = isCouple ? 'PROFILE_COUPLE' : 'PROFILE';

    const result = await createCheckoutSession({
      sku,
      playerId: body.playerId,
      roomCode: body.roomCode,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    });
    return NextResponse.json(result);
  },
});
