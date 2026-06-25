import { Room, Player } from '@/lib/db/types';
import { AppError } from '@/lib/errors';

export function assertHost(player: Player): void {
  if (!player.isHost) {
    throw new AppError('FORBIDDEN', 'Seul l\'hôte peut effectuer cette action');
  }
}

export function canKick(host: Player, target: Player): boolean {
  return host.isHost && host.roomId === target.roomId && host.id !== target.id;
}

export function canStartGame(room: Room, players: Player[]): boolean {
  if (room.status !== 'WAITING') return false;
  const nonHosts = players.filter((p) => !p.isHost);
  if (nonHosts.length === 0) return false;
  return nonHosts.every((p) => p.isReady);
}

export function canEndRoom(actor: Player, room: Room): boolean {
  return actor.isHost && actor.roomId === room.id;
}

export function canViewRoom(player: Player, room: Room): boolean {
  return player.roomId === room.id;
}

export function assertCanKick(host: Player, target: Player): void {
  if (!canKick(host, target)) {
    throw new AppError('FORBIDDEN', 'Action non autorisée');
  }
}
