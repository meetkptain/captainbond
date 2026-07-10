import type { BlogPost } from '@/lib/content/types';

// MIGRATED from legacy page.tsx — body (sections.p) + geoBlock + related to enrich.
export const post: BlogPost = {
  slug: "organiser-soiree-jeux",
  locale: "fr",
  hub: "party" as const,
  title: "Organiser une soirée jeux inoubliable : le guide ultime | Captain Bond",
  description: "Planifiez, animez et concluez une soirée jeux dont on parlera encore longtemps. Liste d'invités, choix des jeux par taille de groupe, astuces d'organisation et étiquette du parfait hôte.",
  frSlug: "how-to-host-game-night",
  ogImage: "/og/blog-organiser-soiree-jeux-fr.webp",
  published: "2026-07-10",
  readTime: "X min de lecture",
  faq: [
    { q: 'TODO question', a: 'TODO answer' },
    { q: 'TODO question', a: 'TODO answer' },
    { q: 'TODO question', a: 'TODO answer' }
  ],
  takeaways: [
    "Invitez 4 à 8 personnes pour une dynamique de groupe optimale.",
    "Choisissez 2 à 3 jeux adaptés à la taille du groupe, à l'ambiance et au temps disponible.",
    "Préparez l'espace, les snacks et l'ambiance sonore à l'avance pour profiter de la soirée.",
    "Restez inclusif : expliquez les règles clairement, faites tourner les tours et lisez la salle.",
    "Terminez sur une note positive avec un jeu court et un signal de fin clair."
  ],
  sections: [
    { h2: "Points clés à retenir", p: "" },
    { h2: "1. Liste d'invités et planification", p: "" },
    { h2: "2. Choix des jeux par taille de groupe", p: "" },
    { h2: "3. Préparer le terrain", p: "" },
    { h2: "4. Animer en professionnel", p: "" },
    { h2: "5. Rangement et prochaine session", p: "" }
  ],
  related: [
    { slug: "best-party-games-for-adults-2026", title: "Best Party Games for Adults 2026: Top Picks for Game Night | Captain Bond", description: "The ultimate guide to the best party games for adults in 2026. From card games and board games to drinking games and no-" },
    { slug: "board-games-apero", title: "Best Board Games for Apéro Night (That Actually Get People Talking)", description: "A curated shortlist of apéro-friendly board games — low rules, high banter, perfect for warm-ups before the real reveal." },
    { slug: "how-to-host-game-night", title: "How to Host an Unforgettable Game Night: The Ultimate Guide | Captain Bond", description: "Plan, host and clean up a game night that people will talk about for weeks. Guest list tips, game selection by group siz" }
  ],
  geoBlock: 'TODO: write a 40+ char paragraph tuned for AI search / answer engines.',
  cta: { heading: 'Ready?', text: 'Discover Captain Bond.', href: "/party" },
  endingQuestion: 'TODO ending question?',
};
