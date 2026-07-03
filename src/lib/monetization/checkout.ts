import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getPackBySku, toCents, Pack } from './catalog';
import { captureServer, AnalyticsEvents } from '@/lib/analytics';
import { dbRetry } from '@/lib/db/withRetry';
import { withTimeout } from '@/lib/fetch';
import { logger } from '@/lib/logger';
import { AppError } from '@/lib/errors';
import { requireEnv } from '@/lib/env';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = requireEnv('STRIPE_SECRET_KEY');
    stripeInstance = new Stripe(key, {
      apiVersion: '2026-05-27.dahlia',
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return stripeInstance;
}

export interface CreateCheckoutSessionInput {
  sku: string;
  playerId: string;
  roomCode: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResult {
  sessionId: string;
  sessionUrl: string | null;
}

export function validateCheckoutUrl(url: string): void {
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : undefined);

  // Autorise les URLs relatives locales qui ne sont pas protocol-relative.
  if (url.startsWith('/') && !url.startsWith('//')) return;

  if (!allowedOrigin) {
    throw new AppError('VALIDATION_ERROR', 'URL de redirection invalide');
  }

  try {
    const parsed = new URL(url);
    const allowed = new URL(allowedOrigin);
    if (parsed.origin === allowed.origin) return;
  } catch {
    // URL malformée
  }

  throw new AppError('VALIDATION_ERROR', 'URL de redirection invalide');
}

export async function createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResult> {
  const { sku, playerId, roomCode, successUrl, cancelUrl } = input;

  validateCheckoutUrl(successUrl);
  validateCheckoutUrl(cancelUrl);

  const pack = await getPackBySku(sku);
  if (!pack) {
    throw new AppError('NOT_FOUND', `Pack inconnu: ${sku}`);
  }

  const { data: room } = await dbRetry<{ id: string; code: string }>(async () =>
    supabaseAdmin
      .from('Room')
      .select('id, code')
      .eq('code', roomCode.toUpperCase().trim())
      .maybeSingle(),
  );

  if (!room) {
    throw new AppError('NOT_FOUND', 'Salle introuvable');
  }

  const { data: player } = await dbRetry<{ id: string; userId: string | null; name: string | null }>(async () =>
    supabaseAdmin
      .from('Player')
      .select('id, userId, name')
      .eq('id', playerId)
      .eq('roomId', room.id)
      .maybeSingle(),
  );

  if (!player) {
    throw new AppError('NOT_FOUND', 'Joueur introuvable dans cette salle');
  }

  // Récupérer ou créer un User lié à Supabase Auth
  let userId = player.userId;
  if (!userId) {
    const email = `player-${playerId.slice(0, 8)}-${room.code.toLowerCase()}@captainbond.com`;
    // Check if user already exists in DB
    const { data: existingUser } = await dbRetry<{ id: string }>(async () =>
      supabaseAdmin.from('User').select('id').eq('email', email).maybeSingle()
    );

    if (existingUser) {
      userId = existingUser.id;
    } else {
      userId = crypto.randomUUID();
      const { error: authError } = await supabaseAdmin.auth.admin.createUser({
        id: userId,
        email,
        email_confirm: true,
        user_metadata: { name: player.name || 'Agent Bond' },
      });

      if (authError) {
        if (authError.message?.toLowerCase().includes('already exists') || authError.status === 422) {
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
          const authUser = users?.find((u) => u.email === email);
          if (authUser) {
            userId = authUser.id;
          } else {
            throw new AppError('INTERNAL_ERROR', 'Erreur de création utilisateur', { cause: authError });
          }
        } else {
          logger.error('Supabase Auth user creation failed', {}, authError);
          throw new AppError('INTERNAL_ERROR', 'Erreur de création utilisateur', { cause: authError });
        }
      }

      const { error: userError } = await dbRetry<null>(async () => supabaseAdmin.from('User').insert({
        id: userId,
        email,
        name: player.name || 'Agent Bond',
      }));

      if (userError) {
        const errObj = userError as unknown as Record<string, unknown>;
        if (errObj?.code !== '23505') {
          logger.error('User insertion failed', {}, userError);
          throw new AppError('INTERNAL_ERROR', 'Erreur de création utilisateur', { cause: userError });
        }
      }
    }

    await dbRetry<null>(async () => supabaseAdmin.from('Player').update({ userId }).eq('id', playerId));
  }

  // Idempotence : réutiliser une session Stripe récente si elle existe
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: pendingPurchase } = await dbRetry<{ id: string; stripePaymentId: string | null }>(async () =>
    supabaseAdmin
      .from('Purchase')
      .select('id, "stripePaymentId"')
      .eq('playerId', playerId)
      .eq('packId', pack.id)
      .eq('status', 'PENDING')
      .gte('createdAt', since)
      .order('createdAt', { ascending: false })
      .maybeSingle(),
  );

  if (pendingPurchase?.stripePaymentId) {
    try {
      const existingSession = await withTimeout(getStripe().checkout.sessions.retrieve(pendingPurchase.stripePaymentId), 10000);
      if (existingSession.status !== 'expired' && existingSession.url) {
        return { sessionId: existingSession.id, sessionUrl: existingSession.url };
      }
    } catch (e) {
      logger.warn('Could not retrieve existing Stripe session', {}, e);
    }
  }

  // Récupérer ou créer le customer Stripe
  const { data: user } = await dbRetry<{ stripeCustomerId: string | null; email: string | null }>(async () => supabaseAdmin.from('User').select('stripeCustomerId, email').eq('id', userId).maybeSingle());
  let customerId = user?.stripeCustomerId;

  if (!customerId && user?.email) {
    // Check if customer already exists in Stripe with this email
    const existingCustomers = await withTimeout(getStripe().customers.list({
      email: user.email,
      limit: 1,
    }), 10000);
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      await dbRetry<null>(async () => supabaseAdmin.from('User').update({ stripeCustomerId: customerId }).eq('id', userId));
    }
  }

  if (!customerId) {
    const customer = await withTimeout(getStripe().customers.create({
      email: user?.email || undefined,
      metadata: { userId, playerId },
    }), 10000);
    customerId = customer.id;
    await dbRetry<null>(async () => supabaseAdmin.from('User').update({ stripeCustomerId: customerId }).eq('id', userId));
  }

  const isSubscription = pack.isSubscription;
  const lineItem = buildLineItem(pack);

  const session = await withTimeout(getStripe().checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: isSubscription ? 'subscription' : 'payment',
    line_items: [lineItem],
    metadata: {
      sku: pack.sku,
      packId: pack.id,
      playerId,
      roomCode: room.code,
      userId,
      productType: pack.productType,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  }), 15000);

  await dbRetry<null>(async () => supabaseAdmin.from('Purchase').insert({
    id: crypto.randomUUID(),
    userId,
    playerId,
    packId: pack.id,
    amount: pack.price,
    currency: 'eur',
    status: 'PENDING',
    stripePaymentId: session.id,
    metadata: { roomCode: room.code, source: 'checkout' },
  }));

  await captureServer(AnalyticsEvents.CHECKOUT_INITIATED, {
    sku: pack.sku,
    productType: pack.productType,
    price: pack.price,
    playerId,
    roomCode: room.code,
    userId,
  });

  return { sessionId: session.id, sessionUrl: session.url };
}

function buildLineItem(pack: Pack): Stripe.Checkout.SessionCreateParams.LineItem {
  if (pack.isSubscription) {
    if (!pack.stripePriceId) {
      throw new AppError('INTERNAL_ERROR', `Prix Stripe manquant pour l'abonnement ${pack.sku}`);
    }
    return { price: pack.stripePriceId, quantity: 1 };
  }

  return {
    price_data: {
      currency: 'eur',
      product_data: {
        name: pack.name,
        description: pack.description,
      },
      unit_amount: toCents(pack.price),
    },
    quantity: 1,
  };
}

export async function getOrCreateStripePrice(pack: Pack): Promise<string> {
  if (pack.stripePriceId) {
    return pack.stripePriceId;
  }

  const interval = pack.productType === 'SUBSCRIPTION_ANNUAL' ? 'year' : 'month';

  const product = await withTimeout(
    getStripe().products.create({
      name: pack.name,
      description: pack.description,
    }),
    10000,
  );

  const price = await withTimeout(
    getStripe().prices.create({
      product: product.id,
      unit_amount: toCents(pack.price),
      currency: 'eur',
      recurring: { interval },
    }),
    10000,
  );

  const { error } = await dbRetry<null>(async () =>
    supabaseAdmin
      .from('Pack')
      .update({ stripePriceId: price.id, stripeProductId: product.id })
      .eq('id', pack.id),
  );

  if (error) {
    logger.error('Failed to save Stripe price id', { packId: pack.id }, error);
  }

  return price.id;
}
