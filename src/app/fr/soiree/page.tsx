import { Metadata } from 'next';
import PartyLanding from '@/components/landing/PartyLanding';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Captain Bond — Le DJ de ta soirée',
  description: "Jeu d'ambiance autour de la TV. Icebreaker, Spicy, Deep Connection, Imposteur, Date Night. 3 cartes gratuites, puis débloque la soirée.",
  alternates: {
    canonical: `${siteUrl}/fr/soiree`,
    languages: {
      'x-default': `${siteUrl}/party`,
      'en': `${siteUrl}/party`,
      'fr': `${siteUrl}/fr/soiree`,
    },
  },
  openGraph: {
    title: 'Captain Bond — Le DJ de ta soirée',
    description: "Jeu d'ambiance autour de la TV. 3 cartes gratuites, puis débloque la soirée.",
    url: `${siteUrl}/fr/soiree`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/soiree-fr.webp`,
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
    images: [`${siteUrl}/og/soiree-fr.webp`],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: "C'est quoi Captain Bond Soirée ?", acceptedAnswer: { '@type': 'Answer', text: "Captain Bond Soirée transforme votre TV en plateau de jeu. 5 modes — Icebreaker, Spicy, Deep Connection, Imposteur, Date Night. 3 cartes gratuites, puis débloquez la soirée." } },
    { '@type': 'Question', name: 'Comment les joueurs rejoignent-ils ?', acceptedAnswer: { '@type': 'Answer', text: 'Ils scannent un QR code ou entrent un code de partie sur leur téléphone. Pas d\'application à télécharger.' } },
    { '@type': 'Question', name: 'Combien de joueurs peuvent participer ?', acceptedAnswer: { '@type': 'Answer', text: 'De 2 à 50+ joueurs. Le plateau s\'affiche sur la TV, les joueurs répondent sur leur téléphone.' } },
    { '@type': 'Question', name: "C'est gratuit ?", acceptedAnswer: { '@type': 'Answer', text: 'Oui, 3 cartes gratuites par mode pour essayer. Débloquez l\'accès illimité avec un Pass 24h ou un abonnement.' } },
    { '@type': 'Question', name: 'Faut-il une smart TV ?', acceptedAnswer: { '@type': 'Answer', text: 'N\'importe quel écran avec un navigateur : smart TV, Chromecast, Apple TV, ou un ordinateur relié en HDMI.' } },
  ],
};

export default function SoireePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="max-w-3xl mx-auto px-4 pt-8">
        <h1 className="text-slate-200 leading-relaxed text-center text-lg">
          Captain Bond Soirée — Transformez votre TV en plateau de jeu
        </h1>
      </section>
      <PartyLanding defaultLang="fr" />
    </>
  );
}
