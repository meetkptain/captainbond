// Single source of truth for blog article shape.
// Articles are pure data objects (see src/content/blog/*.ts); the
// BlogArticle renderer derives ALL SEO/structure from these fields.
// Agents fill this type — they never touch JSX/components.

export type BlogLocale = 'en' | 'fr';

export interface BlogFaqItem {
  q: string;
  a: string;
}

export interface BlogSection {
  h2: string;
  /** Anchor id for the TOC. Auto-slugified from h2 when omitted. */
  id?: string;
  p?: string;
  list?: string[];
  /** Optional blockquote rendered at the end of the section. */
  quote?: string;
}

export interface BlogRelatedItem {
  /** Slug relative to /blog or /fr/blog (no leading slash). */
  slug: string;
  title: string;
  description: string;
}

export interface BlogCta {
  heading: string;
  text: string;
  href: string;
}

export interface BlogAuthor {
  name: string;
  initials: string;
}

export interface BlogPost {
  /** Unique within its locale. */
  slug: string;
  locale: BlogLocale;
  title: string;
  description: string;
  /** Counterpart slug in the other locale, for alternates. */
  frSlug?: string;
  /** Path under /public, e.g. /og/blog-<slug>-<lang>.webp */
  ogImage: string;
  /** ISO date, e.g. '2026-07-10' */
  published: string;
  modified?: string;
  readTime?: string;
  author?: BlogAuthor;
  faq: BlogFaqItem[];
  takeaways: string[];
  /** Decorative blockquote shown right after the header. */
  leadQuote?: string;
  sections: BlogSection[];
  related: BlogRelatedItem[];
  cta?: BlogCta;
  /** GEO / AI-citation paragraph block. */
  geoBlock?: string;
  endingQuestion?: string;
  /** Force TOC render; auto-enabled when sections.length >= 4. */
  toc?: boolean;
  /** Content hub — drives internal-linking variety, OG styling, and `articleSection`. */
  hub?: 'party' | 'couple' | 'bar';
}

/**
 * Minimal shape for the legacy (pre-content-layer) articles.
 * Extracted from their `page.tsx` metadata by scripts/sync-legacy.ts so
 * sitemap + audit cover ALL articles from one combined list.
 * Bodies stay in their original JSX — only SEO metadata is mirrored here.
 */
export interface BlogPostLite {
  slug: string;
  locale: BlogLocale;
  title: string;
  description: string;
  frSlug?: string;
  ogImage: string;
  published: string;
  modified?: string;
}
