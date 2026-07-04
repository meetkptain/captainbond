import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: '150 questions pour couple : du fun au profond | Captain Bond',
  description:
    "Une liste de questions pour couple pour rire, se découvrir, aborder l'intimité et construire un futur commun — avec un rituel simple pour les intégrer au quotidien.",
  alternates: {
    canonical: `${siteUrl}/fr/blog/questions-pour-couple`,
    languages: {
      'x-default': `${siteUrl}/blog/questions-pour-couple`,
      'en': `${siteUrl}/blog/questions-pour-couple`,
      'fr': `${siteUrl}/fr/blog/questions-pour-couple`,
    },
  },
  openGraph: {
    title: '150 questions pour couple : du fun au profond',
    description:
      "Une liste de questions pour couple pour rire, se découvrir, aborder l'intimité et construire un futur commun — avec un rituel simple pour les intégrer au quotidien.",
    url: `${siteUrl}/fr/blog/questions-pour-couple`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/blog-questions-couple-fr.webp`,
        width: 1200,
        height: 630,
        alt: '150 questions pour couple : du fun au profond',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: '150 questions pour couple : du fun au profond',
    description:
      "Une liste de questions pour couple pour rire, se découvrir, aborder l'intimité et construire un futur commun — avec un rituel simple pour les intégrer au quotidien.",
    images: [`${siteUrl}/og/blog-questions-couple-fr.webp`],
  },
  other: {
    'datePublished': '2025-06-01',
    'dateModified': '2025-07-03',
  },
};

const funQuestions = [
  'Quelle chanson te fait danser immédiatement, où que tu sois ?',
  'Quel personnage de fiction voudrais-tu comme colocataire ?',
  'Ananas sur la pizza : oui, non, ou seulement si personne ne regarde ?',
  'Si tu pouvais avoir un super-pouvoir pendant un jour, lequel choisirais-tu ?',
  'Quelle était ta peur d’enfant la plus ridicule ?',
  'Quel plat pourrais-tu manger tous les jours pendant un mois sans te lasser ?',
  'Si on pouvait se téléporter ce week-end, où irais-tu ?',
  'Quel est le pire film que tu aimes en secret ?',
  'Chien ou chat — et est-ce que ta réponse a changé avec le temps ?',
  'Quelle émission TV regardes-tu en cachette ?',
  'Si tu étais un cocktail, comment s’appellerait-il ?',
  'Quelle est la chose la plus drôle qui t’est arrivée cette semaine ?',
  'Préférerais-tu parler toutes les langues ou jouer de tous les instruments ?',
  'Quelle compétence aléatoire aimerais-tu avoir ?',
  'Avec quelle célébrité aimerais-tu dîner ?',
  'Quelle est ton odeur préférée et pourquoi ?',
  'Si tu devais porter une seule tenue pour toujours, laquelle choisirais-tu ?',
  'À quel jeu de société deviens-tu ultra compétitif·ve ?',
  'Quelle combinaison alimentaire bizarre aimes-tu vraiment ?',
  'Si notre vie avait un titre de sitcom, lequel ce serait ?',
  'Quel est ton talent caché ?',
  'Vacances à la plage ou chalet à la montagne ?',
  'Quelle application utilises-tu bien plus que tu ne le voudrais ?',
  'Si tu pouvais te renommer, quel prénom choisirais-tu ?',
  'Quelle est ta chanson de karaoké incontournable ?',
  'Quelle saison correspond le mieux à ta personnalité ?',
  'Quel est l’achat le plus impulsif que tu aies jamais fait ?',
  'Si tu pouvais échanger ta vie avec quelqu’un pendant une semaine, qui choisirais-tu ?',
  'Quel est le son que tu préfères au monde ?',
  'Quel emoji te représente le mieux aujourd’hui ?',
];

const gettingToKnowQuestions = [
  'Que voulais-tu faire quand tu avais dix ans ?',
  'Qui était ton premier vrai modèle ?',
  'Quelle tradition familiale veux-tu garder vivante ?',
  'Quel souvenir te fait toujours sourire ?',
  'Comment tes parents montraient-ils leur amour ?',
  'Quel est le meilleur conseil que tu aies jamais reçu ?',
  'Quel livre a changé ta façon de voir les choses ?',
  'Quelle est ta réussite la plus fière en dehors du travail ?',
  'À quoi ressemble un dimanche parfait pour toi ?',
  'Qu’est-ce que les gens comprennent souvent mal chez toi ?',
  'Quelle valeur ne compromettrais-tu jamais ?',
  'Quand te sens-tu le plus toi-même ?',
  'Quel est ton premier souvenir net ?',
  'Quelle amitié t’a le plus appris sur la confiance ?',
  'Quel endroit te fait le plus sentir chez toi ?',
  'Quel rêve n’as-tu partagé qu’avec peu de gens ?',
  'Comment recharges-tu tes batteries après une dure semaine ?',
  'Quelle est ta langue de l’amour et comment aimes-tu la recevoir ?',
  'Quelle petite chose améliore instantanément ta journée ?',
  'Pour quoi es-tu sincèrement reconnaissant·e aujourd’hui ?',
  'De quel sujet pourrais-tu parler pendant des heures sans préparation ?',
  'Quel risque es-tu content·e d’avoir pris ?',
  'Qu’est-ce que le succès signifie pour toi en dehors de ta carrière ?',
  'Quelle tradition aimerais-tu que l’on crée ensemble ?',
  'Quel est ton souvenir préféré de nous deux jusqu’à présent ?',
  'Qu’est-ce que tu admires le plus dans tes ami·es proches ?',
  'Qu’est-ce qui te fait te sentir en sécurité pour être totalement honnête ?',
  'Quelle leçon as-tu apprise à la dure ?',
  'Qu’est-ce qui t’intrigue en ce moment ?',
  'Quelle est une chose en toi que tu espères ne jamais voir changer ?',
];

const deepQuestions = [
  'Quelle peur n’as-tu jamais dite à voix haute ?',
  'Quand as-tu senti pour la première fois être vraiment compris·e ?',
  'Quelle partie de ton passé t’a le plus façonné·e ?',
  'Comment traverses-tu le deuil quand il frappe ?',
  'Que signifie concrètement la vulnérabilité pour toi ?',
  'Quelle blessure guéris-tu encore discrètement ?',
  'Quand te sens-tu seul·e même entouré·e de monde ?',
  'De quoi as-tu besoin quand tu es triste, mais que tu demandes rarement ?',
  'Quelle est ta plus grande insécurité et d’où vient-elle ?',
  'Comment ta définition de l’amour a-t-elle évolué ?',
  'De quoi as-tu le plus peur d’échouer ?',
  'Quel moment de ta vie t’a fait grandir rapidement ?',
  'Qu’aurais-tu aimé que ton plus jeune toi sache ?',
  'Comment exprimes-tu la colère, et comment aimerais-tu l’exprimer ?',
  'À quoi ressemble le pardon pour toi ?',
  'Quel rêve ou espoir récurrent portes-tu en toi ?',
  'Quand as-tu pleuré pour la dernière fois et qu’est-ce qui t’a ému·e ?',
  'Que crois-tu de la confiance une fois qu’elle est brisée ?',
  'Qu’est-ce qui te fait te sentir profondément vu·e ?',
  'De quoi te juges-tu ?',
  'Comment veux-tu être souvenu·e par ceux que tu aimes ?',
  'Que ferais-tu si tu n’avais pas peur ?',
  'De quoi as-tu besoin de plus dans notre relation ?',
  'Quelle est ta relation avec tes propres émotions ?',
  'Qu’est-ce que la rupture amoureuse t’a appris sur toi-même ?',
  'À quoi ressemble la sécurité émotionnelle dans ton corps ?',
  'Quelle limite apprends-tu à poser plus clairement ?',
  'Quelle vérité évites-tu, même vis-à-vis de toi-même ?',
  'Qu’est-ce qui donne un sens à ta vie ?',
  'Pour quoi veux-tu être célébré·e ?',
];

const intimateQuestions = [
  'Quelle est ta façon préférée d’être touché·e non sexuellement ?',
  'Quelle odeur ou quel son te détend instantanément ?',
  'Qu’est-ce que je fais qui te fait te sentir vraiment désiré·e ?',
  'À quel moment de la journée te sens-tu le plus connecté·e à ton corps ?',
  'Quel fantasme te sentirais-tu en sécurité pour partager avec moi ?',
  'Que signifie la séduction pour toi au-delà du physique ?',
  'Quelle tenue te rend le plus confiant·e ?',
  'Quel est ton souvenir préféré de nous deux proches l’un·e de l’autre ?',
  'Quel genre de compliment t’excite vraiment ?',
  'Quelle est une chose que tu aimerais qu’on essaie ensemble ?',
  'Comment aimes-tu le plus être embrassé·e ?',
  'Quelle est ta partie préférée de mon corps, et pourquoi ?',
  'Quelle ambiance ou quel décor t’aide à te sentir romantique ?',
  'Qu’est-ce qui t’excite sans avoir aucun rapport avec le toucher ?',
  'Quelle chanson te met dans l’ambiance ?',
  'Qu’est-ce que tu trouves sexy dans mon esprit ?',
  'À quoi ressemblent les soins après l’intimité pour toi ?',
  'Quelle est ta façon préférée de se réveiller ensemble ?',
  'Quelle limite autour de l’intimité compte le plus pour toi ?',
  'Quel souhait secret as-tu pour notre relation ?',
  'Quelle texture ou température adores-tu autour de toi ?',
  'À quoi rêves-tu quand tu penses à nous ?',
  'Quel mot décrit le mieux notre alchimie ?',
  'Quel genre de rencard te rapproche le plus après coup ?',
  'Qu’est-ce que tu aimerais que je fasse plus souvent ?',
  'Quelle est ta façon préférée de dire bonne nuit ?',
  'Dans quel lieu de rêve aimerais-tu être intime ?',
  'Quelle est la qualité la plus attirante qu’une personne puisse avoir ?',
  'Que signifie la passion pour toi au-delà de la chambre ?',
  'Quelle est une chose que tu veux que je sache sur ton désir ?',
];

const futureQuestions = [
  'À quoi ressemble ta vie idéale dans cinq ans ?',
  'Où aimerais-tu vivre si l’argent n’était pas un problème ?',
  'Quel genre de parent aimerais-tu être, si tu le souhaites ?',
  'Que penses-tu de l’argent et de la liberté ?',
  'Quel rôle jouent la foi ou la spiritualité dans ta vie ?',
  'Pour quelle cause consacrerais-tu ta vie ?',
  'Comment veux-tu que l’on gère les conflits en équipe ?',
  'À quoi ressemble un partenariat sain pour toi ?',
  'Quelles aventures figurent sur ta liste de rêves ?',
  'Quelle importance a la communauté pour toi ?',
  'Quel héritage veux-tu laisser derrière toi ?',
  'À quoi ressemble la retraite dans tes rêves ?',
  'Comment veux-tu célébrer les étapes importantes ensemble ?',
  'Quelles sont tes lignes rouges dans une relation ?',
  'Quelles compétences aimerais-tu apprendre avec moi ?',
  'Comment imagines-tu nos fêtes dans dix ans ?',
  'Quel genre de chez-toi te semble juste ?',
  'Que signifie l’équilibre vie pro/vie perso pour notre avenir ?',
  'Comment veux-tu soutenir les rêves de l’autre ?',
  'Quelles traditions de ton passé veux-tu transmettre ?',
  'À quoi ressemblerait la sécurité financière pour toi ?',
  'Comment veux-tu vieillir ensemble ?',
  'Quelle est ta position sur l’honnêteté versus la gentillesse ?',
  'Quel rôle la famille élargie devrait-elle jouer dans nos vies ?',
  'À quoi ressemblerait une semaine ordinaire parfaite ?',
  'Quelles valeurs veux-tu incarner ?',
  'Comment veux-tu gérer le changement quand il arrive ?',
  'Quel objectif commun t’enthousiasme vraiment ?',
  'Que signifie l’engagement pour toi ?',
  'Quelle promesse veux-tu faire à notre couple ?',
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    ...funQuestions.slice(0, 15).map((q) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: '' } })),
    ...gettingToKnowQuestions.slice(0, 15).map((q) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: '' } })),
    ...deepQuestions.slice(0, 15).map((q) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: '' } })),
    ...intimateQuestions.slice(0, 15).map((q) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: '' } })),
    ...futureQuestions.slice(0, 15).map((q) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: '' } })),
  ],
};

export default function FrenchQuestionsForCoupleArticlePage() {
  const publishedDate = '1 juin 2025';

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <header className="mb-10">
        <time className="text-sm text-slate-400" dateTime="2025-06-01">{publishedDate}</time>
        <h1 >
          150 questions pour couple : du fun au profond
        </h1>
        <p>
          Les meilleures conversations n'arrivent presque jamais par hasard. Elles commencent par
          une question posée avec curiosité, patience et sans arrière-pensée. Que vous soyez au
          début de votre histoire ou que vous partagiez déjà des décennies, la bonne question peut
          vous sortir de l'automatique et vous rappeler pourquoi vous vous êtes choisis.
        </p>
      </header>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
        La plupart des couples ne manquent pas d'amour ; ils manquent de nouveauté. La technologie
        la plus simple pour inverser cette dérive est une question honnête posée sans agenda.
      </blockquote>

      <div className="flex items-center gap-4 mb-10 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white font-bold text-lg">
          CB
        </div>
        <div>
          <p className="font-semibold text-sm">Équipe Captain Bond</p>
          <p className="text-xs text-slate-400">
            Publié le {publishedDate} &middot; 5 min de lecture
          </p>
        </div>
      </div>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Pourquoi les questions comptent dans un couple</h2>
        <p>
          La plupart des couples ne manquent pas d’amour ; ils manquent de nouveauté. Le quotidien
          — courses, factures, emplois du temps — étouffe peu à peu les conversations profondes qui
          autrefois venaient naturellement. Les questions sont la technologie la plus simple pour
          inverser cette dérive. Elles créent une bulle d’attention où votre partenaire redevient
          intéressant, non pas parce qu’il ou elle a changé, mais parce que vous avez décidé de
          regarder de plus près.
        </p>
        <p>
          Une bonne question n’exige pas une réponse parfaite. Elle invite à l’honnêteté. Elle
          donne la permission de dire ce qui reste d’habitude en sourdine. Au fil du temps, ces
          petites révélations deviennent le tissu de l’intimité : ce sentiment d’être connu, pas
          seulement la version que l’on montre au monde.
        </p>
        <blockquote className="border-l-4 border-neon-pink pl-6 my-6 italic text-slate-200">
          Une bonne question n’exige pas une réponse parfaite. Elle invite la chose qui reste
          d’habitude en sourdine.
        </blockquote>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Comment utiliser cette liste</h2>
        <p>
          La quantité n’est pas l’objectif. La connexion, si. Voici un rituel simple pour tirer le
          meilleur parti de ces questions :
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed mb-4">
          <li>
            <strong>Choisis un créneau hebdomadaire.</strong> Vingt minutes suffisent. Posez les
            téléphones dans une autre pièce.
          </li>
          <li>
            <strong>L’un·e pose, l’autre répond.</strong> Puis vous inversez les rôles. Celui ou
            celle qui écoute reste curieux·se plutôt que de chercher à résoudre.
          </li>
          <li>
            <strong>Créez une zone de sécurité.</strong> Chacun·e peut passer une question sans avoir
            à justifier pourquoi.
          </li>
          <li>
            <strong>Suivez l’énergie.</strong> Si une réponse ouvre une porte, traversez-la plutôt
            que de courir à la question suivante.
          </li>
        </ul>
        <p>
          Les questions ci-dessous sont regroupées par thème et par intensité. Vous n’avez pas
          besoin de répondre aux 150 en une soirée. Piochez, sautez celles qui ne résonnent pas, et
          revenez quand le moment est propice. Si vous voulez des centaines de questions générées
          pour vous, le mode couple de Captain Bond crée de nouveaux decks à chaque session.
        </p>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Questions fun et légères</h2>
        <p>
          Utilisez-les quand vous voulez rire, vous rappeler que vous vous amusez ensemble, ou
          casser une tension. Le jeu est un des ciments les plus sous-estimés des relations
          durables.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {funQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Questions pour mieux se connaître</h2>
        <p>
          Même après des années, un couple peut découvrir de nouvelles pièces l’un·e de l’autre.
          Ces questions explorent l’histoire, les valeurs et les petits détails qui rendent une
          personne unique.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {gettingToKnowQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Questions profondes et émotionnelles</h2>
        <p>
          Réservez ces questions pour un moment calme, quand vous avez tous les deux de la
          disponibilité et que vous voulez vous sentir réellement proches. Elles demandent de la
          vulnérabilité : avancez doucement et sans pression.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {deepQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Questions intimes et pimentées</h2>
        <p>
          Le désir commence dans la tête. Ces questions restent élégantes tout en invitant à parler
          d’attraction, de toucher et de ce qui vous fait sentir désiré·e. Elles construisent
          l’anticipation et la clarté en même temps.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {intimateQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Questions sur le futur et les valeurs</h2>
        <p>
          Une direction partagée est ce qui transforme la chimie en partenariat. Ces questions
          aident à calibrer où vous allez et dont chacun·e a besoin en chemin.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {futureQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Une dernière pensée</h2>
        <p>
          Vous n'avez pas besoin de la question parfaite. Vous avez besoin du courage de demander
          et de la patience d'écouter.
        </p>
        <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
          Vous n'avez pas besoin de la question parfaite. Vous avez besoin du courage de demander
          et de la patience d'écouter.
        </blockquote>
        <p>
          La liste ci-dessus est un point de départ. La vraie magie
          opère dans la suite, la pause, le rire, le silence un peu gênant que vous traversez
          ensemble. Gardez quelques favorites dans un coin et sortez-les quand la vie devient trop
          transactionnelle. Votre couple vous remerciera.
        </p>
      </section>

      <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
        <h3 className="text-xl font-semibold mb-2">Tu veux plus de questions sans préparer quoi que ce soit ?</h3>
        <p className="text-slate-200 leading-relaxed mb-4">
          Le mode couple de Captain Bond génère des decks de questions fraîches à chaque session :
          légères, profondes, pimentées et tout le reste. Zéro préparation, zéro pression, juste de
          meilleures conversations.
        </p>
        <Link
          href="/fr/couple"
          className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
        >
          Essayer le mode couple Captain Bond
        </Link>
      </aside>
    </article>
  );
}
