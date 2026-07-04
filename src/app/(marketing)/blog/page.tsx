import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Captain Bond Blog — Couple Questions, Games & Rituals',
  description:
    'Couple questions, connection games and weekly rituals to deepen your relationship, spark real conversations and build intimacy with Captain Bond.',
  alternates: {
    canonical: `${siteUrl}/blog`,
    languages: {
      'x-default': `${siteUrl}/blog`,
      'en': `${siteUrl}/blog`,
      'fr': `${siteUrl}/fr/blog`,
    },
  },
  openGraph: {
    title: 'Captain Bond Blog — Couple Questions, Games & Rituals',
    description:
      'Couple questions, connection games and weekly rituals to deepen your relationship, spark real conversations and build intimacy with Captain Bond.',
    url: `${siteUrl}/blog`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/blog-questions-couple-en.webp`,
        width: 1200,
        height: 630,
        alt: 'Captain Bond Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Captain Bond Blog — Couple Questions, Games & Rituals',
    description:
      'Couple questions, connection games and weekly rituals to deepen your relationship, spark real conversations and build intimacy with Captain Bond.',
    images: [`${siteUrl}/og/blog-questions-couple-en.webp`],
  },
};

const posts = [
  {
    href: '/blog/questions-pour-couple',
    title: '150 questions for couples: from fun to deep',
    excerpt:
      'A curated list of conversation starters covering fun, intimacy, values and future dreams — plus how to turn them into a weekly ritual.',
  },
  {
    href: '/fr/blog/questions-pour-couple',
    title: '(FR) 150 questions pour couple : du fun au profond',
    excerpt:
      'La version française de notre guide de questions pour couple, des plus légères aux plus profondes.',
  },
  {
    href: '/blog/rituel-hebdo-couple',
    title: 'How to create a weekly couple ritual',
    excerpt:
      'A simple framework for a 20-minute weekly check-in that keeps busy couples connected. Coming soon.',
  },
];

export default function BlogIndexPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 >Captain Bond Blog</h1>
        <p className="text-slate-300 leading-relaxed max-w-xl mx-auto">
          Couple questions, connection games and weekly rituals to help you slow down, talk honestly
          and grow closer — one question at a time.
        </p>
      </header>

      <ul className="space-y-8">
        {posts.map((post) => (
          <li key={post.href}>
            <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-neon-purple/30">
              <Link
                href={post.href}
                className="block text-xl font-semibold text-white hover:text-neon-pink mb-2"
              >
                {post.title}
              </Link>
              <p>{post.excerpt}</p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
