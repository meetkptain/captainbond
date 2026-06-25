import Stripe from 'stripe';
import {
  createWebhookEvent,
  getWebhookEventById,
  getUserByStripeCustomerId,
  updateUser,
  getPurchaseByStripePaymentId,
  updatePurchase,
  getPurchaseByStripeInvoiceId,
} from '@/lib/db/repositories';
import { getPackById, getPackBySku } from '@/lib/monetization/catalog';
import { invalidateUserEntitlements, invalidateRoomPassInfo } from '@/lib/monetization/entitlements';
import { captureServer, AnalyticsEvents } from '@/lib/analytics';
import { AppError } from '@/lib/errors';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { dbRetry, withRetry } from '@/lib/db/withRetry';
import { withTimeout } from '@/lib/fetch';
import { logger } from '@/lib/logger';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-05-27.dahlia',
  httpClient: Stripe.createFetchHttpClient(),
});

export { createCheckoutSession } from '@/lib/monetization/checkout';

export async function verifyStripeWebhook(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new AppError('INTERNAL_ERROR', 'Webhook Stripe non configuré', { status: 500 });
  }

  try {
    return await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new AppError('BAD_REQUEST', `Webhook Error: ${message}`);
  }
}

export async function isWebhookEventProcessed(eventId: string): Promise<boolean> {
  const existing = await getWebhookEventById(eventId);
  return !!existing;
}

export async function processStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, event);
      break;
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
    case 'customer.subscription.deleted':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'charge.refunded':
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;
    default:
      logger.info(`Unhandled Stripe event: ${event.type}`);
  }
}

export async function recordWebhookEvent(event: Stripe.Event): Promise<void> {
  await createWebhookEvent({
    id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, event: Stripe.Event) {
  const metadata = session.metadata || {};
  const { sku, packId, playerId, roomCode, userId, productType } = metadata;

  if (!userId) {
    logger.error('Missing userId in checkout session metadata', { sessionId: session.id });
    return;
  }

  const pack = packId ? await getPackById(packId) : sku ? await getPackBySku(sku) : null;
  if (!pack) {
    logger.error('Pack not found for checkout session', { sessionId: session.id, sku, packId });
    return;
  }

  const durationHours = pack.productType === 'PASS_WEEKEND' ? 72 : 24;

  const { error: fulfillError } = await dbRetry<null>(async () => supabaseAdmin.rpc('fulfill_checkout', {
    p_event_id: event.id,
    p_event_type: event.type,
    p_payload: event as unknown as Record<string, unknown>,
    p_stripe_session_id: session.id,
    p_user_id: userId,
    p_pack_id: pack.id,
    p_room_code: roomCode || '',
    p_player_id: playerId || '',
    p_product_type: pack.productType,
    p_duration_hours: durationHours,
    p_metadata: {
      ...((session.metadata as Record<string, string>) || {}),
      checkoutSessionId: session.id,
      customerId: session.customer,
      paymentIntent: session.payment_intent,
      invoice: session.invoice,
    },
  }));

  if (fulfillError) {
    logger.error('RPC fulfill_checkout error', {}, fulfillError);
    throw new AppError('INTERNAL_ERROR', `Fulfillment failed: ${(fulfillError as Error).message || String(fulfillError)}`);
  }

  if (pack.isSubscription && session.subscription) {
    await updateUser(userId, {
      subscriptionStatus: 'ACTIVE',
      stripeSubscriptionId: session.subscription as string,
    });
  }

  await captureServer(AnalyticsEvents.PURCHASE_COMPLETED, {
    sku: pack.sku,
    productType: pack.productType,
    price: pack.price,
    playerId,
    roomCode,
    userId,
    stripeSessionId: session.id,
  });

  logger.info('Purchase completed', { sku: pack.sku, userId, stripeSessionId: session.id });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = ((invoice as unknown as { subscription?: string }).subscription);
  const customerId = invoice.customer as string;

  if (!subscriptionId || !customerId) return;

  const user = await getUserByStripeCustomerId(customerId);
  if (!user) {
    logger.error('User not found for Stripe customer', { customerId });
    return;
  }

  await updateUser(user.id, { subscriptionStatus: 'ACTIVE' });
  await invalidateUserEntitlements(user.id);

  const existing = await getPurchaseByStripeInvoiceId(invoice.id);
  if (!existing) {
    const firstLine = invoice.lines.data[0] as unknown as { price?: string | { id?: string } };
    const priceId = typeof firstLine?.price === 'string' ? firstLine.price : firstLine?.price?.id;
    const { data: pack } = await dbRetry<{ id: string; price: number }>(async () =>
      supabaseAdmin
        .from('Pack')
        .select('id, price')
        .eq('stripePriceId', priceId)
        .maybeSingle(),
    );

    if (pack) {
      await dbRetry<null>(async () => supabaseAdmin.from('Purchase').insert({
        id: crypto.randomUUID(),
        userId: user.id,
        packId: pack.id,
        amount: (invoice.amount_paid || 0) / 100 || pack.price,
        currency: invoice.currency || 'eur',
        status: 'COMPLETED',
        stripeInvoiceId: invoice.id,
        stripePaymentId: ((invoice as unknown as { payment_intent?: string }).payment_intent),
        metadata: { source: 'subscription_renewal', subscriptionId },
      }));
    }
  }

  logger.info('Subscription renewed', { subscriptionId, customerId });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await getUserByStripeCustomerId(customerId);
  if (!user) {
    logger.error('User not found for Stripe customer on subscription update', { customerId });
    return;
  }

  const status = subscription.status;
  let mappedStatus: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'NONE' = 'NONE';

  if (status === 'active' || status === 'trialing') mappedStatus = 'ACTIVE';
  else if (status === 'canceled') mappedStatus = 'CANCELLED';
  else if (status === 'past_due' || status === 'unpaid') mappedStatus = 'PAST_DUE';

  await updateUser(user.id, {
    subscriptionStatus: mappedStatus,
    stripeSubscriptionId: subscription.id,
  });

  logger.info('Subscription status updated', { subscriptionId: subscription.id, status: mappedStatus, customerId });
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) return;

  const purchase = await getPurchaseByStripePaymentId(paymentIntentId);
  if (!purchase) {
    logger.error('Purchase not found for refunded charge', { paymentIntentId });
    return;
  }

  await updatePurchase(purchase.id, {
    status: 'REFUNDED',
    refundedAt: new Date().toISOString(),
  });

  const { data: pack } = await supabaseAdmin
    .from('Pack')
    .select('productType')
    .eq('id', purchase.packId)
    .maybeSingle();

  if (pack?.productType === 'LIFETIME' || pack?.productType === 'PACK') {
    await dbRetry<null>(async () => supabaseAdmin.from('UserPack').delete().eq('userId', purchase.userId).eq('packId', purchase.packId));
  }

  await captureServer(AnalyticsEvents.PURCHASE_FAILED, {
    reason: 'refunded',
    userId: purchase.userId,
    packId: purchase.packId,
    paymentIntentId,
  });

  logger.info('Purchase refunded', { purchaseId: purchase.id, paymentIntentId, userId: purchase.userId });
}

// ---------- Reconciliation ----------

export async function reconcileCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
  const fakeEvent = {
    id: `reconcile_${crypto.randomUUID()}`,
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 0,
    request: null,
    type: 'checkout.session.completed',
    data: { object: session },
  } as unknown as Stripe.Event;

  await handleCheckoutSessionCompleted(session, fakeEvent);
}

export async function reconcilePendingPurchases(): Promise<{
  processed: number;
  failed: number;
  expired: number;
}> {
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data: pendingPurchases, error } = await dbRetry<Array<{ id: string; stripePaymentId: string | null }>>(async () =>
    supabaseAdmin
      .from('Purchase')
      .select('id, "stripePaymentId"')
      .eq('status', 'PENDING')
      .gte('createdAt', since),
  );

  if (error) {
    throw new AppError('INTERNAL_ERROR', 'Failed to fetch pending purchases', { cause: error });
  }

  let processed = 0;
  let failed = 0;
  let expired = 0;

  for (const purchase of pendingPurchases || []) {
    if (!purchase.stripePaymentId) continue;

    try {
      const session = await withTimeout(stripe.checkout.sessions.retrieve(purchase.stripePaymentId), 10000);

      if (session.status === 'complete') {
        await reconcileCheckoutSession(session);
        processed++;
      } else if (session.status === 'expired') {
        await withRetry(() => updatePurchase(purchase.id, { status: 'FAILED' }));
        expired++;
      }
    } catch (e) {
      logger.error('Reconcile error for purchase', { purchaseId: purchase.id }, e);
      failed++;
    }
  }

  return { processed, failed, expired };
}
