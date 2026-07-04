import { supabaseAdmin } from '@/lib/supabase-admin';
import { createLogger } from '@/lib/logger';
import {
  upsertHeatmapEntry,
  getThemeAxisMapping,
  getHeatmapForCouple,
} from '@/lib/db/repositories/heatmapRepository';

const logger = createLogger({ route: 'heatmapService' });

// Axes de la heatmap confiance
const CONFIDENCE_AXES = ['vulnérabilité', 'communication', 'conflit', 'désir', 'projets'] as const;

// Intensité minimale pour compter comme "vulnérabilité"

export async function updateHeatmapForCouple(coupleId: string): Promise<void> {
  const themeMap = await getThemeAxisMapping();

  // Récupérer tous les rituels révélés du couple
  const { data: rituals, error } = await supabaseAdmin
    .from('DailyQuestion')
    .select('theme, intensity, user1Answer, user2Answer, revealedAt')
    .eq('coupleId', coupleId)
    .eq('isRevealed', true)
    .order('revealedAt', { ascending: false });

  if (error) throw error;
  if (!rituals || rituals.length === 0) {
    logger.info('No revealed rituals for couple', { coupleId });
    return;
  }

  // Calculer le score par axe
  const axisScores: Record<string, { total: number; count: number; lastAnswered: string | null }> = {};
  for (const axis of CONFIDENCE_AXES) {
    axisScores[axis] = { total: 0, count: 0, lastAnswered: null };
  }

  for (const ritual of rituals) {
    const axis = themeMap[ritual.theme ?? ''] ?? mapThemeToAxis(ritual.theme ?? '');
    if (!axis || !axisScores[axis]) continue;

    // Score = moyenne de l'intensité (normalisée 0-1)
    const normalizedIntensity = Math.min(ritual.intensity / 5, 1);
    axisScores[axis].total += normalizedIntensity;
    axisScores[axis].count++;

    if (ritual.revealedAt && (!axisScores[axis].lastAnswered || ritual.revealedAt > axisScores[axis].lastAnswered!)) {
      axisScores[axis].lastAnswered = ritual.revealedAt;
    }
  }

  // Upsert chaque axe
  for (const [axis, data] of Object.entries(axisScores)) {
    if (data.count === 0) continue;

    const score = data.total / data.count;
    const previousEntry = await getPreviousScore(coupleId, axis);
    const trend = previousEntry === null ? 'stable' : score > previousEntry + 0.05 ? 'up' : score < previousEntry - 0.05 ? 'down' : 'stable';

    await upsertHeatmapEntry({
      coupleId,
      axis,
      score: Math.round(score * 100) / 100,
      trend,
      lastAnsweredAt: data.lastAnswered ?? undefined,
    });
  }

  logger.info('Heatmap updated', { coupleId, axes: Object.keys(axisScores).length });
}

async function getPreviousScore(coupleId: string, axis: string): Promise<number | null> {
  const { data } = await supabaseAdmin
    .from('CoupleHeatmap')
    .select('score')
    .eq('coupleId', coupleId)
    .eq('axis', axis)
    .maybeSingle();
  return data ? (data as { score: number }).score : null;
}

function mapThemeToAxis(theme: string): string | null {
  const t = theme.toLowerCase();
  if (t.includes('vulnérab') || t.includes('peur') || t.includes('confiance') || t.includes('secret')) return 'vulnérabilité';
  if (t.includes('communica') || t.includes('écoute') || t.includes('parler') || t.includes('expression')) return 'communication';
  if (t.includes('conflict') || t.includes('dispute') || t.includes('tension') || t.includes('colère')) return 'conflit';
  if (t.includes('désir') || t.includes('intime') || t.includes('sexual') || t.includes('attraction')) return 'désir';
  if (t.includes('projet') || t.includes('futur') || t.includes('objectif') || t.includes('vision')) return 'projets';
  return 'communication'; // fallback
}

export async function getCoupleHeatmap(coupleId: string): Promise<Array<{
  axis: string;
  score: number;
  trend: string;
}>> {
  const entries = await getHeatmapForCouple(coupleId);
  // S'assurer que tous les axes existent
  const existing = new Map(entries.map((e) => [e.axis, e]));
  const result = CONFIDENCE_AXES.map((axis) => ({
    axis,
    score: existing.get(axis)?.score ?? 0.5,
    trend: existing.get(axis)?.trend ?? 'stable',
  }));
  return result;
}
