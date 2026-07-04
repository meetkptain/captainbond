import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    rpc: vi.fn(),
  },
}));

vi.mock('@/lib/db/repositories/webhookEventRepository', () => ({
  insertWebhookEventIfNotExists: vi.fn(),
}));

import { supabaseAdmin } from '@/lib/supabase-admin';
import { insertWebhookEventIfNotExists } from '@/lib/db/repositories/webhookEventRepository';

describe('POST /api/webhook/revenuecat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPayload = {
    event: {
      id: 'evt_rc_123',
      type: 'INITIAL_PURCHASE',
      original_app_user_id: 'user_rc_1',
      product_id: 'com.meetkptain.captainbond.pass24h',
      transaction_id: 'txn_1',
      store: 'APP_STORE',
      original_transaction_id: 'orig_txn_1',
      purchaser_info: { email: 'test@test.com' },
      attributes: {
        roomCode: { value: 'ABCD' },
        playerId: { value: 'player-1' },
      },
    },
  };

  function request(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/webhook/revenuecat', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  it('returns idempotent response when event already processed', async () => {
    vi.mocked(insertWebhookEventIfNotExists).mockResolvedValue({ inserted: false });

    const res = await POST(request(validPayload));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.idempotent).toBe(true);
    expect(json.received).toBe(true);
    expect(supabaseAdmin.rpc).not.toHaveBeenCalled();
  });

  it('inserts webhook event before calling fulfill_checkout', async () => {
    vi.mocked(insertWebhookEventIfNotExists).mockResolvedValue({ inserted: true });
    vi.mocked(supabaseAdmin.rpc).mockResolvedValue({ data: {}, error: null, count: null, status: 200, statusText: 'OK', success: true });

    const res = await POST(request(validPayload));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
    expect(insertWebhookEventIfNotExists).toHaveBeenCalledWith(
      'evt_rc_123',
      'revenuecat.INITIAL_PURCHASE',
      expect.objectContaining({ event: expect.objectContaining({ id: 'evt_rc_123' }) })
    );
    expect(supabaseAdmin.rpc).toHaveBeenCalledWith('fulfill_checkout', expect.objectContaining({
      p_event_id: 'evt_rc_123',
      p_user_id: 'user_rc_1',
    }));
  });

  it('returns 400 when body schema is invalid', async () => {
    const res = await POST(request({ invalid: true }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe('VALIDATION_ERROR');
  });

  it('returns 500 when fulfill_checkout RPC fails', async () => {
    vi.mocked(insertWebhookEventIfNotExists).mockResolvedValue({ inserted: true });
    vi.mocked(supabaseAdmin.rpc).mockResolvedValue({
      data: null, error: { message: 'db down', details: '', hint: '', code: 'internal', name: 'PostgrestError', toJSON: () => ({ message: 'db down', details: '', hint: '', code: 'internal', name: 'PostgrestError' }) },
      count: null, status: 500, statusText: 'Internal Server Error', success: false,
    } as unknown as Awaited<ReturnType<typeof supabaseAdmin.rpc>>);

    const res = await POST(request(validPayload));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe('Fulfillment failed');
  });

  it('returns 400 when product mapping is unknown', async () => {
    vi.mocked(insertWebhookEventIfNotExists).mockResolvedValue({ inserted: true });
    const invalidProduct = { ...validPayload, event: { ...validPayload.event, product_id: 'unknown.product' } };

    const res = await POST(request(invalidProduct));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Unknown product');
  });

  it('skips unhandled event types gracefully', async () => {
    const upgradeEvent = { ...validPayload, event: { ...validPayload.event, type: 'NON_RENEWING_PURCHASE' } };

    const res = await POST(request(upgradeEvent));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
    expect(supabaseAdmin.rpc).not.toHaveBeenCalled();
  });
});
