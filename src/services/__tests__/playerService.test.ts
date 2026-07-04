import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  setPlayerReady,
  removePlayerById,
  removePlayerFromRoom,
  kickPlayerFromRoom,
  deletePlayerAccount,
  getPlayerEntitlementsSummary,
  getUserEntitlementsSummary,
} from '../playerService';
import { AppError } from '@/lib/errors';

const mockPlayer = { id: 'p1', name: 'Alice', isHost: false, isReady: false, roomId: 'room-1' };
const mockRoom = { id: 'room-1', code: 'ABCD', hostId: 'host-1' };

vi.mock('@/lib/db/repositories', () => ({
  getPlayerById: vi.fn(),
  updatePlayer: vi.fn(),
  deletePlayer: vi.fn(),
  deleteScoresForPlayer: vi.fn(),
  deleteResponsesForPlayer: vi.fn(),
  getPlayerInRoom: vi.fn(),
  getRoomByCode: vi.fn(),
}));

vi.mock('@/lib/auth/permissions', () => ({
  assertCanKick: vi.fn(),
}));

vi.mock('@/lib/monetization/entitlements', () => ({
  getPlayerEntitlements: vi.fn(),
  getUserEntitlements: vi.fn(),
}));

import {
  getPlayerById,
  updatePlayer,
  deletePlayer,
  deleteScoresForPlayer,
  deleteResponsesForPlayer,
  getPlayerInRoom,
  getRoomByCode,
} from '@/lib/db/repositories';
import { assertCanKick } from '@/lib/auth/permissions';
import { getPlayerEntitlements, getUserEntitlements } from '@/lib/monetization/entitlements';

describe('playerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setPlayerReady', () => {
    it('updates player ready status', async () => {
      vi.mocked(getPlayerById).mockResolvedValue(mockPlayer);
      await setPlayerReady('p1', true);
      expect(updatePlayer).toHaveBeenCalledWith('p1', { isReady: true });
    });

    it('throws when player not found', async () => {
      vi.mocked(getPlayerById).mockResolvedValue(null);
      await expect(setPlayerReady('p1', true)).rejects.toThrow(AppError);
    });
  });

  describe('removePlayerById', () => {
    it('deletes player and their data', async () => {
      vi.mocked(getPlayerInRoom).mockResolvedValue(mockPlayer);
      await removePlayerById('p1', 'room-1');
      expect(deleteResponsesForPlayer).toHaveBeenCalledWith('p1');
      expect(deleteScoresForPlayer).toHaveBeenCalledWith('p1');
      expect(deletePlayer).toHaveBeenCalledWith('p1');
    });

    it('throws when player not in room', async () => {
      vi.mocked(getPlayerInRoom).mockResolvedValue(null);
      await expect(removePlayerById('p1', 'room-1')).rejects.toThrow(AppError);
    });
  });

  describe('removePlayerFromRoom', () => {
    it('removes player by room code', async () => {
      vi.mocked(getRoomByCode).mockResolvedValue(mockRoom);
      vi.mocked(getPlayerInRoom).mockResolvedValue(mockPlayer);
      await removePlayerFromRoom('p1', 'ABCD');
      expect(deletePlayer).toHaveBeenCalledWith('p1');
    });

    it('throws when room not found', async () => {
      vi.mocked(getRoomByCode).mockResolvedValue(null);
      await expect(removePlayerFromRoom('p1', 'ABCD')).rejects.toThrow(AppError);
    });
  });

  describe('kickPlayerFromRoom', () => {
    it('kicks target player when host has permission', async () => {
      const host = { ...mockPlayer, id: 'host-1', isHost: true };
      vi.mocked(getPlayerInRoom).mockResolvedValueOnce(host);
      vi.mocked(getPlayerInRoom).mockResolvedValueOnce(mockPlayer);
      await kickPlayerFromRoom('host-1', 'p1', 'room-1');
      expect(assertCanKick).toHaveBeenCalledWith(host, mockPlayer);
      expect(deletePlayer).toHaveBeenCalledWith('p1');
    });

    it('throws when host not found', async () => {
      vi.mocked(getPlayerInRoom).mockResolvedValueOnce(null);
      await expect(kickPlayerFromRoom('host-1', 'p1', 'room-1')).rejects.toThrow(AppError);
    });

    it('throws when target not found', async () => {
      vi.mocked(getPlayerInRoom).mockResolvedValueOnce(mockPlayer);
      vi.mocked(getPlayerInRoom).mockResolvedValueOnce(null);
      await expect(kickPlayerFromRoom('host-1', 'p1', 'room-1')).rejects.toThrow(AppError);
    });
  });

  describe('deletePlayerAccount', () => {
    it('deletes player data but not user', async () => {
      vi.mocked(getPlayerInRoom).mockResolvedValue(mockPlayer);
      await deletePlayerAccount('p1', 'room-1');
      expect(deletePlayer).toHaveBeenCalledWith('p1');
    });

    it('throws when player not in room', async () => {
      vi.mocked(getPlayerInRoom).mockResolvedValue(null);
      await expect(deletePlayerAccount('p1', 'room-1')).rejects.toThrow(AppError);
    });
  });

  describe('getPlayerEntitlementsSummary', () => {
    it('returns player entitlements', async () => {
      const entitlements = { hasActivePass: true, passExpiresAt: null, hasActiveSubscription: false };
      vi.mocked(getPlayerEntitlements).mockResolvedValue(entitlements as never);
      const result = await getPlayerEntitlementsSummary('p1');
      expect(result).toEqual(entitlements);
    });
  });

  describe('getUserEntitlementsSummary', () => {
    it('returns user entitlements', async () => {
      const entitlements = { hasActivePass: true, passExpiresAt: null, hasActiveSubscription: false };
      vi.mocked(getUserEntitlements).mockResolvedValue(entitlements as never);
      const result = await getUserEntitlementsSummary('u1');
      expect(result).toEqual(entitlements);
    });
  });
});
