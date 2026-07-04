import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Questions pour un Couple : Le Guide Complet pour se Connecter Plus Profondément | Captain Bond',
  description:
    '150+ questions de couple à travers 5 niveaux de connexion — fun, découverte, profond, intime et futur. Un rituel étape par étape pour transformer chaque conversation en vraie intimité.',
  alternates: {
    canonical: `${siteUrl}/fr/blog/questions-couple-guide-complet`,
    languages: {
      'x-default': `${siteUrl}/fr/blog/questions-couple-guide-complet`,
      'en': `${siteUrl}/blog/couple-questions-complete-guide`,
      'fr': `${siteUrl}/fr/blog/questions-couple-guide-complet`,
    },
  },
  other: {
    'datePublished': '2025-06-15',
    'dateModified': new Date().toISOString().split('T')[0],
  },
  openGraph: {
    title: 'Questions pour un Couple : Le Guide Complet pour se Connecter Plus Profondément',
    description:
      '150+ questions de couple à travers 5 niveaux de connexion — fun, découverte, profond, intime et futur. Un rituel étape par étape pour transformer chaque conversation en vraie intimité.',
    url: `${siteUrl}/fr/blog/questions-couple-guide-complet`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/blog-questions-couple-guide-fr.webp`,
        width: 1200,
        height: 630,
        alt: 'Questions pour un Couple : Le Guide Complet',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Questions pour un Couple : Le Guide Complet pour se Connecter Plus Profondément',
    description:
      '150+ questions de couple à travers 5 niveaux de connexion — fun, découverte, profond, intime et futur. Un rituel étape par étape pour transformer chaque conversation en vraie intimité.',
    images: [`${siteUrl}/og/blog-questions-couple-guide-fr.webp`],
  },
};

const funQuestions = [
  'Quelle chanson nous décrit le mieux en tant que couple ?',
  'Quel est le souvenir le plus drôle que tu as de nous deux ?',
  'Si notre relation était un film, quel en serait le titre ?',
  'Quel est ton plat préféré que je cuisine — ou que tu aimerais que je cuisine ?',
  'Si tu pouvais avoir un super-pouvoir, lequel choisirais-tu ?',
  'Quelle est la chose la plus embarrassante que tu aies faite pour me faire rire ?',
  'Plutôt soirée Netflix ou soirée jeux de société ?',
  'Si on gagnait au loto demain, quelle est la première chose que tu achèterais ?',
  'Quel est le pire film que tu aimes secrètement ?',
  'Quelle est notre meilleure blague privée ?',
  'Si on devait vivre dans une série, laquelle choisirais-tu ?',
  'Quel est ton souvenir denfance le plus absurde ?',
  'Quel surnom ridicule ta famille te donnait-elle ?',
  'Si tu devais décrire notre relation en un mot, que dirais-tu ?',
  'Quel est le voyage de rêve que tu voudrais faire avec moi ?',
  'Plutôt lève-tôt ou couche-tard — et ça a changé avec moi ?',
  'Quelle est la chose la plus spontanée quon ait faite ensemble ?',
  'Si notre couple avait une playlist, quelle chanson serait en boucle ?',
  'Quel est ton talent caché que je ne connais pas encore ?',
  'Si tu pouvais vivre dans une décennie, laquelle ?',
  'Quel est ton jeu de société préféré pour un soir à deux ?',
  'Quelle est la pire mode que tu aies suivie au collège ?',
  'Si on échangeait nos corps pour un jour, que ferais-tu ?',
  'Quelle est la meilleure blague que tu aies jamais entendue ?',
  'Quel animal nous représenterait le mieux en tant que couple ?',
  'Si on créait notre propre langue, quels seraient les premiers mots ?',
  'Quel est le cadeau le plus drôle que tu aies jamais reçu ?',
  'Si on devait participer à un jeu télévisé, lequel ?',
  'Quel est le meilleur compliment que tu aies reçu cette semaine ?',
  'Quelle est la première chose que tu as remarquée chez moi ?',
];

const gettingToKnowQuestions = [
  'Quel moment de ton enfance t\'a le plus marqué ?',
  'Qui a eu la plus grande influence sur la personne que tu es devenue ?',
  'Quelle est la leçon la plus importante que tes parents tâont apprise sans le vouloir ?',
  'Quel est le plus grand risque que tu aies pris dans ta vie ?',
  'Quelle petite chose fais-tu chaque jour que personne ne remarque ?',
  'De quoi es-tu le plus fier sans jamais en parler ?',
  'Quel est le meilleur conseil que tu aies jamais reçu ?',
  'Quel compliment ne pourras-tu jamais oublier ?',
  'Quel est ton plus beau souvenir de nous deux ?',
  'Qu\'est-ce que tu apprends encore sur toi-même ?',
  'Quelle est la meilleure décision que tu aies prise dans ta vie ?',
  'Qu\'est-ce que ton moi adolescent penserait de toi aujourd\'hui ?',
  'Quelle tradition de ton enfance aimerais-tu perpétuer ?',
  'Quelle qualité chez moi as-tu mis du temps à remarquer ?',
  'Quel est ton objectif qui n\'a rien à voir avec le travail ?',
  'Qu\'est-ce qui te fait te sentir profondément compris ?',
  'Quel est ton meilleur souvenir de cette dernière année ?',
  'Quel sujet te passionne à chaque fois qu\'on en parle ?',
  'Quelle a été ta première impression de moi ?',
  'Comment décrirais-tu ta relation avec toi-même ?',
  'Qu\'est-ce que tu aimerais qu\'on te demande plus souvent ?',
  'Quel est le plus grand défi que tu aies surmonté seul ?',
  'Qu\'est-ce qui te rend unique selon toi ?',
  'Quelle est ta plus grande force que tu sous-estimes ?',
  'Quel moment de ta vie aimerais-tu revivre ?',
  'Qu\'est-ce que tu admires le plus chez tes amis proches ?',
  'Quel endroit sur terre te fait sentir le plus en paix ?',
  'Quelle musique te transporte immédiatement ailleurs ?',
  'Quel est ton plus grand rêve que tu naies pas encore réalisé ?',
  'Qu\'est-ce qui te rend le plus curieux dans la vie en ce moment ?',
];

const deepQuestions = [
  'Quelle peur influence tes décisions plus que tu ne le réalises ?',
  'Quand t\'es-tu senti vraiment seul pour la dernière fois ?',
  'Quelle partie de toi caches-tu à la plupart des gens ?',
  'Quel a été ton plus grand tournant émotionnel dans la vie ?',
  'Comment sais-tu que tu peux faire entièrement confiance à quelqu\'un ?',
  'Quel chagrin portes-tu encore en silence ?',
  'Quel mensonge te répètes-tu le plus souvent ?',
  'Quand t\'es-tu pardonné quelque chose pour la dernière fois ?',
  'De quoi as-tu besoin quand tu es submergé ?',
  'Quelle est la chose la plus difficile que tu te sois avouée ?',
  'Comment veux-tu être aimé quand tu traverses une tempête ?',
  'Quelle histoire te racontes-tu sur pourquoi tu n\'es pas assez ?',
  'Qu\'est-ce qui te fait te sentir en sécurité dans ton corps ?',
  'Quelle honte portes-tu depuis trop longtemps ?',
  'De quoi as-tu besoin pour pleurer vraiment ?',
  'Quelle limite as-tu du mal à maintenir ?',
  'Que ferais-tu si tu n\'avais peur d\'aucun jugement ?',
  'Quand te sens-tu complètement à ta place ?',
  'Qu\'est-ce que tu as le plus peur de perdre ?',
  'Qu\'est-ce que les ruptures t\'ont appris sur l\'amour ?',
  'Quel moment de ta vie a exigé le plus de courage ?',
  'Comment ta relation avec ton corps a-t-elle évolué ?',
  'Quelle question non résolue portes-tu sur toi-même ?',
  'À quoi ressemble la compassion d\'un partenaire en pratique ?',
  'De quoi as-tu besoin qu\'on te dise quand tu échoues ?',
  'Quelle est la chose la plus honnête que tu aies jamais dite ?',
  'À quoi ressemblerait la guérison pour toi aujourd\'hui ?',
  'Quand as-tu pleuré pour la dernière fois, et qu\'est-ce qui t\'a ému ?',
  'Qu\'est-ce qui te donne un sentiment de sens dans ta vie ?',
  'Quelle vérité évites-tu, même pour toi-même ?',
];

const intimateQuestions = [
  'Quel mot décrit ce que tu ressens quand on est vraiment proches ?',
  'Qu\'est-ce que je fais, sans contact physique, qui te connecte le plus ?',
  'Quelle est ta façon préférée de terminer une journée avec moi ?',
  'Quel son ou soupir de moi aimes-tu entendre ?',
  'Quelle texture ou matière te rend le plus sensuel ?',
  'Quel moment entre nous a été le plus électrique ?',
  'Qu\'est-ce que tu trouves beau chez moi que je néglige ?',
  'Quel regard te fait te sentir le plus proche ?',
  'Comment aimes-tu être enlacé ?',
  'Quel petit geste de toi me fait me sentir le plus désirée ?',
  'Quelle fantaisie serais-tu curieux d\'explorer avec moi ?',
  'Qu\'est-ce que les préliminaires signifient pour toi au-delà du physique ?',
  'Quelle est la chose la plus attirante dans notre dynamique ?',
  'Quelle humeur ou énergie te rend le plus ouvert à l\'intimité ?',
  'Quel baiser de nous reste gravé dans ta mémoire ?',
  'Quel est ton langage de l\'amour quand les mots ne suffisent pas ?',
  'Quelle partie de mon esprit ou de ma personnalité t\'excite le plus ?',
  'Quel toucher te fait te sentir en sécurité et vu ?',
  'Quel souvenir de notre intimité te procure le plus de joie ?',
  'Comment vis-tu la passion dans ton quotidien ?',
  'Qu\'aimerais-tu que je sache sur tes désirs sans avoir à demander ?',
  'Quel cadre ou atmosphère t\'aide à te connecter le plus intimement ?',
  'Quel est ton moment préféré après avoir fait l\'amour ?',
  'Comment aimes-tu être réveillé lors d\'un matin paresseux ensemble ?',
  'Quelle limite rend l\'intimité plus sécurisante pour toi ?',
  'Quelle énergie est-ce que je fais naître en toi que personne d\'autre ?',
  'À quoi ressemble l\'intimité un jour où on est tous les deux épuisés ?',
  'Comment veux-tu être désiré par moi ?',
  'Qu\'est-ce qui te fait te sentir pleinement présent avec moi ?',
  'Quelle est ta caresse préférée qui n\'a rien de sexuel ?',
];

const futureQuestions = [
  'À quoi ressemble la richesse pour toi au-delà de l\'argent ?',
  'Où nous vois-tu quand nous serons vieux ?',
  'Quelle aventure ne veux-tu pas vivre sans l\'avoir tentée ?',
  'Comment veux-tu qu\'on répartisse les responsabilités dans notre futur foyer ?',
  'À quoi ressemble un partenariat épanoui dans vingt ans ?',
  'Quelles valeurs veux-tu que notre foyer incarne ?',
  'Quelle communauté veux-tu qu\'on construise ensemble ?',
  'Quelle compétence veux-tu apprendre en tant que couple ?',
  'Comment veux-tu gérer les grandes décisions qui nous effraient ?',
  'Quel rôle veux-tu que les voyages jouent dans notre vie commune ?',
  'Quels sont tes non-négociables sur la façon dont on se traite ?',
  'Comment vois-tu notre relation évoluer à travers les grands changements de la vie ?',
  'Que signifie le partenariat financier pour toi ?',
  'Quel projet ou cause aimerais-tu qu\'on entreprenne ensemble ?',
  'Quel héritage veux-tu qu\'on laisse dans notre relation ?',
  'Comment veux-tu qu\'on navigue les conversations difficiles en famille ?',
  'Quels moments clés veux-tu célébrer en grande pompe ?',
  'Quel rêve pour nous t\'effraie un peu ?',
  'Quelle liberté compte le plus pour toi dans un couple à long terme ?',
  'Comment définis-tu grandir ensemble plutôt que grandir séparément ?',
  'À quoi ressembleraient nos traditions dans cinq ans ?',
  'Comment veux-tu qu\'on se recharge mutuellement pendant les saisons stressantes ?',
  'À quoi ressemblerait un mardi parfait dans dix ans ?',
  'Quelle partie de notre dynamique actuelle veux-tu protéger en vieillissant ?',
  'Comment veux-tu gérer notre temps seul versus notre temps avec les autres ?',
  'Quelle promesse veux-tu qu\'on se fasse aujourd\'hui ?',
  'Quel genre de parents, si jamais, nous imagines-tu être ?',
  'Qu\'espères-tu qu\'on puisse dire de notre relation pour nos 50 ans ?',
  'Comment veux-tu qu\'on vieillisse ensemble ?',
  'Quel est le prochain grand pas que tu veux qu\'on fasse ensemble ?',
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    ...funQuestions.slice(0, 15).map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: '' },
    })),
    ...gettingToKnowQuestions.slice(0, 15).map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: '' },
    })),
    ...deepQuestions.slice(0, 15).map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: '' },
    })),
    ...intimateQuestions.slice(0, 15).map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: '' },
    })),
    ...futureQuestions.slice(0, 15).map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: '' },
    })),
  ],
};

export default function QuestionsCoupleGuideCompletPage() {
  const publishedDate = '15 juin 2025';

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <header className="mb-10">
        <time className="text-sm text-slate-400" dateTime="2025-06-15">{publishedDate}</time>
        <h1 className="text-3xl font-bold mb-4">
          Questions pour un Couple : Le Guide Complet pour se Connecter Plus Profondément
        </h1>
        <p >
          La plupart des couples veulent se connecter plus profondément mais ne savent pas par où
          commencer. La réponse est plus simple que vous ne le pensez : la bonne question posée au
          bon moment peut déverrouiller des mondes entre vous. Ce guide vous offre un cadre complet
          — 150+ questions à travers cinq niveaux de connexion, un rituel étape par étape, et la
          science derrière son efficacité.
        </p>
        <p >
          Basé sur les données de 1 200+ sessions couple Captain Bond, les couples qui utilisent
          des questions structurées rapportent une connexion mesurablement plus forte. Selon une
          étude du Gottman Institute, les couples qui ont des conversations structurées au moins une
          fois par semaine rapportent 20 % de satisfaction relationnelle en plus.
        </p>
      </header>

      <div className="flex items-center gap-4 mb-10 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white font-bold text-lg">
          CB
        </div>
        <div>
          <p className="font-semibold text-sm">Captain Bond Team</p>
          <p className="text-xs text-slate-400">
            Publié le {publishedDate} &middot; 7 min de lecture
          </p>
        </div>
      </div>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
        La qualité de votre relation est déterminée par la qualité de vos conversations. Les
        meilleures conversations commencent par une bonne question posée sans agenda.
      </blockquote>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Ce que vous allez découvrir dans ce guide</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          <li>Un cadre en 5 étapes pour des conversations de couple qui comptent</li>
          <li>150+ questions organisées par profondeur et thème</li>
          <li>Un tableau comparatif pour choisir le bon niveau de connexion à chaque moment</li>
          <li>Des conseils pratiques pour écouter, répondre et construire l&rsquo;intimité dans la durée</li>
          <li>Des astuces pour transformer les questions en un rituel hebdomadaire durable</li>
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Les cinq niveaux de connexion en un coup d&rsquo;œil</h2>
        <p >
          Chaque moment ne réclame pas la même profondeur de conversation. Ce tableau vous aide à
          choisir le bon niveau pour la bonne humeur.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase text-xs tracking-wider">
                <th className="py-3 pr-4">Niveau</th>
                <th className="py-3 pr-4">Thème</th>
                <th className="py-3 pr-4">Idéal quand</th>
                <th className="py-3">Temps</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-white/10">
                <td className="py-3 pr-4 font-semibold">1</td>
                <td className="py-3 pr-4">Fun &amp; Léger</td>
                <td className="py-3 pr-4">Vous avez besoin de rire ou briser la glace</td>
                <td className="py-3">5–10 min</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 pr-4 font-semibold">2</td>
                <td className="py-3 pr-4">Découverte</td>
                <td className="py-3 pr-4">Vous voulez découvrir quelque chose de nouveau</td>
                <td className="py-3">10–20 min</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 pr-4 font-semibold">3</td>
                <td className="py-3 pr-4">Profond &amp; Émotionnel</td>
                <td className="py-3 pr-4">Vous avez du calme et de l&rsquo;espace émotionnel</td>
                <td className="py-3">20–40 min</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 pr-4 font-semibold">4</td>
                <td className="py-3 pr-4">Intime &amp; Sensuel</td>
                <td className="py-3 pr-4">Vous voulez nourrir le désir et la connexion</td>
                <td className="py-3">15–30 min</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 pr-4 font-semibold">5</td>
                <td className="py-3 pr-4">Futur &amp; Valeurs</td>
                <td className="py-3 pr-4">Vous voulez aligner direction et rêves</td>
                <td className="py-3">20–40 min</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Étape 1 : Préparer l&rsquo;espace</h2>
        <p >
          L&rsquo;environnement façonne la conversation. Pas besoin de bougies et de pétales de
          rose, mais quelques ajustements simples font toute la différence. Mettez les téléphones
          dans une autre pièce. Asseyez-vous face à face ou côte à côte sans écran entre vous.
          Choisissez un moment où ni l&rsquo;un ni l&rsquo;autre n&rsquo;a faim, n&rsquo;est épuisé
          ou pressé. Même dix minutes d&rsquo;attention totale valent mieux qu&rsquo;une heure de
          présence distraite.
        </p>
        <p >
          Fixez une règle de base : pas de réparation, pas de solution. Le but est la
          compréhension, pas la résolution de problèmes. Si une réponse vous met mal à l&rsquo;aise,
          restez curieux plutôt que sur la défensive. Vous ne vous interviewez pas, vous explorez
          ensemble.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {funQuestions.slice(0, 10).map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Étape 2 : Choisir la bonne profondeur</h2>
        <p >
          La plus grande erreur que font les couples est d&rsquo;aller trop profond trop vite. La
          profondeur sans confiance ressemble à un interrogatoire. Commencez au niveau 1 ou 2 sauf
          si vous savez que vous avez tous les deux l&rsquo;espace nécessaire pour plus. Observez le
          langage corporel : bras croisés, agitation, ou éviter le regard sont des signaux pour
          alléger. Se pencher, un regard soutenu et des épaules détendues signifient que vous pouvez
          aller plus loin.
        </p>
        <p >
          Si vous ne savez pas par où commencer, essayez ceci : demandez à votre partenaire de
          choisir un chiffre de 1 à 5 selon son état d&rsquo;esprit du moment. Alignez-vous sur ce
          niveau et suivez son rythme.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {gettingToKnowQuestions.slice(0, 12).map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <blockquote className="border-l-4 border-neon-pink pl-6 my-8 italic text-slate-200 text-lg">
        La plus grande erreur des couples est daller trop profond trop vite. Adaptez votre
        profondeur à la disponibilité de votre partenaire, pas à votre curiosité.
      </blockquote>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Étape 3 : Poser la question avec intention</h2>
        <p >
          La façon dont vous posez la question compte autant que la question elle-même. Utilisez un
          ton ouvert et chaleureux. Commencez par un adoucisseur : « Je me demandais quelque
          chose… » ou « Je peux te poser une question qui m&rsquo;est venue ? » Cela signale la
          sécurité plutôt que l&rsquo;interrogatoire. Après la réponse de votre partenaire, faites
          une pause avant de répondre. Un silence de trois secondes les invite souvent à aller plus
          loin. Reformulez ce que vous avez entendu : « On dirait que tu as ressenti… » ou
          « Ça me permet de mieux te comprendre. »
        </p>
        <p >
          Évitez le jugement, les conseils, ou de transformer la réponse en débat. Votre seul rôle
          est de recevoir ce qu&rsquo;ils partagent avec gratitude. Quand les deux partenaires se
          sentent entendus sans être réparés, la confiance s&rsquo;accumule rapidement.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {deepQuestions.slice(0, 12).map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Étape 4 : Réfléchir ensemble</h2>
        <p >
          La conversation ne s&rsquo;arrête pas quand la question est répondue. La réflexion est là
          où la vraie connexion opère. Après chaque réponse, prenez un moment pour accueillir ce qui
          a été partagé. Vous pouvez dire : « Merci de m&rsquo;avoir dit ça » ou « Je n&rsquo;avais
          jamais vu les choses comme ça. » Ces petites validations sont puissantes. Elles disent à
          votre partenaire que son honnêteté est en sécurité avec vous.
        </p>
        <p >
          Si ce qu&rsquo;ils partagent éveille une émotion en vous, nommez-la doucement.
          « Entendre ça me rend plus proche de toi. » La réflexion partagée transforme une session
          de questions-réponses en une expérience de rapprochement que vous garderez tous les deux
          longtemps après la fin de la conversation.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {intimateQuestions.slice(0, 12).map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Étape 5 : Répéter et créer un rituel</h2>
        <p >
          La régularité compte plus que l&rsquo;intensité. Un check-in de dix minutes chaque
          semaine approfondira votre connexion plus qu&rsquo;un marathon de quatre heures une fois
          par an. Une étude de 2023 dans le Journal of Social and Personal Relationships a montré
          que les couples qui se posent des questions originales rapportent des niveaux d&rsquo;intimité
          plus élevés. Choisissez un créneau récurrent — café du dimanche matin, débrief du vendredi
          soir, ou une promenade en milieu de semaine. Faites-en votre truc. Avec le temps, ces
          conversations deviennent un espace sûr où chacun peut amener n&rsquo;importe quoi.
        </p>
        <p >
          Gardez une liste des questions qui ont déclenché les meilleures conversations.
          Revisitez-les quelques mois plus tard et remarquez comment vos réponses ont changé. La
          croissance devient visible quand vous comparez où vous étiez à où vous êtes maintenant. Le
          rituel lui-même devient l&rsquo;ancre qui vous maintient connectés à travers les saisons
          chargées comme les plus calmes.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {futureQuestions.slice(0, 12).map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
        La régularité compte plus que l&rsquo;intensité. Un check-in de dix minutes chaque semaine
        approfondit votre connexion plus qu&rsquo;un marathon de quatre heures une fois par an.
      </blockquote>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Un dernier mot</h2>
        <p >
          Vous n&rsquo;avez pas besoin de la question parfaite. Vous avez besoin d&rsquo;un moment
          calme, d&rsquo;un cœur ouvert et du courage de commencer. Les questions ci-dessus sont
          des outils, pas des règles. Adaptez-les, mélangez-les et laissez-les évoluer avec votre
          relation. Le but n&rsquo;est pas de poser chaque question de cette liste. Le but est de
          construire une habitude de curiosité qui vous fait continuer à vous découvrir — aussi
          longtemps que vous choisissez d&rsquo;être ensemble.
        </p>
      </section>

      <section className="article-block">
        <p >
          Ces questions fonctionnent mieux quand les deux partenaires sont disponibles pour une
          conversation sans interruption. Si l&apos;un des deux est fatigué ou réticent, commencez par
          les sections légères — l&apos;objectif est la connexion, pas l&apos;exhaustivité.
        </p>
      </section>

      <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
        <h3 className="text-xl font-semibold mb-2">Prêts pour des conversations plus profondes ?</h3>
        <p className="text-slate-200 leading-relaxed mb-4">
          Le mode couple de Captain Bond génère des jeux de questions frais adaptés à votre
          relation. Pas de préparation, pas de silences gênants — juste de meilleures conversations
          à chaque ouverture de l&rsquo;application.
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
