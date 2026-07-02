import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('@/services/paymentService', () => ({
  verifyStripeWebhook: vi.fn(),
  processStripeEvent: vi.fn(),
}));

vi.mock('@/lib/db/repositories/webhookEventRepository', () => ({
  insertWebhookEventIfNotExists: vi.fn(),
}));

import { verifyStripeWebhook, processStripeEvent } from '@/services/paymentService';
import { insertWebhookEventIfNotExists } from '@/lib/db/repositories/webhookEventRepository';

describe('POST /api/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createWebhookRequest(body: string, signature: string): NextRequest {
    return new NextRequest('http://localhost/api/webhook', {
      method: 'POST',
      body,
      headers: { 'stripe-signature': signature },
    });
  }

  it('returns idempotent response when event already processed', async () => {
    vi.mocked(verifyStripeWebhook).mockResolvedValue({ id: 'evt_123', type: 'checkout.session.completed' } as unknown as Awaited<ReturnType<typeof verifyStripeWebhook>>);
    vi.mocked(insertWebhookEventIfNotExists).mockResolvedValue({ inserted: false });

    const res = await POST(createWebhookRequest('body', 'sig'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.idempotent).toBe(true);
    expect(processStripeEvent).not.toHaveBeenCalled();
  });

  it('processes new checkout event and records it atomically', async () => {
    const event = { id: 'evt_456', type: 'checkout.session.completed' };
    vi.mocked(verifyStripeWebhook).mockResolvedValue(event as unknown as Awaited<ReturnType<typeof verifyStripeWebhook>>);
    vi.mocked(insertWebhookEventIfNotExists).mockResolvedValue({ inserted: true });

    const res = await POST(createWebhookRequest('body', 'sig'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
    expect(insertWebhookEventIfNotExists).toHaveBeenCalledWith(event.id, event.type, event);
    expect(processStripeEvent).toHaveBeenCalledWith(event);
  });
});
