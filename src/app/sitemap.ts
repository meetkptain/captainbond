import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

const staticPages = [
  { path: '/', priority: 1, freq: 'weekly' as const },
  { path: '/pricing', priority: 0.9, freq: 'weekly' as const },
  { path: '/fr/tarifs', priority: 0.9, freq: 'weekly' as const },
  { path: '/fr', priority: 1, freq: 'weekly' as const },
  { path: '/party', priority: 0.9, freq: 'weekly' as const },
  { path: '/fr/soiree', priority: 0.9, freq: 'weekly' as const },
  { path: '/couple', priority: 0.8, freq: 'weekly' as const },
  { path: '/fr/couple', priority: 0.8, freq: 'weekly' as const },
  { path: '/pro', priority: 0.8, freq: 'weekly' as const },
  { path: '/fr/pro', priority: 0.8, freq: 'weekly' as const },
  { path: '/corporate', priority: 0.7, freq: 'monthly' as const },
  { path: '/fr/corporate', priority: 0.7, freq: 'monthly' as const },
  { path: '/corporate/onboarding-recrutement', priority: 0.6, freq: 'monthly' as const },
  { path: '/fr/corporate/onboarding-recrutement', priority: 0.6, freq: 'monthly' as const },
  { path: '/corporate/rse-qvt', priority: 0.6, freq: 'monthly' as const },
  { path: '/fr/corporate/rse-qvt', priority: 0.6, freq: 'monthly' as const },
  { path: '/b2b/bars-cafes', priority: 0.7, freq: 'monthly' as const },
  { path: '/fr/b2b/bars-cafes', priority: 0.7, freq: 'monthly' as const },
  { path: '/privacy', priority: 0.3, freq: 'yearly' as const },
  { path: '/fr/privacy', priority: 0.3, freq: 'yearly' as const },
  { path: '/blog', priority: 0.7, freq: 'weekly' as const },
  { path: '/fr/blog', priority: 0.7, freq: 'weekly' as const },
  { path: '/printables/couple-questions-deck', priority: 0.5, freq: 'monthly' as const },
];

const blogPostsEn = [
  '/blog/questions-to-ask-your-partner',
  '/blog/questions-pour-couple',
  '/blog/50-deep-questions-for-couples',
  '/blog/couple-questions-complete-guide',
  '/blog/weekly-couple-ritual',
  '/blog/couple-communication-exercises',
  '/blog/questions-to-build-intimacy',
  '/blog/best-couple-app-2026',
  '/blog/couple-connection-data-study',
  '/blog/best-party-games-for-adults-2026',
  '/blog/how-to-host-game-night',
  '/blog/icebreaker-games-for-adults',
  '/blog/increase-bar-revenue-weeknight',
  '/blog/best-party-games-for-large-groups',
  '/blog/halloween-party-games-adults',
  '/blog/bar-trivia-night-guide',
];

const blogPostsFr = [
  '/fr/blog/questions-a-poser-a-son-partenaire',
  '/fr/blog/questions-pour-couple',
  '/fr/blog/50-questions-profondes-couple',
  '/fr/blog/questions-couple-guide-complet',
  '/fr/blog/rituel-couple-hebdomadaire',
  '/fr/blog/exercices-communication-couple',
  '/fr/blog/questions-pour-construire-intimite',
  '/fr/blog/meilleure-application-couple-2026',
  '/fr/blog/etude-donnees-connexion-couple',
  '/fr/blog/meilleurs-jeux-soiree-adulte-2026',
  '/fr/blog/organiser-soiree-jeux',
  '/fr/blog/jeux-brise-glace-adultes',
  '/fr/blog/augmenter-chiffre-bar-semaine',
  '/fr/blog/meilleurs-jeux-de-soiree-grand-groupe',
  '/fr/blog/jeux-halloween-adultes',
  '/fr/blog/guide-soiree-quiz-bar',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = staticPages.map((p) => ({
    url: `${siteUrl}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));

  const blogEntriesEn = blogPostsEn.map((p) => ({
    url: `${siteUrl}${p}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const blogEntriesFr = blogPostsFr.map((p) => ({
    url: `${siteUrl}${p}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntriesEn, ...blogEntriesFr];
}
