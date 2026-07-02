import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { AppError } from '@/lib/errors';
import { getAuthenticatedPlayer } from '../player-session';

vi.mock('../player', () => ({
  verifyPlayerSession: vi.fn(),
  PLAYER_COOKIE_NAME: 'koze_player_session',
}));

import { verifyPlayerSession } from '../player';

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
  });

  it('throws when cookie is missing', async () => {
    const req = createRequestWithCookie();
    await expect(getAuthenticatedPlayer(req)).rejects.toThrow('Session joueur manquante');
  });

  it('throws when cookie is invalid', async () => {
    vi.mocked(verifyPlayerSession).mockRejectedValue(
      new AppError('UNAUTHORIZED', 'Session joueur invalide ou expirée')
    );

    const req = createRequestWithCookie('invalid-jwt');
    await expect(getAuthenticatedPlayer(req)).rejects.toThrow('Session joueur invalide ou expirée');
  });
});
