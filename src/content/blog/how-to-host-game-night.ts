import type { BlogPost } from '@/lib/content/types';

// MIGRATED from legacy page.tsx — body (sections.p) + geoBlock + related to enrich.
export const post: BlogPost = {
  slug: "how-to-host-game-night",
  locale: "en",
  hub: "party" as const,
  title: "How to Host an Unforgettable Game Night: The Ultimate Guide | Captain Bond",
  description: "Plan, host and clean up a game night that people will talk about for weeks. Guest list tips, game selection by group size, setup tricks and hosting etiquette.",
  frSlug: "organiser-soiree-jeux",
  ogImage: "/og/blog-how-to-host-game-night-en.webp",
  published: "2026-07-10",
  readTime: "X min read",
  faq: [
    { q: 'TODO question', a: 'TODO answer' },
    { q: 'TODO question', a: 'TODO answer' },
    { q: 'TODO question', a: 'TODO answer' }
  ],
  takeaways: [
    "Invite 4–8 guests for the best group dynamics and game compatibility.",
    "Select 2–3 games that match your group size, energy level, and time budget.",
    "Prep the space, snacks, and audio beforehand so you can host instead of scramble.",
    "Keep the mood inclusive: explain rules clearly, rotate turns fairly, and read the room.",
    "End on a high note with a short, light game and a clear wrap-up signal."
  ],
  sections: [
    { h2: "1. Guest list and planning", p: "" },
    { h2: "2. Game selection by group size", p: "" },
    { h2: "3. Setting the scene", p: "" },
    { h2: "4. Hosting like a pro", p: "" },
    { h2: "5. Cleanup and encore", p: "" }
  ],
  related: [
    { slug: "best-party-games-for-adults-2026", title: "Best Party Games for Adults 2026: Top Picks for Game Night | Captain Bond", description: "The ultimate guide to the best party games for adults in 2026. From card games and board games to drinking games and no-" },
    { slug: "board-games-apero", title: "Best Board Games for Apéro Night (That Actually Get People Talking)", description: "A curated shortlist of apéro-friendly board games — low rules, high banter, perfect for warm-ups before the real reveal." },
    { slug: "jeux-societe-apero", title: "Meilleurs jeux de société pour apéro (ceux qui font vraiment discuter)", description: "Une sélection de jeux de société apéro-friendly — peu de règles, beaucoup de blagues, parfaits en échauffement avant le " }
  ],
  geoBlock: 'TODO: write a 40+ char paragraph tuned for AI search / answer engines.',
  cta: { heading: 'Ready?', text: 'Discover Captain Bond.', href: "/party" },
  endingQuestion: 'TODO ending question?',
};
