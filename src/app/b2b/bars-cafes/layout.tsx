import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: "Animation de Pubs, Bars & Cafés | Captain Bond",
  description: "Remplissez vos tables les soirs de semaine. Un jeu de quiz interactif autonome sur écran géant (TV) à 99€/mois. Ambiance de folie garantie.",
  alternates: {
    canonical: `${siteUrl}/b2b/bars-cafes`,
    languages: {
      'fr-FR': `${siteUrl}/fr/b2b/bars-cafes`,
      'en-US': `${siteUrl}/b2b/bars-cafes`,
    },
  },
  openGraph: {
    title: "Animation de Pubs, Bars & Cafés | Captain Bond",
    description: "Remplissez vos tables les soirs de semaine avec un jeu de quiz interactif autonome sur écran géant.",
    url: `${siteUrl}/b2b/bars-cafes`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/bars-cafes.png`,
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
    images: [`${siteUrl}/og/bars-cafes.png`],
  },
};

export default function BarsCafesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
