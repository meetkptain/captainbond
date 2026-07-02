import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeForCouple, addNodeToTree } from '../treeService';
import { AppError } from '@/lib/errors';

vi.mock('@/lib/db/repositories/coupleTreeRepository', () => ({
  getTreeByCouple: vi.fn(),
  createTreeForCouple: vi.fn(),
  addNode: vi.fn(),
  createConnection: vi.fn(),
  findSimilarNodes: vi.fn(),
}));

vi.mock('@/lib/db/repositories/roomTreeRepository', () => ({
  getTreeByRoom: vi.fn(),
  createTreeForRoom: vi.fn(),
}));

vi.mock('@/lib/db/repositories/questionRepository', () => ({
  getQuestionById: vi.fn(),
}));

vi.mock('@/lib/gemini', () => ({
  getEmbedding: vi.fn(),
}));

import {
  getTreeByCouple,
  createTreeForCouple as createCoupleTreeRecord,
  addNode,
  createConnection,
  findSimilarNodes,
} from '@/lib/db/repositories/coupleTreeRepository';
import { getQuestionById } from '@/lib/db/repositories/questionRepository';
import { getEmbedding } from '@/lib/gemini';

describe('treeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTreeForCouple', () => {
    it('returns existing tree if found', async () => {
      const mockTree = { id: 'tree-1', coupleId: 'couple-1' };
      vi.mocked(getTreeByCouple).mockResolvedValue(mockTree);

      const result = await createTreeForCouple('couple-1');
      expect(result).toEqual(mockTree);
      expect(createCoupleTreeRecord).not.toHaveBeenCalled();
    });

    it('creates new tree if not found', async () => {
      vi.mocked(getTreeByCouple).mockResolvedValue(null);
      const mockTree = { id: 'tree-2', coupleId: 'couple-1' };
      vi.mocked(createCoupleTreeRecord).mockResolvedValue(mockTree);

      const result = await createTreeForCouple('couple-1');
      expect(result).toEqual(mockTree);
      expect(createCoupleTreeRecord).toHaveBeenCalledWith('couple-1');
    });
  });

  describe('addNodeToTree', () => {
    it('throws validation error if neither questionId nor customText is provided', async () => {
      await expect(addNodeToTree('tree-1', { answeredBy: ['user-1'] }))
        .rejects.toThrow(new AppError('VALIDATION_ERROR', 'questionId ou customText est requis.'));
    });

    it('creates node and connections for a question with successful embedding', async () => {
      const mockQuestion = { id: 'q-1', text: 'Quelle est ta plus grande peur ?', intensityLevel: 3, category: 'DEEP' };
      const mockNode = { id: 'node-1', treeId: 'tree-1', questionId: 'q-1', intensity: 3, category: 'DEEP', answeredBy: ['user-1'] };
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockMatches = [{ id: 'node-old', resonance: 0.85 }];

      vi.mocked(getQuestionById).mockResolvedValue(mockQuestion as never);
      vi.mocked(getEmbedding).mockResolvedValue(mockEmbedding);
      vi.mocked(addNode).mockResolvedValue(mockNode as never);
      vi.mocked(findSimilarNodes).mockResolvedValue(mockMatches);

      const result = await addNodeToTree('tree-1', { questionId: 'q-1', answeredBy: ['user-1'] });

      expect(result).toEqual(mockNode);
      expect(getEmbedding).toHaveBeenCalledWith(mockQuestion.text);
      expect(addNode).toHaveBeenCalledWith('tree-1', {
        questionId: 'q-1',
        customText: undefined,
        intensity: 3,
        category: 'DEEP',
        answeredBy: ['user-1'],
        embedding: mockEmbedding,
      });
      expect(findSimilarNodes).toHaveBeenCalledWith('tree-1', mockEmbedding, 0.75, 10);
      expect(createConnection).toHaveBeenCalledWith({
        treeId: 'tree-1',
        sourceId: 'node-1',
        targetId: 'node-old',
        resonance: 0.85,
        type: 'SIMILARITY',
      });
    });

    it('creates node even if getEmbedding fails', async () => {
      const mockNode = { id: 'node-2', treeId: 'tree-1', customText: 'Salut', intensity: 1, category: 'GENERAL', answeredBy: ['user-1'] };

      vi.mocked(getEmbedding).mockRejectedValue(new Error('API Down'));
      vi.mocked(addNode).mockResolvedValue(mockNode as never);

      const result = await addNodeToTree('tree-1', { customText: 'Salut', answeredBy: ['user-1'] });

      expect(result).toEqual(mockNode);
      expect(addNode).toHaveBeenCalledWith('tree-1', {
        questionId: undefined,
        customText: 'Salut',
        intensity: 1,
        category: 'GENERAL',
        answeredBy: ['user-1'],
        embedding: null,
      });
      expect(findSimilarNodes).not.toHaveBeenCalled();
      expect(createConnection).not.toHaveBeenCalled();
    });
  });
});
