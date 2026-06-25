import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  signPlayerSession,
  verifyPlayerSession,
  PLAYER_COOKIE_NAME,
} from '../player';

describe('player auth', () => {
  beforeEach(() => {
    vi.stubEnv('PLAYER_JWT_SECRET', 'player-secret-test-32-chars-long!!');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('signs and verifies a player session', async () => {
    const payload = { playerId: '11111111-1111-1111-1111-111111111111', roomId: '22222222-2222-2222-2222-222222222222' };
    const token = await signPlayerSession(payload);
    expect(token).toBeDefined();

    const verified = await verifyPlayerSession(token);
    expect(verified.playerId).toBe(payload.playerId);
    expect(verified.roomId).toBe(payload.roomId);
  });

  it('rejects an invalid token', async () => {
    await expect(verifyPlayerSession('not-a-jwt')).rejects.toThrow('Session joueur invalide');
  });

  it('rejects a token with missing claims', async () => {
    vi.stubEnv('PLAYER_JWT_SECRET', 'player-secret-test-32-chars-long!!');
    const { SignJWT } = await import('jose');
    const secret = new TextEncoder().encode(process.env.PLAYER_JWT_SECRET);
    const token = await new SignJWT({ playerId: 'only-player-id' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);

    await expect(verifyPlayerSession(token)).rejects.toThrow('Session joueur invalide');
  });

  it('exposes the cookie name', () => {
    expect(PLAYER_COOKIE_NAME).toBe('koze_player_session');
  });
});
