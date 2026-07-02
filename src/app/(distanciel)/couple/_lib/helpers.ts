export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function getScoreClass(score: number): string {
  if (score >= 0.75) return 'timeline-score-high';
  if (score >= 0.5) return 'timeline-score-medium';
  return 'timeline-score-low';
}

export function getScoreLabel(score: number): string {
  if (score >= 0.85) return 'Fusion';
  if (score >= 0.7) return 'Résonance';
  if (score >= 0.5) return 'Équilibre';
  return 'Exploration';
}
