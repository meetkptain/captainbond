import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Bar & Pub Entertainment — Interactive Quiz Game | Captain Bond',
  description: 'Fill your tables on slow weeknights. An autonomous interactive giant-screen quiz game for pubs, bars & cafés at $99/month. Guaranteed atmosphere.',
  alternates: {
    canonical: `${siteUrl}/b2b/bars-cafes`,
    languages: {
      'fr-FR': `${siteUrl}/fr/b2b/bars-cafes`,
      'en-US': `${siteUrl}/b2b/bars-cafes`,
    },
  },
  openGraph: {
    title: 'Bar & Pub Entertainment — Interactive Quiz Game | Captain Bond',
    description: 'Fill your tables on slow weeknights with an autonomous interactive giant-screen quiz game.',
    url: `${siteUrl}/b2b/bars-cafes`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/bars-cafes.webp`,
        width: 1200,
        height: 630,
        alt: 'Captain Bond Bar & Pub Entertainment',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bar & Pub Entertainment — Interactive Quiz Game | Captain Bond',
    description: 'Fill your tables on slow weeknights with an autonomous interactive giant-screen quiz game.',
    images: [`${siteUrl}/og/bars-cafes.webp`],
  },
};

export default function BarsCafesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
