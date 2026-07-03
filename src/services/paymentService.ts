import Stripe from 'stripe';
import {
  getUserByStripeCustomerId,
  updateUser,
  getPurchaseByStripePaymentId,
  updatePurchase,
  getPurchaseByStripeInvoiceId,
} from '@/lib/db/repositories';
import { getCoupleById } from '@/lib/db/repositories/coupleRepository';
import { getPackById, getPackBySku } from '@/lib/monetization/catalog';
import { invalidateUserEntitlements } from '@/lib/monetization/entitlements';
import { captureServer, AnalyticsEvents } from '@/lib/analytics';
import { AppError } from '@/lib/errors';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { dbRetry, withRetry } from '@/lib/db/withRetry';
import { withTimeout } from '@/lib/fetch';
import { logger } from '@/lib/logger';
import { requireEnv } from '@/lib/env';
import type { Pack } from '@/lib/monetization/catalog';

const stripeSecretKey = requireEnv('STRIPE_SECRET_KEY');
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

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, event: Stripe.Event) {
  const metadata = session.metadata || {};
  const { sku, packId, playerId, roomCode, userId } = metadata;

  let activeUserId = userId;
  let userEmail = '';
  let userName = '';

  if (!activeUserId) {
    if (session.customer_details?.email) {
      const email = session.customer_details.email;
      userEmail = email;
      userName = session.customer_details?.name || 'Collaborateur Pro';
      const { data: existingUser } = await dbRetry<{ id: string }>(async () =>
        supabaseAdmin.from('User').select('id').eq('email', email).maybeSingle()
      );

      if (existingUser) {
        activeUserId = existingUser.id;
      } else {
        activeUserId = globalThis.crypto.randomUUID();
        const { error: authError } = await supabaseAdmin.auth.admin.createUser({
          id: activeUserId,
          email,
          email_confirm: true,
          user_metadata: { name: userName },
        });

        if (authError) {
          logger.warn('Supabase Auth corporate user creation check', {}, authError);
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
          const authUser = users?.find((u) => u.email === email);
          if (authUser) {
            activeUserId = authUser.id;
          } else {
            throw new AppError('INTERNAL_ERROR', 'Erreur de création utilisateur corporate', { cause: authError });
          }
        }
      }
    } else {
      logger.error('Missing userId in checkout session metadata', { sessionId: session.id });
      return;
    }
  }

  const pack = packId ? await getPackById(packId) : sku ? await getPackBySku(sku) : null;
  if (!pack) {
    logger.error('Pack not found for checkout session', { sessionId: session.id, sku, packId });
    return;
  }

  const durationHours = pack.productType === 'PASS_WEEKEND' ? 72 : 24;
  const subscriptionId = pack.isSubscription
    ? (typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? null)
    : null;

  const { error: fulfillError } = await dbRetry<null>(async () => supabaseAdmin.rpc('fulfill_checkout_v2', {
    p_event_id: event.id,
    p_event_type: event.type,
    p_payload: event as unknown as Record<string, unknown>,
    p_stripe_session_id: session.id,
    p_user_id: activeUserId,
    p_email: userEmail,
    p_name: userName,
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
    p_subscription_id: subscriptionId,
  }));

  if (fulfillError) {
    logger.error('RPC fulfill_checkout_v2 error', {}, fulfillError);
    throw new AppError('INTERNAL_ERROR', `Fulfillment failed: ${(fulfillError as Error).message || String(fulfillError)}`);
  }

  if (pack.isSubscription && metadata.coupleId) {
    await mirrorSubscriptionToPartner(metadata.coupleId, activeUserId, pack, session.subscription as string | null);
  }

  await captureServer(AnalyticsEvents.PURCHASE_COMPLETED, {
    sku: pack.sku,
    productType: pack.productType,
    price: pack.price,
    playerId,
    roomCode,
    userId: activeUserId,
    stripeSessionId: session.id,
  });

  logger.info('Purchase completed', { sku: pack.sku, userId: activeUserId, stripeSessionId: session.id });
}

async function mirrorSubscriptionToPartner(
  coupleId: string,
  activeUserId: string,
  pack: Pack,
  subscriptionId: string | null,
) {
  if (!subscriptionId) {
    logger.warn('No subscription id for partner mirroring', { coupleId, activeUserId });
    return;
  }

  if (!coupleId) {
    return;
  }

  const couple = await getCoupleById(coupleId);
  if (!couple) {
    logger.error('Couple not found for partner mirroring', { coupleId });
    return;
  }

  const partnerId = couple.user1Id === activeUserId ? couple.user2Id : couple.user1Id;

  const subscription = await withTimeout(stripe.subscriptions.retrieve(subscriptionId), 10000);
  const currentPeriodEnd = (subscription as unknown as { current_period_end: number }).current_period_end;
  const expiresAt = new Date(currentPeriodEnd * 1000).toISOString();

  await dbRetry<null>(async () =>
    supabaseAdmin.from('UserPass').upsert(
      {
        id: crypto.randomUUID(),
        userId: partnerId,
        packId: pack.id,
        expiresAt,
        source: 'couple_partner',
      },
      { onConflict: 'userId,source', ignoreDuplicates: false },
    ),
  );

  const { data: partner } = await dbRetry<{ activePassExpiresAt: string | null }>(async () =>
    supabaseAdmin.from('User').select('activePassExpiresAt').eq('id', partnerId).maybeSingle(),
  );

  const currentExpires = partner?.activePassExpiresAt ? new Date(partner.activePassExpiresAt).getTime() : 0;
  if (!partner?.activePassExpiresAt || new Date(expiresAt).getTime() > currentExpires) {
    await updateUser(partnerId, { activePassExpiresAt: expiresAt });
  }

  await invalidateUserEntitlements(partnerId);

  logger.info('Subscription mirrored to partner', { coupleId, partnerId, subscriptionId, expiresAt });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const invoiceSubscription = (invoice as unknown as { subscription?: string | { id?: string } }).subscription;
  const subscriptionId = typeof invoiceSubscription === 'string' ? invoiceSubscription : invoiceSubscription?.id;
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

  if (!subscriptionId || !customerId) return;

  const user = await getUserByStripeCustomerId(customerId);
  if (!user) {
    logger.error('User not found for Stripe customer', { customerId });
    return;
  }

  await updateUser(user.id, { subscriptionStatus: 'ACTIVE' });
  await invalidateUserEntitlements(user.id);

  const subscription = await withTimeout(stripe.subscriptions.retrieve(subscriptionId), 10000);
  const coupleId = subscription.metadata?.coupleId;

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

      if (coupleId) {
        const fullPack = await getPackById(pack.id);
        if (fullPack) {
          await mirrorSubscriptionToPartner(coupleId, user.id, fullPack, subscriptionId);
        }
      }
    }
  } else if (coupleId) {
    const firstLine = invoice.lines.data[0] as unknown as { price?: string | { id?: string } };
    const priceId = typeof firstLine?.price === 'string' ? firstLine.price : firstLine?.price?.id;
    const { data: pack } = await dbRetry<{ id: string }>(async () =>
      supabaseAdmin.from('Pack').select('id').eq('stripePriceId', priceId).maybeSingle(),
    );
    if (pack) {
      const fullPack = await getPackById(pack.id);
      if (fullPack) {
        await mirrorSubscriptionToPartner(coupleId, user.id, fullPack, subscriptionId);
      }
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
  const existingPurchase = await getPurchaseByStripePaymentId(session.id);

  if (existingPurchase) {
    logger.info('Checkout session already reconciled', { sessionId: session.id });
    return;
  }

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
