import { describe, it, expect } from 'vitest';
import { normalizeQuestionInput } from './normalize';
import { AppError } from '@/lib/errors';

describe('normalizeQuestionInput', () => {
  it('trims text and correctAnswer', () => {
    const result = normalizeQuestionInput({
      text: '  Quelle est la capitale ?  ',
      mode: 'QUIZ_FLASH',
      category: 'GENERAL',
      correctAnswer: '  Paris  ',
    });

    expect(result.text).toBe('Quelle est la capitale ?');
    expect(result.correctAnswer).toBe('Paris');
  });

  it('uppercases mode and category', () => {
    const result = normalizeQuestionInput({
      text: 'Question',
      mode: 'quiz_flash',
      category: 'culture',
    });

    expect(result.mode).toBe('QUIZ_FLASH');
    expect(result.category).toBe('CULTURE');
  });

  it('applies default values for missing fields', () => {
    const result = normalizeQuestionInput({
      text: 'Question',
      mode: 'ICEBREAKER',
      category: 'GENERAL',
    });

    expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(result.correctAnswer).toBe('');
    expect(result.options).toEqual([]);
    expect(result.difficulty).toBe(1);
    expect(result.isPremium).toBe(false);
    expect(result.explanation).toBeNull();
    expect(result.packId).toBeNull();
    expect(result.tags).toEqual([]);
    expect(result.metadata).toBeNull();
  });

  it('parses difficulty from a string', () => {
    const result = normalizeQuestionInput({
      text: 'Question',
      mode: 'ICEBREAKER',
      category: 'GENERAL',
      difficulty: '3',
    });

    expect(result.difficulty).toBe(3);
  });

  it('throws a VALIDATION_ERROR when required fields are missing', () => {
    expect(() => normalizeQuestionInput({})).toThrow(AppError);
    expect(() => normalizeQuestionInput({ text: 'Question' })).toThrow(AppError);
    expect(() =>
      normalizeQuestionInput({ text: 'Question', mode: 'ICEBREAKER' }),
    ).toThrow(AppError);
  });

  it('applies overrides after normalization', () => {
    const result = normalizeQuestionInput(
      {
        text: 'Question',
        mode: 'ICEBREAKER',
        category: 'GENERAL',
      },
      { isPremium: true, difficulty: 5 },
    );

    expect(result.isPremium).toBe(true);
    expect(result.difficulty).toBe(5);
  });
});
