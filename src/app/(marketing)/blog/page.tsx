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
  { href: '/blog/50-deep-questions-for-couples', title: '50 Deep Questions for Couples to Reconnect', excerpt: 'Strengthen your bond with 50 deep questions for couples organized by theme — vulnerability, past, values, love, and dreams.' },
  { href: '/blog/questions-to-ask-your-partner', title: '100+ Questions to Ask Your Partner', excerpt: 'The ultimate list of questions to ask your partner — organized by relationship stage. Deep, fun and intimate questions for every couple.' },
  { href: '/blog/questions-to-build-intimacy', title: '30 Questions to Build Intimacy', excerpt: 'Intimacy-building questions for couples across emotional, physical, and intellectual dimensions. Strengthen your bond tonight.' },
  { href: '/blog/couple-questions-complete-guide', title: 'Couple Questions: The Complete Guide', excerpt: '150+ couple questions across 5 connection levels — fun, deep, intimate, and future. Turn every conversation into real intimacy.' },
  { href: '/blog/questions-pour-couple', title: '150 Questions for Couples: From Fun to Deep', excerpt: 'A curated list of conversation starters covering fun, intimacy, values and future dreams — plus how to turn them into a weekly ritual.' },
  { href: '/blog/couple-communication-exercises', title: '10 Couple Communication Exercises', excerpt: '10 practical communication exercises for couples — from mirroring to conflict scripts — backed by relationship science.' },
  { href: '/blog/weekly-couple-ritual', title: 'How to Create a Weekly Couple Ritual', excerpt: 'A simple 20-minute weekly ritual that keeps your relationship connected, intentional, and intimate.' },
  { href: '/blog/best-couple-app-2026', title: 'Best Couple App 2026: 5 Tested & Compared', excerpt: 'We tested 5 couple apps in 2026 — Captain Bond, Paired, LoveNudge, Gottman Card Decks, and Lasting. Compare features and pricing.' },
  { href: '/blog/couple-connection-data-study', title: 'Couple Connection Data Study', excerpt: 'Original research from 1,237 Captain Bond couple sessions. Discover data on harmony scores, conversation depth, and the science of connection.' },
  { href: '/blog/icebreaker-games-for-adults', title: '50 Icebreaker Games for Adults', excerpt: '50 no-equipment icebreaker games for adults. Quick, team, virtual, get-to-know-you, and deep games for parties, work, and dates.' },
  { href: '/blog/best-party-games-for-adults-2026', title: 'Best Party Games for Adults 2026', excerpt: 'The ultimate guide to the best party games for adults in 2026. Ranked for your next game night.' },
  { href: '/blog/best-party-games-for-large-groups', title: 'Best Party Games for Large Groups', excerpt: 'Party games for large groups of 10-50+ people. Phone-controlled, TV-displayed games that everyone can play.' },
  { href: '/blog/how-to-host-game-night', title: 'How to Host an Unforgettable Game Night', excerpt: 'Plan, host and clean up a game night that people will talk about for weeks. The ultimate hosting guide.' },
  { href: '/blog/halloween-party-games-adults', title: 'Halloween Party Games for Adults', excerpt: 'The best Halloween party games for adults. Spooky icebreakers, costume contests, and group games for 2026.' },
  { href: '/blog/increase-bar-revenue-weeknight', title: 'How to Increase Bar Revenue on Weeknights', excerpt: '5 proven strategies to boost Tuesday–Thursday bar revenue without hiring: themed nights, AI-powered entertainment, and more.' },
  { href: '/blog/bar-trivia-night-guide', title: 'Bar Trivia Night Guide', excerpt: 'The complete guide to hosting a trivia night at your bar or pub. Boost revenue and keep customers coming back.' },
];

export default function BlogIndexPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 >Captain Bond Blog</h1>
        <p className="text-slate-300 max-w-xl mx-auto">
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
