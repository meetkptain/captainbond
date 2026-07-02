import { AppError } from '@/lib/errors';

export const PARIS_TZ = 'Europe/Paris';

const MIN_MS = 60 * 1000;

const SUPPORTED_TIMEZONES = new Set(
  typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl
    ? Intl.supportedValuesOf('timeZone')
    : []
);

function validateTimeZone(timeZone: string): void {
  if (typeof timeZone !== 'string' || timeZone === '') {
    throw new AppError('VALIDATION_ERROR', 'timeZone must be a non-empty string');
  }

  if (SUPPORTED_TIMEZONES.size > 0 && SUPPORTED_TIMEZONES.has(timeZone)) {
    return;
  }

  // Fallback for aliases not in the canonical supported list.
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
  } catch {
    throw new AppError('VALIDATION_ERROR', `Unsupported timeZone: ${timeZone}`);
  }
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
  }).formatToParts(date);

  const offsetStr = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';

  if (offsetStr === 'GMT') {
    return 0;
  }

  const match = offsetStr.match(/^GMT([+-])(\d{2}):(\d{2})$/);
  if (!match) {
    throw new AppError('INTERNAL_ERROR', `Unable to parse timezone offset: ${offsetStr}`);
  }

  const [, sign, hours, minutes] = match;
  const total = Number(hours) * 60 + Number(minutes);
  return sign === '+' ? total : -total;
}

export function getLocalDateString(date: Date, timeZone: string): string {
  validateTimeZone(timeZone);

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new AppError('INTERNAL_ERROR', `Unable to resolve local date for timeZone ${timeZone}`);
  }

  return `${year}-${month}-${day}`;
}

export function startOfDayInTz(dateStr: string, timeZone: string): number {
  return setHourInTz(dateStr, 0, timeZone);
}

export function setHourInTz(dateStr: string, hour: number, timeZone: string): number {
  validateTimeZone(timeZone);

  const [year, month, day] = dateStr.split('-').map(Number);

  if (!year || !month || !day || !Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new AppError('VALIDATION_ERROR', `Invalid date or hour: ${dateStr} ${hour}`);
  }

  // UTC timestamp that would match the desired local wall-clock time if the offset were zero.
  const localTarget = Date.UTC(year, month - 1, day, hour, 0, 0);
  let candidate = localTarget;
  let adjusted = candidate;

  // The offset depends on the actual UTC instant, so iterate until stable.
  for (let i = 0; i < 3; i++) {
    const offsetMinutes = getTimeZoneOffsetMinutes(new Date(candidate), timeZone);
    adjusted = localTarget - offsetMinutes * MIN_MS;
    if (adjusted === candidate) {
      break;
    }
    candidate = adjusted;
  }

  if (adjusted !== candidate) {
    throw new AppError('INTERNAL_ERROR', 'Timezone offset did not converge');
  }

  const resolvedDateStr = getLocalDateString(new Date(adjusted), timeZone);
  if (resolvedDateStr !== dateStr) {
    throw new AppError('VALIDATION_ERROR', `Invalid calendar date: ${dateStr}`);
  }

  return adjusted;
}

export function getLocalHour(date: Date, timeZone: string): number {
  validateTimeZone(timeZone);

  return Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hour12: false,
    }).format(date)
  );
}
