import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { getStripe, getOrCreateStripePrice, validateCheckoutUrl } from '@/lib/monetization/checkout';
import { getPackBySku } from '@/lib/monetization/catalog';
import { getCoupleById } from '@/lib/db/repositories/coupleRepository';
import { checkoutLimiter } from '@/lib/rate-limit';
import { dbRetry } from '@/lib/db/withRetry';
import { withTimeout } from '@/lib/fetch';
import { AppError } from '@/lib/errors';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';
import { captureServer, AnalyticsEvents } from '@/lib/analytics';

export const runtime = 'edge';

const coupleSubscriptionSchema = z.object({
  plan: z.enum(['couple_annual', 'couple_monthly']),
  coupleId: z.string().optional(),
  successUrl: z.string().min(1),
  cancelUrl: z.string().min(1),
});

export const POST = withApiHandler({
  bodySchema: coupleSubscriptionSchema,
  rateLimit: checkoutLimiter,
  async handler({ body, req }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }

    validateCheckoutUrl(body.successUrl);
    validateCheckoutUrl(body.cancelUrl);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get('host') || 'captainbond.com'}`;
    const absoluteUrl = (url: string) => (url.startsWith('/') ? `${siteUrl}${url}` : url);

    const sku = body.plan === 'couple_annual' ? 'SUBSCRIPTION_ANNUAL' : 'SUBSCRIPTION_MONTHLY';
    const pack = await getPackBySku(sku);
    if (!pack) {
      return NextResponse.json({ error: 'Abonnement introuvable', code: 'NOT_FOUND' }, { status: 404 });
    }

    const authUser = await getAuthenticatedUser(req);
    const userId = authUser.id;
    const email = authUser.email;

    if (body.coupleId) {
      const couple = await getCoupleById(body.coupleId);
      if (!couple || (couple.user1Id !== userId && couple.user2Id !== userId)) {
        throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple');
      }
    }

    const customerId = await getOrCreateCustomer(userId, email);
    const priceId = await getOrCreateStripePrice(pack);

    const session = await withTimeout(
      getStripe().checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        subscription_data: {
          metadata: {
            coupleId: body.coupleId || '',
          },
        },
        metadata: {
          sku: pack.sku,
          packId: pack.id,
          userId,
          coupleId: body.coupleId || '',
          productType: pack.productType,
        },
        success_url: absoluteUrl(body.successUrl),
        cancel_url: absoluteUrl(body.cancelUrl),
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
        metadata: { source: 'couple_subscription', plan: body.plan, coupleId: body.coupleId },
      }),
    );

    await captureServer(AnalyticsEvents.CHECKOUT_INITIATED, {
      sku: pack.sku,
      productType: pack.productType,
      price: pack.price,
      userId,
      plan: body.plan,
      coupleId: body.coupleId,
    });

    logger.info('Couple subscription checkout initiated', { sku: pack.sku, userId, plan: body.plan, coupleId: body.coupleId });

    return NextResponse.json({ sessionId: session.id, sessionUrl: session.url });
  },
});

async function getOrCreateCustomer(userId: string, email?: string): Promise<string> {
  const { data: user } = await dbRetry<{ stripeCustomerId: string | null; email: string | null }>(async () =>
    supabaseAdmin.from('User').select('stripeCustomerId, email').eq('id', userId).maybeSingle(),
  );

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const userEmail = email || user?.email;

  if (userEmail) {
    const existingCustomers = await withTimeout(
      getStripe().customers.list({ email: userEmail, limit: 1 }),
      10000,
    );

    if (existingCustomers.data.length > 0) {
      const customerId = existingCustomers.data[0].id;
      await dbRetry<null>(async () =>
        supabaseAdmin.from('User').update({ stripeCustomerId: customerId }).eq('id', userId),
      );
      return customerId;
    }
  }

  const customer = await withTimeout(
    getStripe().customers.create({
      email: userEmail || undefined,
      metadata: { userId },
    }),
    10000,
  );

  await dbRetry<null>(async () =>
    supabaseAdmin.from('User').update({ stripeCustomerId: customer.id }).eq('id', userId),
  );

  return customer.id;
}
