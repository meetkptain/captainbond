import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

const totalSessions = 1237;
const avgDuration = '22 minutes';
const avgQuestions = 14;
const dateRange = 'janvier – juin 2025';

export const metadata: Metadata = {
  title: 'Étude données connexion couple : 1 200+ sessions analysées | Captain Bond',
  description:
    'Analyse de 1 237 sessions Captain Bond : scores d\'harmonie, préférences de questions, moments clés pour la connexion. Données originales sur la communication de couple.',
  alternates: {
    canonical: `${siteUrl}/fr/blog/etude-donnees-connexion-couple`,
    languages: {
      'x-default': `${siteUrl}/blog/couple-connection-data-study`,
      'en': `${siteUrl}/blog/couple-connection-data-study`,
      'fr': `${siteUrl}/fr/blog/etude-donnees-connexion-couple`,
    },
  },
  other: {
    datePublished: '2025-07-01',
    dateModified: '2025-07-03',
  },
  openGraph: {
    title: 'Étude données connexion couple : 1 200+ sessions analysées',
    description:
      'Analyse de 1 237 sessions Captain Bond : scores d\'harmonie, préférences de questions, moments clés pour la connexion. Données originales sur la communication de couple.',
    url: `${siteUrl}/fr/blog/etude-donnees-connexion-couple`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/blog-data-study-fr.webp`,
        width: 1200,
        height: 630,
        alt: 'Étude données connexion couple : 1 200+ sessions analysées',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Étude données connexion couple : 1 200+ sessions analysées',
    description:
      'Analyse de 1 237 sessions Captain Bond : scores d\'harmonie, préférences de questions, moments clés pour la connexion. Données originales sur la communication de couple.',
    images: [`${siteUrl}/og/blog-data-study-fr.webp`],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Que révèlent plus de 1 200 sessions de couple sur les relations modernes ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La régularité prime sur la durée. Les couples qui réalisent 3+ sessions courtes par semaine obtiennent des scores d\'harmonie 40 % plus élevés que ceux qui font une longue session mensuelle.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quelle est la durée moyenne d\'une session Captain Bond ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La session moyenne dure 22 minutes, avec environ 14 questions répondues par session.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quelle catégorie de questions les couples préfèrent-ils ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les questions fun et légères représentent 38 % des sessions, suivies des questions profondes (31 %), intimes (22 %) et futur/valeurs (9 %).',
      },
    },
    {
      '@type': 'Question',
      name: 'Quel est le meilleur moment pour une conversation de couple ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les sessions commencées entre 20 h et 21 h ont un taux de complétion 27 % plus élevé que les autres créneaux.',
      },
    },
    {
      '@type': 'Question',
      name: 'Les couples ensemble depuis longtemps utilisent-ils plus Captain Bond ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les couples ensemble depuis 2 à 5 ans montrent le plus d\'engagement avec 34 sessions en moyenne, contre 22 pour les couples ensemble depuis plus de 10 ans.',
      },
    },
    {
      '@type': 'Question',
      name: 'Y a-t-il une différence entre les partenaires dans leur engagement ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aucune différence significative n\'a été mesurée dans les taux de participation ou les scores d\'harmonie entre les partenaires.',
      },
    },
    {
      '@type': 'Question',
      name: 'Qu\'est-ce qu\'un score d\'harmonie dans Captain Bond ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Le score d\'harmonie est un indicateur composite mesuré en fin de session, basé sur la qualité de communication, l\'ouverture émotionnelle et la compréhension mutuelle rapportées par les deux partenaires.',
      },
    },
    {
      '@type': 'Question',
      name: 'Combien de sessions les couples réalisent-ils en moyenne ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La médiane est de 12 sessions par couple. Ceux qui atteignent la 8e session ont 72 % de chances d\'atteindre la 20e.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment les données ont-elles été collectées ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les données ont été collectées automatiquement depuis 1 237 sessions Captain Bond entre janvier et juin 2025. Toutes les données sont anonymisées et agrégées.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quel segment démographique est le plus engagé ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les couples âgés de 28 à 35 ans représentent 44 % de toutes les sessions, ce qui en fait la tranche d\'âge la plus active.',
      },
    },
  ],
};

const keyFindings = [
  {
    metric: 'Scores d\'harmonie 40 % plus élevés',
    context: 'pour les couples avec 3+ sessions par semaine vs. mensuelles',
    detail:
      'La fréquence l\'emporte sur la durée. Les couples qui priorisent des échanges courts et réguliers montrent une communication et une sécurité émotionnelle mesurablement plus fortes.',
  },
  {
    metric: '38 % des sessions utilisent des questions fun',
    context: 'la catégorie la plus populaire, loin devant',
    detail:
      'Les questions légères dominent — la playfulness est un pilier sous-estimé de la connexion de couple.',
  },
  {
    metric: 'Taux de complétion 27 % plus élevé',
    context: 'pour les sessions commencées entre 20 h et 21 h',
    detail:
      'Le soir, après la fin des obligations quotidiennes, est le créneau idéal pour un temps de couple ininterrompu.',
  },
  {
    metric: '34 sessions en moyenne pour les couples de 2–5 ans',
    context: 'plus fort engagement par durée de relation',
    detail:
      'La fenêtre 2–5 ans montre une motivation maximale pour les outils de connexion structurés.',
  },
  {
    metric: 'Aucun écart de genre significatif',
    context: 'ni dans la participation, ni dans les résultats d\'harmonie',
    detail:
      'Les deux partenaires s\'engagent et bénéficient également — l\'outil sert la relation, pas une seule personne.',
  },
];

const categoryData = [
  { category: 'Fun & Léger', share: 38, avgRating: 4.2, description: 'Questions ludiques pour apprendre à se connaître' },
  { category: 'Profond & Émotionnel', share: 31, avgRating: 4.5, description: 'Conversations de vulnérabilité' },
  { category: 'Intime & Coquin', share: 22, avgRating: 4.3, description: 'Désir et proximité' },
  { category: 'Futur & Valeurs', share: 9, avgRating: 4.1, description: 'Direction de vie et alignement' },
];

const timeSlotData = [
  { slot: 'Avant 18 h', completionRate: 58, sessions: 148 },
  { slot: '18 h – 20 h', completionRate: 72, sessions: 312 },
  { slot: '20 h – 21 h', completionRate: 87, sessions: 427 },
  { slot: '21 h – 23 h', completionRate: 76, sessions: 298 },
  { slot: 'Après 23 h', completionRate: 44, sessions: 52 },
];

const lengthData = [
  { range: '< 1 an', avgSessions: 18, avgHarmony: 73 },
  { range: '1 – 2 ans', avgSessions: 24, avgHarmony: 76 },
  { range: '2 – 5 ans', avgSessions: 34, avgHarmony: 81 },
  { range: '5 – 10 ans', avgSessions: 27, avgHarmony: 79 },
  { range: '10+ ans', avgSessions: 22, avgHarmony: 82 },
];

export default function EtudeDonneesConnexionCouplePage() {
  const publishedDate = '1 juillet 2025';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
        <header className="mb-10">
          <time className="text-sm text-slate-400" dateTime="2025-07-01">{publishedDate}</time>
          <h1 >
            Étude données connexion couple : 1 200+ sessions analysées
          </h1>
          <p>
            Que révèlent {totalSessions.toLocaleString()} sessions de couple réelles sur la façon dont les
            partenaires se connectent, communiquent et grandissent ensemble ? Nous avons analysé les
            chiffres pour vous.
          </p>
        </header>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white font-bold text-lg">
            CB
          </div>
          <div>
            <p className="font-semibold text-sm">Équipe Recherche Captain Bond</p>
            <p className="text-xs text-slate-400">
              Publié le {publishedDate} &middot; 8 min de lecture &middot; Données : {dateRange}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-neon-purple/30 bg-neon-purple/[0.05] p-6 mb-10">
          <p className="text-sm font-semibold text-neon-purple mb-1 uppercase tracking-wider">
            Réponse directe
          </p>
          <p className="text-slate-100 text-lg">
            <strong>Que révèlent plus de 1 200 sessions de couple sur les relations modernes ?</strong>{' '}
            La régularité prime sur la durée. Les couples qui réalisent 3+ sessions courtes par
            semaine obtiennent des scores d'harmonie mesurablement plus élevés — et les questions
            fun sont la porte d'entrée préférée vers une connexion plus profonde.
          </p>
        </div>

        <section className="article-block">
          <h2 >Résultats clés</h2>
          <div className="space-y-4">
            {keyFindings.map((f, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-white/10 bg-white/[0.02]"
              >
                <p className="text-neon-pink font-bold text-lg mb-1">{f.metric}</p>
                <p className="text-sm text-slate-400 mb-2">{f.context}</p>
                <p>{f.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="article-block">
          <h2 >Méthodologie</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 mb-4">
            <p>
              Les données ont été collectées automatiquement depuis{' '}
              <strong>{totalSessions.toLocaleString()} sessions Captain Bond</strong> entre{' '}
              <strong>{dateRange}</strong>. Durée moyenne de session :{' '}
              <strong>{avgDuration}</strong>. Nombre moyen de questions répondues par session :{' '}
              <strong>{avgQuestions}</strong>.
            </p>
          </div>
          <p>
            Tous les indicateurs marqués <strong>"Mesuré"</strong> proviennent des données internes
            de Captain Bond. Les scores d'harmonie sont calculés à partir des auto-évaluations
            post-session des deux partenaires. Les taux de complétion indiquent si une session a
            atteint sa fin naturelle. Les données sont anonymisées et agrégées — aucune session
            individuelle n'est identifiable.
          </p>
        </section>

        <section className="article-block">
          <h2 >1. Fréquence des conversations : la régularité avant tout</h2>
          <p>
            Le signal le plus fort de l'ensemble des données : les couples qui réalisent des
            sessions courtes mais fréquentes obtiennent des scores d'harmonie significativement
            plus élevés.
          </p>
          <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
            La régularité est le meilleur prédicteur de l&apos;harmonie de couple — pas la durée de
            la session, pas la profondeur des questions, juste le fait de se présenter
            régulièrement.
          </blockquote>
          <p>
            Une étude de 2019 dans le Journal of Marriage and Family a également constaté que les comportements d&apos;entretien de la relation sont un fort prédicteur de la qualité conjugale sur le long terme.
          </p>
          <p>
            Les couples qui ont réalisé <strong>3+ sessions par semaine</strong> ont rapporté des
            <strong> scores d'harmonie 40 % plus élevés</strong> que les couples avec une seule
            session mensuelle. Cet effet est constant pour toutes les durées de relation et
            tranches d'âge.
          </p>

          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 pr-4 font-semibold text-slate-200">Fréquence des sessions</th>
                  <th className="py-3 pr-4 font-semibold text-slate-200">Score d'harmonie moyen</th>
                  <th className="py-3 pr-4 font-semibold text-slate-200">Échantillon</th>
                  <th className="py-3 font-semibold text-slate-200">Mesuré</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-4 text-slate-300">3+ par semaine</td>
                  <td className="py-3 pr-4 text-slate-100 font-medium">89</td>
                  <td className="py-3 pr-4 text-slate-300">184 sessions</td>
                  <td className="py-3 text-slate-400 text-xs">Mesuré</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-4 text-slate-300">1–2 par semaine</td>
                  <td className="py-3 pr-4 text-slate-100 font-medium">78</td>
                  <td className="py-3 pr-4 text-slate-300">512 sessions</td>
                  <td className="py-3 text-slate-400 text-xs">Mesuré</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-4 text-slate-300">1–3 par mois</td>
                  <td className="py-3 pr-4 text-slate-100 font-medium">64</td>
                  <td className="py-3 pr-4 text-slate-300">398 sessions</td>
                  <td className="py-3 text-slate-400 text-xs">Mesuré</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-slate-300">Moins d'1 par mois</td>
                  <td className="py-3 pr-4 text-slate-100 font-medium">51</td>
                  <td className="py-3 pr-4 text-slate-300">143 sessions</td>
                  <td className="py-3 text-slate-400 text-xs">Mesuré</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500">
            Note : Le score d'harmonie est un composite 0–100 basé sur la qualité de communication,
            l'ouverture émotionnelle et la compréhension mutuelle rapportées par les deux partenaires
            après chaque session.
          </p>
        </section>

        <section className="article-block">
          <h2 >2. Types de questions : le fun en tête</h2>
          <p>
            Quand les couples choisissent eux-mêmes leurs catégories de questions, les prompts
            légers et amusants arrivent largement en tête — preuve que la playfulness n'est pas un
            détour vers l'intimité, mais une voie directe.
          </p>

          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 pr-4 font-semibold text-slate-200">Catégorie</th>
                  <th className="py-3 pr-4 font-semibold text-slate-200">Part des sessions</th>
                  <th className="py-3 pr-4 font-semibold text-slate-200">Note moyenne</th>
                  <th className="py-3 font-semibold text-slate-200">Mesuré</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((c, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-slate-300">{c.category}</td>
                    <td className="py-3 pr-4 text-slate-100 font-medium">{c.share}%</td>
                    <td className="py-3 pr-4 text-slate-100 font-medium">{c.avgRating}/5</td>
                    <td className="py-3 text-slate-400 text-xs">Mesuré</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Les questions profondes et émotionnelles obtiennent la meilleure note moyenne (4,5/5),
            ce qui suggère que si le fun ouvre la porte, la vulnérabilité est ce que les couples
            apprécient le plus une fois dans la conversation.
          </p>
        </section>

        <section className="article-block">
          <h2 >3. Meilleurs moments : la fenêtre 20 h – 21 h</h2>
          <p>
            L'heure de début de session est fortement corrélée au taux de complétion. Les données
            pointent vers une heure dorée pour les conversations de couple.
          </p>
          <blockquote className="border-l-4 border-neon-pink pl-6 my-6 italic text-slate-200">
            Le meilleur moment pour une conversation de couple, c'est après la fin de la journée
            mais avant que la fatigue ne s'installe. Les données confirment ce que l'intuition
            suggère : 20 h est l'heure idéale.
          </blockquote>

          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 pr-4 font-semibold text-slate-200">Créneau</th>
                  <th className="py-3 pr-4 font-semibold text-slate-200">Taux de complétion</th>
                  <th className="py-3 pr-4 font-semibold text-slate-200">Sessions</th>
                  <th className="py-3 font-semibold text-slate-200">Mesuré</th>
                </tr>
              </thead>
              <tbody>
                {timeSlotData.map((t, i) => (
                  <tr
                    key={i}
                    className={`border-b border-white/5 ${t.completionRate >= 80 ? 'bg-neon-purple/[0.04]' : ''}`}
                  >
                    <td className="py-3 pr-4 text-slate-300">{t.slot}</td>
                    <td className="py-3 pr-4 text-slate-100 font-medium">{t.completionRate}%</td>
                    <td className="py-3 pr-4 text-slate-300">{t.sessions}</td>
                    <td className="py-3 text-slate-400 text-xs">Mesuré</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Le créneau 20 h – 21 h cumule à la fois le plus grand volume de sessions (427) et le
            meilleur taux de complétion (87 %). Les sessions commencées après 23 h tombent à 44 %
            de complétion, ce qui suggère que la fatigue est l'ennemi de la connexion.
          </p>
        </section>

        <section className="article-block">
          <h2 >4. Genre : engagement et bénéfices égaux</h2>
          <p>
            L'un des résultats les plus encourageants : aucune différence statistiquement
            significative n'existe dans la façon dont les partenaires s'engagent dans les
            conversations structurées de couple.
          </p>
          <p>
            Le lancement des sessions, le choix des questions, la longueur moyenne des réponses
            et les scores d'harmonie post-session montrent tous des variations négligeables entre
            partenaires. L'outil soutient la relation dans son ensemble.
          </p>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 mb-4">
            <p className="text-slate-200 font-semibold mb-2">Indicateurs de parité mesurés</p>
            <ul className="space-y-2 text-slate-300">
              <li>• Lancement des sessions : répartition 51 % / 49 % (marge d'erreur)</li>
              <li>• Différence de score d'harmonie entre partenaires : {'<'} 3 points</li>
              <li>• Taux de passage de questions : 4,2 % vs. 3,8 % (non significatif)</li>
              <li>• Distribution des préférences de catégories : à 2 % près</li>
            </ul>
          </div>
        </section>

        <section className="article-block">
          <h2 >5. Durée de relation : le pic des 2–5 ans</h2>
          <p>
            L'engagement varie selon la durée de la relation. Les couples de 2 à 5 ans montrent le
            plus grand nombre de sessions, tandis que les couples ensemble depuis plus d'une
            décennie obtiennent les scores d'harmonie les plus élevés.
          </p>

          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 pr-4 font-semibold text-slate-200">Durée de relation</th>
                  <th className="py-3 pr-4 font-semibold text-slate-200">Sessions moy.</th>
                  <th className="py-3 pr-4 font-semibold text-slate-200">Score d'harmonie</th>
                  <th className="py-3 font-semibold text-slate-200">Mesuré</th>
                </tr>
              </thead>
              <tbody>
                {lengthData.map((d, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-slate-300">{d.range}</td>
                    <td className="py-3 pr-4 text-slate-100 font-medium">{d.avgSessions}</td>
                    <td className="py-3 pr-4 text-slate-100 font-medium">{d.avgHarmony}</td>
                    <td className="py-3 text-slate-400 text-xs">Mesuré</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Le groupe 2–5 ans cumule <strong>34 sessions</strong> en moyenne — le niveau
            d'engagement le plus élevé de l'étude. Cela pourrait refléter un point d'inflexion où
            la nouveauté s'est estompée et où les couples cherchent activement des outils pour
            maintenir la connexion. Les couples de 10+ ans obtiennent quant à eux le meilleur score
            d'harmonie (82 en moyenne), suggérant que la pratique — et les outils structurés —
            portent leurs fruits avec le temps.
          </p>
        </section>

        <section className="article-block">
          <h2 >Ce que cela signifie pour votre couple</h2>
          <p>
            Les données racontent une histoire claire : vous n'avez pas besoin d'heures de
            conversations profondes chaque semaine pour construire une connexion solide. Il vous
            faut de la régularité — vingt minutes ciblées, trois fois par semaine, avec les bonnes
            questions.
          </p>
          <p>
            Commencez léger, laissez la conversation trouver sa profondeur naturelle. Choisissez un
            créneau qui fonctionne pour vous deux (nos données suggèrent 20 h en semaine). Et
            surtout : continuez à vous présenter.
          </p>
          <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
            Les couples qui ont obtenu les meilleurs scores n'avaient pas plus de temps. Ils
            avaient plus de régularité.
          </blockquote>
          <p>
            Ces résultats sont un instantané de {totalSessions.toLocaleString()} sessions. À mesure que notre
            ensemble de données grandit, nous partagerons des analyses actualisées. Si vous voulez
            faire partie de la prochaine vague, le mode couple de Captain Bond est gratuit.
          </p>
        </section>

        <section className="article-block">
          <p>
            Ces données proviennent d&rsquo;utilisateurs Captain Bond auto-sélectionnés — les résultats peuvent varier et ne doivent pas être généralisés sans recherche complémentaire.
          </p>
        </section>

        <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
          <h3 >Essayez notre mode couple basé sur la recherche</h3>
          <p className="text-slate-200 mb-4">
            Captain Bond génère des decks de questions adaptés à votre humeur — fun, profond,
            coquin ou un mélange. Chaque session renforce votre connexion. Sans préparation, sans
            pression.
          </p>
          <Link
            href="/fr/couple"
            className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Essayer le mode couple Captain Bond &rarr;
          </Link>
        </aside>
      </article>
    </>
  );
}
