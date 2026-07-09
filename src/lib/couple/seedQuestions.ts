export type SeedCategory =
  | 'CHILL'
  | 'ICEBREAKER'
  | 'DEEP'
  | 'SPICY'
  | 'DATE'
  | 'PARTY';

export interface SeedQuestion {
  id: string;
  category: SeedCategory;
  text: string;
  intensity: number;
}

/**
 * 15 branded couple questions (Captain Bond voice).
 * Used to seed a "starter sky" when a couple is created so the
 * constellation is never empty on day 0.
 *
 * Categories match DEFAULT_CATEGORIES in src/lib/constellation/layout.ts
 * (CHILL / ICEBREAKER / DEEP / SPICY / DATE / PARTY) so the radial
 * layout places each prompt in its own sector.
 */
export const COUPLE_SEED_QUESTIONS: SeedQuestion[] = [
  // ICEBREAKER
  { id: 'seed-icebreaker-1', category: 'ICEBREAKER', text: 'Quel est ton plus grand talent inutile ?', intensity: 1 },
  { id: 'seed-icebreaker-2', category: 'ICEBREAKER', text: 'Quel film peut te faire pleurer en 10 min ?', intensity: 1 },
  { id: 'seed-icebreaker-3', category: 'ICEBREAKER', text: 'Quel surnom secret détestes-tu qu’on oublie ?', intensity: 1 },

  // CHILL
  { id: 'seed-chill-1', category: 'CHILL', text: 'Ton rituel du dimanche idéal ?', intensity: 1 },
  { id: 'seed-chill-2', category: 'CHILL', text: 'Quelle série on reregarde en boucle ?', intensity: 1 },
  { id: 'seed-chill-3', category: 'CHILL', text: 'Ta cuisine de réconfort ultime ?', intensity: 1 },

  // DEEP
  { id: 'seed-deep-1', category: 'DEEP', text: 'Qu’est-ce qui te fait sentir aimé(e) ?', intensity: 2 },
  { id: 'seed-deep-2', category: 'DEEP', text: 'Quelle peur tu n’avoues qu’à moi ?', intensity: 3 },
  { id: 'seed-deep-3', category: 'DEEP', text: 'Quel rêve tu repousses depuis des années ?', intensity: 2 },

  // DATE
  { id: 'seed-date-1', category: 'DATE', text: 'Notre meilleur souvenir à deux ?', intensity: 2 },
  { id: 'seed-date-2', category: 'DATE', text: 'Un endroit où m’emmener demain ?', intensity: 1 },

  // SPICY
  { id: 'seed-spicy-1', category: 'SPICY', text: 'Le mensonge innocent que tu me fais souvent ?', intensity: 2 },
  { id: 'seed-spicy-2', category: 'SPICY', text: 'Ton fantasme de date surprise ?', intensity: 3 },

  // PARTY
  { id: 'seed-party-1', category: 'PARTY', text: 'Notre anecdote de soirée la plus mythique ?', intensity: 1 },
  { id: 'seed-party-2', category: 'PARTY', text: 'Quel ami doit absolument nous voir ensemble ?', intensity: 1 },
];
