import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordVote, revealRound } from '../roomGameService';
import { AppError } from '@/lib/errors';

import type { Room } from '@/lib/db/types';

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
  getQuestionById: vi.fn(),
  listQuestionsForDeck: vi.fn(),
}));

// Build helper for mock chaining
const mockUpdateChain = (dataValue: unknown, errorValue: unknown = null) => ({
  eq: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: dataValue, error: errorValue }),
} as unknown as ReturnType<typeof supabaseAdmin.from>);

vi.mock('@/lib/supabase-admin', () => {
  const fromMock = vi.fn();
  return {
    supabaseAdmin: {
      rpc: vi.fn(),
      from: fromMock,
    },
  };
});

import { getRoomByCode, getQuestionById } from '@/lib/db/repositories';
import { supabaseAdmin } from '@/lib/supabase-admin';

describe('roomGameService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recordVote', () => {
    beforeEach(() => {
      // Default mock for recordVote
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as unknown as ReturnType<typeof supabaseAdmin.from>);
    });

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
      vi.mocked(supabaseAdmin.rpc).mockResolvedValue({ data: { responseId: 'resp-1' }, error: null } as never);

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

      // We mock the Supabase chain calls in revealRound:
      // 1. Room update to REVEALING
      // 2. Response select
      // 3. Room update to DISCUSSION
      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'Room') {
          return {
            update: vi.fn().mockReturnValue(mockUpdateChain({ id: 'room-1', status: 'DISCUSSION' })),
          } as unknown as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'Response') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            then: vi.fn().mockImplementation((resolve: (val: unknown) => void) => resolve({
              data: [
                { id: 'resp-1', playerId: 'player-1', questionId: 'question-1', answer: 'A', timestamp: '2026-06-27T15:00:00Z' }
              ],
              error: null
            })),
          } as unknown as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as unknown as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(supabaseAdmin.rpc).mockResolvedValue({ data: null, error: null } as never);

      const result = await revealRound('ABCD', 'host-1');
      expect(result.success).toBe(true);
      expect(result.status).toBe('DISCUSSION');
      expect(supabaseAdmin.rpc).toHaveBeenCalledWith('upsert_reveal_scores', expect.any(Object));
    });
  });
});
