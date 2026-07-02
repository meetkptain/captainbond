import { describe, it, expect } from 'vitest';
import {
  startOfDayInTz,
  setHourInTz,
  getLocalHour,
  getLocalDateString,
  PARIS_TZ,
} from '@/lib/time';
import { AppError } from '@/lib/errors';

describe('time helpers', () => {
  it('returns UTC instant for local midnight in Paris (CEST)', () => {
    const instant = startOfDayInTz('2026-07-02', PARIS_TZ);
    expect(new Date(instant).toISOString()).toBe('2026-07-01T22:00:00.000Z');
  });

  it('returns UTC instant for local midnight in Paris (CET)', () => {
    const instant = startOfDayInTz('2026-01-15', PARIS_TZ);
    expect(new Date(instant).toISOString()).toBe('2026-01-14T23:00:00.000Z');
  });

  it('returns local hour for a UTC instant', () => {
    const hour = getLocalHour(new Date('2026-07-02T10:00:00Z'), PARIS_TZ);
    expect(hour).toBe(12);
  });

  it('sets a local hour and returns UTC instant', () => {
    const instant = setHourInTz('2026-07-02', 12, PARIS_TZ);
    expect(new Date(instant).toISOString()).toBe('2026-07-02T10:00:00.000Z');
    expect(getLocalHour(new Date(instant), PARIS_TZ)).toBe(12);
  });

  it('sets local noon', () => {
    expect(getLocalHour(new Date(setHourInTz('2026-07-02', 12, PARIS_TZ)), PARIS_TZ)).toBe(12);
  });

  it('handles DST for Paris in July', () => {
    // CEST = UTC+2, so local noon is 10:00 UTC.
    const instant = setHourInTz('2026-07-02', 12, PARIS_TZ);
    expect(new Date(instant).toISOString()).toBe('2026-07-02T10:00:00.000Z');
  });

  it('handles fractional offset (Asia/Kolkata)', () => {
    const instant = setHourInTz('2026-07-02', 12, 'Asia/Kolkata');
    expect(new Date(instant).toISOString()).toBe('2026-07-02T06:30:00.000Z');
    expect(getLocalHour(new Date(instant), 'Asia/Kolkata')).toBe(12);
  });

  it('handles non-whole-hour offset (America/St_Johns)', () => {
    const instant = setHourInTz('2026-07-02', 12, 'America/St_Johns');
    expect(new Date(instant).toISOString()).toBe('2026-07-02T14:30:00.000Z');
    expect(getLocalHour(new Date(instant), 'America/St_Johns')).toBe(12);
  });

  it('throws for invalid timezone', () => {
    expect(() => setHourInTz('2026-07-02', 12, 'Mars/Phobos')).toThrow(AppError);
    expect(() => setHourInTz('2026-07-02', 12, 'Mars/Phobos')).toThrow('Unsupported timeZone');
  });

  it('throws for empty timezone', () => {
    expect(() => setHourInTz('2026-07-02', 12, '')).toThrow(AppError);
  });

  describe('getLocalDateString', () => {
    it('returns local date string for a normal Paris date', () => {
      expect(getLocalDateString(new Date('2026-07-02T10:00:00Z'), PARIS_TZ)).toBe('2026-07-02');
    });

    it('returns local date string at DST boundary', () => {
      // 2026-03-29T00:30:00Z is 01:30 CET, still 29 March in Paris.
      expect(getLocalDateString(new Date('2026-03-29T00:30:00Z'), PARIS_TZ)).toBe('2026-03-29');
    });

    it('returns local date string in fractional-offset zone', () => {
      expect(getLocalDateString(new Date('2026-07-02T06:30:00Z'), 'Asia/Kolkata')).toBe(
        '2026-07-02'
      );
    });
  });

  describe('setHourInTz DST transitions', () => {
    it('spring-forward gap maps to the earlier valid hour', () => {
      // 2026-03-29 02:00 Paris does not exist because clocks spring forward to 03:00.
      // The helper returns the last valid wall-clock hour before the gap (01:00 CET).
      const instant = setHourInTz('2026-03-29', 2, PARIS_TZ);
      expect(new Date(instant).toISOString()).toBe('2026-03-29T00:00:00.000Z');
      expect(getLocalHour(new Date(instant), PARIS_TZ)).toBe(1);
    });

    it('fall-back ambiguous time returns the post-transition occurrence', () => {
      // 2026-10-25 02:00 Paris occurs twice; return the second (CET) occurrence.
      const instant = setHourInTz('2026-10-25', 2, PARIS_TZ);
      expect(new Date(instant).toISOString()).toBe('2026-10-25T01:00:00.000Z');
      expect(getLocalHour(new Date(instant), PARIS_TZ)).toBe(2);
    });
  });

  describe('setHourInTz validation', () => {
    it('throws for non-integer hour', () => {
      expect(() => setHourInTz('2026-07-02', 12.5, PARIS_TZ)).toThrow(AppError);
    });

    it('throws for negative hour', () => {
      expect(() => setHourInTz('2026-07-02', -1, PARIS_TZ)).toThrow(AppError);
    });

    it('throws for hour > 23', () => {
      expect(() => setHourInTz('2026-07-02', 24, PARIS_TZ)).toThrow(AppError);
    });

    it('throws for malformed dateStr', () => {
      expect(() => setHourInTz('not-a-date', 12, PARIS_TZ)).toThrow(AppError);
    });

    it('throws for non-existent calendar date', () => {
      expect(() => setHourInTz('2026-02-30', 12, PARIS_TZ)).toThrow(AppError);
      expect(() => setHourInTz('2026-02-30', 12, PARIS_TZ)).toThrow('Invalid calendar date');
    });
  });
});
