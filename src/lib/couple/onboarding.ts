export interface OnboardingStep {
  day: number;
  title: string;     // French (default)
  titleEn: string;
  done: boolean;
}

export function getOnboardingCurrentDay(createdAt?: string): number {
  if (!createdAt) return 1;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return 1;
  const now = new Date();
  const diffDays = Math.floor(
    (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) -
      Date.UTC(created.getUTCFullYear(), created.getUTCMonth(), created.getUTCDate())) /
      (1000 * 60 * 60 * 24)
  );
  return Math.min(7, Math.max(1, diffDays + 1));
}

export function getOnboardingSteps(completedDays: number[]): OnboardingStep[] {
  return [
    { day: 1, title: 'Appairer nos profils', titleEn: 'Link our profiles', done: completedDays.includes(1) },
    { day: 2, title: 'Répondre à la première question', titleEn: 'Answer the first question', done: completedDays.includes(2) },
    { day: 3, title: 'Découvrir notre révélation', titleEn: 'Discover our reveal', done: completedDays.includes(3) },
    { day: 4, title: 'Explorer le Totem', titleEn: 'Explore the Totem', done: completedDays.includes(4) },
    { day: 5, title: 'Sceller une TimeCapsule', titleEn: 'Seal a TimeCapsule', done: completedDays.includes(5) },
    { day: 6, title: 'Tester un pack thématique', titleEn: 'Try a themed pack', done: completedDays.includes(6) },
    { day: 7, title: 'Valider notre premier rituel hebdomadaire', titleEn: 'Lock in our first weekly ritual', done: completedDays.includes(7) },
  ];
}
