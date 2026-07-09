import type { SeedCategory } from '@/lib/couple/seedQuestions';

/**
 * Maps a Date Night ritual answer to a constellation sector.
 *
 * Ritual answers are stored on DailyQuestion with an `intensity` (1..3) and a
 * `theme` (RECONNECTION / COMMUNICATION / INTIMACY / SHARED_PROJECT). The
 * constellation layout only knows the 6 visual categories, so we translate the
 * ritual's emotional depth + theme into one of them. This keeps ritual stars
 * spread across sectors instead of all piling into CHILL (the old hardcoded
 * `'daily'` category mapped to sector 0).
 */
export function ritualConstellationCategory(
  intensity: number,
  theme?: string | null,
): SeedCategory {
  const t = (theme || '').toUpperCase();

  if (intensity >= 3) {
    return t === 'INTIMACY' ? 'SPICY' : 'DEEP';
  }
  if (intensity === 2) {
    return t === 'RECONNECTION' || t === 'SHARED_PROJECT' ? 'DATE' : 'DEEP';
  }
  return t === 'COMMUNICATION' ? 'ICEBREAKER' : 'CHILL';
}
