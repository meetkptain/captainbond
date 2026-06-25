import { supabaseAdmin } from '@/lib/supabase-admin';
import { AppError } from '@/lib/errors';

export interface UserStatsSummary {
  totalGamesPlayed: number;
  totalBetrayals: number;
  currentStreak: number;
  gamesPlayedToday: number;
  lastPlayedAt: string | null;
  badges: string[];
  archetypesUnlocked: string[];
}

export interface GameSummary {
  wasHost?: boolean;
  wasImpostor?: boolean;
  archetype?: string;
  axes?: { alignment: number; perspicacity: number; deception: number };
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const BADGE_DEFINITIONS: Record<string, Badge> = {
  first_game: { id: 'first_game', name: 'Première mission', emoji: '🚀', description: 'Vous avez joué votre première partie.' },
  host: { id: 'host', name: 'Captain', emoji: '🎤', description: 'Vous avez commandé la soirée en tant qu\'hôte.' },
  impostor: { id: 'impostor', name: 'Maître du bluff', emoji: '🎭', description: 'Vous avez été l\'imposteur.' },
  bluffer: { id: 'bluffer', name: 'Visage de pierre', emoji: '😐', description: 'Score d\'esprit de jeu / bluff supérieur à 70.' },
  empath: { id: 'empath', name: 'Liseur d\'âmes', emoji: '🔮', description: 'Score d\'empathie supérieur à 70.' },
  conformist: { id: 'conformist', name: 'Chœur des anges', emoji: '👼', description: 'Score de tendance au consensus supérieur à 70.' },
  streak_3: { id: 'streak_3', name: 'Série de 3', emoji: '🔥', description: '3 jours de suite sur Captain Bond.' },
  streak_7: { id: 'streak_7', name: 'Série de 7', emoji: '🔥🔥', description: '7 jours de suite sur Captain Bond.' },
  streak_30: { id: 'streak_30', name: 'Légende', emoji: '👑', description: '30 jours de suite sur Captain Bond.' },
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function isPreviousDay(reference: Date, candidate: Date): boolean {
  const ref = startOfDay(reference);
  const cand = startOfDay(candidate);
  const diffMs = ref.getTime() - cand.getTime();
  return diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
}

function slugify(text?: string): string {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function computeNewBadges(
  existingBadges: string[],
  summary: GameSummary,
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

function computeNewArchetypes(existing: string[], archetype?: string): string[] {
  if (!archetype) return existing;
  const slug = slugify(archetype);
  if (!slug || existing.includes(slug)) return existing;
  return [...existing, slug];
}

export async function getUserStats(userId: string): Promise<UserStatsSummary> {
  const { data, error } = await supabaseAdmin
    .from('UserStats')
    .select('totalGamesPlayed, totalBetrayals, currentStreak, gamesPlayedToday, lastPlayedAt, badges, archetypesUnlocked')
    .eq('userId', userId)
    .maybeSingle();

  if (error) {
    throw new AppError('INTERNAL_ERROR', 'Impossible de récupérer les statistiques', { cause: error });
  }

  return {
    totalGamesPlayed: data?.totalGamesPlayed ?? 0,
    totalBetrayals: data?.totalBetrayals ?? 0,
    currentStreak: data?.currentStreak ?? 0,
    gamesPlayedToday: data?.gamesPlayedToday ?? 0,
    lastPlayedAt: data?.lastPlayedAt ?? null,
    badges: (data?.badges as string[]) ?? [],
    archetypesUnlocked: (data?.archetypesUnlocked as string[]) ?? [],
  };
}

export async function recordGamePlayed(
  userId: string,
  summary: GameSummary = {},
): Promise<UserStatsSummary> {
  const now = new Date();

  const { data: existing } = await supabaseAdmin
    .from('UserStats')
    .select('id, totalGamesPlayed, currentStreak, gamesPlayedToday, lastPlayedAt, badges, archetypesUnlocked')
    .eq('userId', userId)
    .maybeSingle();

  const lastPlayed = existing?.lastPlayedAt ? new Date(existing.lastPlayedAt) : null;
  let currentStreak = existing?.currentStreak ?? 0;
  let gamesPlayedToday = existing?.gamesPlayedToday ?? 0;

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

  const totalGamesPlayed = (existing?.totalGamesPlayed ?? 0) + 1;
  const existingBadges = (existing?.badges as string[]) ?? [];
  const existingArchetypes = (existing?.archetypesUnlocked as string[]) ?? [];

  const newBadges = computeNewBadges(existingBadges, summary, { totalGamesPlayed, currentStreak });
  const newArchetypes = computeNewArchetypes(existingArchetypes, summary.archetype);

  if (!existing) {
    const { error: insertError } = await supabaseAdmin.from('UserStats').insert({
      id: crypto.randomUUID(),
      userId,
      totalGamesPlayed,
      totalBetrayals: 0,
      currentStreak,
      gamesPlayedToday,
      lastPlayedAt: now.toISOString(),
      badges: newBadges,
      archetypesUnlocked: newArchetypes,
    });
    if (insertError) {
      throw new AppError('INTERNAL_ERROR', 'Impossible de créer les statistiques', { cause: insertError });
    }
  } else {
    const { error: updateError } = await supabaseAdmin
      .from('UserStats')
      .update({
        totalGamesPlayed,
        currentStreak,
        gamesPlayedToday,
        lastPlayedAt: now.toISOString(),
        updatedAt: now.toISOString(),
        badges: newBadges,
        archetypesUnlocked: newArchetypes,
      })
      .eq('id', existing.id);

    if (updateError) {
      throw new AppError('INTERNAL_ERROR', 'Impossible de mettre à jour les statistiques', { cause: updateError });
    }
  }

  return {
    totalGamesPlayed,
    totalBetrayals: 0,
    currentStreak,
    gamesPlayedToday,
    lastPlayedAt: now.toISOString(),
    badges: newBadges,
    archetypesUnlocked: newArchetypes,
  };
}
