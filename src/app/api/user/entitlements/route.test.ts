import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

vi.mock('@/lib/auth/user', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/monetization/entitlements', () => ({
  getUserEntitlements: vi.fn(),
}));

describe('GET /api/user/entitlements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns normalized entitlements for an authenticated user', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { getUserEntitlements } = await import('@/lib/monetization/entitlements');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });
    vi.mocked(getUserEntitlements).mockResolvedValue({
      userId: 'user-1',
      hasActivePass: true,
      passExpiresAt: '2027-01-01T00:00:00.000Z',
      hasActiveSubscription: false,
      subscriptionStatus: 'NONE',
      hasPurchasedPack: false,
      purchasedPackIds: [],
      accessibleModes: [],
      accessibleFeatures: [],
    });

    const req = new NextRequest('http://localhost/api/user/entitlements');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      hasActivePass: true,
      passExpiresAt: '2027-01-01T00:00:00.000Z',
      hasActiveSubscription: false,
    });
    expect(getAuthenticatedUser).toHaveBeenCalledWith(req);
    expect(getUserEntitlements).toHaveBeenCalledWith('user-1');
  });

  it('falls back to default values when entitlements are null', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { getUserEntitlements } = await import('@/lib/monetization/entitlements');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-2' });
    vi.mocked(getUserEntitlements).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/user/entitlements');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      hasActivePass: false,
      passExpiresAt: null,
      hasActiveSubscription: false,
    });
  });

  it('returns 401 for an unauthenticated user', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { AppError } = await import('@/lib/errors');

    vi.mocked(getAuthenticatedUser).mockRejectedValue(new AppError('UNAUTHORIZED', 'Session utilisateur manquante'));

    const req = new NextRequest('http://localhost/api/user/entitlements');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.code).toBe('UNAUTHORIZED');
  });
});
