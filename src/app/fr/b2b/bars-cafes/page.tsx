import { Metadata } from 'next';
import BarsCafesLandingPage from '@/app/b2b/bars-cafes/page';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: "Animation de Pubs, Bars & Cafés | Captain Bond",
  description: "Remplissez vos tables les soirs de semaine. Un jeu de quiz interactif autonome sur écran géant (TV) à 99€/mois. Ambiance de folie garantie.",
  alternates: {
    canonical: `${siteUrl}/fr/b2b/bars-cafes`,
    languages: {
      'x-default': `${siteUrl}/b2b/bars-cafes`,
      'en': `${siteUrl}/b2b/bars-cafes`,
      'fr': `${siteUrl}/fr/b2b/bars-cafes`,
    },
  },
  openGraph: {
    title: "Animation de Pubs, Bars & Cafés | Captain Bond",
    description: "Remplissez vos tables les soirs de semaine avec un jeu de quiz interactif autonome sur écran géant.",
    url: `${siteUrl}/fr/b2b/bars-cafes`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/bars-cafes.webp`,
        width: 1200,
        height: 630,
        alt: 'Captain Bond Bars & Cafés',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Animation de Pubs, Bars & Cafés | Captain Bond",
    description: "Remplissez vos tables les soirs de semaine avec un jeu de quiz interactif autonome sur écran géant.",
    images: [`${siteUrl}/og/bars-cafes.webp`],
  },
};

export default function FrenchBarsCafesPage() {
  return <BarsCafesLandingPage defaultLang="fr" />;
}
