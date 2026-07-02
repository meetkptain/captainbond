import { AppError } from '@/lib/errors';
import { DailyQuestion, Couple, Question, CoupleThemeCycle } from '@/lib/db/types';
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
import { supabaseAdmin } from '@/lib/supabase-admin';

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

export function getTodayNoon(timezone: string, now: Date = new Date()): Date {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = dateFormatter.formatToParts(now);
  const year = Number(parts.find((p) => p.type === 'year')?.value ?? now.getFullYear());
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? 1);
  const day = Number(parts.find((p) => p.type === 'day')?.value ?? 1);

  const hourFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  });

  // Start with UTC noon for the target date, then adjust until the target timezone sees 12:00
  let candidate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  for (let i = 0; i < 3; i++) {
    const hourInTz = Number(hourFormatter.format(candidate));
    if (hourInTz === 12) break;
    const diff = hourInTz - 12;
    candidate = new Date(candidate.getTime() - diff * 60 * 60 * 1000);
  }

  return candidate;
}

export async function getOrCreateThemeCycle(
  coupleId: string
): Promise<CoupleThemeCycle> {
  const existing = await getCoupleThemeCycle(coupleId);
  if (existing) return existing;
  return createCoupleThemeCycle(coupleId);
}

export async function pickQuestionForTheme(
  theme: string,
  intensity: number
): Promise<Question> {
  const { data, error } = await supabaseAdmin
    .from('Question')
    .select('id, text, intensityLevel, suggestedAction, therapistGuide')
    .eq('theme', theme)
    .eq('intensityLevel', intensity)
    .limit(50);

  if (error) throw error;
  const questions = (data ?? []) as Question[];

  if (questions.length === 0) {
    throw new AppError(
      'NOT_FOUND',
      `No question found for theme ${theme} intensity ${intensity}`
    );
  }

  return questions[Math.floor(Math.random() * questions.length)];
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
  if (!isRitualDay(now, couple.timezone || 'Europe/Paris')) {
    throw new AppError('BAD_REQUEST', 'Today is not a ritual day');
  }

  const timezone = couple.timezone || 'Europe/Paris';
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
    releasedAt: getTodayNoon(timezone, now).toISOString(),
  });

  return ritual;
}
