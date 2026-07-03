import { describe, it, expect } from 'vitest';
import { getOnboardingCurrentDay, getOnboardingSteps } from './onboarding';

describe('getOnboardingSteps', () => {
  it('returns 7 steps with French titles and English translations', () => {
    const steps = getOnboardingSteps([]);
    expect(steps).toHaveLength(7);
    expect(steps[0]).toEqual({ day: 1, title: 'Appairer nos profils', titleEn: 'Link our profiles', done: false });
    expect(steps[6]).toEqual({ day: 7, title: "Activer l'abo Premium", titleEn: 'Activate Premium', done: false });
  });

  it('marks completed days as done', () => {
    const steps = getOnboardingSteps([1, 3, 5]);
    expect(steps[0].done).toBe(true);
    expect(steps[1].done).toBe(false);
    expect(steps[2].done).toBe(true);
    expect(steps[4].done).toBe(true);
    expect(steps[6].done).toBe(false);
  });

  it('ignores invalid days', () => {
    const steps = getOnboardingSteps([0, 8, 3]);
    expect(steps[2].done).toBe(true);
    expect(steps.filter((s) => s.done)).toHaveLength(1);
  });
});

describe('getOnboardingCurrentDay', () => {
  it('returns 1 for the same day', () => {
    const createdAt = new Date().toISOString();
    expect(getOnboardingCurrentDay(createdAt)).toBe(1);
  });

  it('returns 7 for 6 days later', () => {
    const created = new Date();
    created.setUTCDate(created.getUTCDate() - 6);
    expect(getOnboardingCurrentDay(created.toISOString())).toBe(7);
  });

  it('clamps to 7 for 8 days later', () => {
    const created = new Date();
    created.setUTCDate(created.getUTCDate() - 8);
    expect(getOnboardingCurrentDay(created.toISOString())).toBe(7);
  });

  it('returns 1 for an invalid date', () => {
    expect(getOnboardingCurrentDay('not-a-date')).toBe(1);
  });

  it('returns 1 when undefined', () => {
    expect(getOnboardingCurrentDay(undefined)).toBe(1);
  });
});
