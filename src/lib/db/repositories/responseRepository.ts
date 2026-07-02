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

export async function getResponsesByRoomAndQuestion(
  roomId: string,
  questionId: string
): Promise<Response[]> {
  const { data, error } = await supabaseAdmin
    .from('Response')
    .select('*')
    .eq('roomId', roomId)
    .eq('questionId', questionId);
  if (error) throw error;
  return (data || []) as Response[];
}

export async function getResponsesForProfileInputs(
  roomId: string
): Promise<Array<Pick<Response, 'playerId' | 'answer' | 'questionId' | 'isCorrect'>>> {
  const { data, error } = await supabaseAdmin
    .from('Response')
    .select('playerId, answer, questionId, isCorrect')
    .eq('roomId', roomId);
  if (error) throw error;
  return (data || []) as Array<Pick<Response, 'playerId' | 'answer' | 'questionId' | 'isCorrect'>>;
}

export async function updateResponseCorrectness(
  responseId: string,
  isCorrect: boolean
): Promise<void> {
  const { error } = await supabaseAdmin.from('Response').update({ isCorrect }).eq('id', responseId);
  if (error) throw error;
}
