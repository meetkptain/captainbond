import { describe, it, expect } from 'vitest';
import { ritualConstellationCategory } from './ritualCategory';

describe('ritualConstellationCategory', () => {
  it('maps intensity 1 to CHILL/ICEBREAKER', () => {
    expect(ritualConstellationCategory(1, 'RECONNECTION')).toBe('CHILL');
    expect(ritualConstellationCategory(1, 'COMMUNICATION')).toBe('ICEBREAKER');
    expect(ritualConstellationCategory(1, null)).toBe('CHILL');
  });

  it('maps intensity 2 to DATE/DEEP', () => {
    expect(ritualConstellationCategory(2, 'RECONNECTION')).toBe('DATE');
    expect(ritualConstellationCategory(2, 'SHARED_PROJECT')).toBe('DATE');
    expect(ritualConstellationCategory(2, 'COMMUNICATION')).toBe('DEEP');
    expect(ritualConstellationCategory(2, null)).toBe('DEEP');
  });

  it('maps intensity 3 to DEEP/SPICY', () => {
    expect(ritualConstellationCategory(3, 'INTIMACY')).toBe('SPICY');
    expect(ritualConstellationCategory(3, 'RECONNECTION')).toBe('DEEP');
  });

  it('never returns the legacy "daily" bucket', () => {
    const cats = [1, 2, 3].flatMap((i) =>
      ['RECONNECTION', 'COMMUNICATION', 'INTIMACY', 'SHARED_PROJECT', null].map((t) =>
        ritualConstellationCategory(i, t),
      ),
    );
    expect(cats).not.toContain('daily');
  });
});
