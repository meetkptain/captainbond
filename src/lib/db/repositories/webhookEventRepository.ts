import { supabaseAdmin } from '@/lib/supabase-admin';

export async function insertWebhookEventIfNotExists(
  stripeEventId: string,
  eventType: string,
  payload: unknown
): Promise<{ inserted: boolean }> {
  const { data, error } = await supabaseAdmin.rpc('insert_webhook_event_if_not_exists', {
    p_stripe_event_id: stripeEventId,
    p_event_type: eventType,
    p_payload: payload,
  });
  if (error) throw error;
  return { inserted: data as boolean };
}
