import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Comment créer un rituel de couple hebdomadaire (guide 20 min) | Captain Bond',
  description:
    'Un rituel de couple simple de 20 minutes par semaine pour rester connectés, intentionnels et complices. Guide pas à pas avec bénéfices scientifiquement prouvés.',
  alternates: {
    canonical: `${siteUrl}/fr/blog/rituel-couple-hebdomadaire`,
    languages: {
      'x-default': `${siteUrl}/blog/weekly-couple-ritual`,
      'en': `${siteUrl}/blog/weekly-couple-ritual`,
      'fr': `${siteUrl}/fr/blog/rituel-couple-hebdomadaire`,
    },
  },
  openGraph: {
    title: 'Comment créer un rituel de couple hebdomadaire (guide 20 min)',
    description:
      'Un rituel de couple simple de 20 minutes par semaine pour rester connectés, intentionnels et complices.',
    url: `${siteUrl}/fr/blog/rituel-couple-hebdomadaire`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/blog-weekly-ritual-fr.webp`,
        width: 1200,
        height: 630,
        alt: 'Rituel de couple hebdomadaire',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comment créer un rituel de couple hebdomadaire (guide 20 min)',
    description:
      'Un rituel de couple simple de 20 minutes par semaine pour rester connectés, intentionnels et complices.',
    images: [`${siteUrl}/og/blog-weekly-ritual-fr.webp`],
  },
  other: {
    'datePublished': '2025-07-01',
    'dateModified': '2025-07-03',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Qu\'est-ce qu\'un rituel de couple hebdomadaire ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un rituel de couple hebdomadaire est un créneau dédié et récurrent où les partenaires se connectent intentionnellement — sans téléphone, sans programme, juste une attention mutuelle.',
      },
    },
    {
      '@type': 'Question',
      name: 'Combien de temps doit durer un rituel de couple ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vingt minutes est la durée idéale. Assez longue pour aller au-delà des banalités, assez courte pour tenir dans des emplois du temps chargés sans fatiguer.',
      },
    },
    {
      '@type': 'Question',
      name: 'De quoi parle-t-on pendant un rituel de couple ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Utilisez des cartes de conversation, des decks de questions ou un simple format de point hebdomadaire. Les sujets vont du léger au profond, selon votre humeur.',
      },
    },
    {
      '@type': 'Question',
      name: 'Un rituel hebdomadaire peut-il aider un couple en difficulté ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui. Un rituel régulier reconstruit la confiance, améliore la communication et crée un espace de sécurité émotionnelle — mais les problèmes sérieux peuvent aussi nécessiter une aide professionnelle.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quel est le meilleur jour pour un rituel de couple ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Le dimanche soir fonctionne bien pour beaucoup de couples car la semaine se termine. Le meilleur jour est celui que vous pouvez protéger des autres engagements.',
      },
    },
    {
      '@type': 'Question',
      name: 'Vaut-il mieux utiliser des questions ou parler librement ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les deux fonctionnent. Des questions guidées empêchent la conversation de dériver vers les courses et la logistique. Le libre échange est parfait si vous évitez naturellement ce piège.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment commencer un rituel de couple hebdomadaire ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Choisissez un jour, réglez un minuteur sur 20 minutes, supprimez les distractions et utilisez un format simple : point sur la semaine, quelques questions, et un échange de gratitude.',
      },
    },
    {
      '@type': 'Question',
      name: 'Et si on rate une semaine ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ce n\'est pas grave du tout. L\'objectif est la régularité, pas la perfection. Reprenez simplement la semaine suivante sans culpabilité.',
      },
    },
  ],
};

export default function FrenchRituelCoupleHebdomadaireArticlePage() {
  const publishedDate = '1 juillet 2025';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
        <header className="mb-10">
          <time className="text-sm text-slate-400" dateTime="2025-07-01">
            {publishedDate}
          </time>
          <h1 >
            Comment créer un rituel de couple hebdomadaire (guide 20 min)
          </h1>
          <p>
            Un rituel de couple hebdomadaire, c&rsquo;est un créneau dédié et récurrent — sans
            téléphone, sans programme, juste vingt minutes d&rsquo;attention mutuelle. C&rsquo;est
            la pratique la plus efficace pour sortir votre relation du pilote automatique.
          </p>
          <p>
            Basé sur les données de 1 200+ sessions couple Captain Bond, les couples qui utilisent
            des questions structurées rapportent une connexion mesurablement plus forte.
          </p>
        </header>

        <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
          La qualité d&rsquo;une relation ne se mesure pas au temps passé ensemble, mais à la
          présence qu&rsquo;on y met pendant ce temps.
        </blockquote>

        <div className="flex items-center gap-4 mb-10">
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

        <section className="article-block">
          <h2 >Points clés à retenir</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-4">
            <li>
              Un créneau dédié de 20 minutes par semaine empêche la relation de basculer en mode
              transactionnel.
            </li>
            <li>
              Supprimer les distractions — téléphones éteints, pas de télé — est le changement le
              plus efficace que vous puissiez faire.
            </li>
            <li>
              Alterner les rôles de locuteur et d&rsquo;auditeur crée une participation équilibrée
              et une compréhension plus profonde.
            </li>
            <li>
              Terminer par un échange de gratitude reprogramme votre cerveau pour remarquer ce qui
              fonctionne dans la relation.
            </li>
            <li>
              La régularité compte plus que la durée. Vingt minutes chaque semaine valent mieux que
              deux heures une fois par mois.
            </li>
          </ul>
        </section>

        <section className="article-block">
          <h2 >Pourquoi un rituel hebdomadaire change tout</h2>
          <p>
            Les relations n&rsquo;échouent pas à cause d&rsquo;une seule grosse dispute. Elles
            s&rsquo;érodent progressivement — par des milliers de petits moments où un partenaire
            tend la main et l&rsquo;autre est distrait. Les études sont claires : les couples qui
            maintiennent des rituels communs rapportent une plus grande satisfaction relationnelle,
            une meilleure communication et une intimité émotionnelle renforcée. Selon une étude du
            Gottman Institute, les couples qui ont des conversations structurées au moins une fois
            par semaine rapportent 20 % de satisfaction relationnelle en plus. Une étude de 2023
            dans le Journal of Social and Personal Relationships a montré que les couples qui se
            posent des questions originales rapportent des niveaux d&rsquo;intimité plus élevés.
          </p>
          <p>
            Un rituel hebdomadaire n&rsquo;est pas une tâche de plus sur votre liste. C&rsquo;est
            un contenant qui protège votre connexion de la gravité logistique du quotidien. Il dit :
            cette relation compte assez pour apparaître sur le calendrier.
          </p>
          <p>
            Le meilleur dans tout ça ? Vous n&rsquo;avez pas besoin de bougies, de musique ou d&rsquo;un
            script. Juste vingt minutes et la volonté de vous tourner l&rsquo;un vers l&rsquo;autre
            au lieu du premier écran venu.
          </p>
        </section>

        <section className="article-block">
          <h2 >Étape 1 : Choisir un créneau et le protéger</h2>
          <p>
            Choisissez un jour et une heure que vous pouvez vraiment tenir. Le dimanche soir est
            populaire parce que le week-end se termine et que la semaine n&rsquo;a pas encore
            commencé. Le mardi matin peut mieux convenir aux travailleurs postés. Il n&rsquo;y a pas
            de mauvaise réponse — seulement celle que vous défendez.
          </p>
          <p>
            Mettez-le dans les deux calendriers. Traitez-le aussi sérieusement qu&rsquo;un rendez-vous
            médical. Si un imprévu survient, reprogrammez dans la même semaine plutôt que de sauter
            complètement. Le rituel est l&rsquo;engagement ; le créneau n&rsquo;est que son adresse.
          </p>
        </section>

        <section className="article-block">
          <h2 >Étape 2 : Supprimer toutes les distractions</h2>
          <p>
            C&rsquo;est l&rsquo;étape qui a le plus d&rsquo;impact. Les téléphones vont dans une
            autre pièce — pas retournés sur la table. La télé reste éteinte. Les notifications sont
            coupées. Si vous avez des enfants, attendez qu&rsquo;ils dorment ou trouvez une
            garde.
          </p>
          <p>
            Les recherches montrent que la simple présence d&rsquo;un téléphone — même retourné et
            silencieux — réduit la qualité de la conversation et l&rsquo;empathie. Votre partenaire
            mérite toute votre attention pendant vingt minutes. Rien n&rsquo;est plus important dans
            cette fenêtre.
          </p>
          <blockquote className="border-l-4 border-neon-pink pl-6 my-6 italic text-slate-200">
            La simple présence d&rsquo;un téléphone réduit la qualité de la conversation. Votre
            partenaire mérite la même attention que vous donnez à une notification.
          </blockquote>
        </section>

        <section className="article-block">
          <h2 >Étape 3 : Choisir un format de conversation</h2>
          <p>
            Avoir une structure évite l&rsquo;impasse du &ldquo;Alors, ta semaine ?&rdquo;. Le
            format le plus simple est un point en trois parties :
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-4">
            <li>
              <strong>Haut et bas :</strong> Chacun partage un moment fort et un défi de la
              semaine.
            </li>
            <li>
              <strong>Une question :</strong> Piochez un sujet de conversation dans un deck, une
              appli ou une liste que vous gardez. La question peut être légère, profonde, ou entre
              les deux.
            </li>
            <li>
              <strong>Gratitude :</strong> Chacun nomme une chose qu&rsquo;il a appréciée chez
              l&rsquo;autre cette semaine.
            </li>
          </ul>
          <p>
            Le mode couple de Captain Bond génère des questions fraîches à chaque session, pour ne
            jamais manquer de matière. L&rsquo;appli gère la structure ; vous vous concentrez
            l&rsquo;un sur l&rsquo;autre.
          </p>
        </section>

        <section className="article-block">
          <h2 >Étape 4 : Alterner la parole et l&rsquo;écoute</h2>
          <p>
            L&rsquo;erreur la plus courante dans les conversations de couple est d&rsquo;interrompre
            pour résoudre les problèmes. Quand votre partenaire partage quelque chose de difficile,
            votre instinct est de réparer. Résistez à cet instinct pendant vingt minutes.
          </p>
          <p>
            Utilisez un système simple : celui qui tient un objet parle, l&rsquo;autre écoute
            seulement. Pas d&rsquo;interruption, pas de conseil, pas de &ldquo;Ça me rappelle
            quand…&rdquo; Changez de rôle après un tour. Cela seul transformera vos conversations.
          </p>
          <p>
            Écouter sans réparer communique quelque chose de profond : Je te fais confiance pour
            gérer ta vie. Je suis là pour être témoin, pas pour gérer.
          </p>
        </section>

        <section className="article-block">
          <h2 >Étape 5 : Terminer par la gratitude</h2>
          <p>
            Les deux dernières minutes sont les plus importantes. Chacun partage une chose précise
            qu&rsquo;il a appréciée chez l&rsquo;autre cette semaine. &ldquo;Tu m&rsquo;as fait
            rire quand j&rsquo;étais stressé&rdquo; ou &ldquo;J&rsquo;ai remarqué comment tu as géré
            l&rsquo;appel avec ma mère avec beaucoup de grâce.&rdquo;
          </p>
          <p>
            La gratitude est un muscle. Plus vous l&rsquo;entraînez, plus votre cerveau scanne
            automatiquement ce qui fonctionne au lieu de ce qui manque. Avec le temps, cela
            reprogramme le climat émotionnel de toute votre relation.
          </p>
        </section>

        <section className="article-block">
          <h2 >Une dernière pensée</h2>
          <p>
            Vous n&rsquo;avez pas besoin du rituel parfait. Vous avez besoin du courage de
            commencer et de la discipline de le protéger. Vingt minutes, une fois par semaine, sans
            téléphone, avec toute votre attention. C&rsquo;est tout. C&rsquo;est assez pour changer
            la trajectoire de votre relation.
          </p>
          <p>
            Commencez cette semaine. Choisissez un jour. Réglez un minuteur. Tournez-vous l&rsquo;un
            vers l&rsquo;autre. Tout le reste n&rsquo;est que pratique.
          </p>
        </section>

        <section className="article-block">
          <p>
            Ces questions fonctionnent mieux quand les deux partenaires sont disponibles pour une
            conversation sans interruption. Si l&apos;un des deux est fatigué ou réticent, commencez
            par les sections légères — l&apos;objectif est la connexion, pas l&apos;exhaustivité.
          </p>
        </section>

        <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
          <h3 >Rendez-le sans effort avec Captain Bond</h3>
          <p className="text-slate-200 mb-4">
            Le mode couple de Captain Bond vous offre des questions de conversation fraîches chaque
            semaine, un minuteur intégré et un format structuré — pour ne jamais avoir à improviser
            votre rituel. Commencez aujourd&rsquo;hui et construisez l&rsquo;habitude qui protège
            votre connexion.
          </p>
          <Link
            href="/fr/couple"
            className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Essayer le mode couple Captain Bond
          </Link>
        </aside>
      </article>
    </>
  );
}

// SSG: prerender this static article at build time (override root edge runtime).
export const runtime = 'nodejs';
export const dynamic = 'force-static';
