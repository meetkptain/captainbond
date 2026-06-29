import { supabaseAdmin } from '@/lib/supabase-admin';
import { TotemState } from '../types';

export async function getTotemByCouple(coupleId: string): Promise<TotemState | null> {
  const { data, error } = await supabaseAdmin
    .from('TotemState')
    .select('*')
    .eq('coupleId', coupleId)
    .maybeSingle();
  if (error) throw error;
  return data as TotemState | null;
}

export async function createTotemState(coupleId: string): Promise<TotemState> {
  const { data, error } = await supabaseAdmin
    .from('TotemState')
    .insert({ coupleId })
    .select()
    .single();
  if (error) throw error;
  return data as TotemState;
}

export async function getOrCreateTotem(coupleId: string): Promise<TotemState> {
  const existing = await getTotemByCouple(coupleId);
  if (existing) return existing;
  return createTotemState(coupleId);
}

export async function updateOrbeA(
  coupleId: string,
  stateA: Partial<TotemState['stateA']>
): Promise<TotemState> {
  const current = await getOrCreateTotem(coupleId);
  const merged = { ...current.stateA, ...stateA };
  const { data, error } = await supabaseAdmin
    .from('TotemState')
    .update({ stateA: merged, updatedAt: new Date().toISOString() })
    .eq('coupleId', coupleId)
    .select()
    .single();
  if (error) throw error;
  return data as TotemState;
}

export async function updateOrbeB(
  coupleId: string,
  stateB: Partial<TotemState['stateB']>
): Promise<TotemState> {
  const current = await getOrCreateTotem(coupleId);
  const merged = { ...current.stateB, ...stateB };
  const { data, error } = await supabaseAdmin
    .from('TotemState')
    .update({ stateB: merged, updatedAt: new Date().toISOString() })
    .eq('coupleId', coupleId)
    .select()
    .single();
  if (error) throw error;
  return data as TotemState;
}

export async function updateFusionState(
  coupleId: string,
  fusionState: Partial<TotemState['fusionState']>
): Promise<TotemState> {
  const current = await getOrCreateTotem(coupleId);
  const merged = { ...current.fusionState, ...fusionState };
  const { data, error } = await supabaseAdmin
    .from('TotemState')
    .update({ fusionState: merged, updatedAt: new Date().toISOString() })
    .eq('coupleId', coupleId)
    .select()
    .single();
  if (error) throw error;
  return data as TotemState;
}

export async function updateTotemRitual(
  coupleId: string,
  streakDays: number
): Promise<TotemState> {
  const { data, error } = await supabaseAdmin
    .from('TotemState')
    .update({
      lastRitualAt: new Date().toISOString(),
      streakDays,
      updatedAt: new Date().toISOString(),
    })
    .eq('coupleId', coupleId)
    .select()
    .single();
  if (error) throw error;
  return data as TotemState;
}
