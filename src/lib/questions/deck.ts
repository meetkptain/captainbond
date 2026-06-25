import { supabaseAdmin } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';
import { AppError } from '@/lib/errors';

export interface DeckQuestion {
  id: string;
  text: string;
  intensityLevel: number;
  tags: string[];
  mode: string;
  metadata?: Record<string, unknown>;
}

export async function getQuestionDeck(): Promise<DeckQuestion[]> {
  const { data: questions, error } = await supabaseAdmin
    .from('Question')
    .select('id, text, intensityLevel, tags, mode, metadata');

  if (error) {
    logger.error('Error fetching question deck', {}, error);
    throw new AppError('INTERNAL_ERROR', 'Impossible de charger le deck de questions', { cause: error });
  }

  return (questions || []) as DeckQuestion[];
}
