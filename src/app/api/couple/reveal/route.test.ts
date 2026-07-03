import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('@/lib/auth/user', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/services/coupleDailyQuestionService', () => ({
  revealDailyQuestion: vi.fn(),
}));

const mockDailyQuestion = {
  id: 'dq-1',
  coupleId: 'couple-1',
  user1Answered: true,
  user2Answered: true,
  isRevealed: true,
  analysisStatus: 'REVEALED',
};

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/couple/reveal', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/couple/reveal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reveals the daily question when both partners answered', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { revealDailyQuestion } = await import('@/services/coupleDailyQuestionService');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });
    vi.mocked(revealDailyQuestion).mockResolvedValue(mockDailyQuestion as never);

    const req = createRequest({ coupleId: 'couple-1', dailyQuestionId: 'dq-1' });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.dailyQuestion).toEqual(mockDailyQuestion);
    expect(revealDailyQuestion).toHaveBeenCalledWith('couple-1', 'dq-1', 'user-1');
  });

  it('returns 400 when body is invalid', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });

    const req = createRequest({ coupleId: '', dailyQuestionId: '' });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe('VALIDATION_ERROR');
  });
});
