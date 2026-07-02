import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { AppError } from '@/lib/errors';
import { createCheckoutSession } from '@/services/paymentService';
import { requirePlayerSessionFor } from '@/lib/auth/player-session';

vi.mock('@/lib/auth/player-session', () => ({
  requirePlayerSessionFor: vi.fn(),
}));

vi.mock('@/services/paymentService', () => ({
  createCheckoutSession: vi.fn(),
}));

describe('POST /api/checkout/pass', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated requests', async () => {
    vi.mocked(requirePlayerSessionFor).mockRejectedValue(
      new AppError('UNAUTHORIZED', 'Session joueur manquante')
    );

    const req = new NextRequest('http://localhost/api/checkout/pass', {
      method: 'POST',
      body: JSON.stringify({
        playerId: '550e8400-e29b-41d4-a716-446655440000',
        roomCode: 'ABCD',
        successUrl: 'http://localhost/success',
        cancelUrl: 'http://localhost/cancel',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('creates a checkout session for an authenticated player', async () => {
    vi.mocked(requirePlayerSessionFor).mockResolvedValue({
      playerId: '550e8400-e29b-41d4-a716-446655440000',
      roomId: 'room-1',
      fromCookie: true,
    });
    vi.mocked(createCheckoutSession).mockResolvedValue({
      sessionId: 'sess_123',
      sessionUrl: 'https://checkout.stripe.com/sess_123',
    });

    const req = new NextRequest('http://localhost/api/checkout/pass', {
      method: 'POST',
      body: JSON.stringify({
        playerId: '550e8400-e29b-41d4-a716-446655440000',
        roomCode: 'ABCD',
        successUrl: 'http://localhost/success',
        cancelUrl: 'http://localhost/cancel',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessionUrl).toBe('https://checkout.stripe.com/sess_123');
    expect(createCheckoutSession).toHaveBeenCalledWith(expect.objectContaining({
      sku: 'PASS_24H',
      playerId: '550e8400-e29b-41d4-a716-446655440000',
      roomCode: 'ABCD',
    }));
  });
});
