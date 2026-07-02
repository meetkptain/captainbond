import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getStripe } from '@/lib/monetization/checkout';
import { getPackBySku } from '@/lib/monetization/catalog';
import { checkoutLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

const b2bCheckoutSchema = z.object({
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const POST = withApiHandler({
  bodySchema: b2bCheckoutSchema,
  rateLimit: checkoutLimiter,
  async handler({ body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }

    const pack = await getPackBySku('B2B_EVENT');
    if (!pack) {
      return NextResponse.json({ error: 'Pack B2B introuvable', code: 'NOT_FOUND' }, { status: 404 });
    }

    // Create Stripe Checkout Session for B2B EVENT
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: pack.name,
              description: pack.description,
            },
            unit_amount: 29900, // 299.00 EUR HT
          },
          quantity: 1,
        },
      ],
      metadata: {
        sku: 'B2B_EVENT',
        packId: pack.id,
        productType: 'PACK',
      },
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
    });

    return NextResponse.json({ sessionUrl: session.url });
  },
});
