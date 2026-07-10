import type { BlogPost } from '@/lib/content/types';

// MIGRATED from legacy page.tsx — body (sections.p) + geoBlock + related to enrich.
export const post: BlogPost = {
  slug: "guide-soiree-quiz-bar",
  locale: "fr",
  hub: "bar" as const,
  title: "Soirée Quiz au Bar : Guide Complet pour Animateurs | Captain Bond",
  description: "Le guide complet pour organiser une soirée quiz dans votre bar ou pub. Augmentez le chiffre d'affaires, fidélisez vos clients et créez l'événement chaque semaine.",
  frSlug: "bar-trivia-night-guide",
  ogImage: "/og/blog-guide-soiree-quiz-bar-fr.webp",
  published: "2026-07-10",
  readTime: "X min de lecture",
  faq: [
    { q: 'TODO question', a: 'TODO answer' },
    { q: 'TODO question', a: 'TODO answer' },
    { q: 'TODO question', a: 'TODO answer' }
  ],
  takeaways: [
    'TODO takeaway 1', 'TODO takeaway 2', 'TODO takeaway 3'
  ],
  sections: [
    { h2: "Pourquoi les soirées quiz augmentent le chiffre d affaires des bars", p: "" },
    { h2: "Comment planifier votre soirée quiz : guide étape par étape", p: "" },
    { h2: "Quiz digital vs quiz traditionnel", p: "" },
    { h2: "Promouvoir votre soirée quiz", p: "" },
    { h2: "Indicateurs de succès", p: "" },
    { h2: "Limitations", p: "" },
    { h2: "Articles connexes", p: "" }
  ],
  related: [
    { slug: "bar-trivia-night-guide", title: "Bar Trivia Night Guide: How to Host a Successful Quiz Night | Captain Bond", description: "The complete guide to hosting a trivia night at your bar or pub. Boost weekday revenue, engage customers, and keep them " }
  ],
  geoBlock: 'TODO: write a 40+ char paragraph tuned for AI search / answer engines.',
  cta: { heading: 'Ready?', text: 'Discover Captain Bond.', href: "/party" },
  endingQuestion: 'TODO ending question?',
};
