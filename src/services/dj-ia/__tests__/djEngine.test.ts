import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateDJQuestion, updateDJQuestionFeedback } from '../djEngine';
import { AppError } from '@/lib/errors';

vi.mock('@/lib/db/repositories', () => ({
  getDJProfileById: vi.fn(),
  getTreeByCouple: vi.fn(),
  getTreeByRoom: vi.fn(),
  listTreeNodes: vi.fn(),
  listTreeConnections: vi.fn(),
  getQuestionById: vi.fn(),
  createDJQuestion: vi.fn(),
  updateDJProfile: vi.fn(),
  getDJQuestionById: vi.fn(),
  updateDJQuestionStatus: vi.fn(),
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
  updateDJProfile,
  getDJQuestionById,
  updateDJQuestionStatus,
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
      const mockProfile = { id: 'prof-1', coupleId: 'couple-1', mood: 'DEEP', intensityTarget: 2, interactionHistory: null };
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
      const mockProfile = { id: 'prof-1', coupleId: 'couple-1', mood: 'SPICY', intensityTarget: 2, interactionHistory: null };
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

  describe('updateDJQuestionFeedback', () => {
    it('throws AppError if question is not found', async () => {
      vi.mocked(getDJQuestionById).mockResolvedValue(null);

      await expect(updateDJQuestionFeedback('q-123', 'ACCEPTED'))
        .rejects.toThrow(new AppError('NOT_FOUND', "Question DJ avec l'ID q-123 introuvable."));
    });

    it('records feedback and appends it to profile history successfully', async () => {
      const mockQuestion = { id: 'q-123', profileId: 'prof-1', text: 'Quelle est ta plus grande peur ?', status: 'PENDING' };
      const mockProfile = { id: 'prof-1', interactionHistory: { items: [] } };

      vi.mocked(getDJQuestionById).mockResolvedValue(mockQuestion as never);
      vi.mocked(getDJProfileById).mockResolvedValue(mockProfile as never);

      await updateDJQuestionFeedback('q-123', 'REJECTED', 'Trop sensible');

      expect(updateDJQuestionStatus).toHaveBeenCalledWith('q-123', { status: 'REJECTED', feedback: 'Trop sensible' });
      expect(updateDJProfile).toHaveBeenCalledWith('prof-1', {
        interactionHistory: {
          items: [
            expect.objectContaining({
              questionText: 'Quelle est ta plus grande peur ?',
              status: 'REJECTED',
              feedback: 'Trop sensible',
              timestamp: expect.any(String),
            }),
          ],
        },
      });
    });
  });
});
