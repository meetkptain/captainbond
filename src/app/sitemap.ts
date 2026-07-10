import { MetadataRoute } from 'next';
import { allPosts } from '@/content/blog';
import { legacyPosts } from '@/content/legacy';

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

type SitemapPost = {
  slug: string;
  locale: 'en' | 'fr';
  frSlug?: string;
  lastMod: string;
};

// One combined source: content-layer (full) + legacy (metadata mirror).
const combined: SitemapPost[] = [
  ...allPosts.map((p) => ({
    slug: p.slug,
    locale: p.locale,
    frSlug: p.frSlug,
    lastMod: p.modified ?? p.published,
  })),
  ...legacyPosts.map((p) => ({
    slug: p.slug,
    locale: p.locale,
    frSlug: p.frSlug,
    lastMod: p.modified ?? p.published,
  })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = staticPages.map((p) => ({
    url: `${siteUrl}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));

  const blogEntries = combined.map((p) => {
    const url = `${siteUrl}${p.locale === 'fr' ? '/fr' : ''}/blog/${p.slug}`;
    const languages: Record<string, string> = { 'x-default': url };
    if (p.frSlug) {
      languages['en'] = `${siteUrl}/blog/${p.frSlug}`;
      languages['fr'] = `${siteUrl}/fr/blog/${p.frSlug}`;
    }
    return {
      url,
      lastModified: new Date(p.lastMod),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: { languages },
    };
  });

  return [...staticEntries, ...blogEntries];
}
