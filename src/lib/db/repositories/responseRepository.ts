import { supabaseAdmin } from '@/lib/supabase-admin';
import { Response } from '../types';

export async function getResponsesByRoom(roomId: string): Promise<Response[]> {
  const { data, error } = await supabaseAdmin.from('Response').select('*').eq('roomId', roomId);
  if (error) throw error;
  return (data || []) as Response[];
}

export async function getResponsesByPlayer(playerId: string): Promise<Response[]> {
  const { data, error } = await supabaseAdmin.from('Response').select('*').eq('playerId', playerId);
  if (error) throw error;
  return (data || []) as Response[];
}

export async function updateResponseCorrectness(
  responseId: string,
  isCorrect: boolean
): Promise<void> {
  const { error } = await supabaseAdmin.from('Response').update({ isCorrect }).eq('id', responseId);
  if (error) throw error;
}
