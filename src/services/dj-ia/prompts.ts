import { logger } from '@/lib/logger';

export interface BuildDJPromptInput {
  mood: string;
  avgResonance: number;
  historyText: string;
  resonanceMetricsText: string;
  interactionHistoryText?: string;
  customAnecdotesText?: string;
}

export function buildDJPrompt(input: BuildDJPromptInput): string {
  const isHighResonance = input.avgResonance >= 0.80;

  return `Tu es le DJ IA de Captain Bond, un party game de complicité et de connexion émotionnelle.
Ta mission est de concevoir une question ou un défi unique sur-mesure pour ce couple ou ce groupe, adapté à leur ambiance et à leur taux de résonance relationnel.

Ambiance (mood) du DJ : "${input.mood}"

${input.customAnecdotesText ? `Dossiers réels et anecdotes saisis par les joueurs pour pimenter la partie :
${input.customAnecdotesText}
(RÈGLE CRITIQUE : Rédige une question ou un défi qui fait EXPLICITEMENT référence à l'une de ces anecdotes réelles de manière croustillante !)` : ''}

${input.resonanceMetricsText}

Historique récent de leurs échanges sémantiques (dans l'arbre neural) :
${input.historyText || "- Aucun sujet abordé pour l'instant (nouveau couple)."}

${input.interactionHistoryText ? `Historique de leurs retours sur les questions générées par le DJ IA :
${input.interactionHistoryText}
(Prends en compte ces préférences : évite de reproposer des thèmes rejetés ou similaires et continue sur la lancée des thèmes appréciés)` : ''}

Consignes d'adaptation par rapport au taux de résonance :
${isHighResonance 
  ? `- Le couple montre une très forte complicité sémantique (${Math.round(input.avgResonance * 100)}%). Félicite-les subtilement ou fais une remarque relationnelle chaleureuse intégrée directement dans la question.` 
  : `- Le couple a un taux de résonance plus faible ou débute. Propose une question d'ouverture particulièrement accessible, douce et bienveillante pour créer le premier pont de complicité.`
}

Consignes d'écriture pour l'ambiance "${input.mood}" :
- "CHILL" : Question détendue, amusante, propice à de petites anecdotes drôles.
- "DEEP" : Question profonde, invitant aux souvenirs d'enfance, aux émotions sincères et à la vulnérabilité mutuelle.
- "SPICY" : Question stimulante, piquante, jouant sur le flirt, les secrets ou les fantasmes.
- "PROVOCATIVE" : Question qui pousse à la réflexion critique, remet en question des habitudes ou taquine gentiment les petits travers du partenaire.

Règles strictes :
1. Écris UNE seule question ou défi direct, rédigé à la deuxième personne du pluriel (vous).
2. Ne mets aucun texte d'introduction ni de conclusion.
3. Reste percutant, court (maximum 2 phrases) et élégant.
4. Pas de guillemets autour du résultat. Rends directement le texte de la carte.`;
}

export interface GenerateDJQuestionTextInput {
  profileId: string;
  prompt: string;
  generateContent: (prompt: string) => Promise<string>;
  fallbackQuestions: Record<string, string[]>;
  mood: string;
}

export async function generateDJQuestionText(input: GenerateDJQuestionTextInput): Promise<string> {
  try {
    return await input.generateContent(input.prompt);
  } catch (err) {
    logger.error('Gemini failed to generate DJ question', { profileId: input.profileId }, err instanceof Error ? err : new Error(String(err)));

    const moodQuestions = input.fallbackQuestions[input.mood] || input.fallbackQuestions.CHILL;
    return moodQuestions[Math.floor(Math.random() * moodQuestions.length)];
  }
}
