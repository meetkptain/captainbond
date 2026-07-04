import { Metadata } from 'next';
import HomePageClient from '@/components/landing/HomePageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Captain Bond — Interactive Party Games, Couple Rituals & Team Building',
  description: 'Turn any moment into a connection. Party games on your TV, daily couple rituals, and interactive team building. One platform, infinite vibes.',
  alternates: {
    canonical: `${siteUrl}/`,
    languages: {
      'x-default': `${siteUrl}/`,
      'en': `${siteUrl}/`,
      'fr': `${siteUrl}/fr`,
    },
  },
  openGraph: {
    title: 'Captain Bond — Interactive Party Games, Couple Rituals & Team Building',
    description: 'Turn any moment into a connection. Party games, couple rituals, and team building.',
    url: `${siteUrl}/`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/home-en.webp`,
        width: 1200,
        height: 630,
        alt: 'Captain Bond — Interactive Games & Connection',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Captain Bond — Interactive Party Games, Couple Rituals & Team Building',
    description: 'Turn any moment into a connection. Party games, couple rituals, and team building.',
    images: [`${siteUrl}/og/home-en.webp`],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is Captain Bond?', acceptedAnswer: { '@type': 'Answer', text: 'Captain Bond is an interactive party game platform that turns your TV into a game board. Party games, couple rituals, and team building — one platform, three vibes.' } },
    { '@type': 'Question', name: 'Is Captain Bond free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. You get 3 free cards per game mode. Unlock unlimited access with a Pass 24h or a monthly subscription.' } },
    { '@type': 'Question', name: 'Do I need to download an app?', acceptedAnswer: { '@type': 'Answer', text: 'No. Players join from their phone browser using a room code. No app, no account required.' } },
    { '@type': 'Question', name: 'How many players can play?', acceptedAnswer: { '@type': 'Answer', text: 'Party mode supports 2-50+ players. Couple mode is for two. Pro mode scales to 500+ participants.' } },
    { '@type': 'Question', name: 'What do I need to play on TV?', acceptedAnswer: { '@type': 'Answer', text: 'Any screen with a browser — smart TV, Chromecast, Apple TV, laptop connected to HDMI. The game board displays on the big screen; players use their phones.' } },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="max-w-3xl mx-auto px-4 pt-8">
        <h1 className="text-slate-200 leading-relaxed text-center text-lg">
          Captain Bond — Interactive Party Games, Couple Rituals &amp; Team Building
        </h1>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-6 text-center mb-8">
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <p className="text-2xl font-bold text-neon-purple">50,000+</p>
            <p className="text-sm text-slate-400">questions generated</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <p className="text-2xl font-bold text-neon-purple">1,200+</p>
            <p className="text-sm text-slate-400">couple sessions</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <p className="text-2xl font-bold text-neon-purple">10,000+</p>
            <p className="text-sm text-slate-400">players hosted</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 text-left font-semibold text-slate-300"></th>
                <th className="p-3 text-center font-semibold text-neon-pink">Party</th>
                <th className="p-3 text-center font-semibold text-neon-purple">Couple</th>
                <th className="p-3 text-center font-semibold text-emerald-400">Pro</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="p-3 text-slate-400">Players</td>
                <td className="p-3 text-center text-slate-200">2-50+</td>
                <td className="p-3 text-center text-slate-200">2</td>
                <td className="p-3 text-center text-slate-200">10-500+</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3 text-slate-400">Free trial</td>
                <td className="p-3 text-center text-slate-200">3 cards</td>
                <td className="p-3 text-center text-slate-200">3 sessions</td>
                <td className="p-3 text-center text-slate-200">Demo</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3 text-slate-400">Price</td>
                <td className="p-3 text-center text-slate-200">From 4.99€</td>
                <td className="p-3 text-center text-slate-200">From 4.99€</td>
                <td className="p-3 text-center text-slate-200">From 99€/mo</td>
              </tr>
              <tr>
                <td className="p-3 text-slate-400">Best for</td>
                <td className="p-3 text-center text-slate-200">Game nights</td>
                <td className="p-3 text-center text-slate-200">Date nights</td>
                <td className="p-3 text-center text-slate-200">Bars & teams</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p className="max-w-3xl mx-auto px-4 text-xs text-slate-500 text-center">
        Free cards are enough for most groups. Heavy users may need a Pass or subscription.
      </p>

      <HomePageClient defaultLang="en" />
    </>
  );
}
