import * as repositories from '@/lib/db/repositories';
import { generateContent } from '@/lib/gemini';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { buildDJPrompt, generateDJQuestionText } from './prompts';

interface TreeContext {
  historyText: string;
  resonanceMetricsText: string;
  avgResonance: number;
}

interface DJProfile {
  id: string;
  mood: string;
  coupleId?: string | null;
  roomId?: string | null;
}

const fallbackQuestions: Record<string, string[]> = {
  CHILL: ["Partagez une anecdote ridicule de votre semaine qui vous a fait sourire.", "Si vous deviez définir l'autre en un seul ingrédient de cuisine, ce serait quoi et pourquoi ?"],
  DEEP: ["À quel moment précis de votre relation vous êtes-vous sentis le plus en sécurité l'un avec l'autre ?", "Quel est le rêve le plus fou que vous n'avez pas encore osé partager de peur d'être jugé ?"],
  SPICY: ["Quelle est la première chose physique ou d'attitude qui vous attire chez l'autre en ce moment ?", "Décrivez le rendez-visite idéal et sensuel dont vous rêvez en secret."],
};

async function compileTreeContext(profile: Pick<DJProfile, 'coupleId' | 'roomId'>): Promise<TreeContext> {
  let treeId: string | null = null;
  if (profile.coupleId) {
    const tree = await repositories.getTreeByCouple(profile.coupleId);
    treeId = tree?.id || null;
  } else if (profile.roomId) {
    const tree = await repositories.getTreeByRoom(profile.roomId);
    treeId = tree?.id || null;
  }

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

  return { historyText, resonanceMetricsText, avgResonance };
}

export interface InteractionItem {
  questionText: string;
  status: 'ACCEPTED' | 'REJECTED';
  feedback?: string;
  timestamp: string;
}

function compileInteractionHistoryText(profileHistory: unknown): string {
  const history = profileHistory as { items?: InteractionItem[] } | null;
  if (!history || !history.items || history.items.length === 0) {
    return '';
  }
  const lines = history.items.slice(-5).map((item) => 
    `- Question: "${item.questionText}" | Statut: ${item.status}${item.feedback ? ` | Retours: "${item.feedback}"` : ''}`
  );
  return lines.join('\n');
}

/**
 * Analyzes the neural tree context (including connections and average resonance) 
 * and generates a personalized, highly context-driven question using Gemini.
 * @param profileId Unique DJProfile id
 */
export async function generateDJQuestion(profileId: string): Promise<string> {
  const profile = await repositories.getDJProfileById(profileId);
  if (!profile) {
    throw new AppError('NOT_FOUND', `Profil DJ avec l'ID ${profileId} introuvable.`);
  }

  const { historyText, resonanceMetricsText, avgResonance } = await compileTreeContext(profile);
  const interactionHistoryText = compileInteractionHistoryText(profile.interactionHistory);

  const prompt = buildDJPrompt({
    mood: profile.mood,
    avgResonance,
    historyText,
    resonanceMetricsText,
    interactionHistoryText,
  });

  const generatedText = await generateDJQuestionText({
    profileId,
    prompt,
    generateContent,
    fallbackQuestions,
    mood: profile.mood,
  });

  await repositories.createDJQuestion({
    profileId,
    text: generatedText,
    status: 'PENDING',
  });

  return generatedText;
}

/**
 * Records player feedback on a DJQuestion and stores it in the DJProfile history
 * for continuous learning (apprentissage continu).
 */
export async function updateDJQuestionFeedback(
  questionId: string,
  status: 'ACCEPTED' | 'REJECTED',
  feedback?: string
): Promise<void> {
  const question = await repositories.getDJQuestionById(questionId);
  if (!question) {
    throw new AppError('NOT_FOUND', `Question DJ avec l'ID ${questionId} introuvable.`);
  }

  // Update status in database
  await repositories.updateDJQuestionStatus(questionId, { status, feedback });

  // Update profile interaction history
  const profile = await repositories.getDJProfileById(question.profileId);
  if (profile) {
    const history = (profile.interactionHistory || { items: [] }) as { items?: InteractionItem[] };
    if (!history.items) history.items = [];

    history.items.push({
      questionText: question.text,
      status,
      feedback,
      timestamp: new Date().toISOString(),
    });

    await repositories.updateDJProfile(profile.id, {
      interactionHistory: history as unknown as Record<string, unknown>, // Cast to Json format compatible with prisma/supabase JSONB
    });
  }
}
