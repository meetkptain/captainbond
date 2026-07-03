import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { AppError } from '@/lib/errors';

vi.mock('@/lib/auth/user', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/db/repositories/coupleRepository', () => ({
  createCouple: vi.fn(),
  getCoupleByUsers: vi.fn(),
}));

vi.mock('@/lib/couple/invite', () => ({
  verifyInviteToken: vi.fn(),
}));

vi.mock('@/services/coupleTrialService', () => ({
  grantCoupleTrial: vi.fn(),
}));

const userId = 'user-1';
const partnerId = 'user-2';
const coupleData = {
  id: 'couple-1',
  user1Id: userId,
  user2Id: partnerId,
  timezone: 'Europe/Paris',
};

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/couple/join', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/couple/join', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates a couple and grants trial via invite token', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { createCouple, getCoupleByUsers } = await import('@/lib/db/repositories/coupleRepository');
    const { verifyInviteToken } = await import('@/lib/couple/invite');
    const { grantCoupleTrial } = await import('@/services/coupleTrialService');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: userId } as never);
    vi.mocked(verifyInviteToken).mockResolvedValue({ partnerId, expiresAt: new Date(Date.now() + 3600_000) });
    vi.mocked(getCoupleByUsers).mockResolvedValue(null);
    vi.mocked(createCouple).mockResolvedValue(coupleData as never);
    vi.mocked(grantCoupleTrial).mockResolvedValue(undefined);

    const req = makeRequest({ inviteToken: 'valid-token' });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.couple).toEqual(coupleData);
    expect(verifyInviteToken).toHaveBeenCalledWith('valid-token');
    expect(createCouple).toHaveBeenCalledWith(userId, partnerId);
    expect(grantCoupleTrial).toHaveBeenCalledWith(userId);
    expect(grantCoupleTrial).toHaveBeenCalledWith(partnerId);
  });

  it('prefers invite token partnerId over supplied partnerId', async () => {
    const tokenPartnerId = 'user-token';
    const tokenCoupleData = {
      id: 'couple-token',
      user1Id: userId,
      user2Id: tokenPartnerId,
      timezone: 'Europe/Paris',
    };

    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { createCouple, getCoupleByUsers } = await import('@/lib/db/repositories/coupleRepository');
    const { verifyInviteToken } = await import('@/lib/couple/invite');
    const { grantCoupleTrial } = await import('@/services/coupleTrialService');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: userId } as never);
    vi.mocked(verifyInviteToken).mockResolvedValue({ partnerId: tokenPartnerId, expiresAt: new Date(Date.now() + 3600_000) });
    vi.mocked(getCoupleByUsers).mockResolvedValue(null);
    vi.mocked(createCouple).mockResolvedValue(tokenCoupleData as never);
    vi.mocked(grantCoupleTrial).mockResolvedValue(undefined);

    // When both are supplied, the invite token's partnerId takes precedence.
    const req = makeRequest({ partnerId, inviteToken: 'valid-token' });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.couple).toEqual(tokenCoupleData);
    expect(verifyInviteToken).toHaveBeenCalledWith('valid-token');
    expect(createCouple).toHaveBeenCalledWith(userId, tokenPartnerId);
    expect(grantCoupleTrial).toHaveBeenCalledWith(userId);
    expect(grantCoupleTrial).toHaveBeenCalledWith(tokenPartnerId);
  });

  it('rejects when both partnerId and inviteToken are missing', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: userId } as never);

    const req = makeRequest({});
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe('BAD_REQUEST');
  });

  it('rejects when invite token is invalid or expired', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { verifyInviteToken } = await import('@/lib/couple/invite');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: userId } as never);
    vi.mocked(verifyInviteToken).mockImplementation(() => {
      throw new AppError('VALIDATION_ERROR', 'Invalid invite token');
    });

    const req = makeRequest({ inviteToken: 'invalid-token' });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe('VALIDATION_ERROR');
    expect(verifyInviteToken).toHaveBeenCalledWith('invalid-token');
  });
});
