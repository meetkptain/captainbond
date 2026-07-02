import { describe, it, expect, vi } from 'vitest';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  listQuestionsForDeck,
  type RoomDeckQuestion,
} from '../roomQuestionRepository';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

const mockQuestions: RoomDeckQuestion[] = [
  { id: 'q1', text: 'Question 1', intensityLevel: 1, tags: ['icebreaker'], mode: 'ICEBREAKER' },
  { id: 'q2', text: 'Question 2', intensityLevel: 2, tags: ['deep'], mode: 'DEEP_CONNECTION' },
];

function mockSelectReturn(data: RoomDeckQuestion[] | null, error: Error | null = null) {
  vi.mocked(supabaseAdmin.from).mockReturnValue({
    select: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data, error })),
    })),
  } as never);
}

describe('roomQuestionRepository', () => {
  describe('listQuestionsForDeck', () => {
    it('defaults to French and returns deck questions', async () => {
      mockSelectReturn(mockQuestions);

      const result = await listQuestionsForDeck();

      expect(result).toHaveLength(2);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('Question');
      expect(result[0]).toMatchObject({
        id: 'q1',
        text: 'Question 1',
        intensityLevel: 1,
        tags: ['icebreaker'],
        mode: 'ICEBREAKER',
      });
    });

    it('uses provided language', async () => {
      mockSelectReturn(mockQuestions);

      await listQuestionsForDeck('en');

      const selectMock = vi.mocked(supabaseAdmin.from).mock.results[0]?.value;
      expect(selectMock).toBeDefined();
    });

    it('returns empty array when no questions exist', async () => {
      mockSelectReturn([]);

      const result = await listQuestionsForDeck('fr');
      expect(result).toEqual([]);
    });

    it('throws when supabase returns an error', async () => {
      const dbError = new Error('database error');
      mockSelectReturn(null, dbError);

      await expect(listQuestionsForDeck('fr')).rejects.toThrow('database error');
    });
  });
});
