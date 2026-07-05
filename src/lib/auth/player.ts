import { SignJWT, jwtVerify } from 'jose';
import { AppError } from '@/lib/errors';

export const PLAYER_COOKIE_NAME = 'koze_player_session';
export const PLAYER_REFRESH_COOKIE_NAME = 'koze_player_refresh';

export interface PlayerSessionPayload {
  playerId: string;
  roomId: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.PLAYER_JWT_SECRET;
  if (!secret) {
    throw new Error('Missing PLAYER_JWT_SECRET environment variable');
  }
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.PLAYER_REFRESH_SECRET || process.env.PLAYER_JWT_SECRET;
  if (!secret) {
    throw new Error('Missing PLAYER_JWT_SECRET for refresh token');
  }
  return new TextEncoder().encode(secret);
}

export async function signPlayerSession(payload: PlayerSessionPayload): Promise<string> {
  const secret = getSecret();
  return new SignJWT({ playerId: payload.playerId, roomId: payload.roomId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

export async function signPlayerRefreshToken(payload: PlayerSessionPayload): Promise<string> {
  const secret = getRefreshSecret();
  return new SignJWT({ playerId: payload.playerId, roomId: payload.roomId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('90d')
    .sign(secret);
}

export async function verifyPlayerRefreshToken(token: string): Promise<PlayerSessionPayload | null> {
  const secret = getRefreshSecret();
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    if (!payload.playerId || !payload.roomId || payload.type !== 'refresh') return null;
    return { playerId: payload.playerId as string, roomId: payload.roomId as string };
  } catch {
    return null;
  }
}

export async function verifyPlayerSession(token: string): Promise<PlayerSessionPayload> {
  const secret = getSecret();
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    if (!payload.playerId || !payload.roomId || typeof payload.playerId !== 'string' || typeof payload.roomId !== 'string') {
      throw new AppError('UNAUTHORIZED', 'Session joueur invalide');
    }
    return { playerId: payload.playerId, roomId: payload.roomId };
  } catch {
    throw new AppError('UNAUTHORIZED', 'Session joueur invalide ou expirée');
  }
}

export function getPlayerCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
}

export function getPlayerRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 90, // 90 days
  };
}
