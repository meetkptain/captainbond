import { Metadata } from 'next';
import CouplePage from '@/app/(distanciel)/couple/page';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Captain Bond — Espace Couple',
  description: "Rituels quotidiens, jauge d'harmonie et jeux de connexion profonde pour les couples. Renforcez votre lien, une question à la fois.",
  alternates: {
    canonical: `${siteUrl}/fr/couple`,
    languages: {
      'x-default': `${siteUrl}/couple`,
      'en': `${siteUrl}/couple`,
      'fr': `${siteUrl}/fr/couple`,
    },
  },
  openGraph: {
    title: 'Captain Bond — Espace Couple',
    description: 'Rituels quotidiens et jeux de connexion profonde pour les couples.',
    url: `${siteUrl}/fr/couple`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/couple-fr.webp`,
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
    images: [`${siteUrl}/og/couple-fr.webp`],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: "C'est quoi Captain Bond Couple ?", acceptedAnswer: { '@type': 'Answer', text: "Captain Bond Couple est un espace privé pour les couples avec des decks de questions quotidiens, une jauge d'harmonie et des jeux de connexion profonde." } },
    { '@type': 'Question', name: "Comment fonctionne la jauge d'harmonie ?", acceptedAnswer: { '@type': 'Answer', text: "Après chaque session, les deux partenaires évaluent la conversation. La jauge suit votre tendance de connexion — un moyen simple de rester attentif à la santé de votre couple." } },
    { '@type': 'Question', name: "Le mode couple est-il gratuit ?", acceptedAnswer: { '@type': 'Answer', text: 'Oui, vous avez 3 sessions gratuites pour essayer. Débloquez l\'accès illimité avec un abonnement.' } },
    { '@type': 'Question', name: 'Peut-on jouer sur le même téléphone ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui. Le mode couple fonctionne sur un seul appareil — parfait pour une soirée tranquille à la maison. Chacun répond à son tour.' } },
    { '@type': 'Question', name: 'Nos réponses sont-elles privées ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui. Vos réponses sont visibles uniquement par vous et votre partenaire. Nous ne partageons ni ne vendons jamais vos données.' } },
  ],
};

export default function FrenchCouplePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="max-w-3xl mx-auto px-4 pt-8">
        <h1 className="text-slate-200 leading-relaxed text-center text-lg">
          Captain Bond Couple — Un espace privé pour renforcer votre lien
        </h1>
      </section>
      <CouplePage defaultLang="fr" />
    </>
  );
}
