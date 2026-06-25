import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeForCouple, addNodeToTree } from '../treeService';
import { AppError } from '@/lib/errors';

vi.mock('@/lib/db/repositories', () => ({
  getTreeByCouple: vi.fn(),
  createTree: vi.fn(),
  getQuestionById: vi.fn(),
  createTreeNode: vi.fn(),
  findSimilarTreeNodes: vi.fn(),
  createTreeConnection: vi.fn(),
}));

vi.mock('@/lib/gemini', () => ({
  getEmbedding: vi.fn(),
}));

import {
  getTreeByCouple,
  createTree,
  getQuestionById,
  createTreeNode,
  findSimilarTreeNodes,
  createTreeConnection,
} from '@/lib/db/repositories';
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
      expect(createTree).not.toHaveBeenCalled();
    });

    it('creates new tree if not found', async () => {
      vi.mocked(getTreeByCouple).mockResolvedValue(null);
      const mockTree = { id: 'tree-2', coupleId: 'couple-1' };
      vi.mocked(createTree).mockResolvedValue(mockTree);

      const result = await createTreeForCouple('couple-1');
      expect(result).toEqual(mockTree);
      expect(createTree).toHaveBeenCalledWith({ coupleId: 'couple-1' });
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
      vi.mocked(createTreeNode).mockResolvedValue(mockNode as never);
      vi.mocked(findSimilarTreeNodes).mockResolvedValue(mockMatches);

      const result = await addNodeToTree('tree-1', { questionId: 'q-1', answeredBy: ['user-1'] });

      expect(result).toEqual(mockNode);
      expect(getEmbedding).toHaveBeenCalledWith(mockQuestion.text);
      expect(createTreeNode).toHaveBeenCalledWith({
        treeId: 'tree-1',
        questionId: 'q-1',
        customText: undefined,
        intensity: 3,
        category: 'DEEP',
        answeredBy: ['user-1'],
        embedding: mockEmbedding,
      });
      expect(findSimilarTreeNodes).toHaveBeenCalledWith('tree-1', mockEmbedding, 0.75, 10);
      expect(createTreeConnection).toHaveBeenCalledWith({
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
      vi.mocked(createTreeNode).mockResolvedValue(mockNode as never);

      const result = await addNodeToTree('tree-1', { customText: 'Salut', answeredBy: ['user-1'] });

      expect(result).toEqual(mockNode);
      expect(createTreeNode).toHaveBeenCalledWith({
        treeId: 'tree-1',
        questionId: undefined,
        customText: 'Salut',
        intensity: 1,
        category: 'GENERAL',
        answeredBy: ['user-1'],
        embedding: null,
      });
      expect(findSimilarTreeNodes).not.toHaveBeenCalled();
      expect(createTreeConnection).not.toHaveBeenCalled();
    });
  });
});
