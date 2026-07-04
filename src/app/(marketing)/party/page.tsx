import { Metadata } from 'next';
import PartyLanding from '@/components/landing/PartyLanding';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Captain Bond — The DJ of Your Party',
  description: 'Turn your TV into a party game board. Icebreaker, Spicy, Deep Connection, Imposteur, Date Night. 3 free cards, then unlock the night.',
  alternates: {
    canonical: `${siteUrl}/party`,
    languages: {
      'x-default': `${siteUrl}/party`,
      'en': `${siteUrl}/party`,
      'fr': `${siteUrl}/fr/soiree`,
    },
  },
  openGraph: {
    title: 'Captain Bond — The DJ of Your Party',
    description: 'Turn your TV into a party game board. 3 free cards, then unlock the night.',
    url: `${siteUrl}/party`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/party-en.webp`,
        width: 1200,
        height: 630,
        alt: 'Captain Bond — Party Game',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Captain Bond — The DJ of Your Party',
    description: 'Turn your TV into a party game board. 3 free cards, then unlock the night.',
    images: [`${siteUrl}/og/party-en.webp`],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is Captain Bond Party?', acceptedAnswer: { '@type': 'Answer', text: 'Captain Bond Party turns your TV into a party game board. Choose from 5 game modes — Icebreaker, Spicy, Deep Connection, Imposteur, Date Night — and let the fun begin.' } },
    { '@type': 'Question', name: 'How do players join?', acceptedAnswer: { '@type': 'Answer', text: 'Players scan a QR code or enter a room code on their phone. No app download needed — everything runs in the browser.' } },
    { '@type': 'Question', name: 'How many players can play?', acceptedAnswer: { '@type': 'Answer', text: '2 to 50+ players can join one party. The game board displays on the TV screen while players answer on their phones.' } },
    { '@type': 'Question', name: 'Is it free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, you get 3 free cards per game mode to try it out. Unlock unlimited play with a Pass 24h or a subscription.' } },
    { '@type': 'Question', name: 'Do I need a smart TV?', acceptedAnswer: { '@type': 'Answer', text: 'Any screen with a browser works. Connect a laptop to your TV via HDMI, or use a smart TV / Chromecast / Apple TV.' } },
  ],
};

export default function PartyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="max-w-3xl mx-auto px-4 pt-8">
        <p className="text-slate-200 leading-relaxed text-center text-lg">
          <strong>Captain Bond Party</strong> transforms your TV into a party game board. 5 game modes — Icebreaker, Spicy, Deep Connection, Imposteur, Date Night. 3 free cards to try, then unlock the night. Players join with their phone — no app, no sign-up, just a QR code.
        </p>
      </section>
      <PartyLanding defaultLang="en" />
    </>
  );
}
