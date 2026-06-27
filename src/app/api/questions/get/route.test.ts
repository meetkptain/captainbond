import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { getQuestionById } from '@/lib/db/repositories';
import { requireAdminSession } from '@/lib/auth/admin';
import { getPlayerSessionFromCookie } from '@/lib/auth/player-session';
import { getAuthenticatedCoupleUser } from '@/lib/auth/couple';

vi.mock('@/lib/db/repositories', () => ({
  getQuestionById: vi.fn(),
}));

vi.mock('@/lib/auth/admin', () => ({
  requireAdminSession: vi.fn(),
}));

vi.mock('@/lib/auth/player-session', () => ({
  getPlayerSessionFromCookie: vi.fn(),
}));

vi.mock('@/lib/auth/couple', () => ({
  getAuthenticatedCoupleUser: vi.fn(),
}));

const mockQuestionObj = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  text: 'Test Question',
  mode: 'icebreaker',
  correctAnswer: 'A',
  explanation: 'Because of A',
  metadata: { key: 'val' },
};

describe('GET /api/questions/get', () => {
  it('throws UNAUTHORIZED if not authenticated', async () => {
    vi.mocked(requireAdminSession).mockRejectedValueOnce(new Error('unauthorized'));
    vi.mocked(getPlayerSessionFromCookie).mockResolvedValueOnce(null);
    vi.mocked(getAuthenticatedCoupleUser).mockRejectedValueOnce(new Error('unauthorized'));

    const req = new NextRequest(`http://localhost/api/questions/get?id=${mockQuestionObj.id}`);
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns full question details for admin users', async () => {
    vi.mocked(requireAdminSession).mockResolvedValueOnce({ role: 'admin' });
    vi.mocked(getQuestionById).mockResolvedValueOnce(mockQuestionObj as unknown as Awaited<ReturnType<typeof getQuestionById>>);

    const req = new NextRequest(`http://localhost/api/questions/get?id=${mockQuestionObj.id}`);
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.question.correctAnswer).toBe('A');
    expect(body.question.explanation).toBe('Because of A');
    expect(body.question.metadata).toEqual({ key: 'val' });
  });

  it('returns masked question details for player users', async () => {
    vi.mocked(requireAdminSession).mockRejectedValueOnce(new Error('unauthorized'));
    vi.mocked(getPlayerSessionFromCookie).mockResolvedValueOnce({ playerId: 'player-1', roomId: 'room-1' });
    vi.mocked(getQuestionById).mockResolvedValueOnce(mockQuestionObj as unknown as Awaited<ReturnType<typeof getQuestionById>>);

    const req = new NextRequest(`http://localhost/api/questions/get?id=${mockQuestionObj.id}`);
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.question.correctAnswer).toBeUndefined();
    expect(body.question.explanation).toBeUndefined();
    expect(body.question.metadata).toBeUndefined();
    expect(body.question.text).toBe('Test Question');
  });

  it('returns masked question details for couple users', async () => {
    vi.mocked(requireAdminSession).mockRejectedValueOnce(new Error('unauthorized'));
    vi.mocked(getPlayerSessionFromCookie).mockResolvedValueOnce(null);
    vi.mocked(getAuthenticatedCoupleUser).mockResolvedValueOnce({ id: 'user-1' });
    vi.mocked(getQuestionById).mockResolvedValueOnce(mockQuestionObj as unknown as Awaited<ReturnType<typeof getQuestionById>>);

    const req = new NextRequest(`http://localhost/api/questions/get?id=${mockQuestionObj.id}`);
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.question.correctAnswer).toBeUndefined();
    expect(body.question.explanation).toBeUndefined();
    expect(body.question.metadata).toBeUndefined();
  });
});
