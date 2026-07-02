import { supabaseAdmin } from '@/lib/supabase-admin';
import { AppError } from '@/lib/errors';

export interface RitualQuestion {
  id: string;
  text: string;
  intensityLevel: number;
  suggestedAction: string | null;
  therapistGuide: string | null;
}

export async function listQuestionsForTheme(
  theme: string,
  intensity: number
): Promise<RitualQuestion[]> {
  const { data, error } = await supabaseAdmin
    .from('Question')
    .select('id, text, intensityLevel, suggestedAction, therapistGuide')
    .eq('theme', theme)
    .eq('intensityLevel', intensity);

  if (error) throw error;
  return (data ?? []) as RitualQuestion[];
}

export async function pickQuestionForTheme(
  theme: string,
  intensity: number
): Promise<RitualQuestion> {
  const questions = await listQuestionsForTheme(theme, intensity);

  if (questions.length === 0) {
    throw new AppError(
      'NOT_FOUND',
      `No question found for theme ${theme} intensity ${intensity}`
    );
  }

  return questions[Math.floor(Math.random() * questions.length)];
}
