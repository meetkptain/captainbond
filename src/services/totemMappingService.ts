import { generateContent } from '@/lib/gemini';
import { updatePartnerOrbe, computeFusion } from '@/services/totemService';
import type { OrbeState } from '@/lib/db/types';
import { safeJsonParse } from '@/lib/json';
import { createLogger } from '@/lib/logger';

const log = createLogger({ route: 'totem-mapping', method: 'POST' });

/**
 * Prompt système pour convertir une réponse textuelle en paramètres d'Orbe.
 * Le LLM retourne un JSON strict avec les valeurs de morphing.
 */
const TOTEM_MAPPING_PROMPT = `Tu es un analyste émotionnel. Analyse le texte de réponse d'un partenaire à une question de couple.
Retourne UNIQUEMENT un JSON valide (sans markdown, sans backticks) avec ces champs :
{
  "hue": <number 0-360, ex: bleu=220 réflexion, orange=30 désir, violet=280 tension, vert=120 sérénité>,
  "energy": <number 0.0-1.0, 0=calme 1=agité/intense>,
  "attachmentStyle": <"secure"|"anxious"|"avoidant"|"disorganized">,
  "particleDensity": <number 0.0-1.0, densité émotionnelle du texte>,
  "pulseRate": <number 0.5-3.0, rythme émotionnel>
}

Règles :
- Réponse courte/évasive → energy basse, avoidant, particleDensity basse
- Réponse longue/vulnérable → energy moyenne, secure, particleDensity haute
- Réponse défensive/reproche → energy haute, anxious, hue vers violet/rouge
- Réponse tendre/positive → energy moyenne, secure, hue vers bleu/vert
- Réponse sexuelle/désir → energy haute, hue orange, pulseRate élevé`;

/**
 * Analyse la réponse textuelle d'un partenaire et met à jour son Orbe.
 * Appelé après chaque soumission de réponse au rituel quotidien.
 */
export async function mapAnswerToOrbe(
  coupleId: string,
  userId: string,
  user1Id: string,
  answerText: string
): Promise<OrbeState | null> {
  try {
    const result = await generateContent(
      TOTEM_MAPPING_PROMPT,
      `Réponse du partenaire : "${answerText}"`
    );

    const parsed = safeJsonParse<Partial<OrbeState> | null>(result, null);
    if (!parsed) {
      log.warn('Totem mapping: LLM returned invalid JSON', { result });
      return null;
    }

    // Validation des bornes
    const orbeUpdate: Partial<OrbeState> = {
      hue: clamp(parsed.hue ?? 220, 0, 360),
      energy: clamp(parsed.energy ?? 0.5, 0, 1),
      attachmentStyle: validateAttachment(parsed.attachmentStyle),
      particleDensity: clamp(parsed.particleDensity ?? 0.5, 0, 1),
      pulseRate: clamp(parsed.pulseRate ?? 1.0, 0.5, 3.0),
    };

    const updated = await updatePartnerOrbe(coupleId, userId, user1Id, orbeUpdate);
    await computeFusion(coupleId);

    const isA = userId === user1Id;
    return isA ? updated.stateA : updated.stateB;
  } catch (err) {
    log.error('Totem mapping failed', {}, err);
    return null;
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function validateAttachment(style: string | undefined): OrbeState['attachmentStyle'] {
  const valid = ['secure', 'anxious', 'avoidant', 'disorganized'] as const;
  if (style && (valid as readonly string[]).includes(style)) {
    return style as OrbeState['attachmentStyle'];
  }
  return 'secure';
}
