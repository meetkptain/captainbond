import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { checkoutSessionSchema } from '@/lib/schemas/api';
import { createCheckoutSession } from '@/services/paymentService';
import { checkoutLimiter } from '@/lib/rate-limit';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';

export const runtime = 'edge';

export const POST = withApiHandler({
  bodySchema: checkoutSessionSchema,
  rateLimit: checkoutLimiter,
  async handler({ req, body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const { playerId } = await getAuthenticatedPlayer(req);
    const result = await createCheckoutSession({
      sku: 'PASS_24H',
      playerId,
      roomCode: body.roomCode,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    });
    return NextResponse.json(result);
  },
});
