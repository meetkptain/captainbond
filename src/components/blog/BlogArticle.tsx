import Link from 'next/link';
import type { BlogPost, BlogSection } from '@/lib/content/types';

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sectionId(section: BlogSection, i: number): string {
  return section.id ?? slugify(section.h2) ?? `section-${i}`;
}

function buildFaqSchema(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

function buildArticleSchema(post: BlogPost, url: string) {
  const author = post.author ?? DEFAULT_AUTHOR;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.ogImage,
    datePublished: post.published,
    dateModified: post.modified ?? post.published,
    inLanguage: post.locale === 'fr' ? 'fr-FR' : 'en-US',
    articleSection: post.hub ?? 'Games',
    author: { '@type': 'Organization', name: author.name },
    publisher: { '@type': 'Organization', name: 'Captain Bond' },
    // GEO: lets voice assistants / AI overviews read the structured headings aloud.
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.article-body h2'],
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}

const DEFAULT_AUTHOR = { name: 'Captain Bond', initials: 'CB' };
const DEFAULT_CTA = { heading: 'Go deeper together', text: 'Try Captain Bond couple mode', href: '/couple' };

export default function BlogArticle({ post }: { post: BlogPost }) {
  const author = post.author ?? DEFAULT_AUTHOR;
  const cta = post.cta ?? DEFAULT_CTA;
  const basePath = post.locale === 'fr' ? '/fr/blog' : '/blog';
  const showToc = post.toc ?? post.sections.length >= 4;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';
  const articleUrl = `${SITE_URL}${basePath}/${post.slug}`;
  const metaLine = [
    post.published,
    post.modified ? `Updated ${post.modified}` : null,
    post.readTime ?? '5 min read',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(post)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleSchema(post, articleUrl)) }}
      />

      <header className="mb-10">
        <time className="text-sm text-slate-400" dateTime={post.published}>
          {post.published}
        </time>
        <h1>{post.title}</h1>
        <p>{post.description}</p>
      </header>

      {post.leadQuote && (
        <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
          <p>{post.leadQuote}</p>
        </blockquote>
      )}

      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-10">
        <h2>Key Takeaways</h2>
        <ul>
          {post.takeaways.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>

      {showToc && (
        <div className="article-card-takeaways">
          <h2>Table of Contents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {post.sections.map((s, i) => (
              <a key={i} href={`#${sectionId(s, i)}`} className="article-toc-link">
                <p className="text-sm font-semibold text-white mt-1">{s.h2}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white font-bold text-lg">
          {author.initials}
        </div>
        <div>
          <p className="font-semibold text-white">{author.name}</p>
          <p className="text-xs text-slate-400">{metaLine}</p>
        </div>
      </div>

      {post.sections.map((s, i) => (
        <section key={i} className="article-block" id={sectionId(s, i)}>
          <h2>{s.h2}</h2>
          {s.p && <p>{s.p}</p>}
          {s.list && s.list.length > 0 && (
            <ul>
              {s.list.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          )}
          {s.quote && (
            <blockquote className="border-l-4 border-neon-pink pl-6 my-8 italic text-slate-200 text-lg">
              <p>{s.quote}</p>
            </blockquote>
          )}
        </section>
      ))}

      {post.geoBlock && (
        <section className="article-block">
          <h2>Why it matters for AI search</h2>
          <p>{post.geoBlock}</p>
        </section>
      )}

      <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
        <h3>{cta.heading}</h3>
        <p className="text-slate-200 mb-4">{post.description}</p>
        <Link
          href={cta.href}
          className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
        >
          {cta.text}
        </Link>
      </aside>

      <p className="article-ending-question">
        {post.endingQuestion ?? 'What question will you ask tonight?'}
      </p>

      {post.related.length > 0 && (
        <section className="article-block">
          <h2>Related articles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {post.related.map((r, i) => (
              <Link key={i} href={`${basePath}/${r.slug}`} className="group">
                <p className="font-semibold text-white">{r.title}</p>
                <p className="text-sm text-slate-400 mt-1">{r.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
