import { describe, it, expect, vi } from 'vitest';
import { createInviteToken, verifyInviteToken } from './invite';

vi.stubEnv('COUPLE_INVITE_SECRET', 'test-secret-32-bytes-long!!');

function splitToken(token: string) {
  const first = token.indexOf(':');
  const last = token.lastIndexOf(':');
  return {
    partnerId: token.slice(0, first),
    expiresAtIso: token.slice(first + 1, last),
    signature: token.slice(last + 1),
  };
}

describe('couple invite tokens', () => {
  it('creates and verifies a token', async () => {
    const token = await createInviteToken('user-123');
    const result = await verifyInviteToken(token);
    expect(result.partnerId).toBe('user-123');
    expect(result.expiresAt).toBeInstanceOf(Date);
  });

  it('rejects a tampered token', async () => {
    const token = await createInviteToken('user-123');
    await expect(verifyInviteToken(token + 'x')).rejects.toThrow('Invalid invite token');
  });

  it('rejects an expired token', async () => {
    const token = await createInviteToken('user-123', -1);
    await expect(verifyInviteToken(token)).rejects.toThrow('Invite token expired');
  });

  it('rejects an empty string token', async () => {
    await expect(verifyInviteToken('')).rejects.toThrow('Invalid invite token');
  });

  it('rejects a token with too few colons', async () => {
    const token = await createInviteToken('user-123');
    const { partnerId, expiresAtIso } = splitToken(token);
    await expect(verifyInviteToken(`${partnerId}:${expiresAtIso}`)).rejects.toThrow('Invalid invite token');
  });

  it('rejects a token with too many colons while signature unchanged', async () => {
    const token = await createInviteToken('user-123');
    const { expiresAtIso, signature } = splitToken(token);
    await expect(verifyInviteToken(`user:123:${expiresAtIso}:${signature}`)).rejects.toThrow('Invalid invite token');
  });

  it('rejects a token with a short signature', async () => {
    const token = await createInviteToken('user-123');
    const { partnerId, expiresAtIso } = splitToken(token);
    await expect(verifyInviteToken(`${partnerId}:${expiresAtIso}:abc`)).rejects.toThrow('Invalid invite token');
  });

  it('rejects a token with a tampered partnerId', async () => {
    const token = await createInviteToken('user-123');
    const { expiresAtIso, signature } = splitToken(token);
    await expect(verifyInviteToken(`attacker:${expiresAtIso}:${signature}`)).rejects.toThrow('Invalid invite token');
  });

  it('rejects a token with a tampered expiresAt', async () => {
    const token = await createInviteToken('user-123');
    const { partnerId, expiresAtIso, signature } = splitToken(token);
    const later = new Date(new Date(expiresAtIso).getTime() + 60 * 60 * 1000).toISOString();
    await expect(verifyInviteToken(`${partnerId}:${later}:${signature}`)).rejects.toThrow('Invalid invite token');
  });

  it('rejects a token with an invalid date payload', async () => {
    const token = await createInviteToken('user-123');
    const { partnerId } = splitToken(token);
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(process.env.COUPLE_INVITE_SECRET!),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${partnerId}:not-a-date`));
    const expectedSig = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    await expect(verifyInviteToken(`${partnerId}:not-a-date:${expectedSig}`)).rejects.toThrow('Invalid invite token');
  });

  it('fails to create a token when COUPLE_INVITE_SECRET is missing', async () => {
    const original = process.env.COUPLE_INVITE_SECRET;
    vi.stubEnv('COUPLE_INVITE_SECRET', '');
    await expect(createInviteToken('user-123')).rejects.toThrow('Missing required environment variable: COUPLE_INVITE_SECRET');
    vi.stubEnv('COUPLE_INVITE_SECRET', original!);
  });
});
