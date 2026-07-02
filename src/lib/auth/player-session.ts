import { NextRequest } from 'next/server';
import { verifyPlayerSession, PLAYER_COOKIE_NAME } from './player';
import { AppError } from '@/lib/errors';

export interface AuthenticatedPlayerContext {
  playerId: string;
  roomId: string;
}

/**
 * Récupère la session joueur depuis le cookie JWT signé.
 * Retourne null si le cookie est absent ou invalide (sans rejeter la requête).
 */
export async function getPlayerSessionFromCookie(
  req: NextRequest
): Promise<{ playerId: string; roomId: string } | null> {
  const token = req.cookies.get(PLAYER_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifyPlayerSession(token);
  } catch {
    return null;
  }
}

/**
 * Authentifie un joueur exclusivement via le cookie JWT signé.
 * Toute requête sans cookie valide est rejetée.
 */
export async function getAuthenticatedPlayer(
  req: NextRequest
): Promise<AuthenticatedPlayerContext> {
  const token = req.cookies.get(PLAYER_COOKIE_NAME)?.value;
  if (!token) {
    throw new AppError('UNAUTHORIZED', 'Session joueur manquante');
  }

  const session = await verifyPlayerSession(token);
  return { playerId: session.playerId, roomId: session.roomId };
}
