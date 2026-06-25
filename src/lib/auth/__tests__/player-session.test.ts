import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getAuthenticatedPlayer } from '../player-session';

vi.mock('../player', () => ({
  verifyPlayerSession: vi.fn(),
  PLAYER_COOKIE_NAME: 'koze_player_session',
}));

vi.mock('@/lib/db/repositories', () => ({
  getPlayerInRoom: vi.fn(),
  getRoomByCode: vi.fn(),
}));

import { verifyPlayerSession } from '../player';
import { getPlayerInRoom, getRoomByCode } from '@/lib/db/repositories';

function createRequestWithCookie(cookieValue?: string): NextRequest {
  const headers = new Headers();
  if (cookieValue) {
    headers.set('Cookie', `koze_player_session=${cookieValue}`);
  }
  return new NextRequest(new URL('http://localhost/api/test'), { headers });
}

describe('getAuthenticatedPlayer', () => {
  beforeEach(() => {
    vi.stubEnv('PLAYER_JWT_SECRET', 'player-secret-test-32-chars-long!!');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('authenticates from valid cookie', async () => {
    vi.mocked(verifyPlayerSession).mockResolvedValue({
      playerId: 'player-1',
      roomId: 'room-1',
    });

    const req = createRequestWithCookie('valid-jwt');
    const result = await getAuthenticatedPlayer(req);

    expect(result.playerId).toBe('player-1');
    expect(result.roomId).toBe('room-1');
    expect(result.fromCookie).toBe(true);
  });

  it('falls back to playerId + roomCode with DB verification', async () => {
    vi.mocked(verifyPlayerSession).mockRejectedValue(new Error('invalid'));
    vi.mocked(getRoomByCode).mockResolvedValue({ id: 'room-1', code: 'ABCD' } as unknown as Awaited<ReturnType<typeof getRoomByCode>>);
    vi.mocked(getPlayerInRoom).mockResolvedValue({ id: 'player-1', roomId: 'room-1' } as unknown as Awaited<ReturnType<typeof getPlayerInRoom>>);

    const req = createRequestWithCookie();
    const result = await getAuthenticatedPlayer(req, { playerId: 'player-1', roomCode: 'ABCD' });

    expect(result.playerId).toBe('player-1');
    expect(result.roomId).toBe('room-1');
    expect(result.fromCookie).toBe(false);
  });

  it('throws when player is not in room', async () => {
    vi.mocked(verifyPlayerSession).mockRejectedValue(new Error('invalid'));
    vi.mocked(getRoomByCode).mockResolvedValue({ id: 'room-1', code: 'ABCD' } as unknown as Awaited<ReturnType<typeof getRoomByCode>>);
    vi.mocked(getPlayerInRoom).mockResolvedValue(null);

    const req = createRequestWithCookie();
    await expect(
      getAuthenticatedPlayer(req, { playerId: 'player-1', roomCode: 'ABCD' })
    ).rejects.toThrow('Joueur introuvable dans cette salle');
  });

  it('throws when no cookie and no fallback', async () => {
    vi.mocked(verifyPlayerSession).mockRejectedValue(new Error('invalid'));
    const req = createRequestWithCookie();
    await expect(getAuthenticatedPlayer(req)).rejects.toThrow('Session joueur manquante');
  });
});
