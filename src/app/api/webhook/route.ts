import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { insertWebhookEventIfNotExists } from '@/lib/db/repositories/webhookEventRepository';
import { verifyStripeWebhook, processStripeEvent } from '@/services/paymentService';

export const runtime = 'edge';

export const POST = withApiHandler({
  async handler({ req }) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    const event = await verifyStripeWebhook(body, signature);

    const { inserted } = await insertWebhookEventIfNotExists(
      event.id,
      event.type,
      event as unknown as Record<string, unknown>
    );
    if (!inserted) {
      return NextResponse.json({ received: true, idempotent: true });
    }

    await processStripeEvent(event);
    return NextResponse.json({ received: true });
  },
});
