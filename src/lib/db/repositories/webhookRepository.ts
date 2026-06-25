import { supabaseAdmin } from '@/lib/supabase-admin';
import { WebhookEvent } from '../types';

export async function getWebhookEventById(id: string): Promise<WebhookEvent | null> {
  const { data, error } = await supabaseAdmin
    .from('WebhookEvent')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as WebhookEvent | null;
}

export async function createWebhookEvent(input: Partial<WebhookEvent>): Promise<void> {
  const { error } = await supabaseAdmin.from('WebhookEvent').insert(input);
  if (error) throw error;
}
