import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { AppError } from '@/lib/errors';

vi.mock('@/services/roomGameService', () => ({
  revealRound: vi.fn(),
}));

vi.mock('@/lib/auth/room-host', () => ({
  requireHostAuthFromBody: vi.fn(),
}));

import { revealRound } from '@/services/roomGameService';
import { requireHostAuthFromBody } from '@/lib/auth/room-host';

describe('POST /api/room/reveal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function request(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/room/reveal', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  const validBody = {
    roomCode: 'ABCD',
    hostId: '550e8400-e29b-41d4-a716-446655440000',
    hostToken: 'valid-token',
  };

  it('returns 400 when body validation fails', async () => {
    const res = await POST(request({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 when host auth fails', async () => {
    vi.mocked(requireHostAuthFromBody).mockRejectedValue(
      new AppError('UNAUTHORIZED', 'Hôte non autorisé')
    );

    const res = await POST(request(validBody));
    expect(res.status).toBe(401);
  });

  it('returns 200 and reveals the round', async () => {
    vi.mocked(requireHostAuthFromBody).mockResolvedValue({
      roomCode: 'ABCD',
      hostId: '550e8400-e29b-41d4-a716-446655440000',
      room: { id: 'room-1', code: 'ABCD', hostId: 'host-1', hostToken: 'token', status: 'WAITING', round: 1, language: 'fr' },
    });
    vi.mocked(revealRound).mockResolvedValue({
      success: true,
      status: 'DISCUSSION',
      scores: [{ playerId: 'p1', pointsEarned: 3, isCorrect: true }],
      question: { correctAnswer: 'A', explanation: null },
    });

    const res = await POST(request(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.status).toBe('DISCUSSION');
  });

  it('propagates AppError from revealRound', async () => {
    vi.mocked(requireHostAuthFromBody).mockResolvedValue({
      roomCode: 'ABCD',
      hostId: '550e8400-e29b-41d4-a716-446655440000',
      room: { id: 'room-2', code: 'ABCD', hostId: 'host-1', hostToken: 'token', status: 'WAITING', round: 1, language: 'fr' },
    });
    vi.mocked(revealRound).mockRejectedValue(
      new AppError('BAD_REQUEST', 'No active question found')
    );

    const res = await POST(request(validBody));
    expect(res.status).toBe(400);
  });
});
