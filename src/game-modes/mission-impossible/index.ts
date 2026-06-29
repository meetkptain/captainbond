import { GameModeManifest, GameModeEngine } from '../types';

export interface MissionImpossibleQuestion {
  id?: string;
  text?: string;
  correctAnswer?: string;
  options?: string[];
}

export const missionImpossibleManifest: GameModeManifest = {
  id: 'MISSION_IMPOSSIBLE',
  name: 'Mission Impossible',
  description: "Quiz Coopératif d'équipe. Gagnez ou perdez ensemble.",
  roundDurationSeconds: 45,
  minPlayers: 2,
  maxPlayers: 100,
  isPremium: true,
  category: 'corporate',
  profilingCapabilities: { alignment: true, perspicacity: true, deception: false, verbalOnly: false },
  playSetup: { local: true, remote: true, solo: false }
};

export const missionImpossibleEngine: GameModeEngine<MissionImpossibleQuestion, string, unknown> = {
  validateResponse: (res) => {
    if (typeof res !== 'string' || res.trim() === '') {
      return { isValid: false, errorMessage: "Choix invalide", parsedAnswer: null };
    }
    return { isValid: true, parsedAnswer: res.trim() };
  },
  calculateScores: (responses, question) => {
    const correctAnswer = question?.correctAnswer || '';
    if (!correctAnswer) {
      // Si aucune réponse correcte n'est spécifiée, tout le monde gagne 1 point de participation
      return responses.map((r) => ({ playerId: r.playerId, pointsEarned: 1, isCorrect: true }));
    }

    const SKIP = '__SKIP__';
    const validResponses = responses.filter((r) => r.answer !== SKIP);
    if (validResponses.length === 0) {
      return responses.map((r) => ({ playerId: r.playerId, pointsEarned: 0, isCorrect: false }));
    }

    // Compter les votes pour chaque option
    const voteCounts = new Map<string, number>();
    for (const r of validResponses) {
      const option = r.answer;
      voteCounts.set(option, (voteCounts.get(option) || 0) + 1);
    }

    // Déterminer l'option majoritaire
    let majorityOption = '';
    let maxVotes = 0;
    for (const [option, count] of voteCounts.entries()) {
      if (count > maxVotes) {
        maxVotes = count;
        majorityOption = option;
      }
    }

    // La majorité a-t-elle vu juste ?
    const isMajorityCorrect = majorityOption.toLowerCase() === correctAnswer.toLowerCase();

    // Attribution des scores en mode coopératif
    return responses.map((r) => {
      if (r.answer === SKIP) {
        return { playerId: r.playerId, pointsEarned: 0, isCorrect: false };
      }
      return {
        playerId: r.playerId,
        pointsEarned: isMajorityCorrect ? 1 : 0,
        isCorrect: isMajorityCorrect,
      };
    });
  }
};
