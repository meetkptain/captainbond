import { Metadata } from 'next';
import CorporateLandingPage from '@/app/corporate/page';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: "Team Building Interactif & Séminaires d'Entreprise | Captain Bond",
  description: "Fédérez vos équipes avec un brise-glace interactif moderne. Pas d'application à installer, jouable en présentiel ou en hybride.",
  alternates: {
    canonical: `${siteUrl}/fr/corporate`,
    languages: {
      'fr-FR': `${siteUrl}/fr/corporate`,
      'en-US': `${siteUrl}/corporate`,
    },
  },
  openGraph: {
    title: "Team Building Interactif & Séminaires d'Entreprise | Captain Bond",
    description: "Fédérez vos équipes avec un brise-glace interactif moderne.",
    url: `${siteUrl}/fr/corporate`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/corporate.png`,
        width: 1200,
        height: 630,
        alt: 'Captain Bond Team Building',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Team Building Interactif & Séminaires d'Entreprise | Captain Bond",
    description: "Fédérez vos équipes avec un brise-glace interactif moderne.",
    images: [`${siteUrl}/og/corporate.png`],
  },
};

export default function FrenchCorporatePage() {
  return <CorporateLandingPage defaultLang="fr" />;
}
