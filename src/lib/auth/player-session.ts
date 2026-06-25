import { NextRequest } from 'next/server';
import { verifyPlayerSession, PLAYER_COOKIE_NAME } from './player';
import { AppError } from '@/lib/errors';
import { getPlayerInRoom, getRoomByCode } from '@/lib/db/repositories';

export interface AuthenticatedPlayerContext {
  playerId: string;
  roomId: string;
  fromCookie: boolean;
}

export interface PlayerIdentityFallback {
  playerId?: string;
  roomCode?: string;
  roomId?: string;
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
 * Authentifie un joueur :
 * 1. Cookie JWT signé (prioritaire)
 * 2. Fallback playerId + roomId/roomCode avec vérification DB
 *
 * Le fallback est conservé temporairement pour la compatibilité avec les clients
 * qui n'envoient pas encore le cookie HttpOnly à chaque requête.
 */
export async function getAuthenticatedPlayer(
  req: NextRequest,
  fallback: PlayerIdentityFallback = {}
): Promise<AuthenticatedPlayerContext> {
  const session = await getPlayerSessionFromCookie(req);
  if (session) {
    return { playerId: session.playerId, roomId: session.roomId, fromCookie: true };
  }

  const playerId = fallback.playerId;
  if (!playerId) {
    throw new AppError('UNAUTHORIZED', 'Session joueur manquante');
  }

  let roomId = fallback.roomId;
  if (!roomId && fallback.roomCode) {
    const room = await getRoomByCode(fallback.roomCode);
    if (!room) {
      throw new AppError('NOT_FOUND', 'Salle introuvable');
    }
    roomId = room.id;
  }

  if (!roomId) {
    throw new AppError('UNAUTHORIZED', 'Impossible de vérifier l\'identité du joueur');
  }

  const player = await getPlayerInRoom(playerId, roomId);
  if (!player) {
    throw new AppError('FORBIDDEN', 'Joueur introuvable dans cette salle');
  }

  return { playerId, roomId, fromCookie: false };
}

/**
 * Vérifie qu'une requête est authentifiée pour un playerId donné.
 * Priorité au cookie JWT ; fallback DB si absent.
 */
export async function requirePlayerSessionFor(
  req: NextRequest,
  playerId: string,
  roomCode?: string,
): Promise<AuthenticatedPlayerContext> {
  const session = await getPlayerSessionFromCookie(req);
  if (session) {
    if (session.playerId !== playerId) {
      throw new AppError('FORBIDDEN', 'Session joueur invalide pour ce playerId');
    }
    return { playerId: session.playerId, roomId: session.roomId, fromCookie: true };
  }

  return getAuthenticatedPlayer(req, { playerId, roomCode });
}

/**
 * Vérifie qu'un joueur appartient à une room sans nécessairement renvoyer une session.
 */
export async function assertPlayerInRoom(playerId: string, roomId: string): Promise<void> {
  const player = await getPlayerInRoom(playerId, roomId);
  if (!player) {
    throw new AppError('FORBIDDEN', 'Joueur introuvable dans cette salle');
  }
}
