import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordVote, revealRound, skipQuestion, startNextRound } from '../roomGameService';
import { AppError } from '@/lib/errors';
import { listQuestionsForDeck } from '@/lib/db/repositories/roomQuestionRepository';

import type { Room, Player, Question } from '@/lib/db/types';

const mockRoom = (overrides: Partial<Room> = {}): Room => ({
  id: 'room-1',
  code: 'ABCD',
  hostId: 'host-1',
  hostToken: 'token-1',
  status: 'PLAYING',
  currentQuestionId: 'question-1',
  round: 1,
  ...overrides,
});

vi.mock('@/lib/db/repositories', () => ({
  getRoomByCode: vi.fn(),
  getRoomById: vi.fn(),
  getPlayersInRoom: vi.fn(),
  getPlayerInRoom: vi.fn(),
  getPlayersByRoomWithUserId: vi.fn(),
  getQuestionById: vi.fn(),
  listQuestionsByIds: vi.fn(),
  getResponsesByRoomAndQuestion: vi.fn(),
  getResponsesForProfileInputs: vi.fn(),
  getScoresByRoom: vi.fn(),
  updateRoom: vi.fn(),
  updateRoomWithStatusGuard: vi.fn(),
  updateRoomStatusWithGuard: vi.fn(),
  recordVoteRpc: vi.fn(),
  upsertRevealScoresRpc: vi.fn(),
  advanceRoomRoundRpc: vi.fn(),
}));

vi.mock('@/lib/db/repositories/roomQuestionRepository', () => ({
  listQuestionsForDeck: vi.fn(),
}));

import {
  getRoomByCode,
  getQuestionById,
  updateRoomStatusWithGuard,
  updateRoomWithStatusGuard,
  updateRoom,
  recordVoteRpc,
  upsertRevealScoresRpc,
  advanceRoomRoundRpc,
  getResponsesByRoomAndQuestion,
  getPlayersInRoom,
} from '@/lib/db/repositories';

describe('roomGameService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recordVote', () => {
    it('rejects vote when room is not playing', async () => {
      vi.mocked(getRoomByCode).mockResolvedValue(mockRoom({ status: 'WAITING' }));

      await expect(recordVote('player-1', 'ABCD', 'question-1', 'answer'))
        .rejects.toThrow(new AppError('FORBIDDEN', 'La partie n\'est pas en cours'));
    });

    it('rejects vote when question is not active', async () => {
      vi.mocked(getRoomByCode).mockResolvedValue(mockRoom({ currentQuestionId: 'question-2' }));

      await expect(recordVote('player-1', 'ABCD', 'question-1', 'answer'))
        .rejects.toThrow(new AppError('FORBIDDEN', 'Cette question n\'est pas active'));
    });

    it('records vote when room is playing and question is active', async () => {
      vi.mocked(getRoomByCode).mockResolvedValue(mockRoom());
      vi.mocked(recordVoteRpc).mockResolvedValue('resp-1');

      const result = await recordVote('player-1', 'ABCD', 'question-1', 'answer');
      expect(result).toEqual({ responseId: 'resp-1' });
    });
  });

  describe('revealRound', () => {
    it('successfully reveals a round, calling upsert_reveal_scores RPC', async () => {
      vi.mocked(getRoomByCode).mockResolvedValue(mockRoom());
      vi.mocked(getQuestionById).mockResolvedValue({
        id: 'question-1',
        text: 'Qui a faim?',
        mode: 'icebreaker',
        correctAnswer: 'A',
      } as unknown as Awaited<ReturnType<typeof getQuestionById>>);

      vi.mocked(updateRoomStatusWithGuard)
        .mockResolvedValueOnce(mockRoom({ status: 'REVEALING' }))
        .mockResolvedValueOnce(mockRoom({ status: 'DISCUSSION' }));

      vi.mocked(getResponsesByRoomAndQuestion).mockResolvedValue([
        { id: 'resp-1', playerId: 'player-1', questionId: 'question-1', answer: 'A', timestamp: '2026-06-27T15:00:00Z' }
      ] as Awaited<ReturnType<typeof getResponsesByRoomAndQuestion>>);

      vi.mocked(upsertRevealScoresRpc).mockResolvedValue();

      const result = await revealRound('ABCD', 'host-1');
      expect(result.success).toBe(true);
      expect(result.status).toBe('DISCUSSION');
      expect(upsertRevealScoresRpc).toHaveBeenCalledWith({
        roomId: 'room-1',
        responseUpdates: [{ response_id: 'resp-1', is_correct: true }],
        scoreUpserts: expect.any(Array),
      });
    });
  });

  describe('skipQuestion', () => {
    it('successfully skips a question', async () => {
      vi.mocked(getRoomByCode).mockResolvedValue(mockRoom());
      vi.mocked(getPlayersInRoom).mockResolvedValue([
        { id: 'player-1', name: 'Agent', isHost: false, roomId: 'room-1', userId: 'user-1' }
      ] as Player[]);
      vi.mocked(listQuestionsForDeck).mockResolvedValue([
        { id: 'question-2', text: 'New Question', mode: 'ICEBREAKER', intensityLevel: 1 }
      ] as Awaited<ReturnType<typeof listQuestionsForDeck>>);

      vi.mocked(updateRoom).mockResolvedValue({
        id: 'room-1',
        status: 'PLAYING',
        currentQuestionId: 'question-2',
        round: 1,
      } as Room);

      const result = await skipQuestion('ABCD', 'player-1');
      expect(result.success).toBe(true);
      expect(result.question.id).toBe('question-2');
    });
  });

  describe('startNextRound', () => {
    it('rejects when non-host player count is below mode minimum', async () => {
      vi.mocked(getRoomByCode).mockResolvedValue(mockRoom({ currentMode: 'ICEBREAKER', status: 'WAITING', round: 0 }));
      vi.mocked(getPlayersInRoom).mockResolvedValue([
        { id: 'host-1', name: 'Host', isHost: true, roomId: 'room-1' },
        { id: 'player-1', name: 'Agent', isHost: false, roomId: 'room-1' },
      ] as Player[]);
      vi.mocked(listQuestionsForDeck).mockResolvedValue([
        { id: 'question-1', text: 'Qui a faim?', mode: 'ICEBREAKER', intensityLevel: 1 }
      ] as Pick<Question, 'id' | 'text' | 'intensityLevel' | 'tags' | 'mode'>[]);

      await expect(startNextRound('ABCD', 'host-1'))
        .rejects.toThrow(new AppError('BAD_REQUEST', 'Ce mode nécessite entre 3 et 10 joueurs. Actuellement : 1.'));
    });

    it('rejects when non-host player count exceeds mode maximum', async () => {
      vi.mocked(getRoomByCode).mockResolvedValue(mockRoom({ currentMode: 'DEEP_CONNECTION', status: 'WAITING', round: 0 }));
      vi.mocked(getPlayersInRoom).mockResolvedValue([
        { id: 'host-1', name: 'Host', isHost: true, roomId: 'room-1' },
        ...Array.from({ length: 7 }, (_, i) => ({ id: `player-${i}`, name: `Agent ${i}`, isHost: false, roomId: 'room-1' })),
      ] as Player[]);
      vi.mocked(listQuestionsForDeck).mockResolvedValue([
        { id: 'question-1', text: 'Question deep', mode: 'DEEP_CONNECTION', intensityLevel: 1 }
      ] as Pick<Question, 'id' | 'text' | 'intensityLevel' | 'tags' | 'mode'>[]);

      await expect(startNextRound('ABCD', 'host-1'))
        .rejects.toThrow(new AppError('BAD_REQUEST', 'Ce mode nécessite entre 3 et 6 joueurs. Actuellement : 7.'));
    });

    it('starts a round when player count is within mode bounds', async () => {
      vi.mocked(getRoomByCode).mockResolvedValue(mockRoom({ currentMode: 'ICEBREAKER', status: 'WAITING', round: 0 }));
      vi.mocked(getPlayersInRoom).mockResolvedValue([
        { id: 'host-1', name: 'Host', isHost: true, roomId: 'room-1' },
        { id: 'player-1', name: 'A', isHost: false, roomId: 'room-1' },
        { id: 'player-2', name: 'B', isHost: false, roomId: 'room-1' },
        { id: 'player-3', name: 'C', isHost: false, roomId: 'room-1' },
      ] as Player[]);
      vi.mocked(listQuestionsForDeck).mockResolvedValue([
        { id: 'question-1', text: 'Qui a faim?', mode: 'ICEBREAKER', intensityLevel: 1 }
      ] as Pick<Question, 'id' | 'text' | 'intensityLevel' | 'tags' | 'mode'>[]);

      vi.mocked(advanceRoomRoundRpc).mockResolvedValue({
        id: 'room-1',
        status: 'PLAYING',
        round: 1,
      });

      const result = await startNextRound('ABCD', 'host-1');
      expect(result.success).toBe(true);
      expect(result.status).toBe('PLAYING');
      expect(result.round).toBe(1);
      expect(result.question.id).toBe('question-1');
    });

    it('throws CONFLICT when another request already advanced the round', async () => {
      vi.mocked(getRoomByCode).mockResolvedValue(mockRoom({ currentMode: 'ICEBREAKER', status: 'PLAYING', round: 2 }));
      vi.mocked(getPlayersInRoom).mockResolvedValue([
        { id: 'host-1', name: 'Host', isHost: true, roomId: 'room-1' },
        { id: 'player-1', name: 'A', isHost: false, roomId: 'room-1' },
        { id: 'player-2', name: 'B', isHost: false, roomId: 'room-1' },
        { id: 'player-3', name: 'C', isHost: false, roomId: 'room-1' },
      ] as Player[]);
      vi.mocked(listQuestionsForDeck).mockResolvedValue([
        { id: 'question-1', text: 'Qui a faim?', mode: 'ICEBREAKER', intensityLevel: 1 }
      ] as Pick<Question, 'id' | 'text' | 'intensityLevel' | 'tags' | 'mode'>[]);

      vi.mocked(advanceRoomRoundRpc).mockRejectedValue(
        Object.assign(new Error('Race condition: room round already advanced'), { code: 'ROOM_ROUND_RACE' })
      );

      await expect(startNextRound('ABCD', 'host-1'))
        .rejects.toThrow(new AppError('CONFLICT', 'Une manche est déjà en cours'));
    });
  });
});
