import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRoom, joinRoom } from '../roomService';
import { AppError } from '@/lib/errors';
import { getRoomByCode } from '@/lib/db/repositories';
import { createRoom as createRoomInDb } from '@/lib/db/repositories';
import { generateUniqueRoomCode } from '@/lib/db/repositories';
import { joinRoomRpc } from '@/lib/db/repositories';

vi.mock('@/lib/db/repositories', () => ({
  createRoom: vi.fn(),
  generateUniqueRoomCode: vi.fn(),
  getRoomByCode: vi.fn(),
  getRoomById: vi.fn(),
  createPlayer: vi.fn(),
  joinRoomRpc: vi.fn(),
}));

vi.mock('@/lib/crypto', () => ({
  signHostToken: vi.fn().mockResolvedValue('mock-host-token'),
}));

vi.mock('@/game-modes/manifests', () => ({
  getServerGameMode: vi.fn().mockReturnValue({
    manifest: { maxPlayers: 8 }
  }),
}));

describe('roomService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRoom', () => {
    beforeEach(() => {
      vi.mocked(generateUniqueRoomCode).mockResolvedValue('ABCD');
    });

    it('creates room successfully on first attempt', async () => {
      const mockRoomObj = {
        id: 'room-1',
        code: 'ABCD',
        hostId: 'host-1',
        hostToken: 'mock-host-token',
        status: 'WAITING',
        round: 0,
        targetType: 'GROUP',
      };
      vi.mocked(createRoomInDb).mockResolvedValueOnce(mockRoomObj as unknown as Awaited<ReturnType<typeof createRoomInDb>>);

      const result = await createRoom({ targetType: 'GROUP' });
      expect(result.room.id).toBe('room-1');
      expect(result.hostId).toBeDefined();
      expect(generateUniqueRoomCode).toHaveBeenCalledTimes(1);
      expect(createRoomInDb).toHaveBeenCalledTimes(1);
    });

    it('propagates error when room code generation fails', async () => {
      vi.mocked(generateUniqueRoomCode).mockRejectedValueOnce(
        new AppError('ROOM_CODE_COLLISION', 'Could not generate a unique room code')
      );

      await expect(createRoom({ targetType: 'GROUP' })).rejects.toThrow(
        new AppError('ROOM_CODE_COLLISION', 'Could not generate a unique room code')
      );
      expect(createRoomInDb).not.toHaveBeenCalled();
    });
  });

  describe('joinRoom', () => {
    it('rejects if room does not exist', async () => {
      vi.mocked(getRoomByCode).mockResolvedValueOnce(null);

      await expect(joinRoom({ roomCode: 'ABCD', playerName: 'Alice' })).rejects.toThrow(
        new AppError('NOT_FOUND', 'Room code "ABCD" not found')
      );
    });

    it('successfully joins a room via RPC call', async () => {
      vi.mocked(getRoomByCode).mockResolvedValueOnce({
        id: 'room-1',
        code: 'ABCD',
        status: 'WAITING',
        currentMode: 'icebreaker',
      } as unknown as Awaited<ReturnType<typeof getRoomByCode>>);

      vi.mocked(joinRoomRpc).mockResolvedValueOnce({
        player_id: 'player-1',
        room_id: 'room-1',
        room_code: 'ABCD',
      } as unknown as Awaited<ReturnType<typeof joinRoomRpc>>);

      const result = await joinRoom({ roomCode: 'ABCD', playerName: 'Alice' });
      expect(result.player.id).toBe('player-1');
      expect(result.roomId).toBe('room-1');
      expect(result.roomCode).toBe('ABCD');
    });

    it('maps RPC "Ce nom est déjà pris" error to PLAYER_NAME_TAKEN', async () => {
      vi.mocked(getRoomByCode).mockResolvedValueOnce({
        id: 'room-1',
        code: 'ABCD',
        status: 'WAITING',
      } as unknown as Awaited<ReturnType<typeof getRoomByCode>>);

      vi.mocked(joinRoomRpc).mockRejectedValueOnce(
        new Error('Ce nom est déjà pris')
      );

      await expect(joinRoom({ roomCode: 'ABCD', playerName: 'Alice' })).rejects.toThrow(
        new AppError('PLAYER_NAME_TAKEN', 'The name "Alice" is already taken in this lobby')
      );
    });

    it('maps RPC "Cette table est complète" error to ROOM_FULL', async () => {
      vi.mocked(getRoomByCode).mockResolvedValueOnce({
        id: 'room-1',
        code: 'ABCD',
        status: 'WAITING',
        currentMode: 'icebreaker',
      } as unknown as Awaited<ReturnType<typeof getRoomByCode>>);

      vi.mocked(joinRoomRpc).mockRejectedValueOnce(
        new Error('Cette table est complète')
      );

      await expect(joinRoom({ roomCode: 'ABCD', playerName: 'Alice' })).rejects.toThrow(
        new AppError('ROOM_FULL', 'Cette table est complète (8 joueurs max pour ce mode).')
      );
    });
  });
});
