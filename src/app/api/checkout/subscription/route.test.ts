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
    if (sku === 'BAR_MONTHLY') {
      return Promise.resolve({
        id: 'pack-bar-monthly',
        sku: 'BAR_MONTHLY',
        name: 'Bar Monthly',
        description: 'Bar subscription',
        price: 99.0,
        stripePriceId: 'price_bar',
        stripeProductId: 'prod_bar',
        productType: 'BAR_MONTHLY',
        isSubscription: true,
        isPro: true,
        scope: null,
      });
    }
    return Promise.resolve(null);
  }),
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
const authCreateUserMock = vi.fn();
const authListUsersMock = vi.fn();

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        createUser: (...args: unknown[]) => authCreateUserMock(...args),
        listUsers: () => authListUsersMock(),
      },
    },
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
  authCreateUserMock.mockResolvedValue({ error: null });
  authListUsersMock.mockResolvedValue({ data: { users: [] } });
  getOrCreateStripePrice.mockResolvedValue('price_bar');
  createSession.mockResolvedValue({ id: 'sess_bar', url: 'https://checkout.stripe.com/sess_bar' });
  customersList.mockResolvedValue({ data: [] });
  customersCreate.mockResolvedValue({ id: 'cus_bar' });
});

describe('POST /api/checkout/subscription', () => {
  it('creates a bar monthly subscription checkout', async () => {
    fromMock.mockImplementation(() => ({
      ...mockTable(),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
    }));

    const req = new NextRequest('http://localhost/api/checkout/subscription', {
      method: 'POST',
      body: JSON.stringify({
        plan: 'bar_monthly',
        email: 'bar@example.com',
        name: 'Le Bar',
        company: 'Le Bistro',
        successUrl: 'http://localhost/success',
        cancelUrl: 'http://localhost/cancel',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessionUrl).toBe('https://checkout.stripe.com/sess_bar');
    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        line_items: [{ price: 'price_bar', quantity: 1 }],
      }),
    );
  });

  it('rejects invalid plan', async () => {
    const req = new NextRequest('http://localhost/api/checkout/subscription', {
      method: 'POST',
      body: JSON.stringify({
        plan: 'unknown_plan',
        email: 'bar@example.com',
        name: 'Le Bar',
        successUrl: 'http://localhost/success',
        cancelUrl: 'http://localhost/cancel',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
