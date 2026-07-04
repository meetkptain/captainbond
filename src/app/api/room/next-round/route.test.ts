import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { AppError } from '@/lib/errors';

vi.mock('@/services/roomGameService', () => ({
  startNextRound: vi.fn(),
}));

vi.mock('@/lib/auth/room-host', () => ({
  requireHostAuthFromBody: vi.fn(),
}));

import { startNextRound } from '@/services/roomGameService';
import { requireHostAuthFromBody } from '@/lib/auth/room-host';

const mockRoom = {
  id: 'room-1', code: 'ABCD', hostId: 'host-1', hostToken: 'token',
  status: 'WAITING' as const, round: 0, language: 'fr',
};

const mockAuth = {
  roomCode: 'ABCD',
  hostId: '550e8400-e29b-41d4-a716-446655440000',
  room: mockRoom,
};

describe('POST /api/room/next-round', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function request(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/room/next-round', {
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

  it('returns 200 and starts the next round', async () => {
    vi.mocked(requireHostAuthFromBody).mockResolvedValue(mockAuth);
    vi.mocked(startNextRound).mockResolvedValue({
      success: true,
      status: 'PLAYING',
      round: 2,
      roundDuration: 30,
      freeQuestionsUsed: 2,
      freeQuestionsLimit: 3,
      question: { id: 'q1', text: 'Qui a faim?', tags: [] },
    });

    const res = await POST(request(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.round).toBe(2);
  });

  it('returns 409 when race condition occurs', async () => {
    vi.mocked(requireHostAuthFromBody).mockResolvedValue(mockAuth);
    vi.mocked(startNextRound).mockRejectedValue(
      new AppError('CONFLICT', 'Une manche est déjà en cours')
    );

    const res = await POST(request(validBody));
    expect(res.status).toBe(409);
  });

  it('returns 403 when premium mode requires a pass', async () => {
    vi.mocked(requireHostAuthFromBody).mockResolvedValue(mockAuth);
    vi.mocked(startNextRound).mockRejectedValue(
      new AppError('FORBIDDEN', 'Ce mode premium nécessite le Pass 24h')
    );

    const res = await POST(request(validBody));
    expect(res.status).toBe(403);
  });
});
