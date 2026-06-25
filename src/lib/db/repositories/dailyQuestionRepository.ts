import { supabaseAdmin } from '@/lib/supabase-admin';
import { DailyQuestion, CouplePortrait } from '../types';

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

export async function listDailyQuestions(coupleId: string, limit = 30): Promise<DailyQuestion[]> {
  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .select('*')
    .eq('coupleId', coupleId)
    .order('releasedAt', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as DailyQuestion[];
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

export async function revealDueQuestions(coupleId: string): Promise<DailyQuestion[]> {
  // Find all questions that are COMPUTED and ready to reveal
  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .select('*')
    .eq('coupleId', coupleId)
    .eq('analysisStatus', 'COMPUTED')
    .eq('isRevealed', false);
  if (error) throw error;
  
  const now = new Date();
  const currentHour = now.getHours();
  
  if (currentHour < 20) {
    return []; // Not yet time to reveal
  }
  
  const toReveal = (data ?? []) as DailyQuestion[];
  if (toReveal.length === 0) return [];
  
  const ids = toReveal.map(q => q.id);
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

// ─── CouplePortrait Queries ─────────────────────────────────────────────────

export async function listPortraits(coupleId: string): Promise<CouplePortrait[]> {
  const { data, error } = await supabaseAdmin
    .from('CouplePortrait')
    .select('*')
    .eq('coupleId', coupleId)
    .order('month', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CouplePortrait[];
}

export async function upsertPortrait(
  coupleId: string,
  month: string,
  updates: Partial<Omit<CouplePortrait, 'id' | 'coupleId' | 'month'>>
): Promise<CouplePortrait> {
  const { data, error } = await supabaseAdmin
    .from('CouplePortrait')
    .upsert(
      { coupleId, month, ...updates },
      { onConflict: 'coupleId,month' }
    )
    .select()
    .single();
  if (error) throw error;
  return data as CouplePortrait;
}

export async function getPortraitByMonth(
  coupleId: string,
  month: string
): Promise<CouplePortrait | null> {
  const { data, error } = await supabaseAdmin
    .from('CouplePortrait')
    .select('*')
    .eq('coupleId', coupleId)
    .eq('month', month)
    .maybeSingle();
  if (error) throw error;
  return data as CouplePortrait | null;
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

