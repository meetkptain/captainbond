import { AppError } from '@/lib/errors';
import { getLocalDateString, PARIS_TZ, setHourInTz } from '@/lib/time';
import { DailyQuestion, Couple, CoupleThemeCycle } from '@/lib/db/types';
import {
  createDailyQuestion,
  getCurrentRitual,
  listRecentRituals,
} from '@/lib/db/repositories/dailyQuestionRepository';
import {
  getCoupleThemeCycle,
  createCoupleThemeCycle,
  advanceCoupleThemeCycle,
  getThemeForWeek,
} from '@/lib/db/repositories/coupleThemeCycleRepository';
import { pickQuestionForTheme } from '@/lib/db/repositories';

const RITUAL_DAYS = [1, 3, 5]; // Monday, Wednesday, Friday

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function getDayInTimezone(date: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  }).formatToParts(date);
  const dayName = parts.find((p) => p.type === 'weekday')?.value;
  return WEEKDAY_MAP[dayName || ''] ?? date.getDay();
}

export function isRitualDay(date: Date, timezone?: string): boolean {
  const day = timezone ? getDayInTimezone(date, timezone) : date.getDay();
  return RITUAL_DAYS.includes(day);
}

export async function getOrCreateThemeCycle(
  coupleId: string
): Promise<CoupleThemeCycle> {
  const existing = await getCoupleThemeCycle(coupleId);
  if (existing) return existing;
  return createCoupleThemeCycle(coupleId);
}

export function pickIntensity(recentRituals: DailyQuestion[]): number {
  const last = recentRituals[0];
  if (last && last.intensity >= 3) return 2;
  // Mostly light (1), sometimes deep (2), rarely vulnerable (3)
  const roll = Math.random();
  if (roll < 0.6) return 1;
  if (roll < 0.9) return 2;
  return 3;
}

export async function generateRitualForCouple(
  couple: Couple,
  now: Date = new Date()
): Promise<DailyQuestion> {
  if (!isRitualDay(now, couple.timezone || PARIS_TZ)) {
    throw new AppError('BAD_REQUEST', 'Today is not a ritual day');
  }

  const timezone = couple.timezone || PARIS_TZ;
  const existingToday = await getCurrentRitual(couple.id, timezone);
  if (existingToday) {
    return existingToday;
  }

  let cycle = await getOrCreateThemeCycle(couple.id);
  // New theme starts on Monday, before creating that day's ritual
  if (getDayInTimezone(now, timezone) === 1) {
    cycle = await advanceCoupleThemeCycle(cycle);
  }

  const theme = getThemeForWeek(cycle.weekNumber);
  const recentRituals = await listRecentRituals(couple.id, 7);
  const intensity = pickIntensity(recentRituals);
  const question = await pickQuestionForTheme(theme, intensity);

  const ritual = await createDailyQuestion({
    coupleId: couple.id,
    questionId: question.id,
    customText: question.text,
    theme,
    intensity,
    ritualAction: question.suggestedAction,
    therapistGuide: question.therapistGuide,
    releasedAt: new Date(setHourInTz(getLocalDateString(now, timezone), 12, timezone)).toISOString(),
  });

  return ritual;
}
