import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { AppError } from '@/lib/errors';

vi.mock('@/lib/auth/player-session', () => ({
  requirePlayerSessionFor: vi.fn().mockImplementation(() => {
    throw new AppError('UNAUTHORIZED', 'Session joueur manquante');
  }),
}));

vi.mock('@/lib/db/repositories', () => ({
  getRoomByCode: vi.fn(),
}));

vi.mock('@/services/paymentService', () => ({
  createCheckoutSession: vi.fn(),
}));

describe('POST /api/checkout/profile', () => {
  it('rejects unauthenticated requests', async () => {
    const req = new NextRequest('http://localhost/api/checkout/profile', {
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
});
