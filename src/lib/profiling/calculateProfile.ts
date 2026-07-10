// ================================================================
// CAPTAIN BOND — Moteur de profilage ludique
// ================================================================
// Ce fichier est le "Cerveau" de l'Effet de Dotation.
// Il analyse les Responses et Scores d'un joueur dans une Room
// pour calculer un profil ludique (effet miroir) basé sur
// 3 axes : Alignement (Tendance au consensus), Perspicacité (Empathie), Duperie (Esprit de jeu / Bluff).
//
// v2 : Le moteur est désormais Mode-Aware. Il pondère chaque axe
//      en fonction du mode de jeu d'où proviennent les données.
//      Les modes textuels/oraux n'alimentent pas les mêmes axes
//      que les modes à votes structurés.
// ================================================================

import { MONETIZATION_CONFIG } from '@/lib/config/monetization';

// --- Types ---
export interface ProfileAxis {
  alignment: number;    // 0-100 (0 = Rebelle, 100 = Tendance au consensus)
  perspicacity: number; // 0-100 (0 = Aveugle, 100 = Empathe)
  deception: number;    // 0-100 (0 = Honnête, 100 = Esprit de jeu / Bluff)
}

export interface PlayerProfile {
  archetype: string;
  archetypeEmoji: string;
  barnumText: string;
  axes: ProfileAxis;
  confidencePercent: number; // 0-100
  questionsAnswered: number;
  isReady: boolean;          // true si confiance >= seuil
  axesAvailable: {           // Indique quels axes sont effectivement calculés
    alignment: boolean;
    perspicacity: boolean;
    deception: boolean;
  };
  funniestTrait: string;
}

// --- Réponse enrichie avec le mode de la question ---
export interface EnrichedResponse {
  answer: string;
  isCorrect: boolean | null;
  questionId: string;
  mode: string;              // Le mode de la question (ICEBREAKER, SPICY, etc.)
}

// --- Les 6 Archétypes Barnum ---
const ARCHETYPES = [
  {
    id: 'observateur_stratege',
    name: 'Observateur Stratège',
    emoji: '🎭',
    condition: (a: ProfileAxis, avail: Record<string, boolean>) =>
      avail.perspicacity && avail.deception && a.perspicacity >= 60 && a.deception >= 60,
    text: "Tu lis en tes amis comme dans un livre ouvert. Tu perçois finement les dynamiques du groupe et adaptes ton jeu avec finesse. Ton sens de l'observation aiguisé fait de toi un guide ou un allié précieux lors des soirées."
  },
  {
    id: 'franc_tireur',
    name: 'Le Franc-Tireur Incompris',
    emoji: '🔥',
    condition: (a: ProfileAxis, avail: Record<string, boolean>) =>
      avail.alignment && a.alignment <= 40 && a.perspicacity >= 50,
    text: "Tu comprends les règles sociales, mais tu choisis délibérément de les briser. Ton honnêteté brutale fait de toi l'élément imprévisible de la soirée. On t'aime ou on te craint — jamais entre les deux."
  },
  {
    id: 'observateur_silencieux',
    name: "L'Observateur Silencieux",
    emoji: '👁️',
    condition: (a: ProfileAxis, avail: Record<string, boolean>) =>
      avail.alignment && avail.perspicacity && a.alignment >= 60 && a.perspicacity >= 60,
    text: "Tu ne fais pas de vagues, mais rien ne t'échappe. Tu es la boîte noire de ton groupe d'amis. Tu sais tout de leurs secrets, et ils l'ignorent. Ton calme apparent cache une intelligence sociale redoutable."
  },
  {
    id: 'maitre_du_chaos',
    name: 'Le Maître du Chaos',
    emoji: '💥',
    condition: (a: ProfileAxis, avail: Record<string, boolean>) =>
      avail.alignment && a.alignment <= 40 && a.deception >= 50,
    text: "Tu ne joues pas pour gagner, tu joues pour voir le monde brûler. Tes réponses n'ont aucun sens logique, sauf celui de semer la zizanie. Le chaos est ton élément naturel, et la soirée serait ennuyeuse sans toi."
  },
  {
    id: 'diplomate_ne',
    name: 'Le Diplomate-Né',
    emoji: '🕊️',
    condition: (a: ProfileAxis, avail: Record<string, boolean>) =>
      avail.alignment && a.alignment >= 60 && a.deception <= 40,
    text: "Tu es la colle du groupe. Tu votes avec le consensus non par faiblesse, mais par stratégie sociale. Tu sais que maintenir l'harmonie te donne un pouvoir invisible que les rebelles n'auront jamais."
  },
  {
    // Fallback — s'applique à tout le monde (Effet Barnum pur)
    id: 'agent_double',
    name: "L'Agent Double",
    emoji: '🕶️',
    condition: () => true,
    text: "Tu es un caméléon social. Tu t'adaptes à chaque situation, chaque groupe, chaque question. Personne n'a réussi à te cerner ce soir, et c'est exactement ce que tu voulais. Tu es le joueur le plus dangereux de la table, parce que personne ne sait de quel côté tu es."
  }
];

// --- Modes qui alimentent chaque axe ---
// Ces sets définissent quels modes de jeu alimentent quels axes.
// Un nouveau mode éphémère (ex: HALLOWEEN) peut être ajouté ici,
// ou encore mieux, le manifest du mode déclare ses profilingCapabilities.
const ALIGNMENT_MODES = new Set(['ICEBREAKER', 'SPICY']);
const PERSPICACITY_MODES = new Set(['ICEBREAKER', 'IMPOSTEUR', 'DEEP_CONNECTION']);
const DECEPTION_MODES = new Set(['IMPOSTEUR', 'SPICY']);
const VERBAL_ONLY_MODES = new Set(['DATE_NIGHT']);

// --- Le Moteur de Calcul Adaptatif ---

/**
 * Calcule le profil ludique d'un joueur à partir de ses données de jeu.
 * Version 2 : Mode-Aware — pondère chaque axe selon les modes joués.
 * Fonctionne côté Edge (pas de dépendance Node.js lourde).
 */
export function calculateProfile(
  playerResponses: EnrichedResponse[],
  allRoomResponses: Array<{ playerId: string; answer: string; questionId: string; mode: string }>,
  playerScores: Array<{ points: number }>,
): PlayerProfile {
  // Filtrer les réponses provenant de modes purement oraux (pas de data exploitable)
  const exploitableResponses = playerResponses.filter(r => !VERBAL_ONLY_MODES.has(r.mode));
  const questionsAnswered = exploitableResponses.length;

  // Jauge de confiance : minimum configurable pour un profil "fiable"
  const MIN_QUESTIONS = MONETIZATION_CONFIG.MIN_QUESTIONS_RELIABILITY;
  const confidencePercent = Math.min(100, Math.round((questionsAnswered / MIN_QUESTIONS) * 100));
  const isReady = confidencePercent >= MONETIZATION_CONFIG.CONFIDENCE_THRESHOLD_PERCENT;

  // Identifier quels axes sont disponibles (le joueur a-t-il joué à des modes qui les alimentent ?)
  const modesPlayed = new Set(exploitableResponses.map(r => r.mode));
  const axesAvailable = {
    alignment: [...modesPlayed].some(m => ALIGNMENT_MODES.has(m)),
    perspicacity: [...modesPlayed].some(m => PERSPICACITY_MODES.has(m)),
    deception: [...modesPlayed].some(m => DECEPTION_MODES.has(m)),
  };

  // --- Axe 1 : Alignement (Tendance au consensus vs Rébellion) ---
  // Uniquement calculé sur les réponses des modes ICEBREAKER et SPICY
  let alignmentScore = 50; // Neutre par défaut
  if (axesAvailable.alignment) {
    const alignmentResponses = exploitableResponses.filter(r => ALIGNMENT_MODES.has(r.mode));
    if (alignmentResponses.length > 0) {
      let conformistVotes = 0;
      for (const pr of alignmentResponses) {
        // Trouver toutes les réponses de la salle pour cette question
        const roomAnswers = allRoomResponses
          .filter(r => r.questionId === pr.questionId)
          .map(r => r.answer);

        if (roomAnswers.length > 1) {
          // Trouver la réponse majoritaire
          const freq: Record<string, number> = {};
          for (const a of roomAnswers) {
            freq[a] = (freq[a] || 0) + 1;
          }
          const majority = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
          if (pr.answer === majority) {
            conformistVotes++;
          }
        }
      }
      alignmentScore = Math.round((conformistVotes / alignmentResponses.length) * 100);
    }
  }

  // --- Axe 2 : Perspicacité (Empathie) ---
  // Calculé différemment selon le mode :
  //  - ICEBREAKER/IMPOSTEUR : ratio de réponses correctes (isCorrect)
  //  - DEEP_CONNECTION : ratio de réponses non-skippées (ouverture émotionnelle)
  let perspicacityScore = 50;
  if (axesAvailable.perspicacity) {
    const perspResponses = exploitableResponses.filter(r => PERSPICACITY_MODES.has(r.mode));

    // Sous-ensemble 1 : Modes avec isCorrect exploitable (ICEBREAKER, IMPOSTEUR)
    const correctableResponses = perspResponses.filter(
      r => r.isCorrect !== null && r.mode !== 'DEEP_CONNECTION'
    );
    // Sous-ensemble 2 : Deep Connection — mesure l'ouverture (non-skip)
    const deepResponses = perspResponses.filter(r => r.mode === 'DEEP_CONNECTION');

    let correctRatio = -1;  // -1 = pas de data
    let opennessRatio = -1;

    if (correctableResponses.length > 0) {
      const correctCount = correctableResponses.filter(r => r.isCorrect === true).length;
      correctRatio = correctCount / correctableResponses.length;
    }
    if (deepResponses.length > 0) {
      const nonSkipped = deepResponses.filter(r => r.answer !== '__SKIP__').length;
      opennessRatio = nonSkipped / deepResponses.length;
    }

    // Combiner les deux sources (moyenne pondérée si les deux sont disponibles)
    if (correctRatio >= 0 && opennessRatio >= 0) {
      perspicacityScore = Math.round(((correctRatio * 0.6) + (opennessRatio * 0.4)) * 100);
    } else if (correctRatio >= 0) {
      perspicacityScore = Math.round(correctRatio * 100);
    } else if (opennessRatio >= 0) {
      perspicacityScore = Math.round(opennessRatio * 100);
    }
  }

  // --- Axe 3 : Esprit de jeu / Bluff (Trahison) ---
  // Calculé différemment selon le mode :
  //  - IMPOSTEUR : bonus si le joueur a été imposteur (via les scores obtenus)
  //  - SPICY : mesure le vote minoritaire (anticonformisme stratégique)
  let deceptionScore = 50;
  if (axesAvailable.deception) {
    const deceptionResponses = exploitableResponses.filter(r => DECEPTION_MODES.has(r.mode));

    // Score basé sur les points (heuristique : un bon stratège gagne des points)
    // Le max théorique par question est 3 (imposteur). On normalise sur 3 pts/question.
    const totalPoints = playerScores.reduce((sum, s) => sum + s.points, 0);
    if (deceptionResponses.length > 0) {
      const normalized = (totalPoints / (deceptionResponses.length * 3)) * 100;
      deceptionScore = Math.min(100, Math.round(normalized));
    }

    // Bonus SPICY : voter pour la minorité = signe de duperie
    const spicyResponses = deceptionResponses.filter(r => r.mode === 'SPICY');
    if (spicyResponses.length > 0) {
      let minorityVotes = 0;
      for (const pr of spicyResponses) {
        const roomAnswers = allRoomResponses
          .filter(r => r.questionId === pr.questionId)
          .map(r => r.answer);
        if (roomAnswers.length > 1) {
          const freq: Record<string, number> = {};
          for (const a of roomAnswers) { freq[a] = (freq[a] || 0) + 1; }
          const minority = Object.entries(freq).sort((a, b) => a[1] - b[1])[0][0];
          if (pr.answer === minority) { minorityVotes++; }
        }
      }
      const minorityRatio = minorityVotes / spicyResponses.length;
      // Ajouter un boost de duperie si le joueur vote souvent pour la minorité
      deceptionScore = Math.min(100, Math.round(deceptionScore * 0.6 + minorityRatio * 100 * 0.4));
    }
  }

  const axes: ProfileAxis = {
    alignment: alignmentScore,
    perspicacity: perspicacityScore,
    deception: deceptionScore
  };

  // --- Attribution de l'Archétype ---
  // Les archétypes vérifient quels axes sont disponibles avant de s'appliquer
  const archetype = ARCHETYPES.find(a => a.condition(axes, axesAvailable))!;

  // Générer le trait le plus drôle
  let funniestTrait = "Agent secret en couverture.";
  if (archetype.id === 'observateur_stratege') {
    funniestTrait = `Sait lire dans les pensées (${axes.perspicacity}% d'Empathie) et s'en sert pour guider le groupe avec bienveillance.`;
  } else if (archetype.id === 'franc_tireur') {
    funniestTrait = `Fait sauter le consensus (${100 - axes.alignment}% de Rébellion). Dit toujours tout haut ce que les autres pensent tout bas.`;
  } else if (archetype.id === 'maitre_du_chaos') {
    funniestTrait = `Sème la zizanie stratégiquement (${axes.deception}% d'Esprit de jeu / Bluff). Joue avec les règles pour pimenter la partie.`;
  } else if (archetype.id === 'observateur_silencieux') {
    funniestTrait = `Boîte noire de la table (${axes.perspicacity}% d'Empathie). Connaît tous vos secrets sans jamais rien révéler.`;
  } else if (archetype.id === 'diplomate_ne') {
    funniestTrait = `Colle du groupe (${axes.alignment}% de Tendance au consensus). Vote toujours avec la majorité pour maintenir la paix.`;
  } else if (archetype.id === 'agent_double') {
    funniestTrait = `Impossible à cerner par l'IA. S'adapte à chaque question comme un caméléon social.`;
  }

  return {
    archetype: archetype.name,
    archetypeEmoji: archetype.emoji,
    barnumText: archetype.text,
    axes,
    confidencePercent,
    questionsAnswered,
    isReady,
    axesAvailable,
    funniestTrait
  };
}
