import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Blog Captain Bond — Questions, Jeux & Rituels de Couple',
  description:
    "Questions de couple, jeux de connexion et rituels hebdomadaires pour approfondir votre relation, relancer les vraies conversations et cultiver l'intimité.",
  alternates: {
    canonical: `${siteUrl}/fr/blog`,
    languages: {
      'x-default': `${siteUrl}/blog`,
      'en': `${siteUrl}/blog`,
      'fr': `${siteUrl}/fr/blog`,
    },
  },
  openGraph: {
    title: 'Blog Captain Bond — Questions, Jeux & Rituels de Couple',
    description:
      "Questions de couple, jeux de connexion et rituels hebdomadaires pour approfondir votre relation, relancer les vraies conversations et cultiver l'intimité.",
    url: `${siteUrl}/fr/blog`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/blog-questions-couple-fr.webp`,
        width: 1200,
        height: 630,
        alt: 'Blog Captain Bond',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Captain Bond — Questions, Jeux & Rituels de Couple',
    description:
      "Questions de couple, jeux de connexion et rituels hebdomadaires pour approfondir votre relation, relancer les vraies conversations et cultiver l'intimité.",
    images: [`${siteUrl}/og/blog-questions-couple-fr.webp`],
  },
};

const posts = [
  {
    href: '/fr/blog/questions-pour-couple',
    title: '150 questions pour couple : du fun au profond',
    excerpt:
      'Une liste de questions pour couple, des plus légères aux plus profondes, avec un rituel pour les intégrer au quotidien.',
  },
  {
    href: '/blog/questions-pour-couple',
    title: '(EN) 150 questions for couples: from fun to deep',
    excerpt:
      'The English version of our guide to couple questions, from light and fun to deep and meaningful.',
  },
  {
    href: '/fr/blog/rituel-hebdo-couple',
    title: 'Comment créer un rituel de couple hebdomadaire',
    excerpt:
      "Un cadre simple pour un rendez-vous d'écoute de 20 minutes par semaine, même quand le quotidien s'accélère. Bientôt disponible.",
  },
];

export default function FrenchBlogIndexPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Blog Captain Bond</h1>
        <p className="text-slate-300 leading-relaxed max-w-xl mx-auto">
          Questions de couple, jeux de connexion et rituels hebdomadaires pour vous aider à ralentir,
          parler sincèrement et renforcer votre lien — une question à la fois.
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
              <p >{post.excerpt}</p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
