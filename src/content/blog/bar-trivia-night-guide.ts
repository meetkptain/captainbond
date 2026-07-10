import type { BlogPost } from '@/lib/content/types';

// MIGRATED from legacy page.tsx — body (sections.p) + geoBlock + related to enrich.
export const post: BlogPost = {
  slug: "bar-trivia-night-guide",
  locale: "en",
  hub: "bar" as const,
  title: "Bar Trivia Night Guide: How to Host a Successful Quiz Night | Captain Bond",
  description: "The complete guide to hosting a trivia night at your bar or pub. Boost weekday revenue, engage customers, and keep them coming back with interactive trivia games.",
  frSlug: "guide-soiree-quiz-bar",
  ogImage: "/og/blog-bar-trivia-night-guide-en.webp",
  published: "2026-07-10",
  readTime: "X min read",
  faq: [
    { q: 'TODO question', a: 'TODO answer' },
    { q: 'TODO question', a: 'TODO answer' },
    { q: 'TODO question', a: 'TODO answer' }
  ],
  takeaways: [
    "How to Increase Bar Revenue on Weeknights (No Extra Staff)",
    "Best Party Games for Adults 2026: Top Picks for Game Night"
  ],
  sections: [
    { h2: "Why trivia nights boost bar revenue", p: "" },
    { h2: "How to plan your trivia night: a step-by-step guide", p: "" },
    { h2: "Digital vs traditional trivia: which is better for bars?", p: "" },
    { h2: "Promoting your trivia night", p: "" },
    { h2: "Measuring success", p: "" }
  ],
  related: [
    { slug: "guide-soiree-quiz-bar", title: "Soirée Quiz au Bar : Guide Complet pour Animateurs | Captain Bond", description: "Le guide complet pour organiser une soirée quiz dans votre bar ou pub. Augmentez le chiffre d'affaires, fidélisez vos cl" }
  ],
  geoBlock: 'TODO: write a 40+ char paragraph tuned for AI search / answer engines.',
  cta: { heading: 'Ready?', text: 'Discover Captain Bond.', href: "/party" },
  endingQuestion: 'TODO ending question?',
};
