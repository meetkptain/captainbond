import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { AppError } from '@/lib/errors';

vi.mock('@/services/roomService', () => ({
  joinRoom: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  ipLimiter: vi.fn(() => undefined),
  rateLimiters: { ip: undefined },
}));

vi.mock('@/lib/auth/player', () => ({
  signPlayerSession: vi.fn(),
  PLAYER_COOKIE_NAME: 'player-token',
  getPlayerCookieOptions: vi.fn(() => ({})),
}));

import { joinRoom } from '@/services/roomService';
import { signPlayerSession } from '@/lib/auth/player';

function request(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/room/join', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const validBody = {
  roomCode: 'ABCD',
  playerName: 'Bob',
  consent: true,
};

describe('POST /api/room/join', () => {
  it('returns 400 when body validation fails (empty body)', async () => {
    const res = await POST(request({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe('VALIDATION_ERROR');
  });

  it('joins a room and returns player data with player cookie', async () => {
    vi.mocked(joinRoom).mockResolvedValueOnce({
      player: { id: 'player-1', name: 'Bob' } as never,
      roomId: 'room-1',
      roomCode: 'ABCD',
    });
    vi.mocked(signPlayerSession).mockResolvedValueOnce('player-jwt-token');

    const res = await POST(request(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.playerId).toBe('player-1');
    expect(json.playerName).toBe('Bob');
    expect(json.roomId).toBe('room-1');
    expect(json.roomCode).toBe('ABCD');
    expect(signPlayerSession).toHaveBeenCalledWith({ playerId: 'player-1', roomId: 'room-1' });
    expect(res.headers.get('set-cookie')).toContain('player-token=player-jwt-token');
  });

  it('returns 404 when the room is not found', async () => {
    vi.mocked(joinRoom).mockRejectedValueOnce(
      new AppError('NOT_FOUND', 'Room code "ZZZZ" not found')
    );

    const res = await POST(request({ ...validBody, roomCode: 'ZZZZ' }));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.code).toBe('NOT_FOUND');
    expect(json.error).toContain('ZZZZ');
  });
});
