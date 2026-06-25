import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { checkoutSessionSchema } from '@/lib/schemas/api';
import { createCheckoutSession } from '@/services/paymentService';
import { checkoutLimiter } from '@/lib/rate-limit';
import { requirePlayerSessionFor } from '@/lib/auth/player-session';

export const runtime = 'edge';

const checkoutSchema = checkoutSessionSchema.extend({
  sku: z.string().min(1, 'SKU requis'),
});

export const POST = withApiHandler({
  bodySchema: checkoutSchema,
  rateLimit: checkoutLimiter,
  async handler({ req, body }) {
    await requirePlayerSessionFor(req, body.playerId, body.roomCode);
    const result = await createCheckoutSession({
      sku: body.sku,
      playerId: body.playerId,
      roomCode: body.roomCode,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    });
    return NextResponse.json(result);
  },
});
