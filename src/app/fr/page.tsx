import { Metadata } from 'next';
import HomePageClient from '@/components/landing/HomePageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Captain Bond — Le DJ de ta soirée',
  description: "Jeu d'ambiance autour de la TV. Icebreaker, Spicy, Deep Connection, Imposteur, Date Night. 3 cartes gratuites, puis débloque la soirée.",
  alternates: {
    canonical: `${siteUrl}/fr`,
    languages: {
      'fr-FR': `${siteUrl}/fr`,
      'en-US': `${siteUrl}/`,
    },
  },
  openGraph: {
    title: 'Captain Bond — Le DJ de ta soirée',
    description: "Jeu d'ambiance autour de la TV. 3 cartes gratuites, puis débloque la soirée.",
    url: `${siteUrl}/fr`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/home-fr.png`,
        width: 1200,
        height: 630,
        alt: 'Captain Bond — Le DJ de ta soirée',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Captain Bond — Le DJ de ta soirée',
    description: "Jeu d'ambiance autour de la TV. 3 cartes gratuites, puis débloque la soirée.",
    images: [`${siteUrl}/og/home-fr.png`],
  },
};

export default function FrenchHome() {
  return <HomePageClient defaultLang="fr" />;
}
