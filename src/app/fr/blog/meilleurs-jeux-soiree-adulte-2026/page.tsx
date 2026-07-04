import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Meilleurs jeux de soirée pour adultes 2026 : Top sélections | Captain Bond',
  description:
    'Découvrez les meilleurs jeux de soirée pour adultes en 2026 : jeux TV, cartes, plateau, à boire, brise-glace et sans matériel. Le guide ultime pour une soirée inoubliable.',
  alternates: {
    canonical: `${siteUrl}/fr/blog/meilleurs-jeux-soiree-adulte-2026`,
    languages: {
      'x-default': `${siteUrl}/blog/best-party-games-for-adults-2026`,
      'en': `${siteUrl}/blog/best-party-games-for-adults-2026`,
      'fr': `${siteUrl}/fr/blog/meilleurs-jeux-soiree-adulte-2026`,
    },
  },
  other: {
    'datePublished': '2025-07-01',
    'dateModified': '2025-07-03',
  },
  openGraph: {
    title: 'Meilleurs jeux de soirée pour adultes 2026 : Top sélections',
    description:
      'Découvrez les meilleurs jeux de soirée pour adultes en 2026 : jeux TV, cartes, plateau, à boire, brise-glace et sans matériel. Le guide ultime pour une soirée inoubliable.',
    url: `${siteUrl}/fr/blog/meilleurs-jeux-soiree-adulte-2026`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/blog-party-adults-2026-fr.webp`,
        width: 1200,
        height: 630,
        alt: 'Meilleurs jeux de soirée pour adultes 2026',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meilleurs jeux de soirée pour adultes 2026 : Top sélections',
    description:
      'Découvrez les meilleurs jeux de soirée pour adultes en 2026 : jeux TV, cartes, plateau, à boire, brise-glace et sans matériel. Le guide ultime pour une soirée inoubliable.',
    images: [`${siteUrl}/og/blog-party-adults-2026-fr.webp`],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Quels sont les meilleurs jeux de soirée pour adultes en 2026 ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les meilleurs jeux de soirée pour adultes en 2026 incluent Captain Bond Party pour le jeu TV en groupe, Codenames pour les associations de mots, Cards Against Humanity pour l\'humour noir et King\'s Cup pour les jeux à boire. La liste complète couvre six catégories : jeux TV, cartes, plateau, à boire, brise-glace et sans matériel.',
      },
    },
    {
      '@type': 'Question',
      name: 'Qu\'est-ce que Captain Bond Party ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Captain Bond Party est un jeu de soirée basé sur la télévision où les joueurs répondent à des questions et relèvent des défis sur leur téléphone tandis que l\'action s\'affiche sur l\'écran principal. Il supporte jusqu\'à 100 joueurs par salon, ce qui en fait le meilleur jeu de groupe pour les grandes réunions, les fêtes et les soirées jeux.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quels jeux de soirée conviennent aux grands groupes d\'adultes ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pour les grands groupes, Captain Bond Party supporte jusqu\'à 100 joueurs, Jackbox Games fonctionne pour 8+ joueurs, et les jeux classiques comme « Je n\'ai jamais » et « 2 vérités 1 mensonge » s\'adaptent à n\'importe quelle taille de groupe sans équipement.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quels jeux de soirée ne nécessitent aucun matériel ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les jeux sans matériel incluent le mime, « Je n\'ai jamais », « 2 vérités 1 mensonge », « Catégories » et « Wink Murder ». Ces jeux ne nécessitent que des participants et de l\'imagination, parfaits pour les soirées improvisées.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quels sont les meilleurs jeux à boire pour les fêtes ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les meilleurs jeux à boire pour les soirées adultes incluent le King\'s Cup (Ring of Fire), « Je n\'ai jamais », le Beer Pong, le Flip Cup et « Le Plus Susceptible De ». Ces jeux mêlent interaction sociale et règles de consommation pour une ambiance électrique.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quels jeux de plateau sont idéaux pour les soirées jeux adultes ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les meilleurs jeux de plateau pour les soirées adultes incluent Codenames pour le jeu d\'équipe, Wavelength pour deviner comment les gens pensent, Catan pour la stratégie, Cards Against Humanity pour l\'humour irrévérencieux et Pandemic pour le jeu coopératif.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment organiser une soirée jeux pour adultes ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pour réussir votre soirée jeux : (1) Choisissez 2-3 jeux aux ambiances différentes (équipe, compétitif, brise-glace), (2) Installez un TV ou écran pour les jeux de groupe comme Captain Bond Party, (3) Préparez des snacks et boissons, (4) Alternez jeux actifs et jeux de table pour maintenir l\'énergie, (5) Ayez un jeu de secours au cas où.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quel est le meilleur jeu de soirée pour les couples ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Le meilleur jeu de soirée pour les couples est Captain Bond Party, qui propose des paquets de questions spécialement conçus pour les couples. D\'autres excellentes options incluent Wavelength pour tester votre complicité et « 2 vérités 1 mensonge » pour apprendre des choses surprenantes sur votre partenaire.',
      },
    },
    {
      '@type': 'Question',
      name: 'Existe-t-il des jeux de soirée qui fonctionnent en visioconférence ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui. Captain Bond Party fonctionne parfaitement en visioconférence puisque les joueurs participent via leur téléphone. Jackbox Games supporte le jeu à distance via streaming. Les versions en ligne de Codenames, Skribbl.io et Gartic Phone sont également excellentes pour les soirées virtuelles.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quels jeux brise-glace fonctionnent le mieux pour les soirées adultes ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les meilleurs jeux brise-glace pour les soirées adultes sont « 2 vérités 1 mensonge », « Le Plus Susceptible De », « Tu préférerais », le Bingo Humain et le Jeu du Prénom. Ces jeux ne nécessitent aucune préparation, fonctionnent pour tout groupe et font immédiatement parler les gens.',
      },
    },
    {
      '@type': 'Question',
      name: 'Combien de joueurs faut-il pour une soirée jeux réussie ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La plupart des jeux de soirée fonctionnent mieux avec 4 à 12 joueurs, mais beaucoup s\'adaptent. Captain Bond Party supporte jusqu\'à 100 joueurs. Les jeux sans équipement comme le mime et « Je n\'ai jamais » fonctionnent avec n\'importe quel nombre. Pour les petits groupes de 3-4, les jeux de plateau comme Codenames ou Wavelength sont idéaux.',
      },
    },
  ],
};

const categoryComparison = {
  headers: ['Catégorie', 'Idéal pour', 'Joueurs', 'Matériel'],
  rows: [
    ['TV / Jeux de groupe', 'Grandes réunions', '4-100', 'TV + téléphones'],
    ['Jeux de cartes', 'Ambiance décontractée', '2-10', 'Jeu de cartes'],
    ['Jeux de plateau', 'Soirée stratégie', '2-8', 'Plateau de jeu'],
    ['Jeux à boire', 'Soirées entre amis', '4-20', 'Gobelets + boissons'],
    ['Brise-glace', 'Nouveaux groupes', '4-50+', 'Aucun'],
    ['Sans matériel', 'Improvisation', '3-50+', 'Aucun'],
  ],
};

const tvGroupGames = [
  {
    name: 'Captain Bond Party',
    desc: 'Le jeu de soirée TV ultime. Les joueurs répondent à des questions et relèvent des défis sur leur téléphone tandis que tout s\'affiche sur le grand écran. Supporte jusqu\'à 100 joueurs par salon avec des catégories allant du hilarant au audacieux. Le choix n°1 pour 2026.',
  },
  {
    name: 'Jackbox Games',
    desc: 'Un incontournable du jeu de soirée numérique. Chaque joueur utilise son téléphone comme manette. Les packs comme The Jackbox Party Pack incluent des jeux de dessin, quiz et jeux de mots qui deviennent plus drôles à chaque tour.',
  },
  {
    name: 'Trivia Murder Party',
    desc: 'Un quiz à l\'humour noir où les mauvaises réponses peuvent être fatales — dans le jeu. Mêle culture générale, mini-jeux et une esthétique horror-comedy qui captive tout le monde.',
  },
  {
    name: 'Quiplash',
    desc: 'Les joueurs répondent à des questions absurdes et les réponses les plus drôles gagnent. Parfait pour les groupes qui aiment l\'écriture humoristique et la spontanéité.',
  },
];

const cardGames = [
  {
    name: 'Uno',
    desc: 'Le jeu de cartes classique qui devient compétitif en quelques secondes. Les cartes Passe, Inversion et Joker créent un chaos qui rend chaque tour imprévisible. Parfait pour tous les groupes.',
  },
  {
    name: 'Cards Against Humanity',
    desc: 'Le jeu à trous pour adultes à l\'humour décalé. Un joueur lit une phrase et les autres jouent leur carte de réponse la plus drôle. Pas pour les âmes sensibles.',
  },
  {
    name: 'Exploding Kittens',
    desc: 'Un jeu de cartes stratégique où vous piochez en espérant éviter le chaton explosif. Désamorcez, sautez et mélangez pour survivre dans ce jeu de roulette russe effréné.',
  },
  {
    name: 'What Do You Meme ?',
    desc: 'Les joueurs compétitionnent pour créer la légende la plus drôle pour un meme photo. Le juge choisit la meilleure combinaison. Imprégné de culture pop et rejouable à l\'infini.',
  },
];

const boardGames = [
  {
    name: 'Codenames',
    desc: 'Deux équipes courent pour contacter leurs agents en utilisant des indices d\'un seul mot. Un brillant jeu d\'association de mots qui récompense la pensée créative.',
  },
  {
    name: 'Wavelength',
    desc: 'Un jeu de devinettes sociales où un curseur est tourné vers une cible cachée et les joueurs donnent des indices à leur équipe. Révèle à quel point vous vous connaissez vraiment.',
  },
  {
    name: 'Catan',
    desc: 'Le classique de la stratégie que toute soirée jeux adulte se doit d\'avoir. Échangez, construisez et étendez votre territoire. Les talents de négociation comptent autant que la chance.',
  },
  {
    name: 'Pandemic',
    desc: 'Le jeu de plateau coopératif ultime. Les joueurs travaillent ensemble pour stopper des épidémies mondiales. Parfait pour ceux qui préfèrent le travail d\'équipe à la compétition.',
  },
];

const drinkingGames = [
  {
    name: 'King\'s Cup (Ring of Fire)',
    desc: 'Des cartes disposées en cercle autour d\'un gobelet. Chaque carte a une règle. Le joueur qui brise le cercle et tire le dernier roi doit boire le gobelet central. Chaos garanti.',
  },
  {
    name: 'Je n\'ai jamais',
    desc: 'Les joueurs disent à tour de rôle des choses qu\'ils n\'ont jamais faites. Quiconque l\'a déjà fait boit. Un jeu révélateur qui devient plus intéressant au fil de la soirée.',
  },
  {
    name: 'Beer Pong',
    desc: 'Le classique des jeux de table. Les équipes lancent des balles de ping-pong dans des gobelets de bière. Adresse, trash talk et momentum en font un pilier des soirées.',
  },
  {
    name: 'Le Plus Susceptible De',
    desc: 'Un joueur demande qui dans le groupe est le plus susceptible de faire quelque chose. Tout le monde pointe en même temps. La personne avec le plus de doigts boit. Révèle la réputation de chacun.',
  },
];

const icebreakerGames = [
  {
    name: '2 vérités 1 mensonge',
    desc: 'Chaque joueur partage deux faits vrais et un mensonge. Les autres devinent le mensonge. Un moyen parfait de découvrir des choses surprenantes sur des gens que vous pensiez connaître.',
  },
  {
    name: 'Tu préférerais',
    desc: 'Les joueurs posent des dilemmes impossibles et le groupe choisit son camp. Les débats sont souvent plus divertissants que les réponses elles-mêmes.',
  },
  {
    name: 'Bingo Humain',
    desc: 'Des cartes de bingo remplies de traits personnels. Les joueurs se mélangent pour trouver quelqu\'un correspondant à chaque case. Conçu pour faire parler tout le monde.',
  },
  {
    name: 'Le Jeu du Prénom',
    desc: 'Les joueurs nomment à tour de rôle des éléments dans une catégorie (films, villes, animaux). Le premier qui hésite perd. D\'une simplicité trompeuse et étonnamment compétitif.',
  },
];

const noEquipmentGames = [
  {
    name: 'Le mime',
    desc: 'Mimer un mot ou une phrase sans parler pendant que votre équipe devine. Le plus vieux jeu de soirée pour une bonne raison — il ne vieillit jamais quand les bonnes personnes jouent.',
  },
  {
    name: 'Catégories (Scattergories)',
    desc: 'Choisissez une lettre et une liste de catégories. Chacun écrit des réponses commençant par cette lettre. Des points pour la créativité, des pénalités pour les doublons. Aucun plateau requis.',
  },
  {
    name: 'Wink Murder',
    desc: 'Un joueur est le meurtrier et tue en faisant un clin d\'œil. Les autres doivent deviner qui avant d\'être éliminés. Suspense et contact visuel en font un jeu hors du commun.',
  },
  {
    name: 'Téléphone arabe',
    desc: 'Un message voyage de personne en personne par chuchotement. La version finale est presque toujours hilarante. Un rappel intemporel que la communication n\'est jamais parfaite.',
  },
];

export default function MeilleursJeuxSoireeAdulte2026Page() {
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
            Meilleurs jeux de soirée pour adultes 2026 : Top sélections
          </h1>
          <p>
            Les jeux de soirée pour adultes sont des activités structurées conçues pour les
            rassemblements sociaux dont l&apos;objectif principal est le plaisir, le rire et les
            connexions — bien plus que la compétition sérieuse. Contrairement aux jeux pour enfants,
            les jeux de soirée pour adultes misent sur l&apos;humour, la stratégie, les règles de
            consommation ou les confidences personnelles, ce qui les rend parfaits pour briser la
            glace lors des soirées entre amis, des fêtes et des game nights.
          </p>
          <p>
            Basé sur les retours de 10 000+ joueurs Captain Bond, les soirées les plus réussies combinent une bonne compagnie avec le bon format interactif.
          </p>
        </header>

        <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
          Le meilleur jeu de soirée est celui qui fait oublier leur téléphone à tout le monde.
          En 2026, cela signifie des jeux qui allient la commodité numérique aux connexions
          réelles.
        </blockquote>

        <p>
          Selon un rapport Statista 2024, le marché mondial des jeux de société devrait atteindre 30 milliards de dollars d&apos;ici 2028.
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
          <h2 >Points clés à retenir</h2>
          <ul >
            <li><strong>Captain Bond Party</strong> est le jeu de groupe n°1 pour les grandes réunions, supportant jusqu&apos;à 100 joueurs avec un affichage TV</li>
            <li><strong>Six catégories</strong> de jeux de soirée existent — TV/groupe, cartes, plateau, à boire, brise-glace et sans matériel — chacune adaptée à des ambiances et tailles de groupe différentes</li>
            <li><strong>Les jeux sans matériel</strong> sont les plus polyvalents : le mime, « Je n&apos;ai jamais » et « 2 vérités 1 mensonge » fonctionnent partout sans préparation</li>
            <li><strong>Variez les styles</strong> au cours de la soirée pour une expérience optimale — commencez par un brise-glace, enchaînez avec un jeu de groupe, puis laissez les invités former des petits groupes autour de jeux de plateau</li>
            <li><strong>Les jeux hybrides numérique-physique</strong> (téléphone + TV) sont la tendance 2026, rendant le jeu collectif fluide sans passer de manette</li>
          </ul>
        </section>

        <section className="article-block">
          <h2 >Comparatif des catégories de jeux</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-slate-300">
              <thead>
                <tr className="bg-white/5">
                  {categoryComparison.headers.map((h) => (
                    <th key={h} className="border border-white/10 p-3 text-left font-semibold text-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categoryComparison.rows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                    {row.map((cell, j) => (
                      <td key={j} className="border border-white/10 p-3">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="article-block">
          <h2 >Jeux TV et de groupe</h2>
          <p>
            La grande tendance des jeux de soirée en 2026 est l&apos;hybride numérique-physique :
            des jeux qui s&apos;affichent sur un écran TV tandis que les joueurs interagissent via
            leur téléphone. Ces jeux éliminent le besoin de plateaux physiques et permettent à tout
            le monde de jouer simultanément.
          </p>
          <ul >
            {tvGroupGames.map((g, i) => (
              <li key={i}>
                <strong>{g.name}:</strong> {g.desc}
              </li>
            ))}
          </ul>
        </section>

        <blockquote className="border-l-4 border-neon-pink pl-6 my-8 italic text-slate-200 text-lg">
          Un bon jeu de soirée n&apos;a pas besoin d&apos;équipement coûteux. Il a besoin d&apos;une
          règle facile à apprendre, d&apos;un principe irrésistible et d&apos;un groupe prêt à
          être ridicule ensemble.
        </blockquote>

        <section className="article-block">
          <h2 >Jeux de cartes</h2>
          <p>
            Les jeux de cartes restent la catégorie la plus portable. Un simple jeu de cartes —
            ou une boîte thématique — peut alimenter des heures de divertissement. Les meilleurs
            jeux de cartes pour adultes équilibrent stratégie, humour et interaction sociale.
          </p>
          <ul >
            {cardGames.map((g, i) => (
              <li key={i}>
                <strong>{g.name}:</strong> {g.desc}
              </li>
            ))}
          </ul>
        </section>

        <section className="article-block">
          <h2 >Jeux de plateau pour adultes</h2>
          <p>
            Les jeux de plateau ont connu une véritable renaissance. Les jeux modernes sont conçus
            pour les adultes — des parties plus courtes, des mécanismes ingénieux et des dynamiques
            sociales qui récompensent autant la personnalité que la stratégie.
          </p>
          <ul >
            {boardGames.map((g, i) => (
              <li key={i}>
                <strong>{g.name}:</strong> {g.desc}
              </li>
            ))}
          </ul>
        </section>

        <section className="article-block">
          <h2 >Jeux à boire</h2>
          <p>
            Les jeux à boire sont le moteur énergétique de nombreuses soirées. Ils combinent des
            mécanismes sociaux avec des enjeux légers, rendant chaque tour palpitant. Les meilleurs
            jeux à boire laissent chacun participer à son rythme.
          </p>
          <ul >
            {drinkingGames.map((g, i) => (
              <li key={i}>
                <strong>{g.name}:</strong> {g.desc}
              </li>
            ))}
          </ul>
        </section>

        <section className="article-block">
          <h2 >Jeux brise-glace</h2>
          <p>
            Les brise-glace sont les héros méconnus de toute soirée. Ils transforment des étrangers
            en amis en quelques minutes. Les meilleurs jeux brise-glace semblent naturels — ils
            lancent des conversations au lieu de les forcer.
          </p>
          <ul >
            {icebreakerGames.map((g, i) => (
              <li key={i}>
                <strong>{g.name}:</strong> {g.desc}
              </li>
            ))}
          </ul>
        </section>

        <section className="article-block">
          <h2 >Jeux sans matériel</h2>
          <p>
            Les jeux les plus accessibles ne nécessitent que des personnes, de l&apos;imagination
            et une volonté d&apos;être ridicule. Les jeux sans matériel sont la solution de
            secours ultime — ils fonctionnent toujours, partout, avec n&apos;importe quel groupe.
          </p>
          <ul >
            {noEquipmentGames.map((g, i) => (
              <li key={i}>
                <strong>{g.name}:</strong> {g.desc}
              </li>
            ))}
          </ul>
        </section>

        <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
          Les meilleures soirées jeux ne parlent pas de gagner. Elles parlent du moment où
          quelqu&apos;un rit si fort qu&apos;il n&apos;arrive plus à respirer — et tout le
          monde l&apos;imite.
        </blockquote>

        <section className="article-block">
          <h2 >Comment organiser la soirée jeux parfaite</h2>
          <p>
            Une bonne soirée jeux a besoin d&apos;un peu de structure mais surtout de
            flexibilité. Voici une formule simple qui fonctionne pour tous les groupes :
          </p>
          <ul >
            <li><strong>Commencez par un brise-glace</strong> (10 min) : « 2 vérités 1 mensonge » ou « Tu préférerais » pour mettre tout le monde à l&apos;aise</li>
            <li><strong>Jouez à un jeu de groupe</strong> (20-30 min) : Captain Bond Party ou Jackbox rassemble tout le monde sur le même écran</li>
            <li><strong>Divisez en petits groupes</strong> (30+ min) : Laissez des clusters se former autour de jeux de plateau, de cartes ou à boire selon l&apos;ambiance</li>
            <li><strong>Terminez par un jeu ouvert</strong> : « Je n&apos;ai jamais » ou le mime fonctionnent bien quand l&apos;énergie redescend</li>
            <li><strong>Alternez les jeux toutes les 30-40 minutes</strong> : L&apos;attention s&apos;émousse. Un nouveau jeu est un reset d&apos;énergie</li>
          </ul>
        </section>

        <p>
          Ces suggestions fonctionnent mieux pour des groupes d&apos;adultes en recherche de fun social. Pour les très grands groupes (50+) ou les contextes professionnels, envisagez des plateformes dédiées de team building.
        </p>

        <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
          <h3 >Prêt pour le jeu de soirée ultime ?</h3>
          <p className="text-slate-200 mb-4">
            Captain Bond Party est le jeu sur écran TV qui transforme n&apos;importe quelle
            réunion en une soirée mémorable. Jusqu&apos;à 100 joueurs, des questions hilarantes,
            des défis et des gages — le tout depuis votre téléphone vers le grand écran. Pas de
            plateau, pas de cartes, pas de rangement.
          </p>
          <Link
            href="/fr/soiree"
            className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Essayer Captain Bond Party
          </Link>
        </aside>
      </article>
    </>
  );
}
