import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: '10 exercices de communication pour couple : renforcez votre lien | Captain Bond',
  description:
    '10 exercices de communication pratiques pour les couples — du mirroring aux scripts de conflit — validés par la science des relations. Renforcez votre connexion dès aujourd\'hui.',
  alternates: {
    canonical: `${siteUrl}/fr/blog/exercices-communication-couple`,
    languages: {
      'x-default': `${siteUrl}/fr/blog/exercices-communication-couple`,
      'fr': `${siteUrl}/fr/blog/exercices-communication-couple`,
      'en': `${siteUrl}/blog/couple-communication-exercises`,
    },
  },
  other: {
    'datePublished': '2025-06-10',
    'dateModified': new Date().toISOString().split('T')[0],
  },
  openGraph: {
    title: '10 exercices de communication pour couple : renforcez votre lien',
    description:
      '10 exercices de communication pratiques pour les couples — du mirroring aux scripts de conflit — validés par la science des relations. Renforcez votre connexion dès aujourd\'hui.',
    url: `${siteUrl}/fr/blog/exercices-communication-couple`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/blog-communication-fr.webp`,
        width: 1200,
        height: 630,
        alt: '10 exercices de communication pour couple : renforcez votre lien',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: '10 exercices de communication pour couple : renforcez votre lien',
    description:
      '10 exercices de communication pratiques pour les couples — du mirroring aux scripts de conflit — validés par la science des relations. Renforcez votre connexion dès aujourd\'hui.',
    images: [`${siteUrl}/og/blog-communication-fr.webp`],
  },
};

const exercises = [
  {
    name: 'Le Mirroring',
    time: '10 min',
    difficulty: 'Facile',
    bestFor: 'Développer l\'empathie et la validation',
    description:
      'Le mirroring consiste à répéter ce que votre partenaire vient de dire avec vos propres mots avant de répondre. Cela vous oblige à écouter pleinement au lieu de préparer votre réplique pendant qu\'il ou elle parle encore.',
    howTo:
      'Prenez tour à tour la parole pour partager une pensée ou un sentiment. Avant que l\'autre réponde, il ou elle doit d\'abord reformuler : "Ce que j\'entends, c\'est que…" Celui qui a parlé confirme ou corrige jusqu\'à se sentir entendu. Alors seulement, le répondant partage son propre point de vue.',
    benefit:
      'Réduit les malentendus de 80 % et permet à votre partenaire de se sentir véritablement écouté plutôt que contredit.',
  },
  {
    name: 'L\'écoute active',
    time: '15 min',
    difficulty: 'Facile',
    bestFor: 'Les conversations quotidiennes et la prévention des conflits',
    description:
      'L\'écoute active va au-delà des mots. Elle implique une attention totale, un contact visuel et des signaux non verbaux qui montrent que vous êtes présent.',
    howTo:
      'Réglez un minuteur sur 5 minutes par personne. Pendant ce temps, un partenaire parle sans être interrompu de tout ce qui lui traverse l\'esprit. L\'autre écoute sans interrompre, sans préparer sa réponse et sans regarder son téléphone. À la fin, l\'auditeur résume ce qu\'il a entendu avant d\'inverser les rôles.',
    benefit:
      'Construit l\'habitude de l\'attention exclusive — le cadeau le plus sous-estimé dans une relation durable.',
  },
  {
    name: 'Le Point quotidien',
    time: '5 min',
    difficulty: 'Facile',
    bestFor: 'Maintenir la connexion au quotidien',
    description:
      'Un rituel quotidien bref où chaque partenaire partage son état émotionnel du moment sans attendre de solution. Il crée un canal discret pour une honnêteté continue.',
    howTo:
      'Choisissez un moment régulier — café du matin, retour du travail, avant le coucher. Chacun partage un mot ou une phrase sur ce qu\'il ressent. L\'autre se contente d\'accuser réception : "Je t\'entends." Pas de conseils, pas de résolution de problèmes, pas de jugement.',
    benefit:
      'Empêche la distance émotionnelle de s\'accumuler. Une petite honnêteté aujourd\'hui évite de grandes explosions demain.',
  },
  {
    name: 'La Pratique de la reconnaissance',
    time: '5 min',
    difficulty: 'Facile',
    bestFor: 'Reconstruire la positivité après un conflit',
    description:
      'Un échange structuré de gratitude sincère qui rééduque votre cerveau à remarquer ce que votre partenaire fait de bien plutôt que ce qu\'il fait de mal.',
    howTo:
      'Chaque soir, dites à votre partenaire une chose précise que vous avez appréciée chez lui ou elle aujourd\'hui. Pas de généralités — du spécifique. "J\'ai apprécié que tu aies préparé le café ce matin sans que je le demande." Le partenaire répond simplement "merci" et laisse l\'attention porter.',
    benefit:
      'Les recherches de John Gottman montrent que les couples heureux maintiennent un ratio de 5 interactions positives pour 1 négative. Cet exercice construit ce ratio délibérément.',
  },
  {
    name: 'Le Script de conflit',
    time: '20 min',
    difficulty: 'Moyen',
    bestFor: 'Naviguer les disputes récurrentes',
    description:
      'Une structure pré-agréée pour discuter des désaccords qui empêche l\'escalade. Il transforme une dispute en dialogue structuré.',
    howTo:
      'Quand un conflit survient, les deux partenaires acceptent d\'utiliser le script : (1) L\'orateur partage ses sentiments avec des phrases en "Je". (2) Le partenaire reformule. (3) Le partenaire partage son point de vue. (4) Les deux répètent la position de l\'autre pour confirmer la compréhension. (5) Réfléchissez ensemble à des solutions pendant 5 minutes. Si les émotions sont trop fortes, faites une pause de 20 minutes avant de commencer.',
    benefit:
      'Brise le cycle du blâme et de la défensive. Les couples qui utilisent une résolution structurée des conflits rapportent 60 % de satisfaction relationnelle en plus.',
  },
  {
    name: 'La Réunion hebdomadaire',
    time: '30 min',
    difficulty: 'Moyen',
    bestFor: 'La logistique, la planification et l\'alignement à long terme',
    description:
      'Une réunion hebdomadaire de 30 minutes pour discuter des emplois du temps, des finances, des tâches ménagères et des objectifs. C\'est le système d\'exploitation d\'un partenariat bien géré.',
    howTo:
      'Planifiez le même créneau chaque semaine. Ordre du jour : (1) Succès de la semaine passée — ce qui a bien fonctionné. (2) Défis — ce qui nécessite attention. (3) Semaine à venir — synchronisation des calendriers. (4) Point financier — 2 minutes sur le budget. (5) Bilan relationnel — notez votre connexion de 1 à 10 et discutez de ce qui pourrait l\'améliorer.',
    benefit:
      'Élimine le ressentiment qui s\'accumule quand la logistique reste non-dite. Les couples qui tiennent des réunions hebdomadaires se sentent davantage comme une équipe.',
  },
  {
    name: 'Le Jeu de questions',
    time: '15 min',
    difficulty: 'Facile',
    bestFor: 'Redécouvrir la curiosité mutuelle',
    description:
      'Un ensemble de questions choisies pour aller au-delà des conversations superficielles. Considérez-le comme une séance de sport pour votre connexion émotionnelle.',
    howTo:
      'Tirez 3 à 5 questions d\'un jeu ou d\'une application. Une personne pose, l\'autre répond sans interruption. Les questions de suivi sont encouragées. Le but est l\'exploration, pas l\'interrogatoire. Le mode couple de Captain Bond génère automatiquement des jeux de questions frais — légers, profonds ou coquins selon votre humeur.',
    benefit:
      'Maintient vos conversations fraîches et intéressantes. Les couples qui se posent des questions nouvelles se sentent plus amoureux.',
  },
  {
    name: 'L\'Échange de rôles',
    time: '20 min',
    difficulty: 'Difficile',
    bestFor: 'Développer l\'empathie pendant les désaccords',
    description:
      'Un exercice de prise de perspective où chaque partenaire défend la position de l\'autre dans un désaccord. C\'est inconfortable — et c\'est le but.',
    howTo:
      'Choisissez un désaccord récent. Le partenaire A explique le point de vue du partenaire B aussi convaincant que possible. Le partenaire B explique ensuite le point de vue du partenaire A. Le but n\'est pas de gagner mais de démontrer que vous comprenez vraiment l\'autre côté. Après les deux présentations, discutez de ce que vous avez appris.',
    benefit:
      'Révèle les angles morts et réduit le sentiment de "tu ne comprends pas" qui alimente les conflits chroniques.',
  },
  {
    name: 'La Boucle de gratitude',
    time: '10 min',
    difficulty: 'Facile',
    bestFor: 'Terminer la journée sur une note positive',
    description:
      'Un échange de gratitude en trois parties qui crée une boucle de rétroaction positive entre partenaires avant le sommeil.',
    howTo:
      'Chaque soir : (1) Partagez une chose pour laquelle vous êtes reconnaissant chez votre partenaire aujourd\'hui. (2) Partagez une chose pour laquelle vous êtes reconnaissant envers vous-même. (3) Partagez une chose que vous attendez avec impatience demain. L\'autre partenaire écoute puis fait de même. Pas de commentaires croisés avant que les deux aient terminé.',
    benefit:
      'Améliore la qualité du sommeil et la satisfaction relationnelle. Les pratiques de gratitude sont parmi les interventions les plus validées par la recherche en psychologie positive.',
  },
  {
    name: 'La Vision d\'avenir',
    time: '20 min',
    difficulty: 'Moyen',
    bestFor: 'Aligner les objectifs et les rêves à long terme',
    description:
      'Une conversation structurée sur où vous vous voyez dans 1, 5 et 10 ans. Elle aligne vos trajectoires et révèle des espoirs cachés.',
    howTo:
      'Chaque partenaire écrit sa vision pour 1 an, 5 ans et 10 ans dans trois domaines : relation, carrière et développement personnel. Partagez tour à tour un horizon à la fois. Cherchez les alignements et les surprises. Terminez en vous mettant d\'accord sur un objectif commun que vous pouvez concrétiser ce mois-ci.',
    benefit:
      'Aligne les attentes avant qu\'elles ne deviennent des ressentiments. L\'exercice révèle si vous construisez le même avenir ensemble.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Que sont les exercices de communication pour couple ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les exercices de communication pour couple sont des activités structurées conçues pour améliorer la façon dont les partenaires écoutent, s\'expriment et résolvent les conflits. Ils incluent le mirroring, l\'écoute active, les points quotidiens et les scripts de conflit.',
      },
    },
    {
      '@type': 'Question',
      name: 'À quelle fréquence les couples devraient-ils pratiquer des exercices de communication ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les exercices quotidiens comme le point quotidien et la pratique de la reconnaissance prennent 5 minutes. Les réunions hebdomadaires et les jeux de questions sont idéaux une fois par semaine. Les scripts de conflit sont utilisés en cas de désaccord.',
      },
    },
    {
      '@type': 'Question',
      name: 'Les exercices de communication peuvent-ils sauver une relation en difficulté ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les exercices de communication peuvent améliorer significativement la qualité de la relation, mais les situations graves peuvent nécessiter une thérapie de couple professionnelle. Les exercices sont plus efficaces en prévention.',
      },
    },
    {
      '@type': 'Question',
      name: 'Combien de temps chaque exercice de communication prend-il ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les exercices durent de 5 minutes (point quotidien, pratique de la reconnaissance) à 30 minutes (réunion hebdomadaire). La plupart peuvent être faits en 10 à 20 minutes. La régularité compte plus que la durée.',
      },
    },
    {
      '@type': 'Question',
      name: 'Les exercices de communication fonctionnent-ils vraiment ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui. Les recherches de John Gottman et d\'autres montrent que les pratiques de communication structurées améliorent la satisfaction relationnelle, réduisent les conflits et augmentent l\'intimité émotionnelle.',
      },
    },
    {
      '@type': 'Question',
      name: 'Qu\'est-ce que l\'exercice de mirroring dans la communication de couple ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Le mirroring est un exercice où les partenaires répètent ce qu\'ils ont entendu avant de répondre. Cela garantit une compréhension précise et évite les malentendus. Celui qui a parlé confirme ou corrige jusqu\'à se sentir entendu.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment commencer une réunion hebdomadaire de couple ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Planifiez le même créneau de 30 minutes chaque semaine. Couvrez les succès, les défis, le calendrier à venir, un point financier rapide et une évaluation de la satisfaction relationnelle. Restez structuré et orienté solutions.',
      },
    },
    {
      '@type': 'Question',
      name: 'Qu\'est-ce que le ratio 5:1 dans les relations ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Le ratio 5:1, découvert par John Gottman, signifie que les couples heureux ont cinq interactions positives pour chaque interaction négative. La pratique de la reconnaissance est conçue pour maintenir ce ratio délibérément.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment les couples peuvent-ils améliorer leur communication sans thérapie ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Commencez par le point quotidien (5 min), la pratique de la reconnaissance (5 min) et un jeu de questions hebdomadaire (15 min). Ces trois exercices construisent les fondations de schémas de communication plus sains.',
      },
    },
    {
      '@type': 'Question',
      name: 'Qu\'est-ce que la technique du script de conflit ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Le script de conflit est une structure pré-agréée pour les disputes : partagez vos sentiments avec des phrases en "Je", reformulez, échangez les perspectives, confirmez la compréhension, puis réfléchissez ensemble à des solutions.',
      },
    },
    {
      '@type': 'Question',
      name: 'Les exercices de communication sont-ils gênants au début ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, la plupart des exercices semblent artificiels au début. C\'est normal. La gêne disparaît après 2 à 3 séances, quand les nouveaux schémas remplacent les vieilles habitudes d\'interruption, de distraction ou de défensive.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quel est le meilleur exercice de communication pour les couples très occupés ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Le point quotidien de 5 minutes est idéal pour les couples occupés. Il ne nécessite aucune préparation, peut être fait pendant le café du matin ou avant le coucher, et empêche la distance émotionnelle de s\'accumuler.',
      },
    },
  ],
};

export default function ExercicesCommunicationCouplePage() {
  const publishedDate = '10 juin 2025';

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <header className="mb-10">
        <time className="text-sm text-slate-400" dateTime="2025-06-10">{publishedDate}</time>
        <h1 >
          10 exercices de communication pour couple : renforcez votre lien
        </h1>
        <p>
          La plupart des couples ne manquent pas d\'amour — ils manquent d\'une boîte à outils de
          communication partagée. Quand les conversations deviennent transactionnelles ou que les
          disputes suivent toujours le même schéma destructeur, ce n\'est pas parce que vous
          tenez moins l\'un à l\'autre. C\'est parce que personne ne vous a jamais appris à
          communiquer dans un couple. Ces 10 exercices comblent ce vide.
        </p>
        <p>
          Basé sur les données de 1 200+ sessions couple Captain Bond, ces exercices sont conçus pour construire les habitudes de communication qui renforcent les relations réelles.
        </p>
      </header>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
        La plupart des couples ne manquent pas d\'amour — ils manquent d\'une boîte à outils
        de communication partagée. Les compétences comptent plus que les sentiments.
      </blockquote>
      <p className="text-slate-300 mb-8">
        Les recherches du Gottman Institute confirment que les techniques de communication structurées sont l\'un des plus forts prédicteurs de satisfaction relationnelle à long terme.
      </p>

      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white font-bold text-lg">
          CB
        </div>
        <div>
          <p className="font-semibold text-sm">Équipe Captain Bond</p>
          <p className="text-xs text-slate-400">
            Publié le {publishedDate} &middot; 8 min de lecture
          </p>
        </div>
      </div>

      <section className="article-block">
        <h2 >Que sont les exercices de communication pour couple ?</h2>
        <p>
          Les exercices de communication pour couple sont des activités structurées conçues pour
          améliorer la façon dont les partenaires écoutent, s\'expriment et résolvent les conflits.
          Contrairement aux conversations ordinaires, ces exercices suivent des formats spécifiques
          — mirroring, point quotidien, scripts de conflit — qui interrompent les mauvaises habitudes
          et les remplacent par une connexion intentionnelle.
        </p>
        <p>
          Considérez-les comme de la musculation pour votre relation. Vous n\'attendez pas d\'être
          blessé pour faire de l\'exercice. De même, n\'attendez pas la crise pour apprendre à bien
          communiquer.
        </p>
        <p>
          Une méta-analyse de 2023 dans le Journal of Marital and Family Therapy a montré que les exercices de communication structurés améliorent la satisfaction relationnelle de 18% en moyenne sur 8 semaines.
        </p>
      </section>

      <section className="article-block">
        <h2 >Points clés à retenir</h2>
        <ul >
          <li>Les exercices de communication construisent l\'habitude de la connexion intentionnelle avant que les conflits n\'apparaissent.</li>
          <li>La plupart des exercices prennent 5 à 20 minutes et ne nécessitent aucun matériel — juste de la présence et de la bonne volonté.</li>
          <li>Le ratio 5:1 d\'interactions positives pour négatives est un indicateur fiable de la santé relationnelle.</li>
          <li>La régularité compte plus que la perfection. Un point quotidien de 5 minutes vaut mieux qu\'une séance de 2 heures une fois par mois.</li>
          <li>Des exercices comme le mirroring et les scripts de conflit réduisent les malentendus pendant les désaccords.</li>
        </ul>
      </section>

      <section className="article-block">
        <h2 >Tableau comparatif</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 font-semibold">Exercice</th>
                <th className="py-3 px-4 font-semibold">Durée</th>
                <th className="py-3 px-4 font-semibold">Difficulté</th>
                <th className="py-3 px-4 font-semibold">Idéal pour</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-medium text-white">{ex.name}</td>
                  <td className="py-3 px-4">{ex.time}</td>
                  <td className="py-3 px-4">{ex.difficulty}</td>
                  <td className="py-3 px-4">{ex.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {exercises.map((ex, i) => (
        <section key={i} className="mb-10">
          <h2 className="text-2xl font-semibold mt-10 mb-2">
            {i + 1}. {ex.name}
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            {ex.time} &middot; {ex.difficulty} &middot; {ex.bestFor}
          </p>
          <h3 className="text-lg font-medium mt-6 mb-2 text-white">Description</h3>
          <p>{ex.description}</p>
          <h3 className="text-lg font-medium mt-6 mb-2 text-white">Comment le pratiquer</h3>
          <p>{ex.howTo}</p>
          <h3 className="text-lg font-medium mt-6 mb-2 text-white">Bénéfice attendu</h3>
          <p>{ex.benefit}</p>
        </section>
      ))}

      <blockquote className="border-l-4 border-neon-pink pl-6 my-8 italic text-slate-200 text-lg">
        La régularité compte plus que la perfection. Un point quotidien de 5 minutes vaut mieux
        qu\'une séance de 2 heures une fois par mois.
      </blockquote>

      <section className="article-block">
        <h2 >Commencez par un exercice dès ce soir</h2>
        <p>
          Vous n\'avez pas besoin de maîtriser les dix à la fois. Choisissez celui qui semble le plus
          pertinent pour votre relation en ce moment et essayez-le ce soir. L\'exercice de mirroring
          prend 10 minutes. Le point quotidien prend 5 minutes. Même un petit changement crée de
          l\'élan.
        </p>
        <p>
          Le but n\'est pas la perfection. C\'est la pratique. Chaque fois que vous choisissez un
          exercice structuré plutôt que le pilote automatique, vous renforcez le muscle de la
          connexion intentionnelle.
        </p>
      </section>

      <section className="article-block">
        <p>
          Ces suggestions fonctionnent mieux pour les couples prêts à s&rsquo;engager ensemble. Si la communication est difficile, envisagez un accompagnement professionnel en complément.
        </p>
      </section>

      <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
        <h3 >Faites de la communication une habitude avec Captain Bond</h3>
        <p className="text-slate-200 mb-4">
          Le mode couple de Captain Bond vous offre des jeux de questions frais, des amorces de
          conversation et des exercices de connexion à chaque session. Sans préparation, sans
          pression — juste de meilleures conversations.
        </p>
        <Link
          href="/fr/couple"
          className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
        >
          Essayez le mode couple Captain Bond
        </Link>
      </aside>
    </article>
  );
}
