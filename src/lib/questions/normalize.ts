import { AppError } from '@/lib/errors';
import type { Question } from '@/lib/db/types';

export interface QuestionInput {
  id?: string;
  text?: string;
  mode?: string;
  correctAnswer?: string;
  options?: string[];
  category?: string;
  difficulty?: number | string;
  isPremium?: boolean;
  explanation?: string | null;
  packId?: string | null;
  tags?: string[];
  metadata?: Record<string, unknown> | null;
}

export function normalizeQuestionInput(
  input: QuestionInput,
  overrides?: Partial<Question>,
  context?: { message?: string },
): Omit<Question, 'createdAt'> {
  if (!input.text || !input.mode || !input.category) {
    throw new AppError('VALIDATION_ERROR', context?.message ?? 'Champs manquants : text, mode, category');
  }

  const difficultyNum = typeof input.difficulty === 'number'
    ? input.difficulty
    : parseInt(String(input.difficulty), 10) || 1;

  return {
    id: input.id || crypto.randomUUID(),
    text: input.text.trim(),
    mode: input.mode.toUpperCase(),
    correctAnswer: input.correctAnswer !== undefined ? String(input.correctAnswer).trim() : '',
    options: input.options || [],
    category: input.category.toUpperCase(),
    difficulty: difficultyNum,
    isPremium: !!input.isPremium,
    explanation: input.explanation ? input.explanation.trim() : null,
    packId: input.packId || null,
    tags: input.tags || [],
    metadata: input.metadata || null,
    ...overrides,
  };
}
