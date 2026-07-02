import { supabaseAdmin } from '@/lib/supabase-admin';
import { withRetry } from '@/lib/db/withRetry';
import { DailyQuestion } from '../types';

function startOfDayInTimezone(timezone: string): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const year = Number(parts.find((p) => p.type === 'year')?.value ?? now.getFullYear());
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? 1);
  const day = Number(parts.find((p) => p.type === 'day')?.value ?? 1);

  // Build a UTC noon candidate for that local date, then adjust to local midnight
  let candidate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const hourFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  });
  for (let i = 0; i < 3; i++) {
    const hourInTz = Number(hourFormatter.format(candidate));
    if (hourInTz === 0) break;
    const diff = hourInTz;
    candidate = new Date(candidate.getTime() - diff * 60 * 60 * 1000);
  }
  return candidate;
}

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

export async function revealDueQuestions(
  coupleId: string,
  timezone = 'Europe/Paris',
  allowCatchUp = false
): Promise<DailyQuestion[]> {
  const now = new Date();
  const currentHour = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).format(now)
  );

  // Reveal at 20h+ for today's ritual. If allowCatchUp is true, also reveal
  // any older COMPUTED rituals that were missed by a previous run.
  const startOfToday = startOfDayInTimezone(timezone);

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
  const startOfToday = startOfDayInTimezone(timezone);

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

