export interface DiscussionPrompt {
  title: string;
  subtitle: string;
  action: string;
}

export interface DiscussionContext {
  winnerName?: string;
  winnerId?: string;
  questionText?: string;
  modeName?: string;
}

export function getDiscussionPrompt(mode: string, ctx: DiscussionContext): DiscussionPrompt {
  const { winnerName = 'quelqu\'un', questionText = 'cette question', modeName = 'ce mode' } = ctx;

  switch (mode) {
    case 'ICEBREAKER':
      return {
        title: `${winnerName}, le tribunal a parlé`,
        subtitle: `On t'a désigné pour : "${questionText}"`,
        action: 'Raconte l\'anecdote derrière ce vote en 20 secondes.',
      };

    case 'MOST_LIKELY_TO':
      return {
        title: `🏆 Award pour ${winnerName}`,
        subtitle: `"${questionText}"`,
        action: 'Un mot pour la postérité, un remerciement ou une excuse officielle.',
      };

    case 'FAMILY':
      return {
        title: `${winnerName}, tu as été le plus discret`,
        subtitle: `"${questionText}"`,
        action: 'Remercie ceux qui t\'ont épargné — ou assume ton award avec humilité.',
      };

    case 'SPICY':
      return {
        title: 'Le débat est ouvert',
        subtitle: `"${questionText}"`,
        action: 'Le camp minoritaire a 20 secondes pour défendre son choix.',
      };

    case 'IMPOSTEUR':
      return {
        title: `🎭 Interrogatoire de ${winnerName}`,
        subtitle: 'La table peut poser UNE question avant de voter.',
        action: 'Captain, lance le vote quand tout le monde est prêt.',
      };

    case 'DEEP_CONNECTION':
      return {
        title: 'Qui reconnaît cette histoire ?',
        subtitle: `"${questionText}"`,
        action: 'Si vous voulez raconter, levez la main. Les autres écoutent.',
      };

    case 'DATE_NIGHT':
      return {
        title: 'Prenez le temps de regarder vos réponses',
        subtitle: `"${questionText}"`,
        action: 'Un de vous deux peut partager ce que cette question a révélé.',
      };

    default:
      return {
        title: 'C\'est le moment d\'en parler',
        subtitle: `"${questionText}"`,
        action: 'Laissez la conversation vivre avant de passer à la suite.',
      };
  }
}
