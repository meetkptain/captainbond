export const EMERGENCY_TRUTHS = [
  "J'ai déjà pleuré devant un dessin animé",
  "Je sais imiter l'accent québécois",
  "J'ai déjà volé dans un supermarché quand j'étais enfant",
  "J'ai une peur panique des papillons",
  "J'ai déjà menti sur mon CV pour avoir un job",
  "Je sais faire des crêpes sans les faire sauter",
  "J'ai déjà cassé le téléphone de quelqu'un sans le dire"
] as const;

export const EMERGENCY_LIES = [
  "J'ai déjà fait de la prison pendant 24h",
  "Je suis cousin éloigné avec une célébrité",
  "J'ai gagné un concours de mangeur de hot-dogs",
  "Je me suis déjà fait arrêter par le FBI",
  "J'ai un tatouage secret très gênant"
] as const;

export function pickRandomLie(lies: readonly string[]): string {
  if (lies.length === 0) throw new Error('Need at least one lie');
  return lies[Math.floor(Math.random() * lies.length)];
}

export function pickTwoDistinct<T>(items: readonly T[]): [T, T] {
  if (items.length < 2) {
    throw new Error('pickTwoDistinct requires at least 2 items');
  }

  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return [shuffled[0], shuffled[1]];
}
