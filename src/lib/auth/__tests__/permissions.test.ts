import { describe, it, expect } from 'vitest';
import { canKick, canStartGame, canEndRoom, canViewRoom, assertHost } from '../permissions';
import { Player, Room } from '@/lib/db/types';

describe('permissions', () => {
  const host: Player = {
    id: 'host-1',
    name: 'Hôte',
    isHost: true,
    isReady: false,
    roomId: 'room-1',
  };

  const player: Player = {
    id: 'player-1',
    name: 'Joueur',
    isHost: false,
    isReady: false,
    roomId: 'room-1',
  };

  const otherRoomPlayer: Player = {
    id: 'player-2',
    name: 'Autre',
    isHost: false,
    isReady: false,
    roomId: 'room-2',
  };

  it('allows host to kick a player in the same room', () => {
    expect(canKick(host, player)).toBe(true);
  });

  it('forbids kicking yourself', () => {
    expect(canKick(host, host)).toBe(false);
  });

  it('forbids non-host to kick', () => {
    expect(canKick(player, host)).toBe(false);
  });

  it('forbids kicking a player from another room', () => {
    expect(canKick(host, otherRoomPlayer)).toBe(false);
  });

  it('assertHost throws for non-host', () => {
    expect(() => assertHost(player)).toThrow('Seul l\'hôte peut effectuer cette action');
  });

  it('canStartGame requires all non-hosts ready', () => {
    const room: Room = { id: 'room-1', code: 'ABCD', hostId: 'host-1', hostToken: 'token', status: 'WAITING', round: 0 };
    expect(canStartGame(room, [host, player])).toBe(false);
    expect(canStartGame(room, [host, { ...player, isReady: true }])).toBe(true);
  });

  it('canEndRoom requires host in same room', () => {
    const room: Room = { id: 'room-1', code: 'ABCD', hostId: 'host-1', hostToken: 'token', status: 'PLAYING', round: 1 };
    expect(canEndRoom(host, room)).toBe(true);
    expect(canEndRoom(player, room)).toBe(false);
  });

  it('canViewRoom requires same room', () => {
    const room: Room = { id: 'room-1', code: 'ABCD', hostId: 'host-1', hostToken: 'token', status: 'WAITING', round: 0 };
    expect(canViewRoom(host, room)).toBe(true);
    expect(canViewRoom(otherRoomPlayer, room)).toBe(false);
  });
});
