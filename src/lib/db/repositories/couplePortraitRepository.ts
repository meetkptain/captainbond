import { supabaseAdmin } from '@/lib/supabase-admin';
import { CouplePortrait } from '../types';

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
    .upsert({ coupleId, month, ...updates }, { onConflict: 'coupleId,month' })
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
