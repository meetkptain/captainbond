import type { CustomDeck } from './types';

const STORAGE_KEY = 'cb_custom_decks';

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getLocalDecks(): CustomDeck[] {
  if (typeof window === 'undefined') return [];
  return safeJsonParse<CustomDeck[]>(localStorage.getItem(STORAGE_KEY), []);
}

export function saveLocalDeck(deck: CustomDeck): void {
  const decks = getLocalDecks();
  const idx = decks.findIndex((d) => d.id === deck.id);
  if (idx >= 0) {
    decks[idx] = deck;
  } else {
    decks.push(deck);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

export function deleteLocalDeck(deckId: string): void {
  const decks = getLocalDecks().filter((d) => d.id !== deckId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

export function getLocalDeckById(deckId: string): CustomDeck | null {
  const decks = getLocalDecks();
  return decks.find((d) => d.id === deckId) || null;
}
