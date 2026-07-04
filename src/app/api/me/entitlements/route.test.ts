import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

vi.mock('@/lib/auth/player-session', () => ({
  getAuthenticatedPlayer: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  ipLimiter: vi.fn(() => undefined),
  rateLimiters: { ip: undefined },
}));

vi.mock('@/lib/db/repositories', () => ({
  getPlayerById: vi.fn(),
  getRoomByCode: vi.fn(),
}));

vi.mock('@/lib/monetization/entitlements', () => ({
  getRoomPassInfo: vi.fn(),
  getUserEntitlements: vi.fn(),
  getPlayerEntitlements: vi.fn(),
}));

function getRequest(url: string): NextRequest {
  return new NextRequest(url);
}

const mockPlayer = {
  id: 'player-1',
  name: 'Nico',
  roomId: 'room-1',
  userId: 'user-1',
  isHost: false,
  isReady: false,
};

const mockPlayerEntitlements = {
  userId: 'user-1',
  hasActivePass: false,
  passExpiresAt: null,
  hasActiveSubscription: false,
  subscriptionStatus: 'NONE' as const,
  hasPurchasedPack: false,
  purchasedPackIds: [],
  accessibleModes: ['ICEBREAKER'],
  accessibleFeatures: [],
};

const mockUserEntitlements = {
  userId: 'user-2',
  hasActivePass: true,
  passExpiresAt: '2026-08-01T00:00:00.000Z',
  hasActiveSubscription: false,
  subscriptionStatus: 'NONE' as const,
  hasPurchasedPack: false,
  purchasedPackIds: [],
  accessibleModes: ['DEEP_CONNECTION'],
  accessibleFeatures: ['profiles'],
};

describe('GET /api/me/entitlements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when roomCode validation fails', async () => {
    const res = await GET(getRequest('http://localhost/api/me/entitlements?roomCode=AB'));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 when player is not authenticated', async () => {
    const { getAuthenticatedPlayer } = await import('@/lib/auth/player-session');
    const { AppError } = await import('@/lib/errors');
    vi.mocked(getAuthenticatedPlayer).mockRejectedValue(
      new AppError('UNAUTHORIZED', 'Session joueur manquante')
    );

    const res = await GET(getRequest('http://localhost/api/me/entitlements'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when player is not found', async () => {
    const { getAuthenticatedPlayer } = await import('@/lib/auth/player-session');
    const { getPlayerById } = await import('@/lib/db/repositories');
    vi.mocked(getAuthenticatedPlayer).mockResolvedValue({ playerId: 'player-1', roomId: 'room-1' });
    vi.mocked(getPlayerById).mockResolvedValue(null);

    const res = await GET(getRequest('http://localhost/api/me/entitlements'));
    const json = await res.json();
    expect(res.status).toBe(404);
    expect(json.code).toBe('NOT_FOUND');
  });

  it('returns player entitlements without roomCode', async () => {
    const { getAuthenticatedPlayer } = await import('@/lib/auth/player-session');
    const { getPlayerById } = await import('@/lib/db/repositories');
    const { getPlayerEntitlements, getRoomPassInfo } = await import('@/lib/monetization/entitlements');
    vi.mocked(getAuthenticatedPlayer).mockResolvedValue({ playerId: 'player-1', roomId: 'room-1' });
    vi.mocked(getPlayerById).mockResolvedValue(mockPlayer as never);
    vi.mocked(getPlayerEntitlements).mockResolvedValue(mockPlayerEntitlements as never);
    vi.mocked(getRoomPassInfo).mockResolvedValue({ isActive: false, paidByUserId: null, passExpiresAt: null });

    const res = await GET(getRequest('http://localhost/api/me/entitlements'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.accessibleModes).toEqual(['ICEBREAKER']);
    expect(json.hasActivePass).toBe(false);
    expect(json.roomPassActive).toBe(false);
    expect(json.roomPassPaidByUserId).toBeNull();
  });

  it('returns entitlements with room pass when roomCode is provided', async () => {
    const { getAuthenticatedPlayer } = await import('@/lib/auth/player-session');
    const { getPlayerById, getRoomByCode } = await import('@/lib/db/repositories');
    const { getPlayerEntitlements, getRoomPassInfo } = await import('@/lib/monetization/entitlements');
    vi.mocked(getAuthenticatedPlayer).mockResolvedValue({ playerId: 'player-1', roomId: 'room-1' });
    vi.mocked(getPlayerById).mockResolvedValue(mockPlayer as never);
    vi.mocked(getRoomByCode).mockResolvedValue({
      id: 'room-2', code: 'ABCD', hostId: 'host-1', hostToken: 'tok',
      status: 'WAITING', round: 0,
    } as never);
    vi.mocked(getPlayerEntitlements).mockResolvedValue(mockPlayerEntitlements as never);
    vi.mocked(getRoomPassInfo).mockResolvedValue({
      isActive: true, paidByUserId: 'user-1', passExpiresAt: '2026-07-04T00:00:00.000Z',
    });

    const res = await GET(getRequest('http://localhost/api/me/entitlements?roomCode=ABCD'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.roomPassActive).toBe(true);
    expect(json.roomPassPaidByUserId).toBe('user-1');
    expect(json.hasActivePass).toBe(true);
    expect(json.accessibleModes).toContain('DEEP_CONNECTION');
    expect(json.accessibleModes).toContain('DATE_NIGHT');
    expect(json.accessibleFeatures).toContain('profiles');
  });

  it('falls back to user entitlements when player entitlements are not found', async () => {
    const { getAuthenticatedPlayer } = await import('@/lib/auth/player-session');
    const { getPlayerById } = await import('@/lib/db/repositories');
    const { getPlayerEntitlements, getUserEntitlements, getRoomPassInfo } = await import('@/lib/monetization/entitlements');
    vi.mocked(getAuthenticatedPlayer).mockResolvedValue({ playerId: 'player-2', roomId: 'room-1' });
    vi.mocked(getPlayerById).mockResolvedValue({
      ...mockPlayer, id: 'player-2', userId: 'user-2',
    } as never);
    vi.mocked(getPlayerEntitlements).mockResolvedValue(null);
    vi.mocked(getUserEntitlements).mockResolvedValue(mockUserEntitlements as never);
    vi.mocked(getRoomPassInfo).mockResolvedValue({ isActive: false, paidByUserId: null, passExpiresAt: null });

    const res = await GET(getRequest('http://localhost/api/me/entitlements'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.hasActivePass).toBe(true);
    expect(json.accessibleModes).toContain('DEEP_CONNECTION');
    expect(getUserEntitlements).toHaveBeenCalledWith('user-2');
  });
});
