import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { AppError } from '@/lib/errors';

export const ADMIN_COOKIE_NAME = 'koze_admin_session';

export interface AdminSessionPayload {
  role: 'admin';
}

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error('Missing ADMIN_JWT_SECRET environment variable');
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminSession(): Promise<string> {
  const secret = getSecret();
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secret);
}

export async function verifyAdminSession(token: string): Promise<AdminSessionPayload> {
  const secret = getSecret();
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    if (payload.role !== 'admin') {
      throw new AppError('UNAUTHORIZED', 'Session admin invalide');
    }
    return { role: 'admin' };
  } catch {
    throw new AppError('UNAUTHORIZED', 'Session admin invalide ou expirée');
  }
}

export async function requireAdminSession(req: NextRequest): Promise<AdminSessionPayload> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    throw new AppError('UNAUTHORIZED', 'Session admin manquante');
  }
  return verifyAdminSession(token);
}

export async function requireAdminOrSyncAuth(req: NextRequest): Promise<AdminSessionPayload | { role: 'sync' }> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (token) {
    try {
      return await verifyAdminSession(token);
    } catch {
      // fallthrough to sync secret check
    }
  }

  const syncSecret = process.env.ADMIN_SYNC_SECRET;
  if (syncSecret) {
    const authHeader = req.headers.get('Authorization');
    if (authHeader === `Bearer ${syncSecret}`) {
      return { role: 'sync' };
    }
  }

  throw new AppError('UNAUTHORIZED', 'Authentification admin ou sync secret requise');
}

export async function hashAdminPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyAdminPassword(password: string): Promise<void> {
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminPasswordHash) {
    const valid = await bcrypt.compare(password, adminPasswordHash);
    if (!valid) {
      throw new AppError('INVALID_CREDENTIALS', 'Mot de passe incorrect', { status: 401 });
    }
    return;
  }

  // Fallback déprécié : comparaison en clair (à migrer vers ADMIN_PASSWORD_HASH)
  if (!adminPassword) {
    throw new AppError('INTERNAL_ERROR', 'Mot de passe administrateur non configuré', { status: 500 });
  }
  if (password !== adminPassword) {
    throw new AppError('INVALID_CREDENTIALS', 'Mot de passe incorrect', { status: 401 });
  }
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  };
}
