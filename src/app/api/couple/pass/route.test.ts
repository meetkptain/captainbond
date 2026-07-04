import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('@/lib/auth/user', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  coupleActionLimiter: undefined,
}));

vi.mock('@/services/couplePassService', () => ({
  passDailyQuestion: vi.fn(),
}));

function postRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/couple/pass', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const updatedQuestion = {
  id: 'dq-1',
  coupleId: 'couple-1',
  questionId: 'q-2',
  customText: 'Quelle est votre plus belle mémoire ensemble ?',
  releasedAt: '2026-07-03T12:00:00.000Z',
  isAnswered: false,
  user1Answered: false,
  user2Answered: false,
  isRevealed: false,
  analysisStatus: 'PENDING' as const,
  isSkipped: false,
  isSafeZoneActive: false,
  intensity: 1,
};

describe('POST /api/couple/pass', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when body validation fails', async () => {
    const res = await POST(postRequest({}));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { AppError } = await import('@/lib/errors');
    vi.mocked(getAuthenticatedUser).mockRejectedValue(
      new AppError('UNAUTHORIZED', 'Session utilisateur manquante')
    );

    const req = postRequest({ coupleId: 'couple-1', dailyQuestionId: 'dq-1' });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 200 with updated question on success', async () => {
    const { getAuthenticatedUser } = await import('@/lib/auth/user');
    const { passDailyQuestion } = await import('@/services/couplePassService');

    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' });
    vi.mocked(passDailyQuestion).mockResolvedValue(updatedQuestion as never);

    const req = postRequest({ coupleId: 'couple-1', dailyQuestionId: 'dq-1' });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.dailyQuestion).toEqual(updatedQuestion);
    expect(passDailyQuestion).toHaveBeenCalledWith('couple-1', 'dq-1', 'user-1');
  });
});
