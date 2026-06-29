import { supabaseAdmin } from '@/lib/supabase-admin';
import { Couple } from '../types';

export async function getCoupleById(id: string): Promise<Couple | null> {
  const { data, error } = await supabaseAdmin.from('Couple').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Couple | null;
}

export async function getCoupleByUsers(user1Id: string, user2Id: string): Promise<Couple | null> {
  // Ordered check user1Id < user2Id to guarantee uniqueness or match both directions
  const { data, error } = await supabaseAdmin
    .from('Couple')
    .select('*')
    .or(`and(user1Id.eq.${user1Id},user2Id.eq.${user2Id}),and(user1Id.eq.${user2Id},user2Id.eq.${user1Id})`)
    .maybeSingle();
  if (error) throw error;
  return data as Couple | null;
}

export async function createCouple(user1Id: string, user2Id: string, timezone?: string): Promise<Couple> {
  // Sort user IDs lexicographically to enforce strict unique constraint (user1Id, user2Id)
  const [first, second] = [user1Id, user2Id].sort();
  const insertData: Record<string, any> = { user1Id: first, user2Id: second };
  if (timezone) {
    insertData.timezone = timezone;
  }
  const { data, error } = await supabaseAdmin
    .from('Couple')
    .insert(insertData)
    .select()
    .single();
  if (error) throw error;
  return data as Couple;
}

export async function listCouplesForUser(userId: string): Promise<Couple[]> {
  const { data, error } = await supabaseAdmin
    .from('Couple')
    .select('*')
    .or(`user1Id.eq.${userId},user2Id.eq.${userId}`);
  if (error) throw error;
  return data as Couple[];
}
