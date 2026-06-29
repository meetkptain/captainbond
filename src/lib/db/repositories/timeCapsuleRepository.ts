import { supabaseAdmin } from '@/lib/supabase-admin';
import { TimeCapsule } from '../types';

export async function listTimeCapsules(coupleId: string): Promise<TimeCapsule[]> {
  const { data, error } = await supabaseAdmin
    .from('TimeCapsule')
    .select('*')
    .eq('coupleId', coupleId)
    .order('createdAt', { ascending: false });
  if (error) throw error;
  return (data ?? []) as TimeCapsule[];
}

export async function createTimeCapsule(capsule: Omit<TimeCapsule, 'id' | 'createdAt' | 'isUnlocked'>): Promise<TimeCapsule> {
  const { data, error } = await supabaseAdmin
    .from('TimeCapsule')
    .insert({ ...capsule, isUnlocked: false })
    .select()
    .single();
  if (error) throw error;
  return data as TimeCapsule;
}

export async function unlockDueCapsules(coupleId: string): Promise<TimeCapsule[]> {
  const now = new Date().toISOString();
  const { data: due, error: fetchError } = await supabaseAdmin
    .from('TimeCapsule')
    .select('*')
    .eq('coupleId', coupleId)
    .eq('isUnlocked', false)
    .lte('unlocksAt', now);
  if (fetchError) throw fetchError;
  if (!due || due.length === 0) return [];

  const ids = due.map((c: TimeCapsule) => c.id);
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('TimeCapsule')
    .update({ isUnlocked: true })
    .in('id', ids)
    .select();
  if (updateError) throw updateError;
  return (updated ?? []) as TimeCapsule[];
}
