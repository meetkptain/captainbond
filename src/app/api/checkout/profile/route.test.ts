import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { AppError } from '@/lib/errors';
import { createCheckoutSession } from '@/services/paymentService';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { getRoomByCode } from '@/lib/db/repositories';

vi.mock('@/lib/auth/player-session', () => ({
  getAuthenticatedPlayer: vi.fn(),
}));

vi.mock('@/lib/db/repositories', () => ({
  getRoomByCode: vi.fn(),
}));

vi.mock('@/services/paymentService', () => ({
  createCheckoutSession: vi.fn(),
}));

const playerId = '550e8400-e29b-41d4-a716-446655440000';

describe('POST /api/checkout/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated requests', async () => {
    vi.mocked(getAuthenticatedPlayer).mockRejectedValue(
      new AppError('UNAUTHORIZED', 'Session joueur manquante')
    );

    const req = new NextRequest('http://localhost/api/checkout/profile', {
      method: 'POST',
      body: JSON.stringify({
        roomCode: 'ABCD',
        successUrl: 'http://localhost/success',
        cancelUrl: 'http://localhost/cancel',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('creates a profile checkout for an authenticated player in a standard room', async () => {
    vi.mocked(getAuthenticatedPlayer).mockResolvedValue({
      playerId,
      roomId: 'room-1',
    });
    vi.mocked(getRoomByCode).mockResolvedValue({
      id: 'room-1',
      code: 'ABCD',
      currentMode: 'ICEBREAKER',
    } as Awaited<ReturnType<typeof getRoomByCode>>);
    vi.mocked(createCheckoutSession).mockResolvedValue({
      sessionId: 'sess_profile',
      sessionUrl: 'https://checkout.stripe.com/sess_profile',
    });

    const req = new NextRequest('http://localhost/api/checkout/profile', {
      method: 'POST',
      body: JSON.stringify({
        roomCode: 'ABCD',
        successUrl: 'http://localhost/success',
        cancelUrl: 'http://localhost/cancel',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessionUrl).toBe('https://checkout.stripe.com/sess_profile');
    expect(createCheckoutSession).toHaveBeenCalledWith(expect.objectContaining({
      sku: 'PROFILE',
      playerId,
      roomCode: 'ABCD',
    }));
  });

  it('creates a couple profile checkout for an authenticated player in a date night room', async () => {
    vi.mocked(getAuthenticatedPlayer).mockResolvedValue({
      playerId,
      roomId: 'room-1',
    });
    vi.mocked(getRoomByCode).mockResolvedValue({
      id: 'room-1',
      code: 'ABCD',
      currentMode: 'DATE_NIGHT',
    } as Awaited<ReturnType<typeof getRoomByCode>>);
    vi.mocked(createCheckoutSession).mockResolvedValue({
      sessionId: 'sess_couple',
      sessionUrl: 'https://checkout.stripe.com/sess_couple',
    });

    const req = new NextRequest('http://localhost/api/checkout/profile', {
      method: 'POST',
      body: JSON.stringify({
        roomCode: 'ABCD',
        successUrl: 'http://localhost/success',
        cancelUrl: 'http://localhost/cancel',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(createCheckoutSession).toHaveBeenCalledWith(expect.objectContaining({
      sku: 'PROFILE_COUPLE',
    }));
  });
});
