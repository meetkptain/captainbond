import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { AppError } from '@/lib/errors';

vi.mock('@/services/coupleAnswerService', () => ({
  submitAnswer: vi.fn(),
}));

vi.mock('@/lib/auth/user', () => ({
  getAuthenticatedUser: vi.fn(),
}));

import { submitAnswer } from '@/services/coupleAnswerService';
import { getAuthenticatedUser } from '@/lib/auth/user';

describe('POST /api/couple/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = {
    coupleId: 'couple-1',
    dailyQuestionId: 'dq-1',
    userId: 'user-1',
    answer: 'Je pense que...',
  };

  function request(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/couple/analyze', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  it('returns 400 when body validation fails', async () => {
    const res = await POST(request({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe('VALIDATION_ERROR');
  });

  it('returns 403 when userId does not match authenticated user', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-2', email: 'user2@test.com' });

    const res = await POST(request(validBody));
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toBe('Vous ne pouvez pas soumettre de réponse pour un autre utilisateur.');
  });

  it('returns 200 and submits the answer', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1', email: 'user1@test.com' });
    vi.mocked(submitAnswer).mockResolvedValue({
      status: 'ANSWERED',
      dailyQuestion: { isRevealed: false },
    } as unknown as Awaited<ReturnType<typeof submitAnswer>>);

    const res = await POST(request(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.status).toBe('ANSWERED');
  });

  it('returns 409 when already answered', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1', email: 'user1@test.com' });
    vi.mocked(submitAnswer).mockResolvedValue({
      status: 'ALREADY_ANSWERED',
      dailyQuestion: { isRevealed: false },
    } as unknown as Awaited<ReturnType<typeof submitAnswer>>);

    const res = await POST(request(validBody));

    expect(res.status).toBe(409);
  });

  it('returns 401 when user is not authenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(
      new AppError('UNAUTHORIZED', 'Session utilisateur manquante')
    );

    const res = await POST(request(validBody));
    expect(res.status).toBe(401);
  });
});
