import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateContent } from '@/lib/gemini';
import { AppError } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { upsertWeeklyRecap, getWeeklyRecap } from '@/lib/db/repositories/weeklyRecapRepository';

const logger = createLogger({ route: 'weeklyRecapService' });

interface RecapData {
  questionText: string;
  user1Answer: string | null;
  user2Answer: string | null;
  theme: string | null;
  intensity: number;
  createdAt: string;
}


function getSunday(date: Date): string {
  const monday = new Date(date);
  monday.setDate(monday.getDate() + 6);
  return monday.toISOString().split('T')[0];
}

export async function generateWeeklyRecap(
  coupleId: string,
  weekStart: string
): Promise<void> {
  const existing = await getWeeklyRecap(coupleId, weekStart);
  if (existing) {
    logger.info('Weekly recap already exists', { coupleId, weekStart });
    return;
  }

  const weekEndDate = getSunday(new Date(weekStart + 'T00:00:00Z'));

  const { data: rituals, error } = await supabaseAdmin
    .from('DailyQuestion')
    .select(`
      user1Answer,
      user2Answer,
      theme,
      intensity,
      createdAt,
      customText
    `)
    .eq('coupleId', coupleId)
    .gte('createdAt', weekStart + 'T00:00:00Z')
    .lte('createdAt', weekEndDate + 'T23:59:59Z')
    .eq('isRevealed', true)
    .order('createdAt', { ascending: true });

  if (error) throw error;
  if (!rituals || rituals.length === 0) {
    logger.info('No rituals found for week', { coupleId, weekStart });
    return;
  }

  const recapData: RecapData[] = rituals.map((r) => ({
    questionText: r.customText || 'Question personnalisée',
    user1Answer: r.user1Answer,
    user2Answer: r.user2Answer,
    theme: r.theme,
    intensity: r.intensity,
    createdAt: r.createdAt,
  }));

  const prompt = `
Tu es un expert en dynamique de couple bienveillant. Tu analyses les réponses de deux partenaires à des questions profondes sur leur relation.

Voici les données de la semaine du ${weekStart} au ${weekEndDate} :

${recapData.map((r, i) => `
Rituel ${i + 1} — Thème: ${r.theme || 'non défini'}, Intensité: ${r.intensity}/5
Question: "${r.questionText}"
Réponse Partenaire A: "${r.user1Answer || 'pas de réponse'}"
Réponse Partenaire B: "${r.user2Answer || 'pas de réponse'}"
`).join('\n')}

En te basant sur ces données, génère un récapitulatif hebdomadaire en JSON avec cette structure exacte :
{
  "theme": "Le thème dominant de la semaine (1-2 mots)",
  "summary": "Un résumé bienveillant des échanges de la semaine (2-3 phrases)",
  "insight": "Un insight profond sur la dynamique du couple cette semaine (1-2 phrases)",
  "lesson": "Une leçon concrète et actionable pour renforcer leur lien cette semaine"
}

Réponds UNIQUEMENT avec le JSON, pas de texte supplémentaire.
`;

  const rawResponse = await generateContent(prompt, 'application/json');

  let recap: { theme: string; summary: string; insight: string; lesson: string };
  try {
    recap = JSON.parse(rawResponse);
  } catch {
    throw new AppError('SERVICE_UNAVAILABLE', 'Réponse IA mal formatée pour le récapitulatif hebdomadaire');
  }

  await upsertWeeklyRecap({
    coupleId,
    weekStart,
    theme: recap.theme,
    summary: recap.summary,
    insight: recap.insight,
    lesson: recap.lesson,
  });

  logger.info('Weekly recap generated', { coupleId, weekStart, theme: recap.theme });
}

export async function getCoupleRecaps(
  coupleId: string,
  limit = 4
): Promise<Array<{
  weekStart: string;
  theme: string;
  summary: string;
  insight: string;
  lesson: string;
}>> {
  const { data, error } = await supabaseAdmin
    .from('WeeklyRecapData')
    .select('weekStart, theme, summary, insight, lesson')
    .eq('coupleId', coupleId)
    .order('weekStart', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Array<{
    weekStart: string;
    theme: string;
    summary: string;
    insight: string;
    lesson: string;
  }>;
}
