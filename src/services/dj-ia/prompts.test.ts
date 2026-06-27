import { describe, it, expect, vi } from 'vitest';
import { buildDJPrompt, generateDJQuestionText } from './prompts';

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('buildDJPrompt', () => {
  it('includes mood and metrics', () => {
    const prompt = buildDJPrompt({
      mood: 'DEEP',
      avgResonance: 0.9,
      historyText: '- Some history',
      resonanceMetricsText: 'Some metrics',
    });

    expect(prompt).toContain('Ambiance (mood) du DJ : "DEEP"');
    expect(prompt).toContain('Some metrics');
    expect(prompt).toContain('- Some history');
    expect(prompt).toContain('90%');
  });
});

describe('generateDJQuestionText', () => {
  it('returns generated text on success', async () => {
    const generateContent = vi.fn().mockResolvedValue('Generated question');

    const result = await generateDJQuestionText({
      profileId: 'profile-1',
      prompt: 'prompt',
      generateContent,
      fallbackQuestions: { CHILL: ['Fallback'] },
      mood: 'CHILL',
    });

    expect(result).toBe('Generated question');
    expect(generateContent).toHaveBeenCalledWith('prompt');
  });

  it('returns fallback on failure', async () => {
    const generateContent = vi.fn().mockRejectedValue(new Error('Gemini offline'));

    const result = await generateDJQuestionText({
      profileId: 'profile-1',
      prompt: 'prompt',
      generateContent,
      fallbackQuestions: { CHILL: ['Fallback 1', 'Fallback 2'] },
      mood: 'CHILL',
    });

    expect(result).toBeTypeOf('string');
    expect(result.length).toBeGreaterThan(0);
    expect(['Fallback 1', 'Fallback 2']).toContain(result);
  });
});
