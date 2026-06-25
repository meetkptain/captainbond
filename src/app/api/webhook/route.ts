import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import {
  verifyStripeWebhook,
  isWebhookEventProcessed,
  processStripeEvent,
  recordWebhookEvent,
} from '@/services/paymentService';

export const runtime = 'edge';

export const POST = withApiHandler({
  async handler({ req }) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    const event = await verifyStripeWebhook(body, signature);

    if (await isWebhookEventProcessed(event.id)) {
      return NextResponse.json({ received: true, idempotent: true });
    }

    await processStripeEvent(event);
    await recordWebhookEvent(event);

    return NextResponse.json({ received: true });
  },
});
