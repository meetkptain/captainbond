import { Metadata } from 'next';
import { CoupleDashboardProvider } from './_hooks/useCoupleDashboardContext';
import { CoupleDashboardView } from './_components/CoupleDashboardView';
import './couple.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Captain Bond — Couple Space',
  description: 'Daily rituals, harmony gauge, and deep connection games for couples. Strengthen your bond, one question at a time.',
  alternates: {
    canonical: `${siteUrl}/couple`,
    languages: {
      'x-default': `${siteUrl}/couple`,
      'en': `${siteUrl}/couple`,
      'fr': `${siteUrl}/fr/couple`,
    },
  },
  openGraph: {
    title: 'Captain Bond — Couple Space',
    description: 'Daily rituals and deep connection games for couples.',
    url: `${siteUrl}/couple`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/couple-en.webp`,
        width: 1200,
        height: 630,
        alt: 'Captain Bond — Couple Space',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Captain Bond — Couple Space',
    description: 'Daily rituals and deep connection games for couples.',
    images: [`${siteUrl}/og/couple-en.webp`],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is Captain Bond Couple?', acceptedAnswer: { '@type': 'Answer', text: 'Captain Bond Couple is a private space for couples with daily question decks, a harmony gauge, and deep connection games. Strengthen your bond, one question at a time.' } },
    { '@type': 'Question', name: 'How does the harmony gauge work?', acceptedAnswer: { '@type': 'Answer', text: 'After each session, both partners rate the conversation. The gauge tracks your connection trend over time — a simple way to stay aware of your relationship health.' } },
    { '@type': 'Question', name: 'Is couple mode free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, you get 3 free sessions to try. Unlock unlimited access with a subscription.' } },
    { '@type': 'Question', name: 'Can we play on the same phone?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Couple mode works on a single device — perfect for a quiet evening at home. Each partner takes turns answering.' } },
    { '@type': 'Question', name: 'Are our answers private?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Your answers are visible only to you and your partner. We never share or sell your data.' } },
  ],
};

export default function CoupleDashboard({ defaultLang = 'en' }: { defaultLang?: 'fr' | 'en' }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="max-w-3xl mx-auto px-4 pt-8">
        <h1 className="text-slate-200 leading-relaxed text-center text-lg">
          Captain Bond Couple — Deepen Your Connection, One Game at a Time
        </h1>
      </section>
      <CoupleDashboardProvider>
        <CoupleDashboardView defaultLang={defaultLang} />
      </CoupleDashboardProvider>
    </>
  );
}
