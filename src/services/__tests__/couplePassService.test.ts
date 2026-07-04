import { describe, it, expect, vi, beforeEach } from 'vitest';
import { passDailyQuestion } from '../couplePassService';
import { AppError } from '@/lib/errors';

vi.mock('@/lib/auth/coupleMembership', () => ({
  requireCoupleMembership: vi.fn(),
}));

vi.mock('@/lib/db/repositories/dailyQuestionRepository', () => ({
  getDailyQuestionById: vi.fn(),
  updateDailyQuestion: vi.fn(),
}));

vi.mock('@/lib/db/repositories/questionRepository', () => ({
  findRandomCoupleQuestion: vi.fn(),
}));

vi.mock('@/lib/config/monetization', () => ({
  COUPLE_FALLBACK_QUESTIONS: ['Question de secours A', 'Question de secours B'],
}));

import { requireCoupleMembership } from '@/lib/auth/coupleMembership';
import { getDailyQuestionById, updateDailyQuestion } from '@/lib/db/repositories/dailyQuestionRepository';
import { findRandomCoupleQuestion } from '@/lib/db/repositories/questionRepository';

const mockDailyQuestion = {
  id: 'dq-1',
  coupleId: 'couple-1',
  questionId: 'q-1',
  user1Answered: false,
  user2Answered: false,
  isAnswered: false,
  releasedAt: '2026-07-03T00:00:00Z',
};

const mockCandidate = { id: 'q-2', text: 'Nouvelle question du test' };

describe('couplePassService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes daily question to a new random question', async () => {
    vi.mocked(requireCoupleMembership).mockResolvedValue(undefined);
    vi.mocked(getDailyQuestionById).mockResolvedValue(mockDailyQuestion as never);
    vi.mocked(findRandomCoupleQuestion).mockResolvedValue(mockCandidate as never);
    vi.mocked(updateDailyQuestion).mockResolvedValue({ ...mockDailyQuestion, questionId: 'q-2', customText: 'Nouvelle question du test' } as never);

    const result = await passDailyQuestion('couple-1', 'dq-1', 'user-1');

    expect(requireCoupleMembership).toHaveBeenCalledWith('couple-1', 'user-1');
    expect(updateDailyQuestion).toHaveBeenCalledWith('dq-1', {
      questionId: 'q-2',
      customText: 'Nouvelle question du test',
      releasedAt: expect.any(String),
    });
    expect(result.customText).toBe('Nouvelle question du test');
  });

  it('uses fallback questions when no candidate found', async () => {
    vi.mocked(requireCoupleMembership).mockResolvedValue(undefined);
    vi.mocked(getDailyQuestionById).mockResolvedValue(mockDailyQuestion as never);
    vi.mocked(findRandomCoupleQuestion).mockResolvedValue(null);
    vi.mocked(updateDailyQuestion).mockResolvedValue({
      ...mockDailyQuestion,
      questionId: null,
      customText: 'Question de secours A',
    } as never);

    const result = await passDailyQuestion('couple-1', 'dq-1', 'user-1');

    expect(result.questionId).toBeNull();
    expect(result.customText).toBe('Question de secours A');
  });

  it('throws when daily question not found', async () => {
    vi.mocked(requireCoupleMembership).mockResolvedValue(undefined);
    vi.mocked(getDailyQuestionById).mockResolvedValue(null);

    await expect(passDailyQuestion('couple-1', 'dq-1', 'user-1')).rejects.toThrow(AppError);
  });

  it('throws when question does not belong to couple', async () => {
    vi.mocked(requireCoupleMembership).mockResolvedValue(undefined);
    vi.mocked(getDailyQuestionById).mockResolvedValue({ ...mockDailyQuestion, coupleId: 'other-couple' } as never);

    await expect(passDailyQuestion('couple-1', 'dq-1', 'user-1')).rejects.toThrow(AppError);
  });

  it('throws when question already answered', async () => {
    vi.mocked(requireCoupleMembership).mockResolvedValue(undefined);
    vi.mocked(getDailyQuestionById).mockResolvedValue({ ...mockDailyQuestion, isAnswered: true } as never);

    await expect(passDailyQuestion('couple-1', 'dq-1', 'user-1')).rejects.toThrow(AppError);
  });

  it('throws membership error when user not in couple', async () => {
    vi.mocked(requireCoupleMembership).mockRejectedValue(new AppError('FORBIDDEN', 'Accès refusé'));

    await expect(passDailyQuestion('couple-1', 'dq-1', 'user-1')).rejects.toThrow(AppError);
  });
});
