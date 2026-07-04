import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: '50 questions profondes pour couple : se reconnecter | Captain Bond',
  description:
    'Retrouvez une complicité durable avec 50 questions profondes pour couple en français. Vulnérabilité, passé, valeurs, amour et rêves — pour des soirées qui rapprochent.',
  alternates: {
    canonical: `${siteUrl}/fr/blog/50-questions-profondes-couple`,
    languages: {
      'x-default': `${siteUrl}/blog/50-deep-questions-for-couples`,
      'en': `${siteUrl}/blog/50-deep-questions-for-couples`,
      'fr': `${siteUrl}/fr/blog/50-questions-profondes-couple`,
    },
  },
  other: {
    datePublished: '2025-07-01',
    dateModified: '2025-07-03',
  },
  openGraph: {
    title: '50 questions profondes pour couple : se reconnecter',
    description:
      'Retrouvez une complicité durable avec 50 questions profondes pour couple en français. Vulnérabilité, passé, valeurs, amour et rêves — pour des soirées qui rapprochent.',
    url: `${siteUrl}/fr/blog/50-questions-profondes-couple`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/blog-deep-questions-fr.webp`,
        width: 1200,
        height: 630,
        alt: '50 questions profondes pour couple',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: '50 questions profondes pour couple : se reconnecter',
    description:
      'Retrouvez une complicité durable avec 50 questions profondes pour couple en français. Vulnérabilité, passé, valeurs, amour et rêves — pour des soirées qui rapprochent.',
    images: [`${siteUrl}/og/blog-deep-questions-fr.webp`],
  },
};

const vulnerabiliteQuestions = [
  'De quoi as-tu le plus peur que je pense de toi sans jamais oser me le dire ?',
  'Quand as-tu pleuré pour la dernière fois, et qu\'est-ce qui a libéré cette émotion ?',
  'Quelle partie de toi caches-tu par habitude, même quand personne ne te juge ?',
  'Qu\'est-ce qui te rend plus vulnérable que tu ne le laisses paraître ?',
  'Si tu pouvais supprimer une insécurité d\'un claquement de doigts, laquelle disparaîtrait ?',
  'Quand te sens-tu le plus seul, même en étant accompagné ?',
  'Quel mensonge banal as-tu déjà raconté pour éviter de montrer ta fragilité ?',
  'Qu\'est-ce que tu redoutes le plus dans l\'idée d\'être vraiment connu de moi ?',
  'À quel moment as-tu eu honte d\'une réaction que tu n\'as pas su contrôler ?',
  'Qu\'est-ce que la peur t\'a empêché de vivre pleinement cette année ?',
];

const enfanceQuestions = [
  'Quel objet de ton enfance gardes-tu encore et que personne ne connaît ?',
  'Quel souvenir d\'école te rend encore triste aujourd\'hui ?',
  'Quelle personne de ton enfance a changé le cours de ta vie sans le savoir ?',
  'Quelle injustice subie enfant n\'est toujours pas réparée dans ton cœur ?',
  'Si tu pouvais revivre un seul été de ton passé, lequel choisirais-tu ?',
  'Quelle phrase entendue petit te trotte encore dans la tête ?',
  'Quel rêve d\'enfant as-tu abandonné trop tôt ?',
  'Quel moment avec tes parents aimerais-tu revivre une dernière fois ?',
  'Y a-t-il un lieu de ton enfance qui n\'existe plus et que tu portes en toi ?',
  'Quel meilleur souvenir de toi enfant aimerais-tu que je connaisse ?',
];

const valeursQuestions = [
  'Qu\'est-ce qui est plus important pour toi que notre relation, et pourquoi ?',
  'Sur quel sujet es-tu intransigeant même avec ceux que tu aimes ?',
  'Quelle valeur défendrais-tu coûte que coûte, quitte à perdre des amis ?',
  'Où places-tu la limite entre l\'honnêteté et la bienveillance ?',
  'Qu\'est-ce que l\'échec représente pour toi — vraiment — pas la définition des autres ?',
  'Dans quelle situation as-tu trahi une de tes propres valeurs par peur du conflit ?',
  'Qu\'est-ce que tu admires chez les autres et que tu n\'arrives pas à incarner toi-même ?',
  'Quelle croyance sur l\'argent t\'empêche d\'avancer ?',
  'Si tu devais choisir entre être heureux et avoir raison, que choisirais-tu ?',
  'Qu\'est-ce qui mérite de se battre aujourd\'hui dans le monde, selon toi ?',
];

const amourQuestions = [
  'Quel petit geste de mon côté te fait sentir aimé sans qu\'un mot soit dit ?',
  'Quand as-tu douté de notre histoire pour la première fois ?',
  'Qu\'est-ce que tu n\'oses pas me demander, de peur de ma réaction ?',
  'Dans quel moment de notre vie commune t\'es-tu senti invisible ?',
  'Qu\'est-ce que tu aimes chez moi que je n\'aime pas chez moi-même ?',
  'Quel besoin émotionnel as-tu l\'impression de devoir combler seul ?',
  'Qu\'est-ce que tu voudrais que je comprenne de ta façon d\'aimer, que tu n\'arrives pas à m\'expliquer ?',
  'Quel reproche retiens-tu parce que tu trouves que ce serait injuste de le formuler ?',
  'Dans quel domaine de notre couple as-tu l\'impression de faire tous les efforts ?',
  'Qu\'est-ce qui te rassurerait sur notre avenir si je te le disais aujourd\'hui ?',
];

const revesQuestions = [
  'Si la peur et l\'argent n\'existaient pas, quelle vie mènerais-tu demain ?',
  'Quel rêve as-tu rangé dans un tiroir et que tu n\'as jamais osé sortir ?',
  'Qu\'est-ce que tu regretterais à 80 ans de ne pas avoir tenté ?',
  'Si tu pouvais changer un seul choix de ton passé, lequel serait-ce ?',
  'Où te vois-tu dans cinq ans si tout va bien — et si tout va mal ?',
  'Quel projet secret gardes-tu parce que tu crains qu\'on le trouve ridicule ?',
  'Qu\'est-ce que tu espères pour nous dans dix ans, que tu n\'oses pas formuler à voix haute ?',
  'Quel talent as-tu laissé mourir faute de temps ou de courage ?',
  'Si notre histoire était un livre, que voudrais-tu écrire dans le prochain chapitre ?',
  'Quelle trace veux-tu laisser dans ce monde, même petite ?',
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    ...vulnerabiliteQuestions.map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: 'Prenez un moment pour réfléchir et partager honnêtement.' },
    })),
    ...enfanceQuestions.map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: 'Prenez un moment pour réfléchir et partager honnêtement.' },
    })),
    ...valeursQuestions.map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: 'Prenez un moment pour réfléchir et partager honnêtement.' },
    })),
    ...amourQuestions.map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: 'Prenez un moment pour réfléchir et partager honnêtement.' },
    })),
    ...revesQuestions.map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: 'Prenez un moment pour réfléchir et partager honnêtement.' },
    })),
  ],
};

export default function QuestionsProfondesCoupleArticlePage() {
  const publishedDate = '1 juillet 2025';

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <header className="mb-10">
        <time className="text-sm text-slate-400" dateTime="2025-07-01">{publishedDate}</time>
        <h1 >
          50 questions profondes pour couple : se reconnecter
        </h1>
        <p>
          Les questions profondes pour couple sont des invitations intentionnelles à sortir du
          quotidien pour explorer ce qui compte vraiment — les peurs, les souvenirs, les valeurs et
          les désirs cachés qui tissent la vraie intimité.
        </p>
        <p>
          Basé sur les données de 1 200+ sessions couple Captain Bond, les couples qui utilisent
          des questions structurées rapportent une connexion mesurablement plus forte.
        </p>
      </header>

      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-10">
        <h2 >À retenir</h2>
        <ul >
          <li>Les questions profondes reconstruisent l&apos;intimité émotionnelle en créant un espace où chaque réponse est accueillie sans jugement. Une étude de 2023 dans le Journal of Social and Personal Relationships a montré que les couples qui se posent des questions originales rapportent des niveaux d&apos;intimité plus élevés.</li>
          <li>Les 50 questions sont réparties en 5 thèmes : vulnérabilité, enfance, valeurs, amour et rêves — chacun cible une couche différente de la relation.</li>
          <li>La vraie reconnexion se joue dans la relance, pas dans la question. Reste curieux, tais-toi et laisse l&apos;autre finir.</li>
          <li>Utilisez ces questions comme un rituel hebdomadaire plutôt qu&apos;un quiz unique pour que la conversation reste vivante dans le temps.</li>
        </ul>
      </div>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
        La distance entre deux personnes se mesure rarement en années. Elle se mesure aux questions
        qu&apos;elles ont cessé de se poser.
      </blockquote>

      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white font-bold text-lg">
          CB
        </div>
        <div>
          <p className="font-semibold text-sm">Captain Bond</p>
          <p className="text-xs text-slate-400">
            Publié le {publishedDate} &middot; 5 min de lecture
          </p>
        </div>
      </div>

      <section className="article-block">
        <h2 >Pourquoi les questions profondes sont essentielles</h2>
        <p>
          La plupart des couples ne s&apos;éloignent pas à cause d&apos;une trahison fracassante. Ils
          s&apos;éloignent parce que le rythme du quotidien — le travail, les courses, les écrans —
          remplace peu à peu l&apos;échange authentique par une coordination efficace. On cesse de
          demander comment l&apos;autre se sent pour demander ce qu&apos;il faut acheter au supermarché.
          Avec les mois, cette efficacité creuse un vide.
        </p>
        <p>
          Selon une étude du Gottman Institute, les couples qui ont des conversations structurées
          au moins une fois par semaine rapportent 20 % de satisfaction relationnelle en plus.
        </p>
        <p>
          Les questions profondes inversent ce mécanisme. Elles imposent une pause. Elles obligent à
          s&apos;asseoir, à se regarder, à répondre sans filet. Les premières seront peut-être
          gênantes. C&apos;est normal. La gêne est le prix d&apos;entrée d&apos;une conversation qui compte
          vraiment.
        </p>
        <blockquote className="border-l-4 border-neon-pink pl-6 my-6 italic text-slate-200">
          La gêne est le prix d&apos;entrée d&apos;une conversation qui compte vraiment.
        </blockquote>
      </section>

      <section className="article-block">
        <h2 >Comment utiliser ces questions</h2>
        <p>
          Une liste de cinquante questions peut sembler intimidante. Résistez à l&apos;envie d&apos;en
          faire une check-list. Voici une approche simple qui fonctionne :
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-4">
          <li>
            <strong>Une catégorie par semaine.</strong> Dix questions suffisent pour une soirée.
            Laissez les réponses infuser avant de passer à la suite.
          </li>
          <li>
            <strong>Alternez.</strong> Une personne lit la question à voix haute. L&apos;autre répond.
            Puis on échange. Celui qui écoute reste curieux sans chercher à relativiser ou à
            résoudre.
          </li>
          <li>
            <strong>Passez sans pénalité.</strong> Chacun peut sauter une question sans s&apos;expliquer.
            La sécurité passe avant tout.
          </li>
          <li>
            <strong>Suivez le fil.</strong> Si une réponse ouvre une porte, entrez. La question
            suivante attendra.
          </li>
        </ul>
        <p>
          Le but n&apos;est pas de finir la liste. Le but est de se sentir plus proches en la posant
          qu&apos;en la prenant.
        </p>
      </section>

      <section className="article-block">
        <h2 >Vulnérabilité et peur</h2>
        <p>
          Ces questions explorent ce que nous cachons d&apos;habitude — les peurs qu&apos;on gère seul,
          les insécurités qu&apos;on maquille en confiance, les parties de nous qu&apos;on protège le
          plus farouchement. Abordez-les avec douceur et sans jugement.
        </p>
        <ul >
          {vulnerabiliteQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 >Enfance et passé</h2>
        <p>
          Ce que nous sommes aujourd&apos;hui s&apos;est construit bien avant notre rencontre. Ces
          questions remontent le fil des souvenirs, des personnes et des blessures qui ont façonné
          la personne que vous aimez — et révèlent les liens invisibles entre hier et aujourd&apos;hui.
        </p>
        <ul >
          {enfanceQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 >Valeurs et croyances</h2>
        <p>
          Les valeurs partagées sont le socle d&apos;une relation durable. Ces questions vont au-delà
          des convergences de surface pour explorer d&apos;où viennent vos principes, où ils divergent,
          et ce que chacun tient pour sacré — même quand personne ne regarde.
        </p>
        <ul >
          {valeursQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 >Amour et relation</h2>
        <p>
          Ces questions se concentrent sur l&apos;espace entre vous — comment vous aimez, comment vous
          vous déconnectez, ce dont vous avez besoin et que vous hésitez à demander. C&apos;est le
          chemin le plus direct vers la compréhension intime de l&apos;autre.
        </p>
        <ul >
          {amourQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 >Rêves et regrets</h2>
        <p>
          Le regret et l&apos;ambition habitent la même chambre du cœur. Ces questions vous invitent à
          partager ce que vous voulez encore, ce que vous avez laissé tomber et ce que vous
          espérez — pour vous-même et pour votre vie à deux.
        </p>
        <ul >
          {revesQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 >Garder la conversation vivante</h2>
        <p>
          Le vrai travail n&apos;est pas de poser la question. C&apos;est de construire une vie où ces
          conversations deviennent naturelles, pas programmées. Plus vous pratiquez la
          vulnérabilité à deux, moins vous aurez besoin d&apos;une liste. Mais en attendant, la liste
          est un bon point de départ.
        </p>
        <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
          Le vrai travail n&apos;est pas de poser la question. C&apos;est de construire une vie où ces
          conversations deviennent naturelles, pas programmées.
        </blockquote>
        <p>
          Gardez ces questions à portée de main. Sortez-en une pendant un petit-déjeuner tranquille,
          sur la route d&apos;un week-end ou quand vous sentez la distance revenir. Une seule réponse
          honnête peut changer tout le climat d&apos;une relation.
        </p>
      </section>

      <section className="article-block">
        <p>
          Ces questions fonctionnent mieux quand les deux partenaires sont disponibles pour une
          conversation sans interruption. Si l&apos;un des deux est fatigué ou réticent, commencez par
          les sections légères — l&apos;objectif est la connexion, pas l&apos;exhaustivité.
        </p>
      </section>

      <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
        <h3 >Allez plus loin ensemble</h3>
        <p className="text-slate-200 mb-4">
          Le mode couple de Captain Bond génère des decks de conversation originaux à chaque
          session, adaptés à votre humeur, votre histoire et les sujets qui comptent vraiment pour
          vous maintenant. Sans préparation, sans pression, juste une vraie connexion.
        </p>
        <Link
          href="/fr/couple"
          className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
        >
          Découvrir le mode couple Captain Bond
        </Link>
      </aside>
    </article>
  );
}
