import { supabaseAdmin } from '@/lib/supabase-admin';

export interface UserStatsRow {
  id: string;
  totalGamesPlayed: number;
  totalBetrayals: number;
  currentStreak: number;
  gamesPlayedToday: number;
  lastPlayedAt: string | null;
  badges: string[];
  archetypesUnlocked: string[];
}

export async function loadByUser(userId: string): Promise<UserStatsRow | null> {
  const { data, error } = await supabaseAdmin
    .from('UserStats')
    .select('id, totalGamesPlayed, totalBetrayals, currentStreak, gamesPlayedToday, lastPlayedAt, badges, archetypesUnlocked')
    .eq('userId', userId)
    .maybeSingle();
  if (error) throw error;
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

export async function createForUser(userId: string, row: Omit<UserStatsRow, 'id'>): Promise<void> {
  const { error } = await supabaseAdmin.from('UserStats').insert({
    id: crypto.randomUUID(),
    userId,
    totalGamesPlayed: row.totalGamesPlayed,
    totalBetrayals: row.totalBetrayals,
    currentStreak: row.currentStreak,
    gamesPlayedToday: row.gamesPlayedToday,
    lastPlayedAt: row.lastPlayedAt,
    badges: row.badges,
    archetypesUnlocked: row.archetypesUnlocked,
  });
  if (error) throw error;
}

export async function update(id: string, row: Omit<UserStatsRow, 'id'>): Promise<void> {
  const { error } = await supabaseAdmin
    .from('UserStats')
    .update({
      totalGamesPlayed: row.totalGamesPlayed,
      totalBetrayals: row.totalBetrayals,
      currentStreak: row.currentStreak,
      gamesPlayedToday: row.gamesPlayedToday,
      lastPlayedAt: row.lastPlayedAt,
      updatedAt: new Date().toISOString(),
      badges: row.badges,
      archetypesUnlocked: row.archetypesUnlocked,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function getSummaryByUser(userId: string): Promise<UserStatsRow> {
  const { data, error } = await supabaseAdmin
    .from('UserStats')
    .select('totalGamesPlayed, totalBetrayals, currentStreak, gamesPlayedToday, lastPlayedAt, badges, archetypesUnlocked')
    .eq('userId', userId)
    .maybeSingle();
  if (error) throw error;
  return {
    id: '',
    totalGamesPlayed: data?.totalGamesPlayed ?? 0,
    totalBetrayals: data?.totalBetrayals ?? 0,
    currentStreak: data?.currentStreak ?? 0,
    gamesPlayedToday: data?.gamesPlayedToday ?? 0,
    lastPlayedAt: data?.lastPlayedAt ?? null,
    badges: (data?.badges as string[]) ?? [],
    archetypesUnlocked: (data?.archetypesUnlocked as string[]) ?? [],
  };
}
