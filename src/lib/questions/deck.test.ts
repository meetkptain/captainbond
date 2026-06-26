import { describe, it, expect } from 'vitest';
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

    let pool = buildQuestionPool({
      allQuestions,
      currentMode: 'DATE_NIGHT',
      roomRound: 1,
      previousIntensity: 1,
      random: () => 0.1,
    });
    expect(pool.map((q) => q.id)).toEqual(['q-deep']);

    pool = buildQuestionPool({
      allQuestions,
      currentMode: 'DATE_NIGHT',
      roomRound: 1,
      previousIntensity: 1,
      random: () => 0.9,
    });
    expect(pool.map((q) => q.id)).toEqual(['q-light']);
  });

  it('filters by mode (FAMILY requires mode FAMILY and positive tag)', () => {
    const allQuestions = [
      makeQuestion({ id: 'q1', mode: 'FAMILY', tags: ['positive'] }),
      makeQuestion({ id: 'q2', mode: 'FAMILY', tags: [] }),
      makeQuestion({ id: 'q3', mode: 'ICEBREAKER', tags: ['positive'] }),
    ];

    const pool = buildQuestionPool({
      allQuestions,
      currentMode: 'FAMILY',
      roomRound: 0,
      previousIntensity: 1,
    });

    expect(pool.map((q) => q.id)).toEqual(['q1']);
  });

  it('ICEBREAKER every-3rd round filters positive tags (round 2 does, round 1 does not)', () => {
    const allQuestions = [
      makeQuestion({ id: 'q-positive', mode: 'ICEBREAKER', tags: ['positive'] }),
      makeQuestion({ id: 'q-neutral', mode: 'ICEBREAKER', tags: [] }),
    ];

    const round2Pool = buildQuestionPool({
      allQuestions,
      currentMode: 'ICEBREAKER',
      roomRound: 2,
      previousIntensity: 1,
    });
    expect(round2Pool.map((q) => q.id)).toEqual(['q-positive']);

    const round1Pool = buildQuestionPool({
      allQuestions,
      currentMode: 'ICEBREAKER',
      roomRound: 1,
      previousIntensity: 1,
    });
    expect(round1Pool.map((q) => q.id)).toEqual(['q-positive', 'q-neutral']);
  });
});
