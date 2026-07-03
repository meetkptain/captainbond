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

  it('returns answered questions for a valid coupleId', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { requireCoupleMembership } = await import('@/lib/auth/coupleMembership');
    const { listAnsweredQuestionsForCouple } = await import('@/lib/db/repositories/dailyQuestionRepository');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });
    vi.mocked(requireCoupleMembership).mockResolvedValue(undefined);
    vi.mocked(listAnsweredQuestionsForCouple).mockResolvedValue(mockQuestions as never);

    const req = new NextRequest('http://localhost/api/couple/archive?coupleId=couple-1');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.questions).toEqual(mockQuestions);
    expect(requireCoupleMembership).toHaveBeenCalledWith('couple-1', 'user-1');
    expect(listAnsweredQuestionsForCouple).toHaveBeenCalledWith('couple-1');
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
