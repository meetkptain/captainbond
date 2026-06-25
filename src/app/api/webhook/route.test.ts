import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('@/services/paymentService', () => ({
  verifyStripeWebhook: vi.fn(),
  isWebhookEventProcessed: vi.fn(),
  processStripeEvent: vi.fn(),
  recordWebhookEvent: vi.fn(),
}));

import {
  verifyStripeWebhook,
  isWebhookEventProcessed,
  processStripeEvent,
  recordWebhookEvent,
} from '@/services/paymentService';

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
    vi.mocked(isWebhookEventProcessed).mockResolvedValue(true);

    const res = await POST(createWebhookRequest('body', 'sig'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.idempotent).toBe(true);
    expect(processStripeEvent).not.toHaveBeenCalled();
    expect(recordWebhookEvent).not.toHaveBeenCalled();
  });

  it('processes new checkout event and records it', async () => {
    const event = { id: 'evt_456', type: 'checkout.session.completed' };
    vi.mocked(verifyStripeWebhook).mockResolvedValue(event as unknown as Awaited<ReturnType<typeof verifyStripeWebhook>>);
    vi.mocked(isWebhookEventProcessed).mockResolvedValue(false);

    const res = await POST(createWebhookRequest('body', 'sig'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
    expect(processStripeEvent).toHaveBeenCalledWith(event);
    expect(recordWebhookEvent).toHaveBeenCalledWith(event);
  });
});
