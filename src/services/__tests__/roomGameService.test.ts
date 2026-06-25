import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordVote } from '../roomGameService';
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

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn() })) })),
    })),
  },
}));

import { getRoomByCode } from '@/lib/db/repositories';
import { supabaseAdmin } from '@/lib/supabase-admin';

describe('recordVote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
