import { supabaseAdmin } from '@/lib/supabase-admin';

export async function upsertPushSubscription(
  userId: string,
  endpoint: string,
  keys: { p256dh: string; auth: string },
  timezone: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('PushSubscription')
    .upsert({ userId, endpoint, keys, timezone }, { onConflict: 'endpoint' });
  if (error) throw error;
}

export async function getActiveSubscriptionsForCouple(coupleId: string) {
  // Récupérer les 2 user IDs du couple
  const { data: couple, error: coupleError } = await supabaseAdmin
    .from('Couple')
    .select('user1Id, user2Id')
    .eq('id', coupleId)
    .single();
  if (coupleError || !couple) return [];

  const { data, error } = await supabaseAdmin
    .from('PushSubscription')
    .select('*')
    .in('userId', [couple.user1Id, couple.user2Id])
    .eq('active', true);
  if (error) throw error;
  return data ?? [];
}

export async function deactivateByEndpoint(endpoint: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('PushSubscription')
    .update({ active: false })
    .eq('endpoint', endpoint);
  if (error) throw error;
}
