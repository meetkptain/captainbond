import { describe, it, expect, vi } from 'vitest';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  listQuestionsForTheme,
  pickQuestionForTheme,
  type RitualQuestion,
} from '../coupleQuestionRepository';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

const mockQuestions: RitualQuestion[] = [
  {
    id: 'q1',
    text: 'Question 1',
    intensityLevel: 1,
    suggestedAction: 'Action 1',
    therapistGuide: 'Guide 1',
  },
  {
    id: 'q2',
    text: 'Question 2',
    intensityLevel: 1,
    suggestedAction: 'Action 2',
    therapistGuide: 'Guide 2',
  },
];

function mockSelectReturn(data: RitualQuestion[] | null, error: Error | null = null) {
  vi.mocked(supabaseAdmin.from).mockReturnValue({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data, error })),
      })),
    })),
  } as never);
}

describe('coupleQuestionRepository', () => {
  describe('listQuestionsForTheme', () => {
    it('returns matching ritual questions', async () => {
      mockSelectReturn(mockQuestions);

      const result = await listQuestionsForTheme('RECONNECTION', 1);

      expect(result).toHaveLength(2);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('Question');
      expect(result[0]).toMatchObject({
        id: 'q1',
        text: 'Question 1',
        intensityLevel: 1,
        suggestedAction: 'Action 1',
        therapistGuide: 'Guide 1',
      });
    });

    it('returns empty array when no questions match', async () => {
      mockSelectReturn([]);

      const result = await listQuestionsForTheme('UNKNOWN', 99);
      expect(result).toEqual([]);
    });

    it('throws when supabase returns an error', async () => {
      const dbError = new Error('database error');
      mockSelectReturn(null, dbError);

      await expect(listQuestionsForTheme('RECONNECTION', 1)).rejects.toThrow('database error');
    });
  });

  describe('pickQuestionForTheme', () => {
    it('returns a random matching question', async () => {
      mockSelectReturn(mockQuestions);

      const result = await pickQuestionForTheme('RECONNECTION', 1);

      expect(mockQuestions.map((q) => q.id)).toContain(result.id);
    });

    it('throws when no question matches', async () => {
      mockSelectReturn([]);

      await expect(pickQuestionForTheme('RECONNECTION', 1)).rejects.toThrow(
        'No question found for theme RECONNECTION intensity 1'
      );
    });
  });
});
