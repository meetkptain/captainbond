import { Metadata } from 'next';
import ProLanding from '@/components/pro/ProLanding';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Captain Bond Pro — Team Building, Bars & Onboarding',
  description: "Jeux interactifs sur écran géant pour bars, cafés, team building et onboarding. Une plateforme pour tous vos besoins professionnels.",
  alternates: {
    canonical: `${siteUrl}/fr/pro`,
    languages: {
      'x-default': `${siteUrl}/pro`,
      'en': `${siteUrl}/pro`,
      'fr': `${siteUrl}/fr/pro`,
    },
  },
  openGraph: {
    title: 'Captain Bond Pro — Team Building, Bars & Onboarding',
    description: "Jeux interactifs sur écran géant pour bars, cafés, team building et onboarding.",
    url: `${siteUrl}/fr/pro`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/pro-fr.webp`,
        width: 1200,
        height: 630,
        alt: 'Captain Bond Pro',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Captain Bond Pro — Team Building, Bars & Onboarding',
    description: "Jeux interactifs sur écran géant pour bars, cafés, team building et onboarding.",
    images: [`${siteUrl}/og/pro-fr.webp`],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: "C'est quoi Captain Bond Pro ?", acceptedAnswer: { '@type': 'Answer', text: "Captain Bond Pro est une solution d'animation interactive pour bars, cafés, team building et onboarding. Jeux sur écran géant avec DJ vocal IA — zéro logistique." } },
    { '@type': 'Question', name: 'Combien ça coûte ?', acceptedAnswer: { '@type': 'Answer', text: 'Les bars et cafés s\'abonnent à 99€/mois. Les événements corporate démarrent à 299€ HT la session. Devis sur mesure pour les besoins récurrents.' } },
    { '@type': 'Question', name: 'Quel matériel faut-il ?', acceptedAnswer: { '@type': 'Answer', text: 'Une TV ou un projecteur avec navigateur, plus un smartphone pour animer. Les joueurs rejoignent depuis leur téléphone — pas d\'application.' } },
    { '@type': 'Question', name: "Combien de participants ?", acceptedAnswer: { '@type': 'Answer', text: 'De 10 à 500+ participants. Compatible présentiel, hybride et distanciel.' } },
    { '@type': 'Question', name: 'Y a-t-il une démo ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui. Vous pouvez réserver une démo de 15 minutes ou demander un kit de démo physique gratuit pour votre bar (sous-bocks et affiches).' } },
  ],
};

export default function FrenchProPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="max-w-3xl mx-auto px-4 pt-8">
        <p className="text-slate-200 leading-relaxed text-center text-lg">
          <strong>Captain Bond Pro</strong> est une solution d'animation interactive pour bars, cafés, team building et onboarding. Jeux sur écran géant, animation IA vocale automatique, zéro logistique.
        </p>
      </section>
      <ProLanding defaultLang="fr" />
    </>
  );
}
