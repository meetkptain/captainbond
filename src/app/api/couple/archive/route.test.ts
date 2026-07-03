import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

vi.mock('@/lib/auth/user', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/auth/coupleMembership', () => ({
  requireCoupleMembership: vi.fn(),
}));

vi.mock('@/lib/db/repositories/dailyQuestionRepository', () => ({
  listAnsweredQuestionsForCouple: vi.fn(),
}));

vi.mock('@/lib/db/repositories/coupleRepository', () => ({
  getCoupleById: vi.fn(),
}));

vi.mock('@/lib/monetization/entitlements', () => ({
  getUserEntitlements: vi.fn(),
}));

const mockQuestions = [
  {
    id: 'dq-1',
    coupleId: 'couple-1',
    customText: 'Question 1',
    user1Answered: true,
    user2Answered: false,
    isRevealed: false,
  },
  {
    id: 'dq-2',
    coupleId: 'couple-1',
    customText: 'Question 2',
    user1Answered: true,
    user2Answered: true,
    isRevealed: true,
  },
];

describe('GET /api/couple/archive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns answered questions during the 14-day free window', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { requireCoupleMembership } = await import('@/lib/auth/coupleMembership');
    const { listAnsweredQuestionsForCouple } = await import('@/lib/db/repositories/dailyQuestionRepository');
    const { getCoupleById } = await import('@/lib/db/repositories/coupleRepository');
    const { getUserEntitlements } = await import('@/lib/monetization/entitlements');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });
    vi.mocked(requireCoupleMembership).mockResolvedValue(undefined);
    vi.mocked(listAnsweredQuestionsForCouple).mockResolvedValue(mockQuestions as never);
    vi.mocked(getCoupleById).mockResolvedValue({ id: 'couple-1', createdAt: new Date().toISOString() } as never);
    vi.mocked(getUserEntitlements).mockResolvedValue({
      hasActivePass: false,
      hasActiveSubscription: false,
    } as never);

    const req = new NextRequest('http://localhost/api/couple/archive?coupleId=couple-1');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.questions).toEqual(mockQuestions);
    expect(json.freeWindowActive).toBe(true);
    expect(json.premiumActive).toBe(false);
    expect(requireCoupleMembership).toHaveBeenCalledWith('couple-1', 'user-1');
    expect(listAnsweredQuestionsForCouple).toHaveBeenCalledWith('couple-1');
  });

  it('returns answered questions when a premium pass is active', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { requireCoupleMembership } = await import('@/lib/auth/coupleMembership');
    const { listAnsweredQuestionsForCouple } = await import('@/lib/db/repositories/dailyQuestionRepository');
    const { getCoupleById } = await import('@/lib/db/repositories/coupleRepository');
    const { getUserEntitlements } = await import('@/lib/monetization/entitlements');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });
    vi.mocked(requireCoupleMembership).mockResolvedValue(undefined);
    vi.mocked(listAnsweredQuestionsForCouple).mockResolvedValue(mockQuestions as never);
    vi.mocked(getCoupleById).mockResolvedValue({ id: 'couple-1', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() } as never);
    vi.mocked(getUserEntitlements).mockResolvedValue({
      hasActivePass: true,
      hasActiveSubscription: false,
    } as never);

    const req = new NextRequest('http://localhost/api/couple/archive?coupleId=couple-1');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.questions).toEqual(mockQuestions);
    expect(json.freeWindowActive).toBe(false);
    expect(json.premiumActive).toBe(true);
  });

  it('returns 403 ARCHIVE_LOCKED after the free window without premium', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { requireCoupleMembership } = await import('@/lib/auth/coupleMembership');
    const { getCoupleById } = await import('@/lib/db/repositories/coupleRepository');
    const { getUserEntitlements } = await import('@/lib/monetization/entitlements');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });
    vi.mocked(requireCoupleMembership).mockResolvedValue(undefined);
    vi.mocked(getCoupleById).mockResolvedValue({ id: 'couple-1', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() } as never);
    vi.mocked(getUserEntitlements).mockResolvedValue({
      hasActivePass: false,
      hasActiveSubscription: false,
    } as never);

    const req = new NextRequest('http://localhost/api/couple/archive?coupleId=couple-1');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.code).toBe('ARCHIVE_LOCKED');
  });

  it('returns 400 when coupleId is missing', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });

    const req = new NextRequest('http://localhost/api/couple/archive');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe('VALIDATION_ERROR');
  });
});
