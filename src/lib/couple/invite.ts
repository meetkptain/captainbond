import { AppError } from '@/lib/errors';
import { requireEnv } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { dbRetry } from '@/lib/db/withRetry';

const SEPARATOR = ':';
const DEFAULT_TTL_HOURS = 24 * 7;

export interface VerifiedInvite {
  partnerId: string;
  expiresAt: Date;
}

function getSecret(): string {
  return requireEnv('COUPLE_INVITE_SECRET');
}

function encodeHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function decodeHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function sha256Hex(input: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return encodeHex(buffer);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function sign(payload: string): Promise<string> {
  const key = await importKey(getSecret());
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return encodeHex(signature);
}

export async function createInviteToken(partnerId: string, ttlHours = DEFAULT_TTL_HOURS): Promise<string> {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  const payload = `${partnerId}${SEPARATOR}${expiresAt.toISOString()}`;
  const signature = await sign(payload);
  const token = `${payload}${SEPARATOR}${signature}`;

  // Store a hash so the token can only be used once (anti-replay).
  const tokenHash = await sha256Hex(token);
  const { error } = await dbRetry<null>(async () =>
    supabaseAdmin.from('CoupleInvite').insert({
      inviterId: partnerId,
      tokenHash,
      expiresAt: expiresAt.toISOString(),
    }),
  );
  if (error) {
    throw new AppError('INTERNAL_ERROR', 'Failed to store invite token', { cause: error });
  }

  return token;
}

export async function verifyInviteToken(token: string): Promise<VerifiedInvite> {
  const parts = token.split(SEPARATOR);
  if (parts.length < 3) {
    throw new AppError('VALIDATION_ERROR', 'Invalid invite token');
  }
  const signature = parts.pop();
  const partnerId = parts.shift();
  const expiresAtIso = parts.join(SEPARATOR);
  if (!partnerId || !signature || !expiresAtIso) {
    throw new AppError('VALIDATION_ERROR', 'Invalid invite token');
  }
  const payload = `${partnerId}${SEPARATOR}${expiresAtIso}`;

  const key = await importKey(getSecret());
  const expected = encodeHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)));

  if (signature.length !== expected.length || !constantTimeEqual(decodeHex(signature), decodeHex(expected))) {
    throw new AppError('VALIDATION_ERROR', 'Invalid invite token');
  }

  const expiresAt = new Date(expiresAtIso);
  if (Number.isNaN(expiresAt.getTime())) {
    throw new AppError('VALIDATION_ERROR', 'Invalid invite token');
  }
  if (expiresAt <= new Date()) {
    throw new AppError('VALIDATION_ERROR', 'Invite token expired');
  }

  // Atomic single-use check: mark used only if currently unused and not expired in DB.
  const tokenHash = await sha256Hex(token);
  const now = new Date().toISOString();
  const { data: invite, error } = await dbRetry<{
    inviterId: string;
    expiresAt: string;
  } | null>(async () =>
    supabaseAdmin
      .from('CoupleInvite')
      .update({ usedAt: now })
      .eq('tokenHash', tokenHash)
      .is('usedAt', null)
      .gt('expiresAt', now)
      .select('inviterId, expiresAt')
      .maybeSingle(),
  );
  if (error || !invite) {
    throw new AppError('VALIDATION_ERROR', 'Invalid or already used invite token');
  }

  return { partnerId: invite.inviterId, expiresAt: new Date(invite.expiresAt) };
}
