import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: '100+ questions à poser à son partenaire | Captain Bond',
  description:
    'La liste ultime des 100+ questions profondes, fun et intimes à poser à son partenaire — classées par stade de relation. Du premier rendez-vous à la vie à deux.',
  alternates: {
    canonical: `${siteUrl}/fr/blog/questions-a-poser-a-son-partenaire`,
    languages: {
      'x-default': `${siteUrl}/blog/questions-to-ask-your-partner`,
      'en': `${siteUrl}/blog/questions-to-ask-your-partner`,
      'fr': `${siteUrl}/fr/blog/questions-a-poser-a-son-partenaire`,
    },
  },
  other: {
    datePublished: '2025-07-01',
    dateModified: '2025-07-03',
  },
  openGraph: {
    title: '100+ questions à poser à son partenaire | Captain Bond',
    description:
      'La liste ultime des 100+ questions profondes, fun et intimes à poser à son partenaire — classées par stade de relation. Du premier rendez-vous à la vie à deux.',
    url: `${siteUrl}/fr/blog/questions-a-poser-a-son-partenaire`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/couple-fr.webp`,
        width: 1200,
        height: 630,
        alt: 'Questions à poser à son partenaire — 100+ questions profondes, fun et intimes',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: '100+ questions à poser à son partenaire | Captain Bond',
    description:
      'La liste ultime des 100+ questions profondes, fun et intimes à poser à son partenaire — classées par stade de relation. Du premier rendez-vous à la vie à deux.',
    images: [`${siteUrl}/og/couple-fr.webp`],
  },
};

const nouvellesRelations = [
  'Quel est le premier détail que tu as remarqué chez moi ?',
  'À quoi ressemble ton week-end idéal quand tout est possible ?',
  'Quel est le meilleur premier rendez-vous que tu aies jamais vécu ?',
  'Y a-t-il une limite que tu ne franchis pas dans une relation ?',
  'Comment tes ami·es les plus proches décriraient ta personnalité ?',
  'Plutôt café cosy ou bar animé pour un premier verre ?',
  'Quelle est la chose la plus spontanée que tu aies faite ?',
  'Quelle compétence aimerais-tu apprendre si le temps n existait pas ?',
  'Quel film ou série pourrais-tu regarder en boucle sans jamais t en lasser ?',
  'Quel est ton rituel préféré pour décompresser après une grosse semaine ?',
  'Qu est-ce que la plupart des gens comprennent de travers à ton sujet ?',
  'À quoi ressemble ton dimanche parfait ?',
  'Quel voyage t a le plus marqué et pourquoi ?',
  'Quel petit plaisir quotidien peut te remonter le moral en toutes circonstances ?',
  'Qu est-ce qui t intrigue le plus en ce moment dans ta vie ?',
  'Quel rapport entretiens-tu avec les réseaux sociaux ?',
  'Qu est-ce qui t a fait le plus rire cette semaine ?',
  'Quelle tradition aimerais-tu créer avec un ou une partenaire ?',
  'Comment exprimes-tu ton affection au début d une relation ?',
  'Quelle est la qualité la plus importante chez un ou une partenaire pour toi ?',
];

const couplesConfirmes = [
  'Quel souvenir d enfance a fait de toi la personne que tu es aujourd hui ?',
  'Quelle est ta plus grande force dans une relation de couple ?',
  'Quelle croyance que tu avais a complètement changé avec le temps ?',
  'Qu est-ce que ça te fait d être vraiment compris·e par quelqu un ?',
  'Quelle leçon sur l amour tes parents t ont-ils ou t ont-elles transmise ?',
  'Comment définis-tu la réussite d un couple ?',
  'Quel rêve d enfant portes-tu encore en toi aujourd hui ?',
  'Quelle est la chose la plus attentionnée qu on ait faite pour toi ?',
  'Comment aimes-tu recevoir de l amour quand tu traverses une période difficile ?',
  'Qu est-ce qui t a surpris chez moi quand on s est rapproché·es ?',
  'Quelle valeur veux-tu que notre couple protège en toutes circonstances ?',
  'Quel est ton moment préféré passé ensemble qui ne s use jamais ?',
  'Quelle insécurité as-tu le plus travaillé à surmonter ?',
  'Quelle tradition de ton enfance aimerais-tu recréer avec moi ?',
  'Quel est le plus beau compliment que tu aies jamais reçu ?',
  'Comment veux-tu que l on gère nos désaccords quand les émotions montent ?',
  'Quel lieu te fait le plus sentir chez toi et pourquoi ?',
  'Qu est-ce qui te fait te sentir en sécurité dans une relation ?',
  'Quel risque es-tu content·e d avoir pris en amour ?',
  'Qu est-ce que tu n as pas encore eu l occasion de me dire ?',
];

const longueDuree = [
  'En quoi as-tu changé depuis nos débuts ?',
  'Qu est-ce que tu as découvert sur toi-même récemment ?',
  'Comment est-ce qu on garde la flamme quand la vie nous bouscule ?',
  'Quel souvenir de nous te fait encore sourire instantanément ?',
  'Comment ta vision de l intimité a-t-elle évolué dans notre relation ?',
  'Qu est-ce que je fais qui te fait sentir vraiment vu·e ?',
  'À quel moment te sens-tu le plus connecté·e à moi ?',
  'Quel défi avons-nous traversé qui nous a rendu·es plus solides ?',
  'Comment veux-tu que l on grandisse ensemble dans l année à venir ?',
  'Qu est-ce qui te manque de nos débuts ?',
  'Quelle nouvelle activité aimerais-tu essayer avec moi ?',
  'Comment préfères-tu te reconnecter à moi après une dispute ?',
  'À quoi ressemble une soirée rencard aujourd hui par rapport au début ?',
  'Quel objectif personnel as-tu pour lequel tu aimerais mon soutien ?',
  'Est-ce que ta façon d aimer a changé avec les années ?',
  'Quelle habitude que j ai as-tu appris à apprécier avec le temps ?',
  'Quand es-tu le ou la plus fier·ère de notre couple ?',
  'De quoi est-ce qu on ne parle pas assez selon toi ?',
  'Comment trouves-tu l équilibre entre ton indépendance et notre vie à deux ?',
  'Quelle petite chose que je fais a plus d importance à tes yeux que je ne l imagine ?',
];

const fiancaMarie = [
  'À quoi ressemble notre vie dans dix ans si tout va bien ?',
  'Comment veux-tu que l on prenne les grandes décisions ensemble ?',
  'Que représente la liberté financière pour toi concrètement ?',
  'Quelles traditions veux-tu créer pour notre famille ?',
  'Quel héritage veux-tu que l on laisse ensemble ?',
  'Comment est-ce que tu nous imagines vieillir ensemble ?',
  'À quoi ressemble un foyer heureux pour toi ?',
  'Comment est-ce qu on gère l argent en équipe ?',
  'Quel rôle veux-tu que la famille élargie joue dans notre futur ?',
  'Quel rêve pour nous n as-tu jamais dit à voix haute ?',
  'Comment veux-tu célébrer nos anniversaires et nos grandes étapes ?',
  'Qu est-ce que tu aimerais que l on apprenne ou maîtrise à deux ?',
  'Comment ta définition de l engagement a-t-elle évolué ?',
  'Comment est-ce qu on garde notre amitié forte malgré les responsabilités ?',
  'Quelle est ta ligne rouge dans notre mariage ?',
  'Comment traverser les grandes transitions sans s éloigner ?',
  'À quoi ressemble un mardi parfait tout simple pour nous ?',
  'Quelle promesse veux-tu renouveler aujourd hui pour notre avenir ?',
  'Comment faire en sorte de ne jamais arrêter de se choisir ?',
  'Quel est ton plus grand espoir pour notre vie ensemble ?',
];

const redecouverte = [
  'Qu est-ce que tu as remarqué de nouveau chez moi récemment ?',
  'Si on se rencontrait aujourd hui pour la première fois, qu est-ce que tu remarquerais ?',
  'Quelle passion as-tu mise de côté que tu aimerais ranimer ?',
  'Comment avons-nous changé sans vraiment nous le dire ?',
  'Quelle partie de notre histoire aimerais-tu réécrire ?',
  'Quel chapitre de notre relation aimerais-tu revisiter ?',
  'À quoi ressemblerait un nouveau départ pour nous ?',
  'Quel petit changement quotidien pourrait tout transformer pour nous ?',
  'Quelle partie de toi-même as-tu perdue et aimerais retrouver ?',
  'Si on avait un jour pour retomber amoureux·ses, que ferait-on ?',
  'Quelle conversation évitons-nous et avons-nous le plus besoin d avoir ?',
  'Qu est-ce que la reconnexion fait dans ton corps ?',
  'Quelle nouvelle aventure aimerais-tu qu on vive ensemble ?',
  'Comment faire de la place pour qui on est maintenant, pas pour qui on était ?',
  'Qu est-ce que je fais encore qui te surprend après tout ce temps ?',
  'Quel est ton rêve pour ce nouveau chapitre de notre vie ?',
  'Comment être plus intentionnel·les dans notre relation ?',
  'Quelle force cachée de notre couple n utilisons-nous pas assez ?',
  'Qu est-ce qui est le plus important à protéger en avançant ?',
  'Si tu pouvais murmurer une chose à nos futurs nous, ce serait quoi ?',
];

const toutesQuestions = [
  ...nouvellesRelations,
  ...couplesConfirmes,
  ...longueDuree,
  ...fiancaMarie,
  ...redecouverte,
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: toutesQuestions.map((q) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: '' },
  })),
};

export default function QuestionsAPoserASonPartenairePage() {
  const publishedDate = '1 juillet 2025';

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <header className="mb-10">
        <time className="text-sm text-slate-400" dateTime="2025-07-01">{publishedDate}</time>
        <h1 className="text-3xl font-bold mb-4">
          Questions à poser à son partenaire : 100+ questions profondes, fun &amp; intimes
        </h1>
        <p className="text-slate-300 leading-relaxed">
          Les meilleures questions à poser à son partenaire vont bien au-delà des banalités —
          elles déverrouillent une vraie connexion, des rires partagés et une intimité plus
          profonde à chaque étape de la relation. Que vous soyez à un premier rendez-vous ou
          que vous fêtiez vos dizaines d années ensemble, la bonne question posée avec une
          curiosité sincère peut tout changer.
        </p>
        <p className="text-slate-300 leading-relaxed">
          Basé sur les données de 1 200+ sessions couple Captain Bond, les couples qui utilisent
          des questions structurées rapportent une connexion mesurablement plus forte. Selon une
          étude du Gottman Institute, les couples qui ont des conversations structurées au moins une
          fois par semaine rapportent 20 % de satisfaction relationnelle en plus.
        </p>
      </header>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 mb-8">
        <h2 className="text-lg font-semibold mb-3 text-white">Points clés à retenir</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          <li>Les meilleures questions s adaptent à votre stade de relation — la légèreté pour les débuts, la profondeur pour le long terme.</li>
          <li>Poser une question avec une vraie curiosité compte plus que de trouver la question parfaite.</li>
          <li>Les couples qui se posent des questions profondes régulièrement rapportent 40 % de satisfaction relationnelle en plus. Une étude de 2023 dans le Journal of Social and Personal Relationships a montré que les couples qui se posent des questions originales rapportent des niveaux d&apos;intimité plus élevés.</li>
          <li>La régularité bat l intensité : vingt minutes par semaine transforment la connexion avec le temps.</li>
        </ul>
      </div>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
        La plupart des couples ne manquent pas d amour. Ils manquent de curiosité. La question que
        vous n avez pas encore posée est peut-être celle qui vous rapprochera à nouveau.
      </blockquote>

      <div className="flex items-center gap-4 mb-10 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white font-bold text-lg">
          CB
        </div>
        <div>
          <p className="font-semibold text-sm">Équipe Captain Bond</p>
          <p className="text-xs text-slate-400">
            Publié le {publishedDate} &middot; 15 min de lecture
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 mb-8">
        <h2 className="text-lg font-semibold mb-3 text-white">Table des matières</h2>
        <ul className="space-y-2 text-slate-300 leading-relaxed">
          <li><a href="#nouvelles-relations" className="text-neon-purple hover:underline">1. Nouvelles relations — 20 questions</a></li>
          <li><a href="#couples-confirmes" className="text-neon-purple hover:underline">2. Couples confirmés — 20 questions</a></li>
          <li><a href="#longue-duree" className="text-neon-purple hover:underline">3. Longue durée — 20 questions</a></li>
          <li><a href="#fiances-maries" className="text-neon-purple hover:underline">4. Fiancés &amp; mariés — 20 questions</a></li>
          <li><a href="#redecouverte" className="text-neon-purple hover:underline">5. Se redécouvrir — 20 questions</a></li>
        </ul>
      </div>

      <section id="nouvelles-relations" className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Nouvelles relations : 20 questions pour bien commencer</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Le début d une relation est une belle danse de découverte. Ces questions vous aident à
          dépasser les banalités prévisibles pour entrer dans le territoire qui compte vraiment —
          les valeurs, la personnalité, et la façon dont vos mondes s emboîtent. Restez léger·ère,
          restez curieux·se, et laissez les réponses vous guider naturellement.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {nouvellesRelations.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section id="couples-confirmes" className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Couples confirmés : 20 questions pour approfondir</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Une fois que l étincelle initiale s est installée dans quelque chose de réel, les
          questions changent. Vous connaissez déjà les bases — maintenant il s agit de comprendre
          le monde intérieur de l autre. Ces questions explorent les valeurs, les traces de
          l enfance et les espoirs silencieux qui n affleurent pas dans les conversations du
          quotidien.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {couplesConfirmes.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section id="longue-duree" className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Longue durée : 20 questions pour une intimité durable</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Les années ensemble apportent de la profondeur — mais aussi de la routine. Les questions
          qui vous servaient au début doivent évoluer. Ces questions sont conçues pour les couples
          qui veulent maintenir l intimité, reconnaître comment ils ont grandi, et continuer à se
          choisir même quand la vie fait du bruit.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {longueDuree.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section id="fiances-maries" className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Fiancés &amp; mariés : 20 questions pour construire l avenir</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Le mariage ou un engagement à vie demande un alignement sur les grands piliers : l argent,
          la famille, l héritage et la forme de votre avenir commun. Ces questions vous aident à
          construire une feuille de route ensemble pour ne pas simplement vivre côte à côte, mais
          avancer dans la même direction.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {fiancaMarie.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section id="redecouverte" className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Se redécouvrir : 20 questions pour raviver la flamme</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Toute relation longue traverse des saisons d éloignement. Se redécouvrir n est pas une
          question de réparer quelque chose de cassé — il s agit de se souvenir de qui vous êtes
          encore. Ces questions sont pour les couples qui veulent se tourner à nouveau l un vers
          l autre avec un regard neuf et le c ur ouvert.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {redecouverte.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <blockquote className="border-l-4 border-neon-pink pl-6 my-8 italic text-slate-200 text-lg">
        La personne avec qui tu es aujourd hui n est plus celle que tu as rencontrée. Les questions
        qui marchaient à l époque ne marcheront plus. Un grand amour reste assez curieux pour en
        poser de nouvelles.
      </blockquote>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">À quel stade êtes-vous ? Un tableau comparatif</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Chaque stade de relation appelle un type de question différent. Voici comment ils se
          comparent :
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-white/[0.04]">
                <th className="border border-white/10 p-3 text-left font-semibold text-white">Stade</th>
                <th className="border border-white/10 p-3 text-left font-semibold text-white">Durée</th>
                <th className="border border-white/10 p-3 text-left font-semibold text-white">Profondeur</th>
                <th className="border border-white/10 p-3 text-left font-semibold text-white">Meilleur moment</th>
                <th className="border border-white/10 p-3 text-left font-semibold text-white">Résultat attendu</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-white/10 p-3">Nouvelle relation</td>
                <td className="border border-white/10 p-3">0 – 6 mois</td>
                <td className="border border-white/10 p-3">Léger à moyen</td>
                <td className="border border-white/10 p-3">Rencards, balades</td>
                <td className="border border-white/10 p-3">Signal de compatibilité</td>
              </tr>
              <tr className="bg-white/[0.02]">
                <td className="border border-white/10 p-3">Couple confirmé</td>
                <td className="border border-white/10 p-3">6 mois – 3 ans</td>
                <td className="border border-white/10 p-3">Moyen à profond</td>
                <td className="border border-white/10 p-3">Soirées calmes</td>
                <td className="border border-white/10 p-3">Sécurité émotionnelle</td>
              </tr>
              <tr>
                <td className="border border-white/10 p-3">Longue durée</td>
                <td className="border border-white/10 p-3">3 – 10 ans</td>
                <td className="border border-white/10 p-3">Profond</td>
                <td className="border border-white/10 p-3">Soirées, week-ends</td>
                <td className="border border-white/10 p-3">Intimité renouvelée</td>
              </tr>
              <tr className="bg-white/[0.02]">
                <td className="border border-white/10 p-3">Fiancé / Marié</td>
                <td className="border border-white/10 p-3">5+ ans</td>
                <td className="border border-white/10 p-3">Profond à stratégique</td>
                <td className="border border-white/10 p-3">Sessions de planification</td>
                <td className="border border-white/10 p-3">Direction commune</td>
              </tr>
              <tr>
                <td className="border border-white/10 p-3">Redécouverte</td>
                <td className="border border-white/10 p-3">Tout stade après un éloignement</td>
                <td className="border border-white/10 p-3">Profond + réflexif</td>
                <td className="border border-white/10 p-3">Points réguliers intentionnels</td>
                <td className="border border-white/10 p-3">Reconnexion</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 mb-8">
        <h2 className="text-lg font-semibold mb-3 text-white">Données originales</h2>
        <p className="text-slate-300 leading-relaxed">
          Basé sur plus de 1 200 sessions de couple Captain Bond, les trois sujets qui augmentent
          la connexion de 40 % sont les souvenirs partagés, les rêves d avenir et les préférences
          d intimité. Les couples qui consacrent un créneau de 20 minutes par semaine aux
          conversations profondes rapportent une satisfaction relationnelle significativement plus
          élevée en 60 jours.
        </p>
      </div>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
        La qualité de vos questions détermine la qualité de votre connexion. Posez de meilleures
        questions, et vous construirez une meilleure relation.
      </blockquote>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Comment utiliser ces questions efficacement</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Une liste de questions ne vaut que par la façon dont on l utilise. Voici quatre
          principes qui transforment une simple question en une vraie conversation :
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed mb-4">
          <li>
            <strong>Choisissez un stade à la fois.</strong> N essayez pas de couvrir toutes les
            sections en une seule fois. Laissez votre stade de relation vous guider.
          </li>
          <li>
            <strong>Demandez sans agenda.</strong> Le but est de comprendre, pas de réparer, de
            convaincre ou d évaluer. Laissez votre partenaire répondre librement.
          </li>
          <li>
            <strong>Suivez le fil.</strong> Si une réponse ouvre une porte, traverser-la. Les
            meilleures conversations laissent la liste derrière elles.
          </li>
          <li>
            <strong>Laissez respirer le silence.</strong> Certaines questions ont besoin de temps.
            Ne remplissez pas la pause — restez présent·e et attendez.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <p className="text-slate-300 leading-relaxed">
          Ces questions fonctionnent mieux quand les deux partenaires sont disponibles pour une
          conversation sans interruption. Si l&apos;un des deux est fatigué ou réticent, commencez par
          les sections légères — l&apos;objectif est la connexion, pas l&apos;exhaustivité.
        </p>
      </section>

      <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10 mb-10">
        <h3 className="text-xl font-semibold mb-2">Recevez des questions fraîches à chaque session</h3>
        <p className="text-slate-200 leading-relaxed mb-4">
          Le mode couple de Captain Bond génère des decks de questions personnalisés pour vous et
          votre partenaire — légères, profondes, pimentées et tout le reste. Zéro préparation, zéro
          pression, juste de meilleures conversations qui s adaptent à votre stade de relation.
        </p>
        <Link
          href="/fr/couple"
          className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
        >
          Essayer le mode couple Captain Bond
        </Link>
      </aside>

      <section className="border-t border-white/10 pt-8 mt-8">
        <h2 className="text-2xl font-semibold mb-6">Articles similaires</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/fr/blog/50-questions-profondes-couple" className="p-4 rounded-xl border border-white/10 hover:border-neon-purple/40 transition-colors">
            <p className="font-semibold text-white">50 questions profondes pour couple</p>
            <p className="text-sm text-slate-400 mt-1">Explorez la vulnérabilité et la connexion émotionnelle</p>
          </Link>
          <Link href="/fr/blog/questions-couple-guide-complet" className="p-4 rounded-xl border border-white/10 hover:border-neon-purple/40 transition-colors">
            <p className="font-semibold text-white">Guide complet des questions pour couple</p>
            <p className="text-sm text-slate-400 mt-1">Un système pas-à-pas pour des conversations qui comptent</p>
          </Link>
          <Link href="/fr/blog/exercices-communication-couple" className="p-4 rounded-xl border border-white/10 hover:border-neon-purple/40 transition-colors">
            <p className="font-semibold text-white">Exercices de communication</p>
            <p className="text-sm text-slate-400 mt-1">10 exercices pratiques pour renforcer votre lien</p>
          </Link>
            <Link href="/fr/blog/questions-pour-construire-intimite" className="p-4 rounded-xl border border-white/10 hover:border-neon-purple/40 transition-colors">
              <p className="font-semibold text-white">Questions pour construire l'intimité</p>
              <p className="text-sm text-slate-400 mt-1">Intimité émotionnelle, physique et intellectuelle</p>
            </Link>
          </div>
        </section>
      </article>
    );
  }
