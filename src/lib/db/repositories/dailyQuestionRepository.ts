import { supabaseAdmin } from '@/lib/supabase-admin';
import { withRetry } from '@/lib/db/withRetry';
import { getLocalDateString, getLocalHour, startOfDayInTz } from '@/lib/time';
import { DailyQuestion } from '../types';

// ─── DailyQuestion Queries ──────────────────────────────────────────────────

export async function getDailyQuestionById(id: string): Promise<DailyQuestion | null> {
  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as DailyQuestion | null;
}

export async function listDailyQuestions(coupleId: string, limit?: number): Promise<DailyQuestion[]> {
  const query = supabaseAdmin
    .from('DailyQuestion')
    .select('*')
    .eq('coupleId', coupleId)
    .order('releasedAt', { ascending: false });
  if (limit !== undefined) {
    query.limit(limit);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as DailyQuestion[];
}

export async function updateMood(
  dailyQuestionId: string,
  isUser1: boolean,
  mood: unknown
): Promise<DailyQuestion> {
  const field = isUser1 ? 'user1Mood' : 'user2Mood';
  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .update({ [field]: mood })
    .eq('id', dailyQuestionId)
    .select()
    .single();
  if (error) throw error;
  return data as DailyQuestion;
}

export async function skipDailyQuestion(id: string): Promise<DailyQuestion> {
  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .update({ isSkipped: true, isRevealed: true, analysisStatus: 'EXPIRED' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DailyQuestion;
}

export async function markSafeZone(id: string, active: boolean): Promise<DailyQuestion> {
  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .update({ isSafeZoneActive: active })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DailyQuestion;
}

export async function updateDailyQuestion(
  id: string,
  updates: Partial<DailyQuestion>
): Promise<DailyQuestion> {
  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DailyQuestion;
}

/**
 * Atomically records a partner's answer if they have not answered yet.
 * Returns the updated row, or null if the partner already answered (race).
 */
export async function recordAnswer(
  dailyQuestionId: string,
  isUser1: boolean,
  answer: string
): Promise<DailyQuestion | null> {
  const answerField = isUser1 ? 'user1Answer' : 'user2Answer';
  const answeredField = isUser1 ? 'user1Answered' : 'user2Answered';

  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .update({ [answerField]: answer, [answeredField]: true })
    .eq('id', dailyQuestionId)
    .eq(answeredField, false)
    .select()
    .single();

  if (error) throw error;
  return (data ?? null) as DailyQuestion | null;
}

/**
 * Atomically reveals a daily question once both partners have answered and
 * the analysis is computed. Returns null if the question was not in COMPUTED state.
 */
export async function revealDailyQuestion(id: string): Promise<DailyQuestion | null> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .update({ isRevealed: true, analysisStatus: 'REVEALED', revealedAt: nowIso })
    .eq('id', id)
    .eq('analysisStatus', 'COMPUTED')
    .eq('isRevealed', false)
    .select()
    .single();

  if (error) throw error;
  return (data ?? null) as DailyQuestion | null;
}

/**
 * Atomically claims the right to compute the analysis.
 * Returns true only if the row was in PENDING status.
 */
export async function claimAnalysisComputation(id: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .update({ analysisStatus: 'COMPUTING' })
    .eq('id', id)
    .eq('analysisStatus', 'PENDING')
    .select('id')
    .single();

  if (error) throw error;
  return data !== null;
}

export async function resetAnalysisStatus(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('DailyQuestion')
    .update({ analysisStatus: 'PENDING' })
    .eq('id', id)
    .eq('analysisStatus', 'COMPUTING');

  if (error) throw error;
}

export async function revealDueQuestions(
  coupleId: string,
  timezone = 'Europe/Paris',
  allowCatchUp = false
): Promise<DailyQuestion[]> {
  const now = new Date();
  const currentHour = getLocalHour(now, timezone);

  // Reveal at 20h+ for today's ritual. If allowCatchUp is true, also reveal
  // any older COMPUTED rituals that were missed by a previous run.
  const todayStr = getLocalDateString(now, timezone);
  const startOfToday = new Date(startOfDayInTz(todayStr, timezone));

  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .select('*')
    .eq('coupleId', coupleId)
    .eq('analysisStatus', 'COMPUTED')
    .eq('isRevealed', false);
  if (error) throw error;

  const candidates = (data ?? []) as DailyQuestion[];
  const toReveal = candidates.filter((q) => {
    if (!q.releasedAt) return false;
    const releasedAt = new Date(q.releasedAt);
    const isToday = releasedAt.getTime() >= startOfToday.getTime();
    const isDueToday = isToday && currentHour >= 20;
    if (allowCatchUp) return isDueToday || !isToday;
    return isDueToday;
  });

  if (toReveal.length === 0) return [];

  const ids = toReveal.map((q) => q.id);
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('DailyQuestion')
    .update({
      isRevealed: true,
      analysisStatus: 'REVEALED',
      revealedAt: now.toISOString(),
    })
    .in('id', ids)
    .select();
  if (updateError) throw updateError;

  return (updated ?? []) as DailyQuestion[];
}

export async function createDailyQuestion(input: Partial<DailyQuestion>): Promise<DailyQuestion> {
  const { data, error } = await supabaseAdmin.from('DailyQuestion').insert(input).select().single();
  if (error) throw error;
  return data as DailyQuestion;
}

export async function getLatestDailyQuestion(coupleId: string): Promise<DailyQuestion | null> {
  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .select('*')
    .eq('coupleId', coupleId)
    .order('releasedAt', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as DailyQuestion | null;
}

export async function getCurrentRitual(
  coupleId: string,
  timezone = 'Europe/Paris'
): Promise<DailyQuestion | null> {
  const todayStr = getLocalDateString(new Date(), timezone);
  const startOfToday = new Date(startOfDayInTz(todayStr, timezone));

  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .select('*')
    .eq('coupleId', coupleId)
    .gte('releasedAt', startOfToday.toISOString())
    .order('releasedAt', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as DailyQuestion | null;
}

export async function countOpenedProtocolsSince(
  coupleId: string,
  since: string,
  excludeId?: string
): Promise<number> {
  return withRetry(async () => {
    let query = supabaseAdmin
      .from('DailyQuestion')
      .select('id', { count: 'exact', head: true })
      .eq('coupleId', coupleId)
      .eq('protocolOpened', true)
      .gt('releasedAt', since);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  });
}

export async function listRecentRituals(coupleId: string, limit = 14): Promise<DailyQuestion[]> {
  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .select('*')
    .eq('coupleId', coupleId)
    .order('releasedAt', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as DailyQuestion[];
}

export async function listRevealedDailyQuestionsByMonth(
  coupleId: string,
  month: string
): Promise<DailyQuestion[]> {
  const [year, monthNum] = month.split('-').map(Number);
  const start = new Date(Date.UTC(year, monthNum - 1, 1));
  const end = new Date(Date.UTC(year, monthNum, 1));

  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .select('*')
    .eq('coupleId', coupleId)
    .eq('isRevealed', true)
    .gte('releasedAt', start.toISOString())
    .lt('releasedAt', end.toISOString())
    .order('releasedAt', { ascending: true });

  if (error) throw error;
  return (data ?? []) as DailyQuestion[];
}

export async function listAnsweredQuestionsForCouple(coupleId: string): Promise<DailyQuestion[]> {
  return withRetry(async () => {
    const { data, error } = await supabaseAdmin
      .from('DailyQuestion')
      .select('*')
      .eq('coupleId', coupleId)
      .or('user1Answered.eq.true,user2Answered.eq.true')
      .order('releasedAt', { ascending: false });
    if (error) throw error;
    return (data ?? []) as DailyQuestion[];
  });
}

