import { supabaseAdmin } from '@/lib/supabase-admin';
import { CoupleThemeCycle } from '../types';

const THEMES = ['RECONNECTION', 'COMMUNICATION', 'INTIMACY', 'SHARED_PROJECT'] as const;

export function getThemeForWeek(weekNumber: number): string {
  return THEMES[(weekNumber - 1) % THEMES.length];
}

export async function getCoupleThemeCycle(coupleId: string): Promise<CoupleThemeCycle | null> {
  const { data, error } = await supabaseAdmin
    .from('CoupleThemeCycle')
    .select('*')
    .eq('coupleId', coupleId)
    .maybeSingle();
  if (error) throw error;
  return data as CoupleThemeCycle | null;
}

export async function createCoupleThemeCycle(coupleId: string): Promise<CoupleThemeCycle> {
  const { data, error } = await supabaseAdmin
    .from('CoupleThemeCycle')
    .insert({ coupleId, currentTheme: THEMES[0], weekNumber: 1 })
    .select()
    .single();
  if (error) throw error;
  return data as CoupleThemeCycle;
}

export async function advanceCoupleThemeCycle(cycle: CoupleThemeCycle): Promise<CoupleThemeCycle> {
  const nextWeek = (cycle.weekNumber % THEMES.length) + 1;
  const nextTheme = getThemeForWeek(nextWeek);

  const { data, error } = await supabaseAdmin
    .from('CoupleThemeCycle')
    .update({ currentTheme: nextTheme, weekNumber: nextWeek })
    .eq('id', cycle.id)
    .select()
    .single();
  if (error) throw error;
  return data as CoupleThemeCycle;
}
