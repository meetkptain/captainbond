import { supabaseAdmin } from '@/lib/supabase-admin';
import { User } from '../types';

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin.from('User').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as User | null;
}

export async function getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('User')
    .select('*')
    .eq('stripeCustomerId', stripeCustomerId)
    .maybeSingle();
  if (error) throw error;
  return data as User | null;
}

export async function createUser(input: Partial<User>): Promise<User> {
  const { data, error } = await supabaseAdmin.from('User').insert(input).select().single();
  if (error) throw error;
  return data as User;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
  const { error } = await supabaseAdmin.from('User').update(updates).eq('id', id);
  if (error) throw error;
}
