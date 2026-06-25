import { supabaseAdmin } from '@/lib/supabase-admin';
import { Purchase } from '../types';

export async function createPurchase(input: Partial<Purchase>): Promise<Purchase> {
  const { data, error } = await supabaseAdmin.from('Purchase').insert(input).select().single();
  if (error) throw error;
  return data as Purchase;
}

export async function getPurchaseByStripePaymentId(stripePaymentId: string): Promise<Purchase | null> {
  const { data, error } = await supabaseAdmin
    .from('Purchase')
    .select('*')
    .eq('stripePaymentId', stripePaymentId)
    .maybeSingle();
  if (error) throw error;
  return data as Purchase | null;
}

export async function getPurchaseByStripeInvoiceId(stripeInvoiceId: string): Promise<Purchase | null> {
  const { data, error } = await supabaseAdmin
    .from('Purchase')
    .select('*')
    .eq('stripeInvoiceId', stripeInvoiceId)
    .maybeSingle();
  if (error) throw error;
  return data as Purchase | null;
}

export async function updatePurchase(id: string, updates: Partial<Purchase>): Promise<void> {
  const { error } = await supabaseAdmin.from('Purchase').update(updates).eq('id', id);
  if (error) throw error;
}
