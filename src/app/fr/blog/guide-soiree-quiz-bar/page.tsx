import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Soirée Quiz au Bar : Guide Complet pour Animateurs | Captain Bond',
  description:
    'Le guide complet pour organiser une soirée quiz dans votre bar ou pub. Augmentez le chiffre d\'affaires, fidélisez vos clients et créez l\'événement chaque semaine.',
  alternates: {
    canonical: `${siteUrl}/fr/blog/guide-soiree-quiz-bar`,
    languages: {
      'x-default': `${siteUrl}/blog/bar-trivia-night-guide`,
      'en': `${siteUrl}/blog/bar-trivia-night-guide`,
      'fr': `${siteUrl}/fr/blog/guide-soiree-quiz-bar`,
    },
  },
  other: { datePublished: '2025-07-04', dateModified: new Date().toISOString().split('T')[0] },
  openGraph: {
    title: 'Soirée Quiz au Bar : Guide Complet',
    description: 'Organisez une soirée quiz réussie dans votre bar.',
    url: `${siteUrl}/fr/blog/guide-soiree-quiz-bar`,
    siteName: 'Captain Bond',
    images: [{ url: `${siteUrl}/og/bars-cafes.webp`, width: 1200, height: 630, alt: 'Soirée quiz au bar' }],
    locale: 'fr_FR',
    type: 'article',
  },
  twitter: { card: 'summary_large_image', title: 'Soirée Quiz au Bar : Guide Complet', description: 'Organisez une soirée quiz réussie dans votre bar.', images: [`${siteUrl}/og/bars-cafes.webp`] },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Comment organiser une soirée quiz dans mon bar ?', acceptedAnswer: { '@type': 'Answer', text: 'Choisissez un format (quiz papier ou digital), préparez 5-7 rounds de questions variées, installez un écran pour le score, faites la promotion sur les réseaux sociaux, et animez la soirée avec énergie.' } },
    { '@type': 'Question', name: 'Quel jour est le meilleur pour une soirée quiz ?', acceptedAnswer: { '@type': 'Answer', text: 'Le mardi et le mercredi sont les meilleurs jours pour une soirée quiz. Ces soirs traditionnellement calmes peuvent voir leur fréquentation augmenter de 40 à 60 % avec un quiz.' } },
    { '@type': 'Question', name: 'Combien coûte l\'organisation d\'une soirée quiz ?', acceptedAnswer: { '@type': 'Answer', text: 'Presque rien. Le coût principal est le temps de préparation. Les solutions digitales comme Captain Bond coûtent à partir de 99€/mois et incluent tout le nécessaire.' } },
    { '@type': 'Question', name: 'Faut-il un animateur pour une soirée quiz ?', acceptedAnswer: { '@type': 'Answer', text: 'Idéalement oui. L\'animateur donne le rythme, crée l\'ambiance et gère les interactions. Certaines solutions digitales proposent un DJ vocal IA qui anime automatiquement.' } },
    { '@type': 'Question', name: 'Combien de participants pour une soirée quiz réussie ?', acceptedAnswer: { '@type': 'Answer', text: 'De 20 à 100 participants selon la taille de votre établissement. Formez des équipes de 4 à 6 personnes pour maximiser la participation.' } },
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Comment organiser une soirée quiz dans votre bar',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choisir le format', text: 'Décidez entre quiz papier classique ou quiz digital sur écran. Le digital offre plus d\'interactivité et des statistiques en temps réel.' },
    { '@type': 'HowToStep', position: 2, name: 'Préparer les questions', text: 'Créez 5 à 7 rounds de 8 à 10 questions chacun. Alternez les thèmes : culture générale, musique, images, actualités.' },
    { '@type': 'HowToStep', position: 3, name: 'Installer l\'écran', text: 'Installez un écran visible de tous les participants. Utilisez une TV ou un projecteur pour afficher les questions et le score.' },
    { '@type': 'HowToStep', position: 4, name: 'Faire la promotion', text: 'Annoncez la soirée sur les réseaux sociaux, en interior avec des flyers, et via les newsletters 2 semaines avant.' },
    { '@type': 'HowToStep', position: 5, name: 'Animer la soirée', text: 'Accueillez les équipes, expliquez les règles, lancez les rounds. Gardez un rythme soutenu avec de la musique entre les rounds.' },
    { '@type': 'HowToStep', position: 6, name: 'Fidéliser', text: 'Collectez les emails, annoncez le prochain quiz, et créez un classement saisonnier pour encourager les retours.' },
  ],
};

export default function GuideSoireeQuiz() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
        <h1 className="text-4xl font-black text-white mb-4">Organiser une Soirée Quiz dans Votre Bar : Guide Complet</h1>
        <p className="text-slate-400 text-sm mb-8">Publié le 4 juillet 2025</p>

        <section className="article-block">
          <h2 >Pourquoi les soirées quiz augmentent le chiffre d&apos;affaires des bars</h2>
          <p>Les soirées quiz dans les bars sont des événements hebdomadaires où des équipes de clients s&apos;affrontent sur des questions de culture générale, musique et images, animées par un hôte sur un écran partagé. Ce format combine divertissement, compétition sociale et consommation.</p>
          <p>Selon Statista, les bars qui organisent des soirées à thème hebdomadaires constatent une augmentation moyenne de 35 % de leur chiffre d&apos;affaires les soirs d&apos;événement. Les soirs traditionnellement calmes (mardi, mercredi) sont les plus transformés, avec des hausses allant jusqu&apos;à 60 %.</p>
          <p>Une étude en hôtellerie publiée dans l&apos;International Journal of Hospitality Management (2024) montre que les établissements avec des événements interactifs hebdomadaires fidélisent 28 % mieux leur clientèle que ceux sans animation régulière.</p>
          <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">Une soirée quiz ne coûte presque rien à organiser, mais peut transformer un mardi soir calme en salle comble avec une augmentation de 60 % du chiffre d&apos;affaires.</blockquote>
        </section>

        <section className="article-block">
          <h2 >Comment planifier votre soirée quiz : guide étape par étape</h2>
          <ol className="list-decimal pl-6 space-y-4 text-slate-300 mb-4">
            <li><strong>Choisir le format</strong> — Quiz papier classique (traditionnel) ou quiz digital sur écran (interactif, moderne). Le digital permet des scores en temps réel et des statistiques.</li>
            <li><strong>Préparer les questions</strong> — 5-7 rounds, 8-10 questions par round. Alternez : culture générale, musique (extraits audio), images, actualités, et un round joker.</li>
            <li><strong>Installer l&apos;équipement</strong> — Un écran visible de tous (TV 55&rdquo; minimum ou projecteur), un bon système audio, et une connexion internet stable.</li>
            <li><strong>Promouvoir l&apos;événement</strong> — Commencez 2 semaines avant : réseaux sociaux, affiches en interior, newsletters, et bouche-à-oreille des habitués.</li>
            <li><strong>Animer la soirée</strong> — Accueillez les équipes, expliquez les règles en 2 minutes, lancez le premier round. Gardez un rythme : 30 secondes par question, pause musicale entre les rounds.</li>
            <li><strong>Mesurer le succès</strong> — Chiffre d&apos;affaires par couvert, nombre de participants, taux de retour la semaine suivante.</li>
          </ol>
        </section>

        <section className="article-block">
          <h2 >Quiz digital vs quiz traditionnel</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-xl border border-white/10"><h3 className="text-lg font-semibold text-white mb-2">📝 Quiz papier</h3><ul className="list-disc pl-4 space-y-1 text-sm text-slate-300"><li>Zéro équipement</li><li>Correction manuelle</li><li>Ambiance traditionnelle</li><li>Limitié à 50 personnes</li></ul></div>
            <div className="p-4 rounded-xl border border-white/10"><h3 className="text-lg font-semibold text-white mb-2">📱 Quiz digital</h3><ul className="list-disc pl-4 space-y-1 text-sm text-slate-300"><li>Écran + connexion requis</li><li>Scores en temps réel</li><li>500+ participants possibles</li><li>Statistiques et classement auto</li><li>DJ vocal IA possible</li></ul></div>
          </div>
        </section>

        <section className="article-block">
          <h2 >Promouvoir votre soirée quiz</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-4">
            <li><strong>Réseaux sociaux</strong> — Posts hebdomadaires avec le thème du quiz, stories Instagram avec extraits de questions</li>
            <li><strong>En intérieur</strong> — Sous-verres personnalisés, affiches aux tables, marque-place avec QR code d&apos;inscription</li>
            <li><strong>Email</strong> — Newsletter hebdomadaire avec le classement et le thème de la semaine prochaine</li>
            <li><strong>Bouche-à-oreille</strong> — Offrez un verte au gagnant, ça parle vite</li>
          </ul>
        </section>

        <section className="article-block">
          <h2 >Indicateurs de succès</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-4">
            <li><strong>Chiffre d&apos;affaires par couvert</strong> — Objectif : +20 % vs un mardi normal</li>
            <li><strong>Taux de remplissage</strong> — Objectif : 80 % des places remplies</li>
            <li><strong>Taux de retour</strong> — Objectif : 40 % des équipes reviennent la semaine suivante</li>
            <li><strong>Durée de présence moyenne</strong> — Objectif : 2h30 (vs 1h30 sans animation)</li>
          </ul>
        </section>

        <section className="article-block">
          <h2 >Limitations</h2>
          <p>Ces conseils supposent que vous avez un espace suffisant et un budget pour un écran. Le quiz digital nécessite une connexion internet stable. Pour les très petits bars (moins de 30 places), le quiz papier peut être plus adapté.</p>
        </section>

        <aside className="article-card-takeaways">
          <h3 >Essayez Captain Bond Pro pour votre bar</h3>
          <p className="text-slate-200 mb-4">Questions automatiques, scores en temps réel, DJ vocal IA. Captain Bond Pro transforme votre établissement en salle de jeu interactive. Démo gratuite.</p>
          <Link href="/fr/b2b/bars-cafes" className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors">Demander une démo &rarr;</Link>
        </aside>

        <section className="border-t border-white/10 pt-8">
          <h2 className="text-2xl font-semibold mb-6">Articles connexes</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/fr/blog/augmenter-chiffre-bar-semaine" className="group">
              <p className="font-semibold text-white">Augmenter le chiffre d&apos;affaires de votre bar</p>
              <p className="text-sm text-slate-400 mt-1">Stratégies pour les soirs calmes</p>
            </Link>
            <Link href="/fr/blog/meilleurs-jeux-soiree-adulte-2026" className="group">
              <p className="font-semibold text-white">Meilleurs jeux de soirée 2026</p>
              <p className="text-sm text-slate-400 mt-1">Notre sélection</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
