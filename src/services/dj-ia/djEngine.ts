import * as repositories from '@/lib/db/repositories';
import { generateContent } from '@/lib/gemini';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * Analyzes the neural tree context (including connections and average resonance) 
 * and generates a personalized, highly context-driven question using Gemini.
 * @param profileId Unique DJProfile ID
 */
export async function generateDJQuestion(profileId: string): Promise<string> {
  const profile = await repositories.getDJProfileById(profileId);
  if (!profile) {
    throw new AppError('NOT_FOUND', `Profil DJ avec l'ID ${profileId} introuvable.`);
  }

  // 1. Fetch tree associated with the profile
  let treeId: string | null = null;
  if (profile.coupleId) {
    const tree = await repositories.getTreeByCouple(profile.coupleId);
    treeId = tree?.id || null;
  } else if (profile.roomId) {
    const tree = await repositories.getTreeByRoom(profile.roomId);
    treeId = tree?.id || null;
  }

  // 2. Fetch past nodes and connections to calculate resonance metrics
  let historyText = '';
  let resonanceMetricsText = '';
  let avgResonance = 0.85; // default fallback if no connections exist

  if (treeId) {
    try {
      const [nodes, connections] = await Promise.all([
        repositories.listTreeNodes(treeId),
        repositories.listTreeConnections(treeId)
      ]);

      // Compile last 10 questions/topics
      const recentNodes = nodes.slice(-10);
      const historyItems: string[] = [];
      for (const node of recentNodes) {
        if (node.questionId) {
          const q = await repositories.getQuestionById(node.questionId);
          if (q) historyItems.push(`- ${q.text} (Catégorie: ${q.category}, Intensité: ${q.intensityLevel})`);
        } else if (node.customText) {
          historyItems.push(`- ${node.customText} (DJ IA, Intensité: ${node.intensity})`);
        }
      }
      historyText = historyItems.join('\n');

      // Compile resonance statistics
      if (connections.length > 0) {
        avgResonance = connections.reduce((acc, c) => acc + c.resonance, 0) / connections.length;
        const highResonanceCount = connections.filter(c => c.resonance >= 0.85).length;
        
        resonanceMetricsText = `Statistiques de résonance du couple :
- Nombre total de connexions (ponts sémantiques) : ${connections.length}
- Taux de résonance moyen : ${Math.round(avgResonance * 100)}%
- Nombre de connexions à forte résonance (complicité >= 85%) : ${highResonanceCount}`;
      } else {
        resonanceMetricsText = "- Pas encore de connexions sémantiques fortes détectées.";
      }
    } catch (err) {
      logger.error('Failed to compile tree nodes or connections for DJ IA', { treeId }, err instanceof Error ? err : new Error(String(err)));
    }
  }

  // 3. Build the prompt for Gemini, tailoring prompt based on resonance level
  const isHighResonance = avgResonance >= 0.80;

  const prompt = `Tu es le DJ IA de Captain Bond, un party game de complicité et de connexion émotionnelle.
Ta mission est de concevoir une question ou un défi unique sur-mesure pour ce couple, adapté à leur ambiance et à leur taux de résonance relationnel.

Ambiance (mood) du DJ : "${profile.mood}"

${resonanceMetricsText}

Historique récent de leurs échanges sémantiques (dans l'arbre neural) :
${historyText || "- Aucun sujet abordé pour l'instant (nouveau couple)."}

Consignes d'adaptation par rapport au taux de résonance :
${isHighResonance 
  ? `- Le couple montre une très forte complicité sémantique (${Math.round(avgResonance * 100)}%). Félicite-les subtilement ou fais une remarque relationnelle chaleureuse intégrée directement dans la question.` 
  : `- Le couple a un taux de résonance plus faible ou débute. Propose une question d'ouverture particulièrement accessible, douce et bienveillante pour créer le premier pont de complicité.`
}

Consignes d'écriture pour l'ambiance "${profile.mood}" :
- "CHILL" : Question détendue, amusante, propice à de petites anecdotes drôles.
- "DEEP" : Question profonde, invitant aux souvenirs d'enfance, aux émotions sincères et à la vulnérabilité mutuelle.
- "SPICY" : Question stimulante, piquante, jouant sur le flirt, les secrets ou les fantasmes.
- "PROVOCATIVE" : Question qui pousse à la réflexion critique, remet en question des habitudes ou taquine gentiment les petits travers du partenaire.

Règles strictes :
1. Écris UNE seule question ou défi direct, rédigé à la deuxième personne du pluriel (vous).
2. Ne mets aucun texte d'introduction ni de conclusion.
3. Reste percutant, court (maximum 2 phrases) et élégant.
4. Pas de guillemets autour du résultat. Rends directement le texte de la carte.`;

  // 4. Generate the question using Gemini
  let generatedText = '';
  try {
    generatedText = await generateContent(prompt);
  } catch (err) {
    logger.error('Gemini failed to generate DJ question', { profileId }, err instanceof Error ? err : new Error(String(err)));
    // Fallback if Gemini fails
    const fallbackQuestions: Record<string, string[]> = {
      CHILL: ["Partagez une anecdote ridicule de votre semaine qui vous a fait sourire.", "Si vous deviez définir l'autre en un seul ingrédient de cuisine, ce serait quoi et pourquoi ?"],
      DEEP: ["À quel moment précis de votre relation vous êtes-vous sentis le plus en sécurité l'un avec l'autre ?", "Quel est le rêve le plus fou que vous n'avez pas encore osé partager de peur d'être jugé ?"],
      SPICY: ["Quelle est la première chose physique ou d'attitude qui vous attire chez l'autre en ce moment ?", "Décrivez le rendez-visite idéal et sensuel dont vous rêvez en secret."],
    };
    const moodQuestions = fallbackQuestions[profile.mood] || fallbackQuestions.CHILL;
    generatedText = moodQuestions[Math.floor(Math.random() * moodQuestions.length)];
  }

  // 5. Store the generated question
  await repositories.createDJQuestion({
    profileId,
    text: generatedText,
    status: 'PENDING',
  });

  return generatedText;
}
