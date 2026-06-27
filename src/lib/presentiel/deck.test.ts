import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sequenceDeck, injectWildcards, getImposteurQuestion, DeckQuestion, DeckPlayer } from './deck';

function makeQuestion(overrides: Partial<DeckQuestion> & Pick<DeckQuestion, 'id'>): DeckQuestion {
  return {
    text: 'Question',
    intensityLevel: 1,
    mode: 'ICEBREAKER',
    ...overrides,
  };
}

describe('sequenceDeck', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a short list unchanged', () => {
    const list: DeckQuestion[] = [
      { id: '1', text: 'Q1', intensityLevel: 1, mode: 'ICEBREAKER' },
      { id: '2', text: 'Q2', intensityLevel: 3, mode: 'ICEBREAKER' },
    ];
    expect(sequenceDeck(list)).toEqual(list);
  });

  it('starts with lower intensity cards', () => {
    const list: DeckQuestion[] = [
      { id: '1', text: 'Low 1', intensityLevel: 1, mode: 'ICEBREAKER' },
      { id: '2', text: 'Low 2', intensityLevel: 1, mode: 'ICEBREAKER' },
      { id: '3', text: 'High', intensityLevel: 3, mode: 'ICEBREAKER' },
    ];
    const result = sequenceDeck(list);
    expect(result[0].intensityLevel).toBe(1);
    expect(result[1].intensityLevel).toBe(1);
  });

  it('places a positive/date_safe card in the first half', () => {
    const list: DeckQuestion[] = [
      { id: 'l1', text: 'Positive L1', intensityLevel: 1, tags: ['positive'], mode: 'ICEBREAKER' },
      { id: 'l2', text: 'L1b', intensityLevel: 1, mode: 'ICEBREAKER' },
      { id: 'm1', text: 'M1a', intensityLevel: 2, mode: 'ICEBREAKER' },
      { id: 'm2', text: 'M1b', intensityLevel: 2, mode: 'ICEBREAKER' },
      { id: 'h1', text: 'H3a', intensityLevel: 3, mode: 'ICEBREAKER' },
      { id: 'h2', text: 'H3b', intensityLevel: 3, mode: 'ICEBREAKER' },
    ];
    const result = sequenceDeck(list);
    const positiveIndex = result.findIndex(q => q.tags?.includes('positive'));
    expect(positiveIndex).toBeLessThan(result.length / 2);
  });

  it('does not duplicate questions', () => {
    const qs = [
      makeQuestion({ id: 'l1', intensityLevel: 1 }),
      makeQuestion({ id: 'l2', intensityLevel: 1 }),
      makeQuestion({ id: 'm1', intensityLevel: 2 }),
      makeQuestion({ id: 'h1', intensityLevel: 3, tags: ['positive'] }),
    ];
    const sequenced = sequenceDeck(qs);
    const ids = sequenced.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(sequenced.length).toBe(qs.length);
  });
});

describe('injectWildcards', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(12345);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a sequenced deck when there are fewer than 2 players', () => {
    const list: DeckQuestion[] = [
      { id: '1', text: 'Q1', intensityLevel: 1, mode: 'ICEBREAKER' },
      { id: '2', text: 'Q2', intensityLevel: 2, mode: 'ICEBREAKER' },
      { id: '3', text: 'Q3', intensityLevel: 3, mode: 'ICEBREAKER' },
    ];
    const players: DeckPlayer[] = [{ name: 'Alice' }];
    const result = injectWildcards(list, players, 'ICEBREAKER');
    expect(result.some(q => q.tags?.includes('wildcard'))).toBe(false);
    expect(result.length).toBe(list.length);
  });

  it('inserts wildcards when there are at least 2 players', () => {
    const list: DeckQuestion[] = [
      { id: '1', text: 'Q1', intensityLevel: 1, mode: 'ICEBREAKER' },
      { id: '2', text: 'Q2', intensityLevel: 1, mode: 'ICEBREAKER' },
      { id: '3', text: 'Q3', intensityLevel: 2, mode: 'ICEBREAKER' },
      { id: '4', text: 'Q4', intensityLevel: 2, mode: 'ICEBREAKER' },
      { id: '5', text: 'Q5', intensityLevel: 3, mode: 'ICEBREAKER' },
      { id: '6', text: 'Q6', intensityLevel: 3, mode: 'ICEBREAKER' },
    ];
    const players: DeckPlayer[] = [{ name: 'Alice' }, { name: 'Bob' }];
    const result = injectWildcards(list, players, 'ICEBREAKER');

    const wildcards = result.filter(q => q.tags?.includes('wildcard'));
    expect(wildcards.length).toBe(2);
    expect(result[1].tags).toContain('wildcard');
    expect(result[4].tags).toContain('wildcard');
    expect(result[1].mode).toBe('ICEBREAKER');
    expect(result[4].mode).toBe('ICEBREAKER');
  });
});

describe('getImposteurQuestion', () => {
  it('maps known questions exactly', () => {
    expect(getImposteurQuestion("Tes 3 pires anecdotes de soirée ?"))
      .toBe("Tes 3 pires anecdotes de repas de famille ?");
    expect(getImposteurQuestion("Tes 3 pires ruptures amoureuses ?"))
      .toBe("Tes 3 pires râteaux ou rendez-vous ratés ?");
    expect(getImposteurQuestion("Tes 3 pires mensonges au boulot ?"))
      .toBe("Tes 3 pires bêtises à l'école quand tu étais enfant ?");
  });

  it('falls back on keyword matches', () => {
    expect(getImposteurQuestion("Raconte ta pire soirées de l'année"))
      .toBe("Tes 3 pires anecdotes de repas de famille ?");
    expect(getImposteurQuestion("Tes ruptures les plus drôles ?"))
      .toBe("Tes 3 pires râteaux ou rendez-vous ratés ?");
    expect(getImposteurQuestion("Tes mensonges les plus absurdes ?"))
      .toBe("Tes 3 pires bêtises à l'école quand tu étais enfant ?");
  });

  it('appends a generic suffix for unknown questions', () => {
    expect(getImposteurQuestion("Tes 3 pires voyages ?"))
      .toBe("Tes 3 pires voyages ? (sur un thème légèrement différent)");
  });
});
