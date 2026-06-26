import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildQuestionPool, QuestionForDeck } from './deck';

function makeQuestion(overrides: Partial<QuestionForDeck>): QuestionForDeck {
  return {
    id: 'q-default',
    text: 'Default question',
    mode: 'ICEBREAKER',
    intensityLevel: 1,
    tags: [],
    ...overrides,
  };
}

describe('buildQuestionPool', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('filters by mode (DATE_NIGHT uses date_safe)', () => {
    const allQuestions = [
      makeQuestion({ id: 'q1', mode: 'ICEBREAKER', tags: ['date_safe'] }),
      makeQuestion({ id: 'q2', mode: 'DATE_NIGHT', tags: [] }),
      makeQuestion({ id: 'q3', mode: 'DATE_NIGHT', tags: ['date_safe'] }),
    ];

    const pool = buildQuestionPool({
      allQuestions,
      currentMode: 'DATE_NIGHT',
      roomRound: 0,
      previousIntensity: 1,
    });

    expect(pool.map((q) => q.id)).toEqual(['q1', 'q3']);
  });

  it('after intensity 3, picks light questions', () => {
    const allQuestions = [
      makeQuestion({ id: 'q1', mode: 'ICEBREAKER', intensityLevel: 1 }),
      makeQuestion({ id: 'q2', mode: 'ICEBREAKER', intensityLevel: 2 }),
      makeQuestion({ id: 'q3', mode: 'ICEBREAKER', intensityLevel: 3 }),
    ];

    const pool = buildQuestionPool({
      allQuestions,
      currentMode: 'ICEBREAKER',
      roomRound: 0,
      previousIntensity: 3,
    });

    expect(pool.map((q) => q.id)).toEqual(['q1', 'q2']);
  });

  it('excludes already played questions', () => {
    const allQuestions = [
      makeQuestion({ id: 'q1', mode: 'ICEBREAKER' }),
      makeQuestion({ id: 'q2', mode: 'ICEBREAKER' }),
      makeQuestion({ id: 'q3', mode: 'ICEBREAKER' }),
    ];

    const pool = buildQuestionPool({
      allQuestions,
      currentMode: 'ICEBREAKER',
      roomRound: 0,
      previousIntensity: 1,
      playedQuestionIds: new Set(['q2']),
    });

    expect(pool.map((q) => q.id)).toEqual(['q1', 'q3']);
  });

  it('falls back to mode pool when filtering empties everything', () => {
    const allQuestions = [
      makeQuestion({ id: 'q1', mode: 'ICEBREAKER' }),
      makeQuestion({ id: 'q2', mode: 'ICEBREAKER' }),
    ];

    const pool = buildQuestionPool({
      allQuestions,
      currentMode: 'ICEBREAKER',
      roomRound: 0,
      previousIntensity: 1,
      playedQuestionIds: new Set(['q1', 'q2']),
    });

    expect(pool.map((q) => q.id)).toEqual(['q1', 'q2']);
  });

  it('DATE_NIGHT round 0 picks icebreaker intensity 1', () => {
    const allQuestions = [
      makeQuestion({ id: 'q1', mode: 'DATE_NIGHT', tags: ['date_safe', 'icebreaker'], intensityLevel: 1 }),
      makeQuestion({ id: 'q2', mode: 'DATE_NIGHT', tags: ['date_safe'], intensityLevel: 1 }),
      makeQuestion({ id: 'q3', mode: 'DATE_NIGHT', tags: ['date_safe', 'icebreaker'], intensityLevel: 2 }),
    ];

    const pool = buildQuestionPool({
      allQuestions,
      currentMode: 'DATE_NIGHT',
      roomRound: 0,
      previousIntensity: 1,
    });

    expect(pool.map((q) => q.id)).toEqual(['q1']);
  });

  it('DATE_NIGHT round > 0 uses 30% deep / 70% light randomization', () => {
    const allQuestions = [
      makeQuestion({ id: 'q-light', mode: 'DATE_NIGHT', tags: ['date_safe'], intensityLevel: 1 }),
      makeQuestion({ id: 'q-deep', mode: 'DATE_NIGHT', tags: ['date_safe'], intensityLevel: 3 }),
    ];

    randomSpy.mockReturnValue(0.2);
    let pool = buildQuestionPool({
      allQuestions,
      currentMode: 'DATE_NIGHT',
      roomRound: 1,
      previousIntensity: 1,
    });
    expect(pool.map((q) => q.id)).toEqual(['q-deep']);

    randomSpy.mockReturnValue(0.8);
    pool = buildQuestionPool({
      allQuestions,
      currentMode: 'DATE_NIGHT',
      roomRound: 1,
      previousIntensity: 1,
    });
    expect(pool.map((q) => q.id)).toEqual(['q-light']);
  });
});
