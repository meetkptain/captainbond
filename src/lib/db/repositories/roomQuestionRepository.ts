import { supabaseAdmin } from '@/lib/supabase-admin';
import { Question } from '../types';

export type RoomDeckQuestion = Pick<Question, 'id' | 'text' | 'intensityLevel' | 'tags' | 'mode'>;

export async function listQuestionsForDeck(
  language: string = 'fr'
): Promise<RoomDeckQuestion[]> {
  const { data, error } = await supabaseAdmin
    .from('Question')
    .select('id, text, intensityLevel, tags, mode')
    .eq('language', language);
  if (error) throw error;
  return (data || []) as RoomDeckQuestion[];
}
