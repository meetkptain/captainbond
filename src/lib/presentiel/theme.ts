export interface ThemedQuestion {
  text: string;
  tags?: string[];
}

export function getQuestionTheme(q: ThemedQuestion): string {
  const text = q.text.toLowerCase();

  if (text.includes('rupture') || text.includes('rateau') || text.includes('râteau') || text.includes('ex ')) {
    return '💔 Amours & Ruptures';
  }

  if (text.includes('mensonge') || text.includes('menti') || text.includes('bluff') || text.includes('tromp')) {
    return '🤫 Mensonges & Secrets';
  }

  if (
    text.includes('soirée') ||
    text.includes('fête') ||
    text.includes('alcool') ||
    text.includes('boire') ||
    text.includes('party')
  ) {
    return '🎉 Anecdotes de Soirée';
  }

  if (
    text.includes('boulot') ||
    text.includes('travail') ||
    text.includes('école') ||
    text.includes('classe') ||
    text.includes('prof') ||
    text.includes('collègue')
  ) {
    return '🎒 École & Travail';
  }

  if (text.includes('honte') || text.includes('pire') || text.includes('gênant') || text.includes('ridicule')) {
    return '😬 Moments Gênants';
  }

  if (q.tags?.includes('positive') || q.tags?.includes('compliment')) {
    return '✨ Compliments & Positif';
  }

  if (
    q.tags?.includes('date_safe') ||
    text.includes('couple') ||
    text.includes('rencontre') ||
    text.includes('amour')
  ) {
    return '👩‍❤️‍👨 Romance & Couple';
  }

  if (text.length > 80) {
    return '💬 Confidences Profondes';
  }

  return '🎲 Chill & Anecdotes';
}
