import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getStripe, getOrCreateStripePrice, validateCheckoutUrl } from '@/lib/monetization/checkout';
import { getPackBySku } from '@/lib/monetization/catalog';
import { checkoutLimiter } from '@/lib/rate-limit';
import { dbRetry } from '@/lib/db/withRetry';
import { withTimeout } from '@/lib/fetch';
import { AppError } from '@/lib/errors';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';
import { captureServer, AnalyticsEvents } from '@/lib/analytics';

export const runtime = 'edge';

const subscriptionCheckoutSchema = z.object({
  plan: z.enum(['bar_monthly']),
  email: z.string().email('Email invalide'),
  name: z.string().min(1, 'Le nom est requis'),
  company: z.string().optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const POST = withApiHandler({
  bodySchema: subscriptionCheckoutSchema,
  rateLimit: checkoutLimiter,
  async handler({ body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }

    validateCheckoutUrl(body.successUrl);
    validateCheckoutUrl(body.cancelUrl);

    const pack = await getPackBySku('BAR_MONTHLY');
    if (!pack) {
      return NextResponse.json({ error: 'Abonnement introuvable', code: 'NOT_FOUND' }, { status: 404 });
    }

    const userId = await getOrCreateUser(body.email, body.name);
    const customerId = await getOrCreateCustomer(userId, body.email);
    const priceId = await getOrCreateStripePrice(pack);

    const session = await withTimeout(
      getStripe().checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: {
          sku: pack.sku,
          packId: pack.id,
          userId,
          productType: pack.productType,
          company: body.company || '',
        },
        success_url: body.successUrl,
        cancel_url: body.cancelUrl,
      }),
      15000,
    );

    await dbRetry<null>(async () =>
      supabaseAdmin.from('Purchase').insert({
        id: crypto.randomUUID(),
        userId,
        packId: pack.id,
        amount: pack.price,
        currency: 'eur',
        status: 'PENDING',
        stripePaymentId: session.id,
        metadata: { source: 'subscription_checkout', plan: body.plan, company: body.company },
      }),
    );

    await captureServer(AnalyticsEvents.CHECKOUT_INITIATED, {
      sku: pack.sku,
      productType: pack.productType,
      price: pack.price,
      userId,
      plan: body.plan,
    });

    logger.info('Subscription checkout initiated', { sku: pack.sku, userId, plan: body.plan });

    return NextResponse.json({ sessionId: session.id, sessionUrl: session.url });
  },
});

async function getOrCreateUser(email: string, name: string): Promise<string> {
  const { data: existingUser } = await dbRetry<{ id: string }>(async () =>
    supabaseAdmin.from('User').select('id').eq('email', email).maybeSingle(),
  );

  if (existingUser) {
    return existingUser.id;
  }

  const id = crypto.randomUUID();
  const { error: authError } = await supabaseAdmin.auth.admin.createUser({
    id,
    email,
    email_confirm: true,
    user_metadata: { name },
  });

  if (authError) {
    if (authError.message?.toLowerCase().includes('already exists') || authError.status === 422) {
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const authUser = users?.find((u) => u.email === email);
      if (authUser) {
        return authUser.id;
      }
    }
    throw new AppError('INTERNAL_ERROR', 'Erreur de création utilisateur', { cause: authError });
  }

  const { error: userError } = await dbRetry<null>(async () =>
    supabaseAdmin.from('User').insert({ id, email, name }),
  );

  if (userError) {
    const errObj = userError as unknown as Record<string, unknown>;
    if (errObj?.code !== '23505') {
      throw new AppError('INTERNAL_ERROR', 'Erreur de création utilisateur', { cause: userError });
    }
  }

  return id;
}

async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  const { data: user } = await dbRetry<{ stripeCustomerId: string | null }>(async () =>
    supabaseAdmin.from('User').select('stripeCustomerId').eq('id', userId).maybeSingle(),
  );

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const existingCustomers = await withTimeout(
    getStripe().customers.list({ email, limit: 1 }),
    10000,
  );

  if (existingCustomers.data.length > 0) {
    const customerId = existingCustomers.data[0].id;
    await dbRetry<null>(async () =>
      supabaseAdmin.from('User').update({ stripeCustomerId: customerId }).eq('id', userId),
    );
    return customerId;
  }

  const customer = await withTimeout(
    getStripe().customers.create({ email, metadata: { userId } }),
    10000,
  );

  await dbRetry<null>(async () =>
    supabaseAdmin.from('User').update({ stripeCustomerId: customer.id }).eq('id', userId),
  );

  return customer.id;
}
