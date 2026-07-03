import { supabaseAdmin } from '@/lib/supabase-admin';

export interface TreeProgressRecord {
  id: string;
  coupleId: string;
  nodeCount: number;
  connectionCount: number;
  avgSimilarity: number;
  dominantTheme: string;
  strongestLink: Record<string, unknown> | null;
  month: string;
  createdAt: string;
}

export async function getTreeProgress(coupleId: string, month: string): Promise<TreeProgressRecord | null> {
  const { data, error } = await supabaseAdmin
    .from('TreeProgress')
    .select('*')
    .eq('coupleId', coupleId)
    .eq('month', month)
    .maybeSingle();
  if (error) throw error;
  return data as TreeProgressRecord | null;
}

export async function upsertTreeProgress(progress: {
  coupleId: string;
  nodeCount: number;
  connectionCount: number;
  avgSimilarity: number;
  dominantTheme: string;
  strongestLink?: Record<string, unknown>;
  month: string;
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from('TreeProgress')
    .upsert(progress, { onConflict: 'coupleId,month' });
  if (error) throw error;
}

export async function getTreeProgressHistory(coupleId: string, limit = 6): Promise<TreeProgressRecord[]> {
  const { data, error } = await supabaseAdmin
    .from('TreeProgress')
    .select('*')
    .eq('coupleId', coupleId)
    .order('month', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as TreeProgressRecord[];
}
