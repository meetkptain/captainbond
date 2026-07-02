import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitAnswer } from '@/services/coupleAnswerService';
import type { Couple, DailyQuestion, TreeNode, TreeConnection } from '@/lib/db/types';

vi.mock('@/lib/auth/coupleMembership', () => ({
  requireCoupleMembership: vi.fn(),
}));

vi.mock('@/lib/db/repositories/dailyQuestionRepository', () => ({
  getDailyQuestionById: vi.fn(),
  recordAnswer: vi.fn(),
  claimAnalysisComputation: vi.fn(),
  updateDailyQuestion: vi.fn(),
}));

vi.mock('@/lib/db/repositories/treeRepository', () => ({
  createTree: vi.fn(),
  createTreeNode: vi.fn(),
  createTreeConnection: vi.fn(),
  listTreeNodesByQuestion: vi.fn(),
}));

vi.mock('@/lib/db/repositories/coupleTreeRepository', () => ({
  getTreeByCouple: vi.fn(),
}));

vi.mock('@/lib/db/repositories/coupleRepository', () => ({
  getCoupleById: vi.fn(),
}));

vi.mock('@/lib/gemini', () => ({
  getEmbedding: vi.fn(),
  generateContent: vi.fn(),
}));

vi.mock('@/services/totemMappingService', () => ({
  mapAnswerToOrbe: vi.fn().mockResolvedValue(undefined),
}));

import * as dailyQuestionRepository from '@/lib/db/repositories/dailyQuestionRepository';
import * as treeRepository from '@/lib/db/repositories/treeRepository';
import * as coupleTreeRepository from '@/lib/db/repositories/coupleTreeRepository';
import * as coupleRepository from '@/lib/db/repositories/coupleRepository';
import * as gemini from '@/lib/gemini';

const coupleId = 'couple-1';
const user1Id = 'user-1';
const user2Id = 'user-2';
const dailyQuestionId = 'dq-1';
const questionId = 'q-1';

const baseCouple: Couple = {
  id: coupleId,
  user1Id,
  user2Id,
  createdAt: new Date().toISOString(),
} as Couple;

function makeDailyQuestion(overrides: Partial<DailyQuestion> = {}): DailyQuestion {
  return {
    id: dailyQuestionId,
    coupleId,
    questionId,
    customText: 'Quel est votre rêve commun ?',
    analysisStatus: 'PENDING',
    user1Answered: false,
    user2Answered: false,
    isAnswered: false,
    isRevealed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  } as DailyQuestion;
}

describe('coupleAnswerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(coupleRepository.getCoupleById).mockResolvedValue(baseCouple);
    vi.mocked(coupleTreeRepository.getTreeByCouple).mockResolvedValue({ id: 'tree-1' });
    vi.mocked(treeRepository.createTreeNode).mockResolvedValue({ id: 'node-1' } as TreeNode);
    vi.mocked(treeRepository.createTreeConnection).mockResolvedValue({ id: 'conn-1' } as TreeConnection);
    vi.mocked(treeRepository.listTreeNodesByQuestion).mockResolvedValue([]);
    vi.mocked(gemini.getEmbedding).mockResolvedValue([0.1, 0.2, 0.3]);
    vi.mocked(gemini.generateContent).mockResolvedValue(
      JSON.stringify({
        alignmentScore: 0.85,
        resonanceInsight: 'Vous êtes sur la même longueur d’onde.',
      })
    );
  });

  it('returns WAITING when only one partner answered', async () => {
    vi.mocked(dailyQuestionRepository.getDailyQuestionById).mockResolvedValue(
      makeDailyQuestion()
    );
    vi.mocked(dailyQuestionRepository.recordAnswer).mockResolvedValue(
      makeDailyQuestion({ user1Answered: true, user1Answer: 'Amour' })
    );

    const result = await submitAnswer(coupleId, dailyQuestionId, user1Id, 'Amour');

    expect(result.status).toBe('WAITING');
    expect(dailyQuestionRepository.recordAnswer).toHaveBeenCalledWith(dailyQuestionId, true, 'Amour');
  });

  it('returns ALREADY_ANSWERED when the partner already answered', async () => {
    vi.mocked(dailyQuestionRepository.getDailyQuestionById).mockResolvedValue(
      makeDailyQuestion({ user1Answered: true })
    );
    vi.mocked(dailyQuestionRepository.recordAnswer).mockResolvedValue(null);

    const result = await submitAnswer(coupleId, dailyQuestionId, user1Id, 'Amour');

    expect(result.status).toBe('ALREADY_ANSWERED');
    expect(dailyQuestionRepository.claimAnalysisComputation).not.toHaveBeenCalled();
  });

  it('computes analysis when both partners answered', async () => {
    vi.mocked(dailyQuestionRepository.getDailyQuestionById)
      .mockResolvedValueOnce(makeDailyQuestion({ user2Answered: true, user2Answer: 'Voyage' }))
      .mockResolvedValueOnce(makeDailyQuestion({ analysisStatus: 'COMPUTED' }));
    vi.mocked(dailyQuestionRepository.recordAnswer).mockResolvedValue(
      makeDailyQuestion({ user1Answered: true, user1Answer: 'Amour', user2Answered: true, user2Answer: 'Voyage' })
    );
    vi.mocked(dailyQuestionRepository.claimAnalysisComputation).mockResolvedValue(true);

    const result = await submitAnswer(coupleId, dailyQuestionId, user1Id, 'Amour');

    expect(result.status).toBe('COMPUTED');
    expect(dailyQuestionRepository.updateDailyQuestion).toHaveBeenCalledWith(
      dailyQuestionId,
      expect.objectContaining({
        analysisStatus: 'COMPUTED',
        isAnswered: true,
      })
    );
    expect(treeRepository.createTreeConnection).toHaveBeenCalled();
  });

  it('returns WAITING when another request claims analysis first', async () => {
    vi.mocked(dailyQuestionRepository.getDailyQuestionById)
      .mockResolvedValueOnce(makeDailyQuestion({ user2Answered: true }))
      .mockResolvedValueOnce(makeDailyQuestion({ analysisStatus: 'COMPUTING' }));
    vi.mocked(dailyQuestionRepository.recordAnswer).mockResolvedValue(
      makeDailyQuestion({ user1Answered: true, user2Answered: true })
    );
    vi.mocked(dailyQuestionRepository.claimAnalysisComputation).mockResolvedValue(false);

    const result = await submitAnswer(coupleId, dailyQuestionId, user1Id, 'Amour');

    expect(result.status).toBe('WAITING');
    expect(gemini.generateContent).not.toHaveBeenCalled();
  });
});
