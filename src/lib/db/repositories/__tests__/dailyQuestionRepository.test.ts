import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { listAnsweredQuestionsForCouple } from '../dailyQuestionRepository';
import { DailyQuestion } from '../../types';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

const mockQuestions: DailyQuestion[] = [
  {
    id: 'dq-1',
    coupleId: 'couple-1',
    customText: 'Comment te sens-tu aujourd\'hui ?',
    releasedAt: '2026-07-02T08:00:00.000Z',
    isAnswered: true,
    user1Answered: true,
    user2Answered: false,
    isRevealed: false,
    analysisStatus: 'PENDING',
    isSkipped: false,
    isSafeZoneActive: false,
    intensity: 1,
  },
  {
    id: 'dq-2',
    coupleId: 'couple-1',
    customText: 'Quel est ton souvenir préféré avec moi ?',
    releasedAt: '2026-07-01T08:00:00.000Z',
    isAnswered: true,
    user1Answered: true,
    user2Answered: true,
    isRevealed: true,
    analysisStatus: 'REVEALED',
    isSkipped: false,
    isSafeZoneActive: false,
    intensity: 2,
  },
];

function mockListReturn(data: DailyQuestion[] | null, error: Error | null = null) {
  vi.mocked(supabaseAdmin.from).mockReturnValue({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        or: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data, error })),
        })),
      })),
    })),
  } as never);
}

describe('dailyQuestionRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listAnsweredQuestionsForCouple', () => {
    it('returns answered questions ordered by releasedAt desc', async () => {
      mockListReturn(mockQuestions);

      const result = await listAnsweredQuestionsForCouple('couple-1');

      expect(supabaseAdmin.from).toHaveBeenCalledWith('DailyQuestion');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('dq-1');
      expect(result[1].id).toBe('dq-2');
    });

    it('returns empty array when no answered questions exist', async () => {
      mockListReturn([]);

      const result = await listAnsweredQuestionsForCouple('couple-1');

      expect(result).toEqual([]);
    });

    it('throws when supabase returns an error', async () => {
      const dbError = new Error('database error');
      mockListReturn(null, dbError);

      await expect(listAnsweredQuestionsForCouple('couple-1')).rejects.toThrow('database error');
    });
  });
});
