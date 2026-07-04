import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { REVENUECAT_PRODUCT_MAPPING } from '@/lib/config/monetization';
import { insertWebhookEventIfNotExists } from '@/lib/db/repositories/webhookEventRepository';
import { logger } from '@/lib/logger';
import { eventBus } from '@/lib/events/bus';
import { webhookLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

const revenueCatEventSchema = z.object({
  event: z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    original_app_user_id: z.string().optional(),
    product_id: z.string().optional(),
    transaction_id: z.string().optional(),
    store: z.string().optional(),
    original_transaction_id: z.string().optional(),
    purchaser_info: z.record(z.string(), z.unknown()).optional(),
    attributes: z
      .object({
        roomCode: z.object({ value: z.string() }).optional(),
        playerId: z.object({ value: z.string() }).optional(),
      })
      .passthrough()
      .optional(),
  }).passthrough(),
});

type RevenueCatPayload = z.infer<typeof revenueCatEventSchema>;

export const POST = withApiHandler({
  bodySchema: revenueCatEventSchema,
  rateLimit: webhookLimiter,
  async handler({ req, body }) {
    const authHeader = req.headers.get('Authorization');
    const secret = process.env.REVENUECAT_WEBHOOK_SECRET;

    if (secret && authHeader !== `Bearer ${secret}`) {
      logger.warn('Unauthorized RevenueCat webhook attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = body as RevenueCatPayload;
    const event = payload.event;

    logger.info('Received RevenueCat webhook event', { eventId: event.id, type: event.type });

    if (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL') {
      const eventId = event.id;
      const userId = event.original_app_user_id;
      const productId = event.product_id;

      if (!userId) {
        logger.error('Missing original_app_user_id in RevenueCat event', { eventId });
        return NextResponse.json({ error: 'Missing app user id' }, { status: 400 });
      }

      const mapping = REVENUECAT_PRODUCT_MAPPING[productId || ''];
      if (!mapping) {
        logger.error('No database mapping found for RevenueCat product ID', { productId });
        return NextResponse.json({ error: 'Unknown product' }, { status: 400 });
      }

      const { inserted } = await insertWebhookEventIfNotExists(
        eventId,
        `revenuecat.${event.type}`,
        payload
      );
      if (!inserted) {
        logger.info('Duplicate RevenueCat webhook event, skipping', { eventId });
        return NextResponse.json({ received: true, idempotent: true });
      }

      const { error: fulfillError } = await supabaseAdmin.rpc('fulfill_checkout', {
        p_event_id: eventId,
        p_event_type: `revenuecat.${event.type}`,
        p_payload: payload as unknown as Record<string, unknown>,
        p_stripe_session_id: event.transaction_id || `rc_${eventId}`,
        p_user_id: userId,
        p_pack_id: mapping.packId,
        p_room_code: event.attributes?.roomCode?.value || '',
        p_player_id: event.attributes?.playerId?.value || '',
        p_product_type: mapping.productType,
        p_duration_hours: mapping.durationHours,
        p_metadata: {
          store: event.store || 'UNKNOWN',
          original_transaction_id: event.original_transaction_id || '',
          purchaser_info: event.purchaser_info || {},
        },
      });

      if (fulfillError) {
        logger.error('RPC fulfill_checkout failed for RevenueCat', {}, fulfillError);
        return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 });
      }

      logger.info('RevenueCat purchase fulfilled successfully', { userId, productId });

      eventBus.emit('webhook:processed', { type: 'REVENUECAT', eventId, sku: mapping.packId, userId });
    } else {
      logger.info('Unhandled RevenueCat webhook event type', { type: event.type });
    }

    return NextResponse.json({ received: true });
  },
});
