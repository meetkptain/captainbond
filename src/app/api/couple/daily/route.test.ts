import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

vi.mock('@/lib/auth/user', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/db/repositories/coupleRepository', () => ({
  getCoupleById: vi.fn(),
}));

vi.mock('@/lib/db/repositories/dailyQuestionRepository', () => ({
  getCurrentRitual: vi.fn(),
}));

describe('GET /api/couple/daily', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns ritual for authenticated couple member', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { getCoupleById } = await import('@/lib/db/repositories/coupleRepository');
    const { getCurrentRitual } = await import('@/lib/db/repositories/dailyQuestionRepository');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });

    const coupleData = {
      id: 'couple-1',
      user1Id: 'user-1',
      user2Id: 'user-2',
      timezone: 'Europe/Paris',
    };
    const ritualData = {
      id: 'dq-1',
      coupleId: 'couple-1',
      theme: 'RECONNECTION',
      intensity: 1,
      user1Answered: true,
      user2Answered: false,
      isRevealed: false,
    };

    vi.mocked(getCoupleById).mockResolvedValue(coupleData as never);
    vi.mocked(getCurrentRitual).mockResolvedValue(ritualData as never);

    const req = new NextRequest('http://localhost/api/couple/daily?coupleId=couple-1');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ritual.theme).toBe('RECONNECTION');
    expect(json.me.hasAnswered).toBe(true);
    expect(json.partner.hasAnswered).toBe(false);
    expect(getCurrentRitual).toHaveBeenCalledWith('couple-1', 'Europe/Paris');
  });

  it('rejects when user is not a couple member', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { getCoupleById } = await import('@/lib/db/repositories/coupleRepository');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'stranger' } as never);

    const coupleData = {
      id: 'couple-1',
      user1Id: 'user-1',
      user2Id: 'user-2',
      timezone: 'Europe/Paris',
    };

    vi.mocked(getCoupleById).mockResolvedValue(coupleData as never);

    const req = new NextRequest('http://localhost/api/couple/daily?coupleId=couple-1');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.code).toBe('FORBIDDEN');
  });
});
