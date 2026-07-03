import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

const createSession = vi.fn();
const customersList = vi.fn();
const customersCreate = vi.fn();
const getOrCreateStripePrice = vi.fn();

vi.mock('@/lib/monetization/checkout', () => ({
  getStripe: () => ({
    checkout: { sessions: { create: createSession } },
    customers: { list: customersList, create: customersCreate },
  }),
  getOrCreateStripePrice: (...args: unknown[]) => getOrCreateStripePrice(...args),
  validateCheckoutUrl: () => undefined,
}));

vi.mock('@/lib/monetization/catalog', () => ({
  getPackBySku: vi.fn((sku: string) => {
    if (sku === 'SUBSCRIPTION_ANNUAL') {
      return Promise.resolve({
        id: 'pack-sub-annual',
        sku: 'SUBSCRIPTION_ANNUAL',
        name: 'Captain Bond Premium — Annuel',
        description: 'Tous les modes, dossiers et packs pendant 1 an.',
        price: 39.99,
        stripePriceId: 'price_annual',
        stripeProductId: 'prod_annual',
        productType: 'SUBSCRIPTION_ANNUAL',
        isSubscription: true,
        isPro: false,
        scope: null,
      });
    }
    if (sku === 'SUBSCRIPTION_MONTHLY') {
      return Promise.resolve({
        id: 'pack-sub-monthly',
        sku: 'SUBSCRIPTION_MONTHLY',
        name: 'Captain Bond Premium — Mensuel',
        description: 'Tous les modes, dossiers et packs pendant 1 mois.',
        price: 7.99,
        stripePriceId: 'price_monthly',
        stripeProductId: 'prod_monthly',
        productType: 'SUBSCRIPTION_MONTHLY',
        isSubscription: true,
        isPro: false,
        scope: null,
      });
    }
    return Promise.resolve(null);
  }),
}));

vi.mock('@/lib/auth/user', () => ({
  getAuthenticatedUser: vi.fn(() =>
    Promise.resolve({ id: 'user_123', email: 'couple@example.com' }),
  ),
}));

vi.mock('@/lib/db/repositories/coupleRepository', () => ({
  getCoupleById: vi.fn((id: string) =>
    Promise.resolve(
      id === 'couple_123'
        ? { id: 'couple_123', user1Id: 'user_123', user2Id: 'user_456' }
        : null,
    ),
  ),
}));

vi.mock('@/lib/db/withRetry', () => ({
  dbRetry: vi.fn((fn: () => Promise<unknown>) => fn()),
}));

vi.mock('@/lib/fetch', () => ({
  withTimeout: vi.fn((promise: Promise<unknown>) => promise),
}));

vi.mock('@/lib/analytics', () => ({
  captureServer: vi.fn(),
  AnalyticsEvents: {},
}));

const fromMock = vi.fn();

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: (table: string) => fromMock(table),
  },
}));

function mockTable() {
  const builder: Record<string, unknown> = {
    select: () => builder,
    insert: () => ({ error: null }),
    update: () => builder,
    eq: () => builder,
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: (value: { data: null; error: null }) => unknown) => resolve({ data: null, error: null }),
  };
  return builder;
}

beforeEach(() => {
  vi.clearAllMocks();
  fromMock.mockReturnValue(mockTable());
  getOrCreateStripePrice.mockResolvedValue('price_annual');
  createSession.mockResolvedValue({ id: 'sess_couple', url: 'https://checkout.stripe.com/sess_couple' });
  customersList.mockResolvedValue({ data: [] });
  customersCreate.mockResolvedValue({ id: 'cus_couple' });
});

describe('POST /api/checkout/couple-subscription', () => {
  it('returns 200 with sessionUrl for couple_annual plan', async () => {
    fromMock.mockImplementation(() => ({
      ...mockTable(),
      maybeSingle: () => Promise.resolve({ data: { stripeCustomerId: null, email: 'couple@example.com' }, error: null }),
    }));

    const req = new NextRequest('http://localhost/api/checkout/couple-subscription', {
      method: 'POST',
      body: JSON.stringify({
        plan: 'couple_annual',
        coupleId: 'couple_123',
        successUrl: 'http://localhost/couple?paid=premium',
        cancelUrl: 'http://localhost/couple',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessionUrl).toBe('https://checkout.stripe.com/sess_couple');
    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        line_items: [{ price: 'price_annual', quantity: 1 }],
        metadata: expect.objectContaining({
          sku: 'SUBSCRIPTION_ANNUAL',
          userId: 'user_123',
          coupleId: 'couple_123',
        }),
      }),
    );
  });

  it('returns 200 with relative successUrl and cancelUrl', async () => {
    fromMock.mockImplementation(() => ({
      ...mockTable(),
      maybeSingle: () => Promise.resolve({ data: { stripeCustomerId: null, email: 'couple@example.com' }, error: null }),
    }));

    const req = new NextRequest('http://localhost/api/checkout/couple-subscription', {
      method: 'POST',
      body: JSON.stringify({
        plan: 'couple_annual',
        successUrl: '/couple?paid=premium',
        cancelUrl: '/couple',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('returns 200 for couple_monthly plan', async () => {
    fromMock.mockImplementation(() => ({
      ...mockTable(),
      maybeSingle: () => Promise.resolve({ data: { stripeCustomerId: 'cus_couple', email: 'couple@example.com' }, error: null }),
    }));
    getOrCreateStripePrice.mockResolvedValue('price_monthly');

    const req = new NextRequest('http://localhost/api/checkout/couple-subscription', {
      method: 'POST',
      body: JSON.stringify({
        plan: 'couple_monthly',
        coupleId: 'couple_123',
        successUrl: 'http://localhost/couple?paid=premium',
        cancelUrl: 'http://localhost/couple',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessionUrl).toBe('https://checkout.stripe.com/sess_couple');
    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        line_items: [{ price: 'price_monthly', quantity: 1 }],
        metadata: expect.objectContaining({
          sku: 'SUBSCRIPTION_MONTHLY',
          userId: 'user_123',
          coupleId: 'couple_123',
        }),
      }),
    );
  });

  it('returns 403 for an unauthorized coupleId', async () => {
    const req = new NextRequest('http://localhost/api/checkout/couple-subscription', {
      method: 'POST',
      body: JSON.stringify({
        plan: 'couple_annual',
        coupleId: 'couple_unknown',
        successUrl: 'http://localhost/couple?paid=premium',
        cancelUrl: 'http://localhost/couple',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid plan', async () => {
    const req = new NextRequest('http://localhost/api/checkout/couple-subscription', {
      method: 'POST',
      body: JSON.stringify({
        plan: 'invalid_plan',
        successUrl: 'http://localhost/couple?paid=premium',
        cancelUrl: 'http://localhost/couple',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
