import { supabaseAdmin } from '@/lib/supabase-admin';
import { AppError } from '@/lib/errors';
import { TotemState } from '../types';
import { dbRetry } from '@/lib/db/withRetry';

export type DetoxAction = 'START' | 'INTERRUPT' | 'COMPLETE';

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
  for (let attempt = 0; attempt < 3; attempt++) {
    const current = await getOrCreateTotem(coupleId);
    const merged = { ...current.stateA, ...stateA };
    const now = new Date().toISOString();
    const { data, error } = await dbRetry(async () =>
      supabaseAdmin
        .from('TotemState')
        .update({ stateA: merged, updatedAt: now })
        .eq('coupleId', coupleId)
        .eq('updatedAt', current.updatedAt)
        .select()
        .single()
    );
    if (error && !(error as { message?: string }).message?.includes('0 rows')) throw error;
    if (data) return data as TotemState;
  }
  throw new AppError('CONFLICT', 'Totem state updated by another request, retry exhausted');
}

export async function updateOrbeB(
  coupleId: string,
  stateB: Partial<TotemState['stateB']>
): Promise<TotemState> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const current = await getOrCreateTotem(coupleId);
    const merged = { ...current.stateB, ...stateB };
    const now = new Date().toISOString();
    const { data, error } = await dbRetry(async () =>
      supabaseAdmin
        .from('TotemState')
        .update({ stateB: merged, updatedAt: now })
        .eq('coupleId', coupleId)
        .eq('updatedAt', current.updatedAt)
        .select()
        .single()
    );
    if (error && !(error as { message?: string }).message?.includes('0 rows')) throw error;
    if (data) return data as TotemState;
  }
  throw new AppError('CONFLICT', 'Totem state updated by another request, retry exhausted');
}

export async function updateFusionState(
  coupleId: string,
  fusionState: Partial<TotemState['fusionState']>
): Promise<TotemState> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const current = await getOrCreateTotem(coupleId);
    const merged = { ...current.fusionState, ...fusionState };
    const now = new Date().toISOString();
    const { data, error } = await dbRetry(async () =>
      supabaseAdmin
        .from('TotemState')
        .update({ fusionState: merged, updatedAt: now })
        .eq('coupleId', coupleId)
        .eq('updatedAt', current.updatedAt)
        .select()
        .single()
    );
    if (error && !(error as { message?: string }).message?.includes('0 rows')) throw error;
    if (data) return data as TotemState;
  }
  throw new AppError('CONFLICT', 'Totem state updated by another request, retry exhausted');
}

export async function updateDetoxSession(
  coupleId: string,
  action: DetoxAction,
  durationMinutes?: number
): Promise<TotemState> {
  const totem = await getTotemByCouple(coupleId);
  if (!totem) {
    throw new AppError('NOT_FOUND', 'TotemState introuvable pour ce couple.');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fusionState: Record<string, any> = { ...(totem.fusionState ?? {}) };

  if (action === 'START') {
    fusionState.detoxSession = {
      startedAt: new Date().toISOString(),
      durationMinutes: durationMinutes ?? 60,
      interrupted: false,
    };
  } else if (action === 'INTERRUPT') {
    if (fusionState.detoxSession) {
      fusionState.detoxSession.interrupted = true;
    }
    fusionState.energy = Math.max(0.1, (fusionState.energy ?? 1.0) - 0.15);
  } else if (action === 'COMPLETE') {
    delete fusionState.detoxSession;
    fusionState.energy = Math.min(1.0, (fusionState.energy ?? 1.0) + 0.2);
    fusionState.totalRitualsCompleted = (fusionState.totalRitualsCompleted ?? 0) + 1;
  }

  return updateFusionState(coupleId, fusionState as Partial<TotemState['fusionState']>);
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
