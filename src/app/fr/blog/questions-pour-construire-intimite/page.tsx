import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: '30 questions pour construire l\'intimité : rapprochez-vous dès ce soir | Captain Bond',
  description:
    '30 questions pour construire l\'intimité émotionnelle, physique et intellectuelle dans votre couple. Renforcez votre connexion avec des conversations qui comptent.',
  alternates: {
    canonical: `${siteUrl}/fr/blog/questions-pour-construire-intimite`,
    languages: {
      'x-default': `${siteUrl}/fr/blog/questions-pour-construire-intimite`,
      'fr': `${siteUrl}/fr/blog/questions-pour-construire-intimite`,
      'en': `${siteUrl}/blog/questions-to-build-intimacy`,
    },
  },
  other: {
    'datePublished': '2025-06-12',
    'dateModified': new Date().toISOString().split('T')[0],
  },
  openGraph: {
    title: '30 questions pour construire l\'intimité : rapprochez-vous dès ce soir',
    description:
      '30 questions pour construire l\'intimité émotionnelle, physique et intellectuelle dans votre couple. Renforcez votre connexion avec des conversations qui comptent.',
    url: `${siteUrl}/fr/blog/questions-pour-construire-intimite`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/couple-fr.webp`,
        width: 1200,
        height: 630,
        alt: '30 questions pour construire l\'intimité : rapprochez-vous dès ce soir',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: '30 questions pour construire l\'intimité : rapprochez-vous dès ce soir',
    description:
      '30 questions pour construire l\'intimité émotionnelle, physique et intellectuelle dans votre couple. Renforcez votre connexion avec des conversations qui comptent.',
    images: [`${siteUrl}/og/couple-fr.webp`],
  },
};

const emotionalQuestions = [
  'Quelle peur n\'as-tu jamais osé dire à voix haute à personne ?',
  'Quand as-tu ressenti pour la dernière fois que je te voyais vraiment ?',
  'Quel souvenir te rend encore ému(e) quand tu y repenses ?',
  'De quoi as-tu besoin de ma part quand tu passes une journée difficile ?',
  'Qu\'aimerais-tu que je comprenne mieux de ton enfance ?',
  'À quoi ressemble la sécurité pour toi dans une relation ?',
  'Quelle blessure es-tu encore en train de guérir ?',
  'Comment préfères-tu être réconforté(e) quand tu es triste ?',
  'De quoi te pardonnes-tu trop peu ?',
  'Quelle est la chose la plus vulnérable que tu aies jamais partagée avec moi ?',
];

const physicalQuestions = [
  'Comment aimes-tu être touché(e) quand rien de sexuel n\'est attendu ?',
  'Quelle est ta façon préférée de vous endormir ensemble ?',
  'Quelle expérience sensorielle te fait le plus sentir présent(e) dans ton corps ?',
  'À quoi ressemble le désir pour toi, depuis la toute première étincelle ?',
  'Quelle tenue ou quel look chez moi te rend le plus attiré(e) ?',
  'Quel est notre rituel physique non-sexuel préféré ?',
  'Comment aimes-tu être embrassé(e) quand on se dit au revoir ?',
  'Quelle température ou texture te détend le plus physiquement ?',
  'Quelle partie de notre intimité aimerais-tu qu\'on prenne plus de temps pour ?',
  'Que signifie l\'aftercare pour toi, dans l\'intimité ou en dehors ?',
];

const intellectualQuestions = [
  'Quelle idée a changé ta façon de voir le monde récemment ?',
  'Quel livre ou article t\'a marqué(e) ?',
  'Quel sujet pourrais-tu débattre passionnément sans t\'énerver ?',
  'À quoi penses-tu pendant les moments calmes où tu es seul(e) ?',
  'Quelle croyance as-tu changée d\'avis récemment ?',
  'Quelle question sur la vie t\'empêche de dormir ?',
  'Quelle compétence ou matière apprendrais-tu si le temps n\'était pas une limite ?',
  'À quoi ressemble une conversation profonde pour toi ?',
  'Qu\'admires-tu dans la façon dont mon esprit fonctionne ?',
  'Quel mystère de l\'univers te fascine le plus ?',
];

const allQuestions = [...emotionalQuestions, ...physicalQuestions, ...intellectualQuestions];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allQuestions.map((q) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: '' },
  })),
};

export default function QuestionsPourConstruireIntimitePage() {
  const publishedDate = '12 juin 2025';

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <header className="mb-10">
        <time className="text-sm text-slate-400" dateTime="2025-06-12">{publishedDate}</time>
        <h1 className="text-3xl font-bold mb-4">
          30 questions pour construire l&rsquo;intimité : rapprochez-vous dès ce soir
        </h1>
        <p className="text-slate-300 leading-relaxed">
          L&rsquo;intimité n&rsquo;est pas une destination — c&rsquo;est une pratique. Elle
          s&rsquo;approfondit chaque fois que vous choisissez la curiosité plutôt que
          l&rsquo;hypothèse, l&rsquo;honnêteté plutôt que le confort, et la présence plutôt que
          la distraction. Ces 30 questions sont conçues pour vous y aider, dès ce soir.
        </p>
        <p className="text-slate-300 leading-relaxed">
          Basé sur les données de 1 200+ sessions couple Captain Bond, ces questions sont conçues pour susciter les conversations qui renforcent les relations réelles.
        </p>
      </header>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
        L&rsquo;intimité n&rsquo;est pas une destination — c&rsquo;est une pratique. Elle
        s&rsquo;approfondit chaque fois que vous choisissez la curiosité plutôt que l&rsquo;hypothèse.
      </blockquote>
      <p className="text-slate-300 leading-relaxed mb-8">
        Une étude de Harvard a montré que l&rsquo;intimité émotionnelle est le plus fort prédicteur de satisfaction relationnelle à long terme.
      </p>

      <div className="flex items-center gap-4 mb-10 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white font-bold text-lg">
          CB
        </div>
        <div>
          <p className="font-semibold text-sm">Équipe Captain Bond</p>
          <p className="text-xs text-slate-400">
            Publié le {publishedDate} &middot; 6 min de lecture
          </p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Que sont les questions pour construire l&rsquo;intimité ?</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Les questions pour construire l&rsquo;intimité sont des amorces conçues pour faire
          passer la conversation au-delà des échanges superficiels vers un territoire émotionnel,
          physique et intellectuel plus profond. Contrairement aux questions banales sur votre
          journée, elles invitent à la vulnérabilité, à la réflexion et à une curiosité sincère
          pour le monde intérieur de votre partenaire.
        </p>
        <p className="text-slate-300 leading-relaxed">
          Elles fonctionnent parce qu&rsquo;elles contournent le pilote automatique du quotidien.
          Quand vous posez une question que votre partenaire ne s&rsquo;est jamais posée, vous
          créez un petit moment de nouveauté —           et la nouveauté est la matière première du désir
          et de la connexion.
        </p>
        <p className="text-slate-300 leading-relaxed">
          Selon une recherche publiée dans les Archives of Sexual Behavior (2022), les couples qui discutent de leurs préférences intimes rapportent 30% de satisfaction sexuelle en plus.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Points clés à retenir</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          <li>L&rsquo;intimité a trois dimensions : émotionnelle, physique et intellectuelle. Négliger l&rsquo;une d&rsquo;elles crée de la distance.</li>
          <li>Les meilleures questions sont ouvertes et ne peuvent pas être répondues par oui ou non.</li>
          <li>Alternez les rôles. Le seul travail de celui qui écoute est de comprendre, pas de répondre ou de réparer.</li>
          <li>Vous pouvez passer votre tour sur n&rsquo;importe quelle question. La sécurité compte plus que le nombre de réponses.</li>
          <li>Suivez l&rsquo;énergie. Si une réponse ouvre une porte, traversez-la avant de passer à la suivante.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Questions d&rsquo;intimité émotionnelle</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          L&rsquo;intimité émotionnelle vit dans l&rsquo;espace entre ce que vous ressentez et ce
          que vous partagez. Ces questions invitent votre partenaire dans votre monde intérieur —
          vos peurs, vos souvenirs, vos espoirs les plus discrets. Allez-y doucement. Ces questions
          demandent une vraie vulnérabilité.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {emotionalQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Questions d&rsquo;intimité physique</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          L&rsquo;intimité physique ne concerne pas uniquement le sexe — il s&rsquo;agit du
          toucher, de la présence et du fait d&rsquo;être bien dans son corps à deux. Ces
          questions explorent la dimension sensorielle et physique de votre connexion. Elles
          restent élégantes tout en invitant à l&rsquo;honnêteté sur le désir.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {physicalQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Questions d&rsquo;intimité intellectuelle</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          L&rsquo;intimité intellectuelle est la dimension la plus négligée de la connexion. Elle
          grandit quand vous partagez comment vous pensez, pas seulement ce que vous ressentez.
          Ces questions vous invitent à explorer les idées ensemble — les croyances, les curiosités
          et les questions qui façonnent votre façon de naviguer dans le monde.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {intellectualQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <blockquote className="border-l-4 border-neon-pink pl-6 my-8 italic text-slate-200 text-lg">
        Suivez l&rsquo;énergie. Si une réponse ouvre une porte, traversez-la avant de passer à la suivante.
      </blockquote>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Comment utiliser ces questions</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Choisissez une catégorie et posez 2 à 3 questions. C&rsquo;est suffisant pour une
          session. Rangez vos téléphones, regardez-vous dans les yeux, et laissez les réponses
          respirer. Les questions de suivi — &laquo; dis-moi en plus &raquo; — comptent plus que
          la question d&rsquo;origine.
        </p>
        <p className="text-slate-300 leading-relaxed">
          Certaines questions peuvent ne pas fonctionner. C&rsquo;est normal. D&rsquo;autres
          ouvriront des portes que vous ne soupçonniez pas. Le but n&rsquo;est pas de finir la
          liste. Le but est de rester curieux l&rsquo;un de l&rsquo;autre.
        </p>
      </section>

      <section className="mb-10">
        <p className="text-slate-300 leading-relaxed">
          Ces suggestions fonctionnent mieux pour les couples prêts à s&rsquo;engager ensemble. Si la communication est difficile, envisagez un accompagnement professionnel en complément.
        </p>
      </section>

      <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
        <h3 className="text-xl font-semibold mb-2">Des questions fraîches à chaque fois ?</h3>
        <p className="text-slate-200 leading-relaxed mb-4">
          Le mode couple de Captain Bond génère de nouvelles questions pour construire l&rsquo;intimité
          à chaque session — émotionnelles, physiques, intellectuelles et bien plus. Sans
          préparation, sans répétition, juste de meilleures conversations.
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
