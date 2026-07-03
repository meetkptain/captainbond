import { describe, it, expect, vi, beforeEach } from 'vitest';

interface InviteRow {
  inviterId: string;
  expiresAt: string;
  usedAt: string | null;
}

function getMockState() {
  return mockState;
}

function buildCoupleInviteFrom(store: Map<string, InviteRow>) {
  let currentHash: string | null = null;
  let currentUsedAtNull = false;
  let currentExpiresAtGt: string | null = null;
  let updateData: Partial<{ usedAt: string }> | null = null;

  const builder = {
    insert: vi.fn((rows: InviteRow | InviteRow[]) => {
      for (const row of Array.isArray(rows) ? rows : [rows]) {
        if ('tokenHash' in row && row.tokenHash) {
          store.set(row.tokenHash as string, {
            inviterId: row.inviterId as string,
            expiresAt: row.expiresAt as string,
            usedAt: null,
          });
        }
      }
      return Promise.resolve({ data: null, error: null });
    }),
    update: vi.fn((data: Partial<{ usedAt: string }>) => {
      updateData = data;
      return builder;
    }),
    eq: vi.fn((field: string, value: string) => {
      if (field === 'tokenHash') currentHash = value;
      return builder;
    }),
    is: vi.fn((field: string, value: unknown) => {
      if (field === 'usedAt' && value === null) currentUsedAtNull = true;
      return builder;
    }),
    gt: vi.fn((field: string, value: string) => {
      if (field === 'expiresAt') currentExpiresAtGt = value;
      return builder;
    }),
    select: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => {
      if (!currentHash || !updateData || !currentUsedAtNull || !currentExpiresAtGt) {
        return { data: null, error: null };
      }
      const invite = store.get(currentHash);
      if (
        !invite ||
        invite.usedAt !== null ||
        new Date(invite.expiresAt).getTime() <= new Date(currentExpiresAtGt).getTime()
      ) {
        return { data: null, error: null };
      }
      invite.usedAt = updateData.usedAt || new Date().toISOString();
      return {
        data: { inviterId: invite.inviterId, expiresAt: invite.expiresAt },
        error: null,
      };
    }),
  };
  return builder;
}

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: (table: string) => {
      if (table === 'CoupleInvite') {
        return buildCoupleInviteFrom(getMockState().invites);
      }
      return {};
    },
  },
}));

import { createInviteToken, verifyInviteToken } from './invite';

const mockState = { invites: new Map<string, InviteRow>() };

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
  beforeEach(() => {
    mockState.invites.clear();
  });

  it('creates and verifies a token', async () => {
    const token = await createInviteToken('user-123');
    const result = await verifyInviteToken(token);
    expect(result.partnerId).toBe('user-123');
    expect(result.expiresAt).toBeInstanceOf(Date);
  });

  it('rejects a reused token', async () => {
    const token = await createInviteToken('user-123');
    await verifyInviteToken(token);
    await expect(verifyInviteToken(token)).rejects.toThrow('Invalid or already used invite token');
  });

  it('rejects an unknown token hash even if signature is valid', async () => {
    const token = await createInviteToken('user-123');
    mockState.invites.clear();
    await expect(verifyInviteToken(token)).rejects.toThrow('Invalid or already used invite token');
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
