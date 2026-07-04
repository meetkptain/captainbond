import { Metadata } from 'next';
import HomePageClient from '@/components/landing/HomePageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Captain Bond — Jeux de soirée, rituels couple & team building',
  description: "Un jeu, trois ambiances. Jeux d'ambiance sur écran géant, rituels quotidiens pour couple et animations interactives pour entreprise.",
  alternates: {
    canonical: `${siteUrl}/fr`,
    languages: {
      'x-default': `${siteUrl}/`,
      'en': `${siteUrl}/`,
      'fr': `${siteUrl}/fr`,
    },
  },
  openGraph: {
    title: 'Captain Bond — Jeux de soirée, rituels couple & team building',
    description: "Un jeu, trois ambiances. Soirée, couple, entreprise — Captain Bond s'adapte à votre moment.",
    url: `${siteUrl}/fr`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/home-fr.webp`,
        width: 1200,
        height: 630,
        alt: 'Captain Bond — Jeux & Connexion',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Captain Bond — Jeux de soirée, rituels couple & team building',
    description: "Un jeu, trois ambiances. Soirée, couple, entreprise — Captain Bond s'adapte à votre moment.",
    images: [`${siteUrl}/og/home-fr.webp`],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: "C'est quoi Captain Bond ?", acceptedAnswer: { '@type': 'Answer', text: "Captain Bond est une plateforme de jeux interactifs qui transforme votre TV en terrain de jeu. Soirées, couple, team building — un jeu, trois ambiances." } },
    { '@type': 'Question', name: 'Est-ce que Captain Bond est gratuit ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui. Vous avez 3 cartes gratuites par mode de jeu. Débloquez l\'accès illimité avec un Pass 24h ou un abonnement mensuel.' } },
    { '@type': 'Question', name: 'Faut-il télécharger une application ?', acceptedAnswer: { '@type': 'Answer', text: 'Non. Les joueurs rejoignent depuis le navigateur de leur téléphone avec un code de partie. Pas d\'appli, pas de compte.' } },
    { '@type': 'Question', name: 'Combien de joueurs peuvent participer ?', acceptedAnswer: { '@type': 'Answer', text: 'Le mode soirée accueille 2 à 50+ joueurs. Le mode couple est pour deux. Le mode pro monte jusqu\'à 500+ participants.' } },
    { '@type': 'Question', name: 'De quoi a-t-on besoin pour jouer sur TV ?', acceptedAnswer: { '@type': 'Answer', text: 'N\'importe quel écran avec un navigateur — smart TV, Chromecast, Apple TV, ordinateur relié en HDMI. Le plateau s\'affiche sur le grand écran, les joueurs utilisent leur téléphone.' } },
  ],
};

export default function FrenchHome() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="max-w-3xl mx-auto px-4 pt-8">
        <h1 className="text-slate-200 leading-relaxed text-center text-lg">
          Captain Bond — Jeux de soirée, rituels couple &amp; team building
        </h1>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-6 text-center mb-8">
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <p className="text-2xl font-bold text-neon-purple">50 000+</p>
            <p className="text-sm text-slate-400">questions générées</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <p className="text-2xl font-bold text-neon-purple">1 200+</p>
            <p className="text-sm text-slate-400">sessions couple</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <p className="text-2xl font-bold text-neon-purple">10 000+</p>
            <p className="text-sm text-slate-400">joueurs accueillis</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 text-left font-semibold text-slate-300"></th>
                <th className="p-3 text-center font-semibold text-neon-pink">Soirée</th>
                <th className="p-3 text-center font-semibold text-neon-purple">Couple</th>
                <th className="p-3 text-center font-semibold text-emerald-400">Pro</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="p-3 text-slate-400">Joueurs</td>
                <td className="p-3 text-center text-slate-200">2-50+</td>
                <td className="p-3 text-center text-slate-200">2</td>
                <td className="p-3 text-center text-slate-200">10-500+</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3 text-slate-400">Essai gratuit</td>
                <td className="p-3 text-center text-slate-200">3 cartes</td>
                <td className="p-3 text-center text-slate-200">3 sessions</td>
                <td className="p-3 text-center text-slate-200">Démo</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3 text-slate-400">Prix</td>
                <td className="p-3 text-center text-slate-200">Dès 4.99€</td>
                <td className="p-3 text-center text-slate-200">Dès 4.99€</td>
                <td className="p-3 text-center text-slate-200">Dès 99€/mois</td>
              </tr>
              <tr>
                <td className="p-3 text-slate-400">Idéal pour</td>
                <td className="p-3 text-center text-slate-200">Soirées jeux</td>
                <td className="p-3 text-center text-slate-200">Soirées en duo</td>
                <td className="p-3 text-center text-slate-200">Bars & équipes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p className="max-w-3xl mx-auto px-4 text-xs text-slate-500 text-center">
        Les cartes gratuites suffisent pour la plupart des groupes. Les gros utilisateurs peuvent avoir besoin d'un Pass ou d'un abonnement.
      </p>

      <HomePageClient defaultLang="fr" />
    </>
  );
}
