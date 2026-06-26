import { Question } from '@/lib/db/types';

export type QuestionForDeck = Pick<Question, 'id' | 'text' | 'mode' | 'intensityLevel' | 'tags'>;

export interface BuildQuestionPoolInput {
  allQuestions: QuestionForDeck[];
  currentMode: string;
  roomRound: number;
  previousIntensity: number;
  playedQuestionIds?: Iterable<string>;
  random?: () => number;
}

function roomRoundWouldNeedPositive(currentMode: string, roomRound: number): boolean {
  return currentMode === 'ICEBREAKER' && roomRound > 0 && (roomRound + 1) % 3 === 0;
}

export function filterByMode(
  questions: QuestionForDeck[],
  currentMode: string
): QuestionForDeck[] {
  if (currentMode === 'DATE_NIGHT') {
    return questions.filter((q) => q.tags?.includes('date_safe'));
  }

  if (currentMode === 'FAMILY') {
    return questions.filter((q) => q.mode === currentMode && q.tags?.includes('positive'));
  }

  return questions.filter((q) => q.mode === currentMode);
}

export function applyRoundSpecificFilter(
  pool: QuestionForDeck[],
  currentMode: string,
  roomRound: number
): QuestionForDeck[] {
  if (roomRoundWouldNeedPositive(currentMode, roomRound)) {
    return pool.filter((q) => q.tags?.includes('positive'));
  }

  return pool;
}

export function selectDateNightPool(
  poolWithoutRepeats: QuestionForDeck[],
  previousIntensity: number,
  roomRound: number,
  random: () => number
): QuestionForDeck[] {
  if (roomRound === 0) {
    return poolWithoutRepeats;
  }

  if (previousIntensity === 3) {
    return poolWithoutRepeats.filter((q) => (q.intensityLevel || 1) <= 2);
  }

  const deepPool = poolWithoutRepeats.filter((q) => q.intensityLevel === 3);
  const lightPool = poolWithoutRepeats.filter((q) => (q.intensityLevel || 1) <= 2);

  return random() < 0.3 && deepPool.length > 0 ? deepPool : lightPool;
}

function filterByPreviousIntensity(
  poolWithoutRepeats: QuestionForDeck[],
  previousIntensity: number,
  currentMode: string,
  roomRound: number,
  random: () => number
): QuestionForDeck[] {
  if (currentMode === 'DATE_NIGHT') {
    return selectDateNightPool(poolWithoutRepeats, previousIntensity, roomRound, random);
  }

  if (previousIntensity === 3) {
    return poolWithoutRepeats.filter((q) => (q.intensityLevel || 1) <= 2);
  }

  return poolWithoutRepeats;
}

function buildModeFallback(allQuestions: QuestionForDeck[], currentMode: string): QuestionForDeck[] {
  if (currentMode === 'DATE_NIGHT') {
    return allQuestions.filter((q) => q.tags?.includes('date_safe'));
  }

  return allQuestions.filter((q) => q.mode === currentMode);
}

export function buildQuestionPool(input: BuildQuestionPoolInput): QuestionForDeck[] {
  const { allQuestions, currentMode, roomRound, previousIntensity, playedQuestionIds, random = Math.random } = input;

  let pool = filterByMode(allQuestions, currentMode);
  pool = applyRoundSpecificFilter(pool, currentMode, roomRound);

  const playedIdsSet = new Set(playedQuestionIds);
  const poolWithoutRepeats = pool.filter((q) => !playedIdsSet.has(q.id));

  pool = filterByPreviousIntensity(poolWithoutRepeats, previousIntensity, currentMode, roomRound, random);

  if (currentMode === 'DATE_NIGHT' && roomRound === 0) {
    pool = pool.filter((q) => q.intensityLevel === 1 && q.tags?.includes('icebreaker'));
  }

  if (!pool.length) {
    pool = buildModeFallback(allQuestions, currentMode);
  }

  return pool;
}
