import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { AppError } from '@/lib/errors';

vi.mock('@/services/gamePlayService', () => ({
  recordVote: vi.fn(),
}));

vi.mock('@/lib/auth/player-session', () => ({
  getAuthenticatedPlayer: vi.fn(),
}));

import { recordVote } from '@/services/gamePlayService';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';

describe('POST /api/room/vote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function voteRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/room/vote', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  it('returns 400 when body validation fails', async () => {
    const res = await POST(voteRequest({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 when player is not authenticated', async () => {
    vi.mocked(getAuthenticatedPlayer).mockRejectedValue(
      new AppError('UNAUTHORIZED', 'Session joueur manquante')
    );

    const res = await POST(voteRequest({
      roomCode: 'ABCD',
      questionId: '550e8400-e29b-41d4-a716-446655440000',
      answer: 'player-1',
    }));

    expect(res.status).toBe(401);
  });

  it('returns 200 and records a valid vote', async () => {
    vi.mocked(getAuthenticatedPlayer).mockResolvedValue({
      playerId: 'player-1',
      roomId: 'room-1',
    } as Awaited<ReturnType<typeof getAuthenticatedPlayer>>);
    vi.mocked(recordVote).mockResolvedValue({ responseId: 'resp-1' });

    const res = await POST(voteRequest({
      roomCode: 'ABCD',
      questionId: '550e8400-e29b-41d4-a716-446655440000',
      answer: 'player-1',
    }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.responseId).toBe('resp-1');
  });

  it('propagates AppError from recordVote', async () => {
    vi.mocked(getAuthenticatedPlayer).mockResolvedValue({
      playerId: 'player-1',
      roomId: 'room-1',
    } as Awaited<ReturnType<typeof getAuthenticatedPlayer>>);
    vi.mocked(recordVote).mockRejectedValue(
      new AppError('FORBIDDEN', 'La partie n\'est pas en cours')
    );

    const res = await POST(voteRequest({
      roomCode: 'ABCD',
      questionId: '550e8400-e29b-41d4-a716-446655440000',
      answer: 'player-1',
    }));

    expect(res.status).toBe(403);
  });
});
