import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import type Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  getUserByStripeCustomerId,
  getPurchaseByStripeInvoiceId,
  getPurchaseByStripePaymentId,
  updateUser,
  updatePurchase,
} from '@/lib/db/repositories';

const subscriptionsRetrieve = vi.fn().mockResolvedValue({
  id: 'sub_1',
  metadata: {},
  current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
});
const sessionsRetrieve = vi.fn().mockResolvedValue({ status: 'complete' });

vi.mock('stripe', () => ({
  default: class MockStripe {
    static createFetchHttpClient = vi.fn();
    subscriptions = { retrieve: subscriptionsRetrieve };
    checkout = { sessions: { retrieve: sessionsRetrieve } };
    webhooks = { constructEventAsync: vi.fn() };
  },
}));

vi.mock('@/lib/db/repositories', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/db/repositories')>();
  return {
    ...actual,
    getUserByStripeCustomerId: vi.fn(),
    getPurchaseByStripeInvoiceId: vi.fn(),
    getPurchaseByStripePaymentId: vi.fn(),
    updateUser: vi.fn(),
    updatePurchase: vi.fn(),
  };
});

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    rpc: vi.fn(),
    auth: {
      admin: {
        createUser: vi.fn().mockResolvedValue({ error: null }),
        listUsers: vi.fn().mockResolvedValue({ data: { users: [] }, error: null }),
      },
    },
    from: vi.fn(),
  },
}));

vi.mock('@/lib/monetization/entitlements', () => ({
  invalidateUserEntitlements: vi.fn(),
  invalidateRoomPassInfo: vi.fn(),
}));

vi.mock('@/lib/analytics', () => ({
  captureServer: vi.fn(),
  AnalyticsEvents: {
    PURCHASE_COMPLETED: 'PURCHASE_COMPLETED',
    PURCHASE_FAILED: 'PURCHASE_FAILED',
  },
}));

function buildDefaultFrom(table?: string) {
  const base = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    delete: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  if (table === 'Couple') {
    return {
      ...base,
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: 'couple_1', user1Id: 'u1', user2Id: 'u2' },
        error: null,
      }),
    };
  }

  if (table === 'User') {
    return {
      ...base,
      maybeSingle: vi.fn().mockResolvedValue({
        data: { activePassExpiresAt: null },
        error: null,
      }),
    };
  }

  return base;
}

describe('paymentService', () => {
  let paymentService: typeof import('../paymentService');

  beforeAll(async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', `sk_test_${'x'.repeat(50)}`);
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', `whsec_${'x'.repeat(40)}`);
    paymentService = await import('../paymentService');
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) =>
      buildDefaultFrom(table)
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('verifyStripeWebhook', () => {
    it('throws when webhook secret is missing', async () => {
      vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');
      await expect(paymentService.verifyStripeWebhook('body', 'sig')).rejects.toThrow(
        'Webhook Stripe non configuré'
      );
    });
  });

  describe('processStripeEvent', () => {
    it('calls fulfill_checkout_v2 for checkout.session.completed', async () => {
      const session = {
        id: 'cs_1',
        metadata: { sku: 'PASS_24H', userId: 'u1' },
        customer_details: null,
        customer: null,
        payment_intent: 'pi_1',
        invoice: null,
        subscription: null,
      };
      const event = {
        id: 'evt_1',
        type: 'checkout.session.completed',
        data: { object: session },
      } as unknown as Stripe.Event;

      (supabaseAdmin.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });

      await paymentService.processStripeEvent(event);

      expect(supabaseAdmin.rpc).toHaveBeenCalledWith(
        'fulfill_checkout_v2',
        expect.objectContaining({
          p_stripe_session_id: 'cs_1',
          p_user_id: 'u1',
          p_pack_id: 'pack-pass-24h',
          p_product_type: 'PASS_24H',
          p_duration_hours: 24,
          p_subscription_id: null,
        })
      );
    });

    it('passes subscription id for subscription packs', async () => {
      const session = {
        id: 'cs_sub',
        metadata: { sku: 'SUBSCRIPTION_MONTHLY', userId: 'u2' },
        customer_details: null,
        customer: null,
        payment_intent: 'pi_sub',
        invoice: null,
        subscription: 'sub_123',
      };
      const event = {
        id: 'evt_sub',
        type: 'checkout.session.completed',
        data: { object: session },
      } as unknown as Stripe.Event;

      (supabaseAdmin.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });

      await paymentService.processStripeEvent(event);

      expect(supabaseAdmin.rpc).toHaveBeenCalledWith(
        'fulfill_checkout_v2',
        expect.objectContaining({
          p_stripe_session_id: 'cs_sub',
          p_product_type: 'SUBSCRIPTION_MONTHLY',
          p_subscription_id: 'sub_123',
        })
      );
    });

    it('throws when fulfill_checkout_v2 returns an error', async () => {
      const session = {
        id: 'cs_2',
        metadata: { sku: 'PASS_24H', userId: 'u2' },
        customer_details: null,
        customer: null,
        payment_intent: 'pi_2',
        invoice: null,
        subscription: null,
      };
      const event = {
        id: 'evt_2',
        type: 'checkout.session.completed',
        data: { object: session },
      } as unknown as Stripe.Event;

      (supabaseAdmin.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error: new Error('db down'),
      });

      await expect(paymentService.processStripeEvent(event)).rejects.toThrow('Fulfillment failed');
    });

    it('mirrors subscription to partner on checkout.session.completed with coupleId', async () => {
      const session = {
        id: 'cs_couple',
        metadata: { sku: 'SUBSCRIPTION_ANNUAL', userId: 'u1', coupleId: 'couple_1' },
        customer_details: null,
        customer: null,
        payment_intent: 'pi_couple',
        invoice: null,
        subscription: 'sub_123',
      };
      const event = {
        id: 'evt_couple',
        type: 'checkout.session.completed',
        data: { object: session },
      } as unknown as Stripe.Event;

      const userPassMock = buildDefaultFrom('UserPass');
      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
        const base = buildDefaultFrom(table);
        if (table === 'UserPass') return userPassMock;
        return base;
      });
      (supabaseAdmin.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });

      await paymentService.processStripeEvent(event);

      expect(userPassMock.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'u2', source: 'couple_partner' }),
        expect.anything(),
      );
    });

    it('does not mirror when Stripe subscription lacks current_period_end', async () => {
      subscriptionsRetrieve.mockResolvedValueOnce({
        id: 'sub_bad',
        metadata: {},
        current_period_end: undefined,
      });

      const session = {
        id: 'cs_bad',
        metadata: { sku: 'SUBSCRIPTION_ANNUAL', userId: 'u1', coupleId: 'couple_1' },
        customer_details: null,
        customer: null,
        payment_intent: 'pi_bad',
        invoice: null,
        subscription: 'sub_bad',
      };
      const event = {
        id: 'evt_bad',
        type: 'checkout.session.completed',
        data: { object: session },
      } as unknown as Stripe.Event;

      const userPassMock = buildDefaultFrom('UserPass');
      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
        const base = buildDefaultFrom(table);
        if (table === 'UserPass') return userPassMock;
        return base;
      });
      (supabaseAdmin.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });

      await paymentService.processStripeEvent(event);

      expect(userPassMock.upsert).not.toHaveBeenCalled();
    });

    describe('invoice.payment_succeeded', () => {
      it('reactivates subscription and creates purchase when none exists', async () => {
        const invoice = {
          id: 'inv_1',
          customer: 'cus_1',
          subscription: 'sub_1',
          amount_paid: 799,
          currency: 'eur',
          lines: { data: [{ price: { id: 'price_monthly' } }] },
          payment_intent: 'pi_inv1',
        } as unknown as Stripe.Invoice;

        vi.mocked(getUserByStripeCustomerId).mockResolvedValue({ id: 'u1', email: 'a@b.com' } as unknown as Awaited<ReturnType<typeof getUserByStripeCustomerId>>);
        vi.mocked(getPurchaseByStripeInvoiceId).mockResolvedValue(null);

        (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
          const base = buildDefaultFrom(table);
          if (table === 'Pack') {
            base.eq = vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: 'pack-sub-monthly', price: 7.99 },
                error: null,
              }),
            });
          }
          return base;
        });

        await paymentService.processStripeEvent({
          id: 'evt_inv',
          type: 'invoice.payment_succeeded',
          data: { object: invoice },
        } as unknown as Stripe.Event);

        expect(updateUser).toHaveBeenCalledWith('u1', { subscriptionStatus: 'ACTIVE' });
        expect(supabaseAdmin.from).toHaveBeenCalledWith('Purchase');
      });

      it('does nothing when customer or subscription is missing', async () => {
        const invoice = { id: 'inv_2', customer: null, subscription: null } as unknown as Stripe.Invoice;

        await paymentService.processStripeEvent({
          id: 'evt_inv2',
          type: 'invoice.payment_succeeded',
          data: { object: invoice },
        } as unknown as Stripe.Event);

        expect(getUserByStripeCustomerId).not.toHaveBeenCalled();
      });

      it('mirrors subscription to partner when subscription metadata has coupleId', async () => {
        subscriptionsRetrieve.mockResolvedValueOnce({
          id: 'sub_1',
          metadata: { coupleId: 'couple_1' },
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        });

        const invoice = {
          id: 'inv_couple',
          customer: 'cus_1',
          subscription: 'sub_1',
          amount_paid: 5999,
          currency: 'eur',
          lines: { data: [{ price: { id: 'price_annual' } }] },
          payment_intent: 'pi_inv_couple',
        } as unknown as Stripe.Invoice;

        vi.mocked(getUserByStripeCustomerId).mockResolvedValue({ id: 'u1', email: 'a@b.com' } as unknown as Awaited<ReturnType<typeof getUserByStripeCustomerId>>);
        vi.mocked(getPurchaseByStripeInvoiceId).mockResolvedValue(null);

        const userPassMock = buildDefaultFrom('UserPass');
        (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
          const base = buildDefaultFrom(table);
          if (table === 'Pack') {
            base.eq = vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: 'pack-sub-annual', price: 59.99 },
                error: null,
              }),
            });
          }
          if (table === 'UserPass') return userPassMock;
          return base;
        });

        await paymentService.processStripeEvent({
          id: 'evt_inv_couple',
          type: 'invoice.payment_succeeded',
          data: { object: invoice },
        } as unknown as Stripe.Event);

        expect(userPassMock.upsert).toHaveBeenCalledWith(
          expect.objectContaining({ userId: 'u2', source: 'couple_partner' }),
          expect.anything(),
        );
      });
    });

    describe('subscription lifecycle', () => {
      it('updates user status to ACTIVE on active subscription', async () => {
        vi.mocked(getUserByStripeCustomerId).mockResolvedValue({ id: 'u1', email: 'a@b.com' } as unknown as Awaited<ReturnType<typeof getUserByStripeCustomerId>>);

        await paymentService.processStripeEvent({
          id: 'evt_sub_up',
          type: 'customer.subscription.updated',
          data: { object: { id: 'sub_1', customer: 'cus_1', status: 'active' } },
        } as unknown as Stripe.Event);

        expect(updateUser).toHaveBeenCalledWith('u1', {
          subscriptionStatus: 'ACTIVE',
          stripeSubscriptionId: 'sub_1',
        });
      });

      it('updates user status to CANCELLED on canceled subscription', async () => {
        vi.mocked(getUserByStripeCustomerId).mockResolvedValue({ id: 'u1', email: 'a@b.com' } as unknown as Awaited<ReturnType<typeof getUserByStripeCustomerId>>);

        await paymentService.processStripeEvent({
          id: 'evt_sub_del',
          type: 'customer.subscription.deleted',
          data: { object: { id: 'sub_1', customer: 'cus_1', status: 'canceled' } },
        } as unknown as Stripe.Event);

        expect(updateUser).toHaveBeenCalledWith('u1', {
          subscriptionStatus: 'CANCELLED',
          stripeSubscriptionId: 'sub_1',
        });
      });
    });

    describe('charge.refunded', () => {
      it('updates purchase and deletes UserPack for lifetime packs', async () => {
        vi.mocked(getPurchaseByStripePaymentId).mockResolvedValue({
          id: 'pur_1',
          userId: 'u1',
          packId: 'pack-lifetime',
        } as unknown as Awaited<ReturnType<typeof getPurchaseByStripePaymentId>>);

        (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
          const base = buildDefaultFrom(table);
          if (table === 'Pack') {
            base.eq = vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { productType: 'LIFETIME' },
                error: null,
              }),
            });
          }
          return base;
        });

        await paymentService.processStripeEvent({
          id: 'evt_ref',
          type: 'charge.refunded',
          data: { object: { payment_intent: 'pi_1' } },
        } as unknown as Stripe.Event);

        expect(updatePurchase).toHaveBeenCalledWith('pur_1', expect.objectContaining({ status: 'REFUNDED' }));
        expect(supabaseAdmin.from).toHaveBeenCalledWith('UserPack');
      });

      it('does nothing when purchase is not found', async () => {
        vi.mocked(getPurchaseByStripePaymentId).mockResolvedValue(null);

        await paymentService.processStripeEvent({
          id: 'evt_ref2',
          type: 'charge.refunded',
          data: { object: { payment_intent: 'pi_missing' } },
        } as unknown as Stripe.Event);

        expect(updatePurchase).not.toHaveBeenCalled();
      });
    });
  });

  describe('reconcileCheckoutSession', () => {
    it('skips when a purchase already exists for the session', async () => {
      vi.mocked(getPurchaseByStripePaymentId).mockResolvedValue({ id: 'pur_1' } as unknown as Awaited<ReturnType<typeof getPurchaseByStripePaymentId>>);

      await paymentService.reconcileCheckoutSession({
        id: 'cs_1',
        metadata: { sku: 'PASS_24H' },
      } as unknown as Stripe.Checkout.Session);

      expect(supabaseAdmin.rpc).not.toHaveBeenCalled();
    });

    it('fulfills when no purchase exists for the session', async () => {
      vi.mocked(getPurchaseByStripePaymentId).mockResolvedValue(null);
      (supabaseAdmin.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });

      await paymentService.reconcileCheckoutSession({
        id: 'cs_1',
        metadata: { sku: 'PASS_24H', userId: 'u1' },
      } as unknown as Stripe.Checkout.Session);

      expect(supabaseAdmin.rpc).toHaveBeenCalledWith(
        'fulfill_checkout_v2',
        expect.objectContaining({ p_stripe_session_id: 'cs_1' })
      );
    });
  });
});
