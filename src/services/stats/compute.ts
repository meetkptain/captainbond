export interface GameSummaryInput {
  wasHost?: boolean;
  wasImpostor?: boolean;
  archetype?: string;
  axes?: { alignment: number; perspicacity: number; deception: number };
}

export interface UserStatsData {
  totalGamesPlayed: number;
  totalBetrayals: number;
  currentStreak: number;
  gamesPlayedToday: number;
  lastPlayedAt: string | null;
  badges: string[];
  archetypesUnlocked: string[];
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function isPreviousDay(reference: Date, candidate: Date): boolean {
  const ref = startOfDay(reference);
  const cand = startOfDay(candidate);
  const diffMs = ref.getTime() - cand.getTime();
  return diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
}

export function slugify(text?: string): string {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

export function computeNewBadges(
  existingBadges: string[],
  summary: GameSummaryInput,
  stats: { totalGamesPlayed: number; currentStreak: number },
): string[] {
  const earned = new Set(existingBadges);

  if (stats.totalGamesPlayed >= 1) earned.add('first_game');
  if (summary.wasHost) earned.add('host');
  if (summary.wasImpostor) earned.add('impostor');
  if (summary.axes) {
    if (summary.axes.deception >= 70) earned.add('bluffer');
    if (summary.axes.perspicacity >= 70) earned.add('empath');
    if (summary.axes.alignment >= 70) earned.add('conformist');
  }
  if (stats.currentStreak >= 3) earned.add('streak_3');
  if (stats.currentStreak >= 7) earned.add('streak_7');
  if (stats.currentStreak >= 30) earned.add('streak_30');

  return Array.from(earned);
}

export function computeNewArchetypes(existing: string[], archetype?: string): string[] {
  if (!archetype) return existing;
  const slug = slugify(archetype);
  if (!slug || existing.includes(slug)) return existing;
  return [...existing, slug];
}

export function computeNextStats(
  existing: UserStatsData | null,
  summary: GameSummaryInput,
  now: Date,
): UserStatsData {
  const base: UserStatsData = {
    totalGamesPlayed: existing?.totalGamesPlayed ?? 0,
    totalBetrayals: existing?.totalBetrayals ?? 0,
    currentStreak: existing?.currentStreak ?? 0,
    gamesPlayedToday: existing?.gamesPlayedToday ?? 0,
    lastPlayedAt: existing?.lastPlayedAt ?? null,
    badges: existing?.badges ?? [],
    archetypesUnlocked: existing?.archetypesUnlocked ?? [],
  };

  const lastPlayed = base.lastPlayedAt ? new Date(base.lastPlayedAt) : null;
  let currentStreak = base.currentStreak;
  let gamesPlayedToday = base.gamesPlayedToday;

  if (!existing || !lastPlayed) {
    currentStreak = 1;
    gamesPlayedToday = 1;
  } else if (isSameDay(now, lastPlayed)) {
    gamesPlayedToday += 1;
  } else if (isPreviousDay(now, lastPlayed)) {
    currentStreak += 1;
    gamesPlayedToday = 1;
  } else {
    currentStreak = 1;
    gamesPlayedToday = 1;
  }

  const totalGamesPlayed = base.totalGamesPlayed + 1;

  const newBadges = computeNewBadges(base.badges, summary, { totalGamesPlayed, currentStreak });
  const newArchetypes = computeNewArchetypes(base.archetypesUnlocked, summary.archetype);

  return {
    totalGamesPlayed,
    totalBetrayals: base.totalBetrayals,
    currentStreak,
    gamesPlayedToday,
    lastPlayedAt: now.toISOString(),
    badges: newBadges,
    archetypesUnlocked: newArchetypes,
  };
}
