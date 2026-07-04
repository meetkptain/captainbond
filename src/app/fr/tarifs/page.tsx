import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Tarifs — Captain Bond | Gratuit, Pass & Abonnements',
  description: 'Commencez gratuitement avec 3 cartes. Débloquez les jeux illimités avec Pass 24h (2,99€), Mensuel (7,99€) ou Lifetime (69,99€). Offres Pro dès 99€/mois.',
  alternates: {
    canonical: `${siteUrl}/fr/tarifs`,
    languages: {
      'x-default': `${siteUrl}/pricing`,
      'en': `${siteUrl}/pricing`,
      'fr': `${siteUrl}/fr/tarifs`,
    },
  },
  openGraph: {
    title: 'Captain Bond — Tarifs',
    description: 'Commencez gratuitement. Débloquez l\'illimité. 3 façons de jouer.',
    url: `${siteUrl}/fr/tarifs`,
    siteName: 'Captain Bond',
    images: [{ url: `${siteUrl}/og/tarifs-fr.webp`, width: 1200, height: 630, alt: 'Captain Bond Tarifs' }],
    locale: 'fr_FR',
    type: 'website',
  },
};

const plans = [
  {
    id: 'soiree',
    icon: '🎉',
    name: 'Soirée',
    desc: 'Soirées jeux entre amis. La TV comme plateau, les smartphones comme manettes.',
    tiers: [
      { name: 'Gratuit', price: '0', period: 'toujours', features: ['3 cartes gratuites par mode', '5 modes de jeu', '2-50+ joueurs'], cta: 'Commencer', href: '/fr/soiree' },
      { name: 'Pass 24h', price: '2,99', period: '24h', features: ['Tous les modes illimité', 'Profils & dossiers', 'Accès une soirée'], cta: 'Prendre le Pass', href: '/fr/soiree' },
      { name: 'Mensuel', price: '7,99', period: '/mois', features: ['Tous les modes illimité', 'Tous les profils & packs', 'Annulation libre'], cta: 'S\'abonner', href: '/fr/soiree' },
      { name: 'Lifetime', price: '69,99', period: 'unique', features: ['Tout le contenu actuel + futur', 'Tous les profils & packs', 'Paiement unique'], cta: 'Acheter Lifetime', href: '/fr/soiree', badge: 'Meilleure offre' },
    ],
  },
  {
    id: 'couple',
    icon: '💕',
    name: 'Couple',
    desc: 'Rituels quotidiens, jauge d\'harmonie, connexion profonde.',
    tiers: [
      { name: 'Gratuit', price: '0', period: 'toujours', features: ['3 sessions gratuites', 'Mode Daily Mirror', 'Jauge d\'harmonie de base'], cta: 'Commencer', href: '/fr/couple' },
      { name: 'Mensuel', price: '4,99', period: '/mois', features: ['Sessions illimitées', 'Jauge d\'harmonie complète', 'Arbre relationnel', 'Récapitulatifs hebdo'], cta: 'S\'abonner', href: '/fr/couple' },
      { name: 'Annuel', price: '39,99', period: '/an', features: ['Tout le Mensuel', 'Économisez 33%', 'Analyses premium'], cta: 'Abonnement Annuel', href: '/fr/couple', badge: 'Économisez 33%' },
    ],
  },
  {
    id: 'pro',
    icon: '🏢',
    name: 'Pro',
    desc: 'Bars, événements d\'entreprise, team building.',
    tiers: [
      { name: 'Démo', price: '0', period: 'gratuite', features: ['Appel démo guidé', 'Voir le mode TV en direct', 'Poser vos questions'], cta: 'Réserver une Démo', href: '/fr/pro' },
      { name: 'Bar Mensuel', price: '99', period: '/mois', features: ['Mode TV', 'DJ Vocal IA', 'Kit bar (sous-verres + affiches)', 'Tableau de bord'], cta: 'Essai Gratuit', href: '/fr/b2b/bars-cafes' },
      { name: 'Événement', price: '299', period: '/événement', features: ['500+ participants', 'Questions personnalisées', 'Rapport de cohésion', 'Dashboard animateur'], cta: 'Réserver', href: '/fr/corporate' },
    ],
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Captain Bond est-il vraiment gratuit ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui. Vous avez 3 cartes gratuites par mode de jeu en Soirée et 3 sessions gratuites en Couple. Aucune carte bancaire requise.' } },
    { '@type': 'Question', name: 'Puis-je annuler mon abonnement ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui, à tout moment. Votre accès continue jusqu\'à la fin de la période de facturation.' } },
    { '@type': 'Question', name: 'C\'est quoi le plan Lifetime ?', acceptedAnswer: { '@type': 'Answer', text: 'Un paiement unique de 69,99€ vous donne accès à tout le contenu actuel et futur. Sans frais récurrents.' } },
    { '@type': 'Question', name: 'Proposez-vous des réductions pour les équipes ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui. Contactez-nous pour les tarifs de groupe.' } },
    { '@type': 'Question', name: 'Comment fonctionne le paiement ?', acceptedAnswer: { '@type': 'Answer', text: 'Paiement sécurisé par Stripe. Nous acceptons Visa, Mastercard et Apple Pay.' } },
  ],
};

export default function TarifsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Une plateforme.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-emerald-400">Trois façons de jouer.</span>
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto">
            Commencez gratuitement. Pas de carte bancaire. Quand vous êtes prêt, choisissez la formule qui vous correspond.
          </p>
        </div>

        <div className="space-y-20">
          {plans.map((plan) => (
            <section key={plan.id}>
              <div className="text-center mb-10">
                <span className="text-3xl">{plan.icon}</span>
                <h2 className="text-2xl font-bold text-white mt-2">{plan.name}</h2>
                <p className="text-white/50">{plan.desc}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plan.tiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={`relative p-6 rounded-2xl border transition-all hover:scale-[1.02] ${
                      tier.badge
                        ? 'border-neon-purple bg-white/[0.04]'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    {tier.badge && (
                      <span className="absolute -top-3 left-4 px-3 py-1 rounded-full bg-neon-purple text-xs font-bold text-white">
                        {tier.badge}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                    <p className="mt-2">
                      <span className="text-3xl font-black text-white">{tier.price === '0' ? 'Gratuit' : `${tier.price}€`}</span>
                      {tier.price !== '0' && <span className="text-sm text-slate-400 ml-0.5">{tier.period}</span>}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {tier.features.map((f) => (
                        <li key={f} className="text-sm text-slate-400 flex items-center gap-2">
                          <span className="text-emerald-400">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={tier.href}
                      className={`mt-6 block text-center py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-95 ${
                        tier.badge
                          ? 'bg-neon-purple text-white hover:bg-neon-purple/90'
                          : 'border border-white/10 text-white hover:bg-white/5'
                      }`}
                    >
                      {tier.cta}
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-24 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Encore hésitant ?</h2>
          <p className="text-white/60 max-w-md mx-auto">Essayez le mode Soirée gratuitement. Sans compte, sans carte, sans appli.</p>
          <Link
            href="/fr/soiree"
            className="inline-flex items-center gap-2 bg-neon-purple text-white font-bold px-8 py-3 rounded-xl hover:bg-neon-purple/90 transition-all active:scale-95"
          >
            Commencer Gratuitement
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>
      </main>
    </>
  );
}
