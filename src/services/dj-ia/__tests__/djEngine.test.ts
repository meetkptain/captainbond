import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateDJQuestion } from '../djEngine';
import { AppError } from '@/lib/errors';

vi.mock('@/lib/db/repositories', () => ({
  getDJProfileById: vi.fn(),
  getTreeByCouple: vi.fn(),
  getTreeByRoom: vi.fn(),
  listTreeNodes: vi.fn(),
  listTreeConnections: vi.fn(),
  getQuestionById: vi.fn(),
  createDJQuestion: vi.fn(),
}));

vi.mock('@/lib/gemini', () => ({
  generateContent: vi.fn(),
}));

import {
  getDJProfileById,
  getTreeByCouple,
  listTreeNodes,
  listTreeConnections,
  getQuestionById,
  createDJQuestion,
} from '@/lib/db/repositories';
import { generateContent } from '@/lib/gemini';

describe('djEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateDJQuestion', () => {
    it('throws AppError if profile does not exist', async () => {
      vi.mocked(getDJProfileById).mockResolvedValue(null);

      await expect(generateDJQuestion('profile-1'))
        .rejects.toThrow(new AppError('NOT_FOUND', "Profil DJ avec l'ID profile-1 introuvable."));
    });

    it('generates personalized question successfully with high resonance feedback', async () => {
      const mockProfile = { id: 'prof-1', coupleId: 'couple-1', mood: 'DEEP', intensityTarget: 2 };
      const mockTree = { id: 'tree-1', coupleId: 'couple-1' };
      const mockQuestion = { id: 'q-1', text: 'Parle de ton enfance', category: 'DEEP', intensityLevel: 2 };
      const mockNode = { id: 'node-1', treeId: 'tree-1', questionId: 'q-1' };
      const mockConnections = [{ id: 'conn-1', resonance: 0.90, sourceId: 'node-1', targetId: 'node-2' }];
      const mockGeneratedText = 'Votre résonance est forte (90%). Racontez une blessure d\'enfance.';

      vi.mocked(getDJProfileById).mockResolvedValue(mockProfile as never);
      vi.mocked(getTreeByCouple).mockResolvedValue(mockTree as never);
      vi.mocked(listTreeNodes).mockResolvedValue([mockNode] as never);
      vi.mocked(listTreeConnections).mockResolvedValue(mockConnections as never);
      vi.mocked(getQuestionById).mockResolvedValue(mockQuestion as never);
      vi.mocked(generateContent).mockResolvedValue(mockGeneratedText);

      const result = await generateDJQuestion('prof-1');

      expect(result).toBe(mockGeneratedText);
      expect(generateContent).toHaveBeenCalled();
      expect(createDJQuestion).toHaveBeenCalledWith({
        profileId: 'prof-1',
        text: mockGeneratedText,
        status: 'PENDING',
      });
    });

    it('uses fallback questions if generateContent fails', async () => {
      const mockProfile = { id: 'prof-1', coupleId: 'couple-1', mood: 'SPICY', intensityTarget: 2 };
      const mockTree = { id: 'tree-1', coupleId: 'couple-1' };

      vi.mocked(getDJProfileById).mockResolvedValue(mockProfile as never);
      vi.mocked(getTreeByCouple).mockResolvedValue(mockTree as never);
      vi.mocked(listTreeNodes).mockResolvedValue([] as never);
      vi.mocked(listTreeConnections).mockResolvedValue([] as never);
      vi.mocked(generateContent).mockRejectedValue(new Error('Gemini offline'));

      const result = await generateDJQuestion('prof-1');

      expect(result).toBeTypeOf('string');
      expect(result.length).toBeGreaterThan(0);
      expect(createDJQuestion).toHaveBeenCalledWith({
        profileId: 'prof-1',
        text: result,
        status: 'PENDING',
      });
    });
  });
});
