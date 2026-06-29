import { supabaseAdmin } from '@/lib/supabase-admin';
import { MonthlyReport, DailyQuestion, CouplePortrait } from '@/lib/db/types';

/**
 * Génère le rapport mensuel de résonance pour un couple.
 * @param coupleId - identifiant du couple
 * @param month    - mois au format "YYYY-MM"
 */
export async function generateMonthlyReport(
  coupleId: string,
  month: string
): Promise<MonthlyReport> {
  // Calcul des bornes du mois
  const [year, monthNum] = month.split('-').map(Number);
  const start = new Date(Date.UTC(year, monthNum - 1, 1));
  const end = new Date(Date.UTC(year, monthNum, 1)); // début du mois suivant (exclusif)
  const startIso = start.toISOString();
  const endIso = end.toISOString();

  // Lecture des DailyQuestions révélées dans la plage du mois
  const { data: rawQuestions, error: dqError } = await supabaseAdmin
    .from('DailyQuestion')
    .select('*')
    .eq('coupleId', coupleId)
    .eq('isRevealed', true)
    .gte('releasedAt', startIso)
    .lt('releasedAt', endIso)
    .order('releasedAt', { ascending: true });

  if (dqError) {
    throw new Error(`Impossible de charger les questions: ${dqError.message}`);
  }

  const questions: DailyQuestion[] = (rawQuestions ?? []) as DailyQuestion[];

  // Lecture du CouplePortrait du mois (si existant)
  const { data: rawPortrait } = await supabaseAdmin
    .from('CouplePortrait')
    .select('*')
    .eq('coupleId', coupleId)
    .eq('month', month)
    .maybeSingle();

  const portrait: CouplePortrait | null = rawPortrait as CouplePortrait | null;

  // --- Calcul des métriques ---
  const totalQuestionsRevealed = questions.length;

  // Score de résonance moyen (sur les questions avec un score)
  const scored = questions.filter((q) => q.resonanceScore != null);
  const avgResonanceScore =
    scored.length > 0
      ? scored.reduce((sum, q) => sum + (q.resonanceScore ?? 0), 0) / scored.length
      : 0;

  // Jour pic de résonance
  let peakResonanceDay: string | null = null;
  if (scored.length > 0) {
    const peak = scored.reduce((best, q) =>
      (q.resonanceScore ?? 0) > (best.resonanceScore ?? 0) ? q : best
    );
    peakResonanceDay = peak.releasedAt?.slice(0, 10) ?? null;
  }

  // Profil d'humeur moyen (energy & stress depuis user1Mood / user2Mood)
  let totalEnergy = 0;
  let totalStress = 0;
  let moodCount = 0;

  for (const q of questions) {
    for (const moodRaw of [q.user1Mood, q.user2Mood]) {
      if (moodRaw && typeof moodRaw === 'object') {
        const mood = moodRaw as Record<string, unknown>;
        if (typeof mood.energy === 'number') {
          totalEnergy += mood.energy;
          moodCount++;
        }
        if (typeof mood.stress === 'number') {
          totalStress += mood.stress;
        }
      }
    }
  }

  const avgEnergy = moodCount > 0 ? totalEnergy / moodCount : 0;
  const avgStress = moodCount > 0 ? totalStress / moodCount : 0;

  // Top 3 moments forts (plus hauts scores de résonance)
  const highlights = scored
    .slice()
    .sort((a, b) => (b.resonanceScore ?? 0) - (a.resonanceScore ?? 0))
    .slice(0, 3)
    .map((q) => ({
      questionText: q.customText ?? q.questionId ?? 'Question du jour',
      resonanceScore: q.resonanceScore ?? 0,
      releasedAt: q.releasedAt ?? '',
    }));

  // Tendance d'alignement depuis le portrait, sinon calcul approximatif
  const alignmentTrend = portrait?.alignmentTrend ?? (avgResonanceScore - 0.5) * 2;

  return {
    coupleId,
    month,
    totalQuestionsRevealed,
    avgResonanceScore,
    peakResonanceDay,
    moodProfile: { avgEnergy, avgStress },
    highlights,
    alignmentTrend,
  };
}
