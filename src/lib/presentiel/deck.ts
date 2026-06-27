export interface DeckQuestion {
  id: string;
  text: string;
  intensityLevel?: number;
  tags?: string[];
  mode: string;
}

export interface DeckPlayer {
  name: string;
}

export function sequenceDeck(questionsList: DeckQuestion[]): DeckQuestion[] {
  if (questionsList.length < 3) return questionsList;

  const lvl1 = questionsList.filter(q => (q.intensityLevel || 1) === 1).sort(() => Math.random() - 0.5);
  const lvl2 = questionsList.filter(q => (q.intensityLevel || 1) === 2).sort(() => Math.random() - 0.5);
  const lvl3 = questionsList.filter(q => (q.intensityLevel || 1) === 3).sort(() => Math.random() - 0.5);

  const sequenced: DeckQuestion[] = [];

  if (lvl1.length > 0) sequenced.push(lvl1.pop()!);
  if (lvl1.length > 0) {
    sequenced.push(lvl1.pop()!);
  } else if (lvl2.length > 0) {
    sequenced.push(lvl2.pop()!);
  }

  if (lvl2.length > 0) sequenced.push(lvl2.pop()!);
  if (lvl2.length > 0) {
    sequenced.push(lvl2.pop()!);
  } else if (lvl3.length > 0) {
    sequenced.push(lvl3.pop()!);
  }

  if (lvl3.length > 0) sequenced.push(lvl3.pop()!);

  const positiveQ = [...lvl1, ...lvl2, ...lvl3].find(q => q.tags?.includes('positive') || q.tags?.includes('date_safe'));
  if (positiveQ) {
    sequenced.push(positiveQ);
  } else if (lvl1.length > 0) {
    sequenced.push(lvl1.pop()!);
  } else if (lvl2.length > 0) {
    sequenced.push(lvl2.pop()!);
  }

  const remaining = [...lvl1, ...lvl2, ...lvl3].sort(() => Math.random() - 0.5);
  sequenced.push(...remaining);

  return sequenced;
}

export function injectWildcards(
  questionsList: DeckQuestion[],
  players: DeckPlayer[],
  modeId: string
): DeckQuestion[] {
  if (players.length < 2) return sequenceDeck(questionsList);

  const wildcards: DeckQuestion[] = [];

  const p1 = players[Math.floor(Math.random() * players.length)].name;
  let p2 = players[Math.floor(Math.random() * players.length)].name;
  while (p2 === p1 && players.length > 1) {
    p2 = players[Math.floor(Math.random() * players.length)].name;
  }

  wildcards.push({
    id: `wc-ping-pong-${Date.now()}`,
    text: `${p1}, cite 3 qualités ou anecdotes sur ${p2} en moins de 15 secondes ! ⏱️`,
    intensityLevel: 1,
    tags: ['wildcard', 'positive'],
    mode: modeId
  });

  const p3 = players[Math.floor(Math.random() * players.length)].name;
  let p4 = players[Math.floor(Math.random() * players.length)].name;
  while (p4 === p3 && players.length > 1) {
    p4 = players[Math.floor(Math.random() * players.length)].name;
  }
  wildcards.push({
    id: `wc-rebond-${Date.now()}`,
    text: `${p3} doit répondre à la question suivante, mais c'est ${p4} qui doit deviner sa réponse secrète avant qu'elle ne soit dite !`,
    intensityLevel: 2,
    tags: ['wildcard'],
    mode: modeId
  });

  const sequenced = sequenceDeck(questionsList);
  if (sequenced.length >= 4) {
    sequenced.splice(1, 0, wildcards[0]);
    sequenced.splice(4, 0, wildcards[1]);
  } else {
    sequenced.push(...wildcards);
  }

  return sequenced;
}

const IMPOSTEUR_QUESTION_MAPPING: Record<string, string> = {
  "Tes 3 pires anecdotes de soirée ?": "Tes 3 pires anecdotes de repas de famille ?",
  "Tes 3 pires ruptures amoureuses ?": "Tes 3 pires râteaux ou rendez-vous ratés ?",
  "Tes 3 pires mensonges au boulot ?": "Tes 3 pires bêtises à l'école quand tu étais enfant ?",
};

export function getImposteurQuestion(civilQuestion: string): string {
  if (IMPOSTEUR_QUESTION_MAPPING[civilQuestion]) {
    return IMPOSTEUR_QUESTION_MAPPING[civilQuestion];
  }
  const lower = civilQuestion.toLowerCase();
  if (lower.includes("soirée") || lower.includes("soirées")) {
    return "Tes 3 pires anecdotes de repas de famille ?";
  }
  if (lower.includes("rupture") || lower.includes("ruptures")) {
    return "Tes 3 pires râteaux ou rendez-vous ratés ?";
  }
  if (lower.includes("mensonge") || lower.includes("mensonges")) {
    return "Tes 3 pires bêtises à l'école quand tu étais enfant ?";
  }
  return civilQuestion + " (sur un thème légèrement différent)";
}
