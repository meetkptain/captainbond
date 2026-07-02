import { Metadata } from 'next';
import HomePageClient from '@/components/landing/HomePageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Captain Bond — The DJ of Your Party',
  description: 'Turn your TV into a party game board. Icebreaker, Spicy, Deep Connection, Imposteur, Date Night. 3 free cards, then unlock the night.',
  alternates: {
    canonical: `${siteUrl}/`,
    languages: {
      'fr-FR': `${siteUrl}/fr`,
      'en-US': `${siteUrl}/`,
    },
  },
  openGraph: {
    title: 'Captain Bond — The DJ of Your Party',
    description: 'Turn your TV into a party game board. 3 free cards, then unlock the night.',
    url: `${siteUrl}/`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/home-en.png`,
        width: 1200,
        height: 630,
        alt: 'Captain Bond — The DJ of Your Party',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Captain Bond — The DJ of Your Party',
    description: 'Turn your TV into a party game board. 3 free cards, then unlock the night.',
    images: [`${siteUrl}/og/home-en.png`],
  },
};

export default function Home() {
  return <HomePageClient defaultLang="en" />;
}
