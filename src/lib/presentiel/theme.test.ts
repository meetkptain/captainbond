import { describe, it, expect } from 'vitest';
import { getQuestionTheme } from './theme';

describe('getQuestionTheme', () => {
  it('detects love and breakup themes', () => {
    expect(getQuestionTheme({ text: 'Ta pire rupture amoureuse ?' })).toBe('💔 Amours & Ruptures');
    expect(getQuestionTheme({ text: 'Ton plus gros râteau ?' })).toBe('💔 Amours & Ruptures');
    expect(getQuestionTheme({ text: 'Parle-moi de ton ex ' })).toBe('💔 Amours & Ruptures');
  });

  it('detects lies and secrets themes', () => {
    expect(getQuestionTheme({ text: 'Le plus gros mensonge que tu as dit ?' })).toBe(
      '🤫 Mensonges & Secrets'
    );
    expect(getQuestionTheme({ text: 'Un bluff qui a marché ?' })).toBe('🤫 Mensonges & Secrets');
  });

  it('detects party and alcohol themes', () => {
    expect(getQuestionTheme({ text: 'Ta pire soirée ?' })).toBe('🎉 Anecdotes de Soirée');
    expect(getQuestionTheme({ text: 'Une fête qui a mal tourné ?' })).toBe('🎉 Anecdotes de Soirée');
    expect(getQuestionTheme({ text: 'Boire un verre entre amis...' })).toBe('🎉 Anecdotes de Soirée');
  });

  it('detects school and work themes', () => {
    expect(getQuestionTheme({ text: 'Ton pire boulot ?' })).toBe('🎒 École & Travail');
    expect(getQuestionTheme({ text: 'Un prof mémorable ?' })).toBe('🎒 École & Travail');
    expect(getQuestionTheme({ text: 'Ton collègue le plus bizarre' })).toBe('🎒 École & Travail');
  });

  it('detects embarrassing moments', () => {
    expect(getQuestionTheme({ text: 'Ton moment le plus gênant ?' })).toBe('😬 Moments Gênants');
    expect(getQuestionTheme({ text: 'La pire chose qui te soit arrivée' })).toBe('😬 Moments Gênants');
  });

  it('detects positive and compliment themes from tags', () => {
    expect(getQuestionTheme({ text: 'Un truc cool ?', tags: ['positive'] })).toBe(
      '✨ Compliments & Positif'
    );
    expect(getQuestionTheme({ text: 'Un compliment sincère', tags: ['compliment'] })).toBe(
      '✨ Compliments & Positif'
    );
  });

  it('detects romance and couple themes', () => {
    expect(getQuestionTheme({ text: 'Ton premier couple ?', tags: ['date_safe'] })).toBe(
      '👩‍❤️‍👨 Romance & Couple'
    );
    expect(getQuestionTheme({ text: 'Ta première rencontre amoureuse ?' })).toBe('👩‍❤️‍👨 Romance & Couple');
  });

  it('classifies long questions as deep confidences', () => {
    const longText = 'a'.repeat(81);
    expect(getQuestionTheme({ text: longText })).toBe('💬 Confidences Profondes');
  });

  it('falls back to chill and anecdotes', () => {
    expect(getQuestionTheme({ text: 'Un truc sympa ?' })).toBe('🎲 Chill & Anecdotes');
    expect(getQuestionTheme({ text: 'Raconte une histoire.' })).toBe('🎲 Chill & Anecdotes');
  });
});
