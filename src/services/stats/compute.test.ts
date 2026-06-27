import { describe, it, expect } from 'vitest';
import {
  computeNextStats,
  computeNewBadges,
  computeNewArchetypes,
  isSameDay,
  isPreviousDay,
  slugify,
  type GameSummaryInput,
  type UserStatsData,
} from './compute';

function makeExisting(overrides: Partial<UserStatsData> = {}): UserStatsData {
  return {
    totalGamesPlayed: 0,
    totalBetrayals: 0,
    currentStreak: 0,
    gamesPlayedToday: 0,
    lastPlayedAt: null,
    badges: [],
    archetypesUnlocked: [],
    ...overrides,
  };
}

describe('compute helpers', () => {
  it('slugify converts text to snake_case slugs', () => {
    expect(slugify('Le Diable en Costume')).toBe('le_diable_en_costume');
    expect(slugify('  Archétype  ')).toBe('arch_type');
    expect(slugify('')).toBe('');
    expect(slugify(undefined)).toBe('');
  });

  it('isSameDay detects same calendar day', () => {
    const now = new Date('2026-06-27T08:00:00Z');
    expect(isSameDay(now, new Date('2026-06-27T16:00:00Z'))).toBe(true);
    expect(isSameDay(now, new Date('2026-06-28T02:00:00Z'))).toBe(false);
  });

  it('isPreviousDay detects exactly one calendar day before', () => {
    const now = new Date('2026-06-27T10:00:00Z');
    expect(isPreviousDay(now, new Date('2026-06-26T10:00:00Z'))).toBe(true);
    expect(isPreviousDay(now, new Date('2026-06-25T10:00:00Z'))).toBe(false);
    expect(isPreviousDay(now, new Date('2026-06-27T10:00:00Z'))).toBe(false);
  });
});

describe('computeNewBadges', () => {
  it('awards first_game on the first game', () => {
    const badges = computeNewBadges([], {}, { totalGamesPlayed: 1, currentStreak: 1 });
    expect(badges).toContain('first_game');
  });

  it('awards host and impostor badges', () => {
    const badges = computeNewBadges([], { wasHost: true, wasImpostor: true }, { totalGamesPlayed: 1, currentStreak: 1 });
    expect(badges).toContain('host');
    expect(badges).toContain('impostor');
  });

  it('awards axis badges when thresholds are reached', () => {
    const summary: GameSummaryInput = {
      axes: { alignment: 70, perspicacity: 70, deception: 70 },
    };
    const badges = computeNewBadges([], summary, { totalGamesPlayed: 1, currentStreak: 1 });
    expect(badges).toContain('bluffer');
    expect(badges).toContain('empath');
    expect(badges).toContain('conformist');
  });

  it('does not award axis badges below threshold', () => {
    const badges = computeNewBadges([], { axes: { alignment: 69, perspicacity: 69, deception: 69 } }, { totalGamesPlayed: 1, currentStreak: 1 });
    expect(badges).not.toContain('bluffer');
    expect(badges).not.toContain('empath');
    expect(badges).not.toContain('conformist');
  });

  it('awards streak badges', () => {
    expect(computeNewBadges([], {}, { totalGamesPlayed: 3, currentStreak: 3 })).toContain('streak_3');
    expect(computeNewBadges([], {}, { totalGamesPlayed: 7, currentStreak: 7 })).toContain('streak_7');
    expect(computeNewBadges([], {}, { totalGamesPlayed: 30, currentStreak: 30 })).toContain('streak_30');
  });

  it('preserves existing badges', () => {
    const badges = computeNewBadges(['host'], {}, { totalGamesPlayed: 2, currentStreak: 1 });
    expect(badges).toContain('host');
    expect(badges).toContain('first_game');
  });
});

describe('computeNewArchetypes', () => {
  it('adds a new archetype slug', () => {
    expect(computeNewArchetypes([], 'Le Diable')).toEqual(['le_diable']);
  });

  it('does not duplicate archetypes', () => {
    expect(computeNewArchetypes(['le_diable'], 'Le Diable')).toEqual(['le_diable']);
  });

  it('ignores empty archetypes', () => {
    expect(computeNewArchetypes(['a'], '')).toEqual(['a']);
    expect(computeNewArchetypes(['a'], undefined)).toEqual(['a']);
  });
});

describe('computeNextStats', () => {
  it('initializes stats for a new user', () => {
    const now = new Date('2026-06-27T10:00:00Z');
    const next = computeNextStats(null, {}, now);

    expect(next.totalGamesPlayed).toBe(1);
    expect(next.totalBetrayals).toBe(0);
    expect(next.currentStreak).toBe(1);
    expect(next.gamesPlayedToday).toBe(1);
    expect(next.lastPlayedAt).toBe(now.toISOString());
    expect(next.badges).toContain('first_game');
    expect(next.archetypesUnlocked).toEqual([]);
  });

  it('increments gamesPlayedToday on the same day', () => {
    const now = new Date('2026-06-27T10:00:00Z');
    const existing = makeExisting({
      totalGamesPlayed: 5,
      currentStreak: 2,
      gamesPlayedToday: 1,
      lastPlayedAt: '2026-06-27T08:00:00.000Z',
      badges: ['first_game'],
    });

    const next = computeNextStats(existing, {}, now);
    expect(next.totalGamesPlayed).toBe(6);
    expect(next.currentStreak).toBe(2);
    expect(next.gamesPlayedToday).toBe(2);
  });

  it('continues a streak from the previous day', () => {
    const now = new Date('2026-06-27T10:00:00Z');
    const existing = makeExisting({
      totalGamesPlayed: 2,
      currentStreak: 2,
      gamesPlayedToday: 1,
      lastPlayedAt: '2026-06-26T10:00:00.000Z',
      badges: ['first_game'],
    });

    const next = computeNextStats(existing, {}, now);
    expect(next.currentStreak).toBe(3);
    expect(next.gamesPlayedToday).toBe(1);
    expect(next.badges).toContain('streak_3');
  });

  it('resets streak after a gap', () => {
    const now = new Date('2026-06-27T10:00:00Z');
    const existing = makeExisting({
      totalGamesPlayed: 10,
      currentStreak: 5,
      gamesPlayedToday: 1,
      lastPlayedAt: '2026-06-25T10:00:00.000Z',
      badges: ['first_game', 'streak_3'],
    });

    const next = computeNextStats(existing, {}, now);
    expect(next.currentStreak).toBe(1);
    expect(next.gamesPlayedToday).toBe(1);
  });

  it('unlocks archetypes and preserves previous ones', () => {
    const now = new Date('2026-06-27T10:00:00Z');
    const existing = makeExisting({
      totalGamesPlayed: 1,
      archetypesUnlocked: ['ange'],
    });

    const next = computeNextStats(existing, { archetype: 'Le Diable' }, now);
    expect(next.archetypesUnlocked).toEqual(['ange', 'le_diable']);
  });
});
