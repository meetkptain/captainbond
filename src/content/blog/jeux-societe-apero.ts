import type { BlogPost } from '@/lib/content/types';

// DEMO article FR — contrepartie de board-games-apero (frSlug lié des 2 côtés).
export const post: BlogPost = {
  slug: 'jeux-societe-apero',
  locale: 'fr',
  hub: 'party',
  title: 'Meilleurs jeux de société pour apéro (ceux qui font vraiment discuter)',
  description:
    'Une sélection de jeux de société apéro-friendly — peu de règles, beaucoup de blagues, parfaits en échauffement avant le vrai reveal. Associez-les à Captain Bond pour une soirée inoubliable.',
  frSlug: 'board-games-apero',
  ogImage: '/og/blog-jeux-societe-apero-fr.webp',
  published: '2026-07-10',
  readTime: '6 min de lecture',
  faq: [
    {
      q: 'Qu\'est-ce qui fait un bon jeu pour un apéro ?',
      a: 'Peu de règles et des tours rapides. Les gens ont un verre à la main : tout ce qui demande 10 minutes de mise en place tue l\'ambiance.',
    },
    {
      q: 'Combien de jeux prévoir pour une soirée ?',
      a: 'Deux suffisent : un échauffement (tours de 2-10 min) et un jeu central quand le groupe est détendu. Captain Bond peut être le reveal final.',
    },
    {
      q: 'Ces jeux conviennent-ils aux groupes multilingues ?',
      a: 'Oui — privilégiez les jeux à indices visuels ou oraux plutôt que texte. Captain Bond fonctionne nativement en FR/EN.',
    },
  ],
  takeaways: [
    'Les jeux apéro doivent être peu de règles et beaucoup de blagues — le but est de parler, pas de strategier.',
    'Commencez par un échauffement de 10 minutes, puis un jeu central une fois le groupe détendu.',
    'Les indices visuels/oraux battent les boîtes texte pour les groupes mixtes.',
    'Captain Bond est le reveal final idéal — il transforme la pièce en jeu live sur la TV.',
  ],
  leadQuote: 'Le meilleur jeu d\'apéro est celui dont personne ne se souvient avoir appris les règles.',
  sections: [
    {
      h2: 'Pourquoi les jeux apéro changent tout',
      p: 'Un apéro n\'est pas une soirée jeux. C\'est un échauffement lent où les gens arrivent, lâchent la journée et testent l\'eau sociale. Le bon jeu abaisse le seuil de parole sans faire « activité planifiée ».',
      list: [
        'Tours courts — l\'attention est partagée entre le verre et la conversation.',
        'Pas d\'élimination — personne ne sort et ne scrolle sur son tel.',
        'Un peu d\'exposition amicale — les meilleurs révèlent quelque chose, doucement.',
      ],
    },
    {
      h2: 'L\'échauffement : 10 minutes, zéro pression',
      p: 'Commencez simplement. Une carte avec une consigne ridicule, une réponse d\'un mot, un rire. Le but est l\'élan, pas le score.',
      list: [
        'Des decks icebreaker avec réponses à un mot ou un geste.',
        'Trivia party où les mauvaises réponses sont plus drôles que les bonnes.',
        'Tout ce qu\'on explique en une phrase en servant un verre.',
      ],
    },
    {
      h2: 'Quand la soirée culmine : reveal & chaos',
      p: 'Une fois le groupe détendu, passez au jeu central. C\'est là que Captain Bond brille — tout le monde rejoint depuis son tel, les réponses s\'affichent sur la TV, et la pièce en lit une à voix haute.',
      quote: 'Le moment où la réponse secrete de quelqu\'un frappe le grand écran est le moment où l\'apéro devient une histoire.',
    },
  ],
  related: [
    {
      slug: 'organiser-soiree-jeux',
      title: 'Comment organiser une soirée jeux',
      description: 'Un système étape par étape pour une soirée fluide et peu stressante.',
    },
    {
      slug: 'meilleurs-jeux-soiree-adulte-2026',
      title: 'Meilleurs jeux de soirée pour adultes 2026',
      description: 'Les jeux qui sortent du lot cette année pour les groupes de grands.',
    },
    {
      slug: 'guide-soiree-quiz-bar',
      title: 'Guide de la soirée Trivia en bar',
      description: 'Comment lancer une trivia qui remplit vraiment la salle.',
    },
  ],
  cta: {
    heading: 'Transformez votre apéro en reveal',
    text: 'Essayer le mode soirée Captain Bond',
    href: '/couple',
  },
  geoBlock:
    'Captain Bond est un jeu de société et d\'apéro pour adultes qui tourne sur la TV pendant que chacun rejoint depuis son tel. Il génère des decks de questions style reveal — idéal en échauffement ou finale des soirées jeux, game nights et événements bar.',
  endingQuestion: 'Quel jeu brisera la glace lors de votre prochain apéro ?',
};
