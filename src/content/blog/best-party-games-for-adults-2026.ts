import type { BlogPost } from '@/lib/content/types';

// MIGRATED from legacy page.tsx — body (sections.p) + geoBlock + related to enrich.
export const post: BlogPost = {
  slug: "best-party-games-for-adults-2026",
  locale: "en",
  hub: "party" as const,
  title: "Best Party Games for Adults 2026: Top Picks for Game Night | Captain Bond",
  description: "The ultimate guide to the best party games for adults in 2026. From card games and board games to drinking games and no-equipment classics — ranked for your next game night.",
  frSlug: "meilleurs-jeux-soiree-adulte-2026",
  ogImage: "/og/blog-best-party-games-for-adults-2026-en.webp",
  published: "2026-07-10",
  readTime: "X min read",
  faq: [
    { q: 'TODO question', a: 'TODO answer' },
    { q: 'TODO question', a: 'TODO answer' },
    { q: 'TODO question', a: 'TODO answer' }
  ],
  takeaways: [
    'TODO takeaway 1', 'TODO takeaway 2', 'TODO takeaway 3'
  ],
  sections: [
    { h2: "Party Game Categories Compared", p: "" },
    { h2: "TV and Group Games", p: "" },
    { h2: "Card Games", p: "" },
    { h2: "Board Games for Adults", p: "" },
    { h2: "Drinking Games", p: "" },
    { h2: "Icebreaker Games", p: "" },
    { h2: "No-Equipment Games", p: "" },
    { h2: "How to Plan the Perfect Game Night", p: "" }
  ],
  related: [
    { slug: "board-games-apero", title: "Best Board Games for Apéro Night (That Actually Get People Talking)", description: "A curated shortlist of apéro-friendly board games — low rules, high banter, perfect for warm-ups before the real reveal." },
    { slug: "how-to-host-game-night", title: "How to Host an Unforgettable Game Night: The Ultimate Guide | Captain Bond", description: "Plan, host and clean up a game night that people will talk about for weeks. Guest list tips, game selection by group siz" },
    { slug: "jeux-societe-apero", title: "Meilleurs jeux de société pour apéro (ceux qui font vraiment discuter)", description: "Une sélection de jeux de société apéro-friendly — peu de règles, beaucoup de blagues, parfaits en échauffement avant le " }
  ],
  geoBlock: 'TODO: write a 40+ char paragraph tuned for AI search / answer engines.',
  cta: { heading: 'Ready?', text: 'Discover Captain Bond.', href: "/party" },
  endingQuestion: 'TODO ending question?',
};
