import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

vi.mock('@/lib/auth/user', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/services/couplePortraitService', () => ({
  getCouplePortraitData: vi.fn(),
  listCouplesForPortraitUser: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  createLogger: vi.fn(() => ({ error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() })),
}));

function request(url: string): NextRequest {
  return new NextRequest(url);
}

describe('GET /api/couple/portrait', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    vi.mocked(getAuthenticatedUser).mockRejectedValue(
      new (await import('@/lib/errors')).AppError('UNAUTHORIZED', 'Session utilisateur manquante')
    );

    const res = await GET(request('http://localhost/api/couple/portrait?coupleId=cpl-1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 when coupleId is missing and list is not true', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });

    const res = await GET(request('http://localhost/api/couple/portrait'));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe('BAD_REQUEST');
  });

  it('returns 200 with portrait data', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { getCouplePortraitData } = await import('@/services/couplePortraitService');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });
    vi.mocked(getCouplePortraitData).mockResolvedValue({
      id: 'cpl-1',
      user1: { id: 'user-1', nickname: 'Alice' },
      user2: { id: 'user-2', nickname: 'Bob' },
      stats: { streak: 5, totalRituals: 42 },
    } as never);

    const res = await GET(
      request('http://localhost/api/couple/portrait?coupleId=cpl-1&timezone=Europe/Paris')
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.id).toBe('cpl-1');
    expect(json.user1.nickname).toBe('Alice');
    expect(getCouplePortraitData).toHaveBeenCalledWith('cpl-1', 'user-1', 'Europe/Paris');
  });

  it('returns 200 with portrait data when no timezone is provided', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { getCouplePortraitData } = await import('@/services/couplePortraitService');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });
    vi.mocked(getCouplePortraitData).mockResolvedValue({
      id: 'cpl-1',
    } as never);

    const res = await GET(request('http://localhost/api/couple/portrait?coupleId=cpl-1'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(getCouplePortraitData).toHaveBeenCalledWith('cpl-1', 'user-1', undefined);
  });

  it('returns 200 with empty array when list mode returns null', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { listCouplesForPortraitUser } = await import('@/services/couplePortraitService');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });
    vi.mocked(listCouplesForPortraitUser).mockResolvedValue(null as never);

    const res = await GET(request('http://localhost/api/couple/portrait?list=true'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual([]);
  });

  it('returns 200 with couples list in list mode', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { listCouplesForPortraitUser } = await import('@/services/couplePortraitService');

    const couples = [
      { id: 'cpl-1', partnerNickname: 'Bob', partnerAvatarUrl: null },
      { id: 'cpl-2', partnerNickname: 'Charlie', partnerAvatarUrl: 'https://example.com/avatar.png' },
    ];

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });
    vi.mocked(listCouplesForPortraitUser).mockResolvedValue(couples as never);

    const res = await GET(request('http://localhost/api/couple/portrait?list=true'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveLength(2);
    expect(json[0].partnerNickname).toBe('Bob');
  });

  it('returns 500 when list mode service throws', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { listCouplesForPortraitUser } = await import('@/services/couplePortraitService');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });
    vi.mocked(listCouplesForPortraitUser).mockRejectedValue(new Error('DB error'));

    const res = await GET(request('http://localhost/api/couple/portrait?list=true'));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.code).toBe('INTERNAL_ERROR');
  });

  it('returns 500 when portrait service throws', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { getCouplePortraitData } = await import('@/services/couplePortraitService');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });
    vi.mocked(getCouplePortraitData).mockRejectedValue(new Error('DB error'));

    const res = await GET(request('http://localhost/api/couple/portrait?coupleId=cpl-1'));
    const json = await res.json();

    expect(res.status).toBe(500);
  });
});
