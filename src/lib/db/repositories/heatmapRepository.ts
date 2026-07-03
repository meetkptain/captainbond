import { supabaseAdmin } from '@/lib/supabase-admin';

export interface CoupleHeatmapEntry {
  id: string;
  coupleId: string;
  axis: string;
  score: number;
  trend: string;
  lastAnsweredAt: string | null;
  updatedAt: string;
}

export async function getHeatmapForCouple(coupleId: string): Promise<CoupleHeatmapEntry[]> {
  const { data, error } = await supabaseAdmin
    .from('CoupleHeatmap')
    .select('*')
    .eq('coupleId', coupleId)
    .order('axis', { ascending: true });
  if (error) throw error;
  return (data ?? []) as CoupleHeatmapEntry[];
}

export async function upsertHeatmapEntry(entry: {
  coupleId: string;
  axis: string;
  score: number;
  trend: string;
  lastAnsweredAt?: string;
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from('CoupleHeatmap')
    .upsert(entry, { onConflict: 'coupleId,axis' });
  if (error) throw error;
}

export async function getThemeAxisMapping(): Promise<Record<string, string>> {
  const { data, error } = await supabaseAdmin
    .from('ThemeAxisMapping')
    .select('*');
  if (error) throw error;
  const map: Record<string, string> = {};
  for (const row of (data ?? []) as Array<{ theme: string; axis: string }>) {
    map[row.theme] = row.axis;
  }
  return map;
}
