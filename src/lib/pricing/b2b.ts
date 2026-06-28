export type B2BFormula = 'self-service' | 'facilitator' | 'enterprise' | 'custom';

export interface B2BQuote {
  formula: B2BFormula;
  unitPrice: number;
  label: string;
  description: string;
}

export function getB2BQuote(participants: number, lang: 'fr' | 'en' = 'en'): B2BQuote {
  if (participants <= 40) {
    return {
      formula: 'self-service',
      unitPrice: 25,
      label: lang === 'fr' ? 'Self-service' : 'Self-service',
      description: lang === 'fr' 
        ? 'Accès à la plateforme Captain Bond pour un événement autonome.'
        : 'Access to the Captain Bond platform for an autonomous event.',
    };
  }

  if (participants <= 120) {
    return {
      formula: 'facilitator',
      unitPrice: 35,
      label: lang === 'fr' ? 'Avec facilitateur dédié' : 'With dedicated facilitator',
      description: lang === 'fr'
        ? 'Un animateur Captain Bond accompagne votre événement de A à Z.'
        : 'A Captain Bond animator accompanies your event from A to Z.',
    };
  }

  if (participants <= 300) {
    return {
      formula: 'enterprise',
      unitPrice: 45,
      label: lang === 'fr' ? 'Grand compte' : 'Enterprise',
      description: lang === 'fr'
        ? 'Solution clé en main pour séminaires et événements d\'envergure.'
        : 'Turnkey solution for large-scale seminars and events.',
    };
  }

  return {
    formula: 'custom',
    unitPrice: 45,
    label: lang === 'fr' ? 'Sur mesure' : 'Custom',
    description: lang === 'fr'
      ? 'Contactez-nous pour une proposition adaptée à vos besoins.'
      : 'Contact us for a proposal adapted to your needs.',
  };
}

export function estimateB2BPrice(participants: number, lang: 'fr' | 'en' = 'en'): number {
  const quote = getB2BQuote(participants, lang);
  return participants * quote.unitPrice;
}
