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
      'fr-FR': `${siteUrl}/fr/couple`,
      'en-US': `${siteUrl}/couple`,
    },
  },
  openGraph: {
    title: 'Captain Bond — Couple Space',
    description: 'Daily rituals and deep connection games for couples.',
    url: `${siteUrl}/couple`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/couple-en.png`,
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
    images: [`${siteUrl}/og/couple-en.png`],
  },
};

export default function CoupleDashboard({ defaultLang = 'en' }: { defaultLang?: 'fr' | 'en' }) {
  return (
    <CoupleDashboardProvider>
      <CoupleDashboardView defaultLang={defaultLang} />
    </CoupleDashboardProvider>
  );
}
