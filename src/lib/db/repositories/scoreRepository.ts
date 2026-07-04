import { supabaseAdmin } from '@/lib/supabase-admin';
import { Score } from '../types';

export async function getScoresByRoom(roomId: string): Promise<Score[]> {
  const { data, error } = await supabaseAdmin.from('Score').select('*').eq('roomId', roomId);
  if (error) throw error;
  return (data || []) as Score[];
}

export async function getScoresByPlayer(playerId: string): Promise<Score[]> {
  const { data, error } = await supabaseAdmin.from('Score').select('*').eq('playerId', playerId);
  if (error) throw error;
  return (data || []) as Score[];
}

export async function upsertScore(input: Partial<Score>): Promise<void> {
  const { error } = await supabaseAdmin.from('Score').upsert(input, { onConflict: 'roomId,playerId' });
  if (error) throw error;
}

export async function deleteScoresByRoom(roomId: string): Promise<void> {
  const { error } = await supabaseAdmin.from('Score').delete().eq('roomId', roomId);
  if (error) throw error;
}
