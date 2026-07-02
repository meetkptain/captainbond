import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { checkoutSessionSchema } from '@/lib/schemas/api';
import { createCheckoutSession } from '@/services/paymentService';
import { getRoomByCode } from '@/lib/db/repositories';
import { checkoutLimiter } from '@/lib/rate-limit';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { AppError } from '@/lib/errors';
import { resolveProfileSku } from '@/lib/monetization/skuResolver';

export const runtime = 'edge';

export const POST = withApiHandler({
  bodySchema: checkoutSessionSchema,
  rateLimit: checkoutLimiter,
  async handler({ req, body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const { playerId } = await getAuthenticatedPlayer(req);
    const room = await getRoomByCode(body.roomCode);
    if (!room) {
      throw new AppError('NOT_FOUND', 'Salle introuvable');
    }
    const sku = resolveProfileSku(room.currentMode);

    const result = await createCheckoutSession({
      sku,
      playerId,
      roomCode: body.roomCode,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    });
    return NextResponse.json(result);
  },
});
