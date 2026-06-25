export type DeckVibe = 'ICEBREAKER' | 'SPICY' | 'SECRETS' | 'NOSTALGIA';
export type QuestionMode = 'ICEBREAKER' | 'SPICY' | 'DEEP_CONNECTION' | 'IMPOSTEUR' | 'MOST_LIKELY_TO';

export interface CustomQuestion {
  id: string;
  text: string;
  mode: QuestionMode;
  intensityLevel: 1 | 2 | 3;
  involvedPlayers: string[]; // Player names required for this card to make sense
  isGeneric: boolean; // true if card works with anyone
}

export interface CustomDeck {
  id: string;
  title: string;
  createdAt: string;
  friends: string[]; // All original friend names
  vibes: DeckVibe[]; // Selected vibes
  groupContext: string; // Brief context (e.g. 'Vacances Ibiza 2025')
  questions: CustomQuestion[];
  isPurchased: boolean; // Whether the full 60 cards are unlocked
}
