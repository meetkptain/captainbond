import { supabaseAdmin } from '@/lib/supabase-admin';

const DEFAULT_TTL_MS = 5 * 60 * 1000;

export async function acquireCronLock(name: string, ttlMs = DEFAULT_TTL_MS): Promise<boolean> {
  const now = new Date();
  const expiresBefore = new Date(now.getTime() - ttlMs).toISOString();

  // Try to insert fresh lock
  const { error: insertError } = await supabaseAdmin
    .from('CronLock')
    .insert({ id: name, lockedAt: now.toISOString(), lockedBy: 'cron' })
    .maybeSingle();

  if (!insertError) return true;

  // If insert failed, try to steal expired lock
  const { error: updateError } = await supabaseAdmin
    .from('CronLock')
    .update({ lockedAt: now.toISOString(), lockedBy: 'cron' })
    .eq('id', name)
    .lt('lockedAt', expiresBefore);

  return !updateError;
}

export async function releaseCronLock(name: string): Promise<void> {
  await supabaseAdmin.from('CronLock').delete().eq('id', name);
}
