import { Metadata } from 'next';
import CouplePage from '@/app/(distanciel)/couple/page';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Captain Bond — Espace Couple',
  description: "Rituels quotidiens, jauge d'harmonie et jeux de connexion profonde pour les couples. Renforcez votre lien, une question à la fois.",
  alternates: {
    canonical: `${siteUrl}/fr/couple`,
    languages: {
      'fr-FR': `${siteUrl}/fr/couple`,
      'en-US': `${siteUrl}/couple`,
    },
  },
  openGraph: {
    title: 'Captain Bond — Espace Couple',
    description: 'Rituels quotidiens et jeux de connexion profonde pour les couples.',
    url: `${siteUrl}/fr/couple`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/couple-fr.png`,
        width: 1200,
        height: 630,
        alt: 'Captain Bond — Espace Couple',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Captain Bond — Espace Couple',
    description: 'Rituels quotidiens et jeux de connexion profonde pour les couples.',
    images: [`${siteUrl}/og/couple-fr.png`],
  },
};

export default function FrenchCouplePage() {
  return <CouplePage defaultLang="fr" />;
}
