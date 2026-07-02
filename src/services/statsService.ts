import { AppError } from '@/lib/errors';
import {
  loadByUser,
  createForUser,
  update,
  getSummaryByUser,
  type UserStatsRow,
} from '@/lib/db/repositories/userStatsRepository';
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

async function loadUserStats(userId: string): Promise<UserStatsRow | null> {
  try {
    return await loadByUser(userId);
  } catch (error) {
    throw new AppError('INTERNAL_ERROR', 'Impossible de récupérer les statistiques', { cause: error });
  }
}

async function persistUserStats(
  userId: string,
  existing: UserStatsRow | null,
  nextStats: UserStatsData,
  now: Date,
): Promise<void> {
  const row: Omit<UserStatsRow, 'id'> = {
    totalGamesPlayed: nextStats.totalGamesPlayed,
    totalBetrayals: nextStats.totalBetrayals,
    currentStreak: nextStats.currentStreak,
    gamesPlayedToday: nextStats.gamesPlayedToday,
    lastPlayedAt: now.toISOString(),
    badges: nextStats.badges,
    archetypesUnlocked: nextStats.archetypesUnlocked,
  };

  try {
    if (!existing) {
      await createForUser(userId, row);
      return;
    }

    await update(existing.id, row);
  } catch (error) {
    throw new AppError(
      'INTERNAL_ERROR',
      existing ? 'Impossible de mettre à jour les statistiques' : 'Impossible de créer les statistiques',
      { cause: error },
    );
  }
}

export async function getUserStats(userId: string): Promise<UserStatsSummary> {
  try {
    return await getSummaryByUser(userId);
  } catch (error) {
    throw new AppError('INTERNAL_ERROR', 'Impossible de récupérer les statistiques', { cause: error });
  }
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
