import { supabaseAdmin } from '@/lib/supabase-admin';

export interface WeeklyRecapRecord {
  id: string;
  coupleId: string;
  weekStart: string;
  theme: string;
  summary: string;
  insight: string;
  lesson: string;
  generatedAt: string;
}

export async function getWeeklyRecap(coupleId: string, weekStart: string): Promise<WeeklyRecapRecord | null> {
  const { data, error } = await supabaseAdmin
    .from('WeeklyRecapData')
    .select('*')
    .eq('coupleId', coupleId)
    .eq('weekStart', weekStart)
    .maybeSingle();
  if (error) throw error;
  return data as WeeklyRecapRecord | null;
}

export async function upsertWeeklyRecap(recap: {
  coupleId: string;
  weekStart: string;
  theme: string;
  summary: string;
  insight: string;
  lesson: string;
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from('WeeklyRecapData')
    .upsert(recap, { onConflict: 'coupleId,weekStart' });
  if (error) throw error;
}
