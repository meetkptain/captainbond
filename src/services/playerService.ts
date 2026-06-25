import {
  getPlayerById,
  updatePlayer,
  deletePlayer,
  deleteScoresForPlayer,
  deleteResponsesForPlayer,
  getPlayerInRoom,
  getRoomByCode,
} from '@/lib/db/repositories';
import { AppError } from '@/lib/errors';
import { assertCanKick } from '@/lib/auth/permissions';
import { getPlayerEntitlements, getUserEntitlements, Entitlements } from '@/lib/monetization/entitlements';

export async function setPlayerReady(playerId: string, ready: boolean): Promise<void> {
  const player = await getPlayerById(playerId);
  if (!player) {
    throw new AppError('NOT_FOUND', 'Joueur introuvable');
  }
  await updatePlayer(playerId, { isReady: ready });
}

export async function removePlayerById(playerId: string, roomId: string): Promise<void> {
  const player = await getPlayerInRoom(playerId, roomId);
  if (!player) {
    throw new AppError('NOT_FOUND', 'Joueur introuvable dans cette salle');
  }
  await deleteResponsesForPlayer(playerId);
  await deleteScoresForPlayer(playerId);
  await deletePlayer(playerId);
}

export async function removePlayerFromRoom(playerId: string, roomCode: string): Promise<void> {
  const room = await getRoomByCode(roomCode);
  if (!room) {
    throw new AppError('NOT_FOUND', 'Salle introuvable');
  }
  await removePlayerById(playerId, room.id);
}

export async function kickPlayerFromRoom(
  hostId: string,
  targetPlayerId: string,
  roomId: string
): Promise<void> {
  const [host, target] = await Promise.all([
    getPlayerInRoom(hostId, roomId),
    getPlayerInRoom(targetPlayerId, roomId),
  ]);

  if (!host) {
    throw new AppError('FORBIDDEN', 'Hôte introuvable');
  }
  if (!target) {
    throw new AppError('NOT_FOUND', 'Joueur cible introuvable');
  }

  assertCanKick(host, target);
  await removePlayerById(targetPlayerId, roomId);
}

export async function deletePlayerAccount(playerId: string, roomId: string): Promise<void> {
  const player = await getPlayerInRoom(playerId, roomId);
  if (!player) {
    throw new AppError('NOT_FOUND', 'Joueur introuvable dans cette salle');
  }
  await removePlayerById(playerId, roomId);

  // Note: we intentionally do NOT delete the User row here because the same
  // Supabase Auth user may be linked to purchases. A separate process should
  // handle full account deletion (GDPR right to erasure) with audit.
}

export async function getPlayerEntitlementsSummary(playerId: string): Promise<Entitlements | null> {
  return getPlayerEntitlements(playerId);
}

export async function getUserEntitlementsSummary(userId: string): Promise<Entitlements | null> {
  return getUserEntitlements(userId);
}
