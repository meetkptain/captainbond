export type B2BFormula = 'self-service' | 'facilitator' | 'enterprise' | 'custom';

export interface B2BQuote {
  formula: B2BFormula;
  unitPrice: number;
  label: string;
  description: string;
}

export function getB2BQuote(participants: number): B2BQuote {
  if (participants <= 40) {
    return {
      formula: 'self-service',
      unitPrice: 25,
      label: 'Self-service',
      description: 'Accès à la plateforme Captain Bond pour un événement autonome.',
    };
  }

  if (participants <= 120) {
    return {
      formula: 'facilitator',
      unitPrice: 35,
      label: 'Avec facilitateur dédié',
      description: 'Un animateur Captain Bond accompagne votre événement de A à Z.',
    };
  }

  if (participants <= 300) {
    return {
      formula: 'enterprise',
      unitPrice: 45,
      label: 'Grand compte',
      description: 'Solution clé en main pour séminaires et événements d\'envergure.',
    };
  }

  return {
    formula: 'custom',
    unitPrice: 45,
    label: 'Sur mesure',
    description: 'Contactez-nous pour une proposition adaptée à vos besoins.',
  };
}

export function estimateB2BPrice(participants: number): number {
  const quote = getB2BQuote(participants);
  return participants * quote.unitPrice;
}
