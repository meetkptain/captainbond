import { supabaseAdmin } from '@/lib/supabase-admin';
import { AppError } from '@/lib/errors';
import {
  computeNextStats,
  type GameSummaryInput,
  type UserStatsData,
} from './stats/compute';

export type GameSummary = GameSummaryInput;

export interface UserStatsSummary {
  totalGamesPlayed: number;
  totalBetrayals: number;
  currentStreak: number;
  gamesPlayedToday: number;
  lastPlayedAt: string | null;
  badges: string[];
  archetypesUnlocked: string[];
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

type UserStatsRow = UserStatsData & { id: string };

async function loadUserStats(userId: string): Promise<UserStatsRow | null> {
  const { data, error } = await supabaseAdmin
    .from('UserStats')
    .select('id, totalGamesPlayed, currentStreak, gamesPlayedToday, lastPlayedAt, badges, archetypesUnlocked')
    .eq('userId', userId)
    .maybeSingle();

  if (error) {
    throw new AppError('INTERNAL_ERROR', 'Impossible de récupérer les statistiques', { cause: error });
  }

  if (!data) return null;

  return {
    id: data.id,
    totalGamesPlayed: data.totalGamesPlayed ?? 0,
    totalBetrayals: (data as { totalBetrayals?: number }).totalBetrayals ?? 0,
    currentStreak: data.currentStreak ?? 0,
    gamesPlayedToday: data.gamesPlayedToday ?? 0,
    lastPlayedAt: data.lastPlayedAt ?? null,
    badges: (data.badges as string[]) ?? [],
    archetypesUnlocked: (data.archetypesUnlocked as string[]) ?? [],
  };
}

async function persistUserStats(
  userId: string,
  existing: UserStatsRow | null,
  nextStats: UserStatsData,
  now: Date,
): Promise<void> {
  if (!existing) {
    const { error: insertError } = await supabaseAdmin.from('UserStats').insert({
      id: crypto.randomUUID(),
      userId,
      totalGamesPlayed: nextStats.totalGamesPlayed,
      totalBetrayals: 0,
      currentStreak: nextStats.currentStreak,
      gamesPlayedToday: nextStats.gamesPlayedToday,
      lastPlayedAt: now.toISOString(),
      badges: nextStats.badges,
      archetypesUnlocked: nextStats.archetypesUnlocked,
    });

    if (insertError) {
      throw new AppError('INTERNAL_ERROR', 'Impossible de créer les statistiques', { cause: insertError });
    }

    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from('UserStats')
    .update({
      totalGamesPlayed: nextStats.totalGamesPlayed,
      currentStreak: nextStats.currentStreak,
      gamesPlayedToday: nextStats.gamesPlayedToday,
      lastPlayedAt: now.toISOString(),
      updatedAt: now.toISOString(),
      badges: nextStats.badges,
      archetypesUnlocked: nextStats.archetypesUnlocked,
    })
    .eq('id', existing.id);

  if (updateError) {
    throw new AppError('INTERNAL_ERROR', 'Impossible de mettre à jour les statistiques', { cause: updateError });
  }
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
  summary: GameSummaryInput = {},
): Promise<UserStatsSummary> {
  const now = new Date();
  const existing = await loadUserStats(userId);
  const nextStats = computeNextStats(existing, summary, now);
  await persistUserStats(userId, existing, nextStats, now);

  return {
    totalGamesPlayed: nextStats.totalGamesPlayed,
    totalBetrayals: nextStats.totalBetrayals,
    currentStreak: nextStats.currentStreak,
    gamesPlayedToday: nextStats.gamesPlayedToday,
    lastPlayedAt: nextStats.lastPlayedAt,
    badges: nextStats.badges,
    archetypesUnlocked: nextStats.archetypesUnlocked,
  };
}
