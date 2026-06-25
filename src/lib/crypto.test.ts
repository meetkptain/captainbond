import { describe, it, expect, beforeAll } from 'vitest';
import { signHostToken, verifyHostToken, getPlayerHmac } from './crypto';

describe('crypto', () => {
  beforeAll(() => {
    process.env.HOST_TOKEN_SECRET = 'host-token-test-32-chars-long!!';
    process.env.HMAC_IMPOSTEUR_SECRET = 'impostor-secret-test-32-chars!!';
  });

  it('signs and verifies host tokens', async () => {
    const token = await signHostToken('ABCD', 'host-123');
    expect(await verifyHostToken(token, 'ABCD', 'host-123')).toBe(true);
    expect(await verifyHostToken(token, 'ABCD', 'host-999')).toBe(false);
    expect(await verifyHostToken(token, 'WXYZ', 'host-123')).toBe(false);
  });

  it('generates deterministic player hmacs', async () => {
    const h1 = await getPlayerHmac('player-1');
    const h2 = await getPlayerHmac('player-1');
    const h3 = await getPlayerHmac('player-2');
    expect(h1).toBe(h2);
    expect(h1).not.toBe(h3);
    expect(h1).toHaveLength(64);
  });
});
