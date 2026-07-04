import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: '50 jeux brise-glace pour adultes : idées fun sans matériel | Captain Bond',
  description:
    '50 jeux brise-glace pour adultes classés en 5 catégories. Jeux rapides, pour faire connaissance, en équipe, virtuels et profonds. Zéro matériel nécessaire.',
  alternates: {
    canonical: `${siteUrl}/fr/blog/jeux-brise-glace-adultes`,
    languages: {
      'x-default': `${siteUrl}/blog/icebreaker-games-for-adults`,
      'en': `${siteUrl}/blog/icebreaker-games-for-adults`,
      'fr': `${siteUrl}/fr/blog/jeux-brise-glace-adultes`,
    },
  },
  other: {
    'datePublished': '2025-06-15',
    'dateModified': '2025-07-03',
  },
  openGraph: {
    title: '50 jeux brise-glace pour adultes : idées fun sans matériel',
    description:
      '50 jeux brise-glace pour adultes classés en 5 catégories. Jeux rapides, pour faire connaissance, en équipe, virtuels et profonds. Zéro matériel nécessaire.',
    url: `${siteUrl}/fr/blog/jeux-brise-glace-adultes`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/soiree-fr.webp`,
        width: 1200,
        height: 630,
        alt: '50 jeux brise-glace pour adultes',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: '50 jeux brise-glace pour adultes : idées fun sans matériel',
    description:
      '50 jeux brise-glace pour adultes classés en 5 catégories. Jeux rapides, pour faire connaissance, en équipe, virtuels et profonds. Zéro matériel nécessaire.',
    images: [`${siteUrl}/og/soiree-fr.webp`],
  },
};

const jeuxRapides = [
  'Deux vérités et un mensonge — Chacun partage deux vérités et un mensonge ; le groupe devine le mensonge.',
  'Je n\'ai jamais — Quelqu\'un dit une chose qu\'il n\'a jamais faite ; tous ceux qui l\'ont faite boivent (ou marquent un point).',
  'Le jeu du nom — Dites un nom qui commence par la dernière lettre du nom précédent. Pas de répétition.',
  'Association de mots — Une personne dit un mot ; la suivante dit le premier mot qui lui vient à l\'esprit.',
  'Tournoi de pierre-feuille-ciseaux — Élimination rapide. Le gagnant porte une couronne ridicule.',
  'Catégories — Choisissez une catégorie (ex. films). Chacun nomme un élément. Le premier qui répète ou hésite perd.',
  'Le jeu du rythme — Une personne frappe un rythme ; tout le monde le répète. La vitesse augmente à chaque tour.',
  'Charades en 30 secondes — Une personne mime un mot ou une phrase. L\'équipe devine en 30 secondes.',
  'Nœud humain — Debout en cercle, attrapez des mains au hasard, démêlez-vous sans lâcher prise.',
  'Zip Zap Zop — Montrez quelqu\'un du doigt en disant "Zip". Un mot erroné et vous êtes éliminé.',
];

const jeuxConnaissance = [
  'Chronologie personnelle — Dessinez une frise de votre vie avec 5 moments clés et partagez-les.',
  'Le jeu de la carte — Chacun place une épingle sur une carte à l\'endroit de sa naissance. Racontez une histoire de cet endroit.',
  'Partage de bucket list — Partagez trois éléments de votre liste de rêves. Trouvez quelqu\'un avec un point commun.',
  'Les objets de l\'île déserte — Trois objets que vous emporteriez sur une île déserte. Expliquez chacun.',
  'La bio en six mots — Racontez votre vie en exactement six mots. Lisez à voix haute.',
  'Histoire du premier concert — Où et quand était votre premier concert ? Racontez.',
  'Le dîner de rêve — Quelle figure historique inviteriez-vous à dîner et pourquoi ?',
  'Le métier de vos rêves d\'enfant — Que vouliez-vous faire à dix ans ? Cela a-t-il changé ?',
  'Le super-pouvoir — Un super-pouvoir pour un jour. Que choisissez-vous et que faites-vous ?',
  'Le dernier livre qui vous a marqué — Partagez un livre ou un article qui a changé votre regard.',
];

const jeuxEquipe = [
  'Le carré parfait — Les yeux bandés, une équipe avec une corde doit former un carré parfait au sol.',
  'Défi survivaliste — Les équipes s\'affrontent dans des mini-épreuves. L\'équipe perdante désigne quelqu\'un pour un gage.',
  'Tous à bord — Les équipes se tiennent sur une bâche. Pliez-la plus petite à chaque tour. La dernière équipe gagne.',
  'Le défi de la guimauve — Construisez la tour la plus haute avec des spaghettis, du ruban, de la ficelle et une guimauve au sommet.',
  'Le bâton d\'hélium — Abaissez un long bâton au sol en équipe. Si un doigt perd le contact, on recommence.',
  'Pictionary en équipe — Une personne dessine, l\'équipe devine. On change d\'artiste à chaque tour.',
  'La tour de ballons — Avec seulement des ballons et du ruban, construisez la tour la plus haute en 10 minutes.',
  'Chasse au trésor en équipe — Chaque équipe reçoit une liste de 20 objets. La première à tous les trouver gagne.',
  'Le champ de mines — Un joueur aux yeux bandés traverse un champ d\'objets guidé seulement par la voix de son coéquipier.',
  'Histoire collective — Une personne commence une histoire par une phrase. Chacun ajoute une phrase jusqu\'à la conclusion.',
];

const jeuxVirtuels = [
  'Concours de fonds d\'écran — Chacun met un fond d\'écran thématique. Le groupe vote pour le meilleur.',
  'Un fait par email — Avant l\'appel, chacun envoie un fait amusant. Lisez-les à haute voix et devinez qui est qui.',
  'Montre et raconte — Chacun prend un objet à portée de main. 60 secondes pour expliquer pourquoi c\'est le meilleur objet de la pièce.',
  'Deux vérités et un mensonge (virtuel) — Le même jeu classique adapté à la vidéo. Utilisez les réactions pour voter.',
  'Pictionary par partage d\'écran — Partagez votre écran et utilisez un outil de dessin. L\'équipe devine.',
  'Tu préférerais — Sondez le groupe avec une question "tu préférerais". Discutez des résultats.',
  'Histoire en émojis — Décrivez un film ou un événement avec uniquement des émojis. Le premier à deviner gagne.',
  'Check-in en cinq mots — Chacun décrit sa journée ou son humeur en exactement cinq mots.',
  'Trivia virtuel — Une personne prépare 10 questions. Les équipes répondent dans le chat. La réponse la plus rapide gagne.',
  'Quiz sonore — Diffusez 5 courts extraits audio. L\'équipe devine chaque son.',
];

const jeuxProfonds = [
  'Le cercle de gratitude — Chacun dit une chose pour laquelle il est reconnaissant et pourquoi.',
  'Leçon de vie — Partagez une leçon apprise à la dure. Pas d\'interruption, pas de conseil.',
  'Le moment de fierté — Décrivez un moment où vous vous êtes senti vraiment fier de vous et ce qu\'il signifiait.',
  'Le défi que vous avez relevé — Ouvrez-vous sur un défi récent et ce qu\'il vous a appris.',
  'Le tri des valeurs — Parmi 10 valeurs, choisissez vos trois premières et expliquez votre classement.',
  'La peur dans le chapeau — Chacun écrit une peur anonyme sur un papier. Lisez-les à voix haute en groupe.',
  'Le cercle des compliments — Chaque personne reçoit un compliment sincère de tous les membres du groupe.',
  'Lettre à votre moi adolescent — Écrivez une courte lettre à vous-même à 16 ans. Lisez-la si vous êtes à l\'aise.',
  'Le carrefour — Partagez un moment où vous avez choisi un chemin et vous vous demandez ce qu\'aurait donné l\'autre.',
  'Ce pourquoi vous voulez être célébré — Que voulez-vous que les gens retiennent de vous ?',
];

const faqItems = [
  {
    name: 'Qu\'est-ce qu\'un jeu brise-glace pour adultes ?',
    text: 'Un jeu brise-glace pour adultes est une activité structurée qui aide un groupe à se détendre, faire connaissance et lancer des conversations en toute légèreté. Aucun matériel nécessaire. Cela fonctionne pour les soirées, le team-building, les rendez-vous et les appels virtuels.',
  },
  {
    name: 'Combien de temps doit durer un jeu brise-glace ?',
    text: 'La plupart des jeux brise-glace pour adultes fonctionnent mieux en 5 à 15 minutes. Les jeux d\'échauffement rapides prennent moins de 5 minutes, tandis que les activités plus profondes peuvent durer 15 à 20 minutes. L\'important est de s\'arrêter avant que l\'énergie ne retombe.',
  },
  {
    name: 'Quel est le meilleur jeu brise-glace pour un premier rendez-vous ?',
    text: 'Deux vérités et un mensonge, la bio en six mots ou les objets de l\'île déserte sont parfaits pour un premier rendez-vous. Ils sont légers, révèlent la personnalité et gardent la conversation naturelle.',
  },
  {
    name: 'Quels jeux fonctionnent pour les grands groupes ?',
    text: 'Catégories, Je n\'ai jamais, le jeu du nom et les charades s\'adaptent aux groupes de 20 personnes ou plus. Pour les très grands groupes, formez des petites équipes avec des tours parallèles.',
  },
  {
    name: 'Peut-on jouer aux jeux brise-glace en virtuel ?',
    text: 'Oui. Le concours de fonds d\'écran, l\'histoire en émojis, montre et raconte et le trivia virtuel sont excellents pour les appels vidéo. La plupart des jeux classiques s\'adaptent facilement.',
  },
  {
    name: 'Quel est le jeu le plus facile pour les adultes timides ?',
    text: 'L\'association de mots et les catégories sont peu stressantes car elles se concentrent sur le sujet plutôt que sur la personne. Le fait par email fonctionne bien car les participants écrivent avant l\'appel.',
  },
  {
    name: 'Quels jeux ne nécessitent aucun matériel ?',
    text: 'Deux vérités et un mensonge, Je n\'ai jamais, le jeu du nom, l\'association de mots et Tu préférerais ne nécessitent aucun matériel. Ils reposent uniquement sur la parole et l\'imagination.',
  },
  {
    name: 'Comment choisir le bon jeu brise-glace ?',
    text: 'Adaptez le jeu à la taille du groupe, au cadre (présentiel ou virtuel), à la familiarité entre les personnes et à l\'énergie que vous souhaitez créer. Les jeux rapides réchauffent l\'ambiance ; les jeux profonds construisent la confiance.',
  },
  {
    name: 'Quels jeux sont les meilleurs pour le team-building au travail ?',
    text: 'Le défi de la guimauve, le bâton d\'hélium, le Pictionary en équipe et le carré parfait développent la collaboration et la communication. Ils révèlent les styles de leadership naturels.',
  },
  {
    name: 'Combien de jeux prévoir pour un événement ?',
    text: 'Prévoyez 3 à 5 jeux pour une session d\'une heure. Commencez par un échauffement rapide (2-3 minutes), enchaînez avec un jeu de connaissance (5-10 minutes) et terminez par un jeu d\'équipe ou profond.',
  },
  {
    name: 'Qu\'est-ce qui rend un jeu brise-glace réussi ?',
    text: 'Des règles claires, une limite de temps, une animation enthousiaste et la possibilité de passer son tour. Les meilleurs jeux permettent à chacun de participer à son niveau de confort.',
  },
  {
    name: 'Quels jeux aident les couples à se connecter ?',
    text: 'Le cercle de gratitude, les objets de l\'île déserte et le moment de fierté fonctionnent bien pour les couples. Ils encouragent le partage sans la pression d\'une conversation sérieuse.',
  },
  {
    name: 'Peut-on réutiliser les mêmes jeux avec le même groupe ?',
    text: 'Oui, mais attendez au moins un mois avant de répéter un jeu. Alternez les catégories et essayez des variantes. Par exemple, changez le thème de Deux vérités et un mensonge.',
  },
  {
    name: 'Quel jeu brise-glace est amusant pour les groupes d\'âges mixtes ?',
    text: 'Catégories, Tu préférerais et Montre et raconte fonctionnent à tous les âges. Ils reposent sur des connaissances générales et des expériences personnelles plutôt que sur la culture pop.',
  },
  {
    name: 'Comment conclure une session de brise-glace ?',
    text: 'Terminez sur une note positive avant que l\'énergie ne retombe. Clôturez par un rapide tour de gratitude ou un vote amusant. Une fin claire donne envie de recommencer.',
  },
];

const comparisonTable = {
  headers: ['Jeu', 'Catégorie', 'Taille', 'Durée', 'Idéal pour'],
  rows: [
    ['Deux vérités et un mensonge', 'Rapide', '4-30', '5-10 min', 'Échauffement'],
    ['Je n\'ai jamais', 'Rapide', '4-20', '5-10 min', 'Soirées, groupes'],
    ['Chronologie personnelle', 'Connaissance', '2-12', '10-15 min', 'Rendez-vous, équipes'],
    ['Défi de la guimauve', 'Équipe', '4-20', '15-18 min', 'Team-building'],
    ['Concours de fonds d\'écran', 'Virtuel', '5-50', '5-8 min', 'Équipes à distance'],
    ['Cercle de gratitude', 'Profond', '3-15', '10-15 min', 'Confiance, familles'],
    ['Catégories', 'Rapide', '4-40', '5-10 min', 'Grands groupes'],
    ['Bâton d\'hélium', 'Équipe', '6-12', '5-10 min', 'Collaboration'],
    ['Histoire en émojis', 'Virtuel', '4-30', '8-12 min', 'Fun à distance'],
    ['Tri des valeurs', 'Profond', '3-10', '15-20 min', 'Connexion profonde'],
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((q) => ({
    '@type': 'Question',
    name: q.name,
    acceptedAnswer: { '@type': 'Answer', text: q.text },
  })),
};

export default function JeuxBriseGlaceAdultesPage() {
  const publishedDate = '15 juin 2025';

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <header className="mb-10">
        <time className="text-sm text-slate-400" dateTime="2025-06-15">{publishedDate}</time>
        <h1 >
          50 jeux brise-glace pour adultes : idées fun sans matériel
        </h1>
        <p>
          Les jeux brise-glace pour adultes sont l&apos;ingrédient secret entre une soirée plate et un
          moment dont on parle pendant des semaines. Les meilleurs jeux ne nécessitent aucun
          accessoire, aucune préparation, et fonctionnent aussi bien en présentiel qu&apos;en visio.
          Nous avons rassemblé 50 jeux répartis en cinq catégories pour que vous trouviez le bon
          en quelques secondes.
        </p>
        <p>
          Basé sur les retours de 10 000+ joueurs Captain Bond, les soirées les plus réussies combinent une bonne compagnie avec le bon format interactif.
        </p>
      </header>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
        Les meilleurs jeux brise-glace pour adultes ne brisent pas la glace. Ils la font fondre
        lentement,         jusqu&apos;à ce que les gens oublient qu&apos;il y avait un mur entre eux.
      </blockquote>

      <p>
        Selon un rapport Statista 2024, le marché mondial des jeux de société devrait atteindre 30 milliards de dollars d&apos;ici 2028.
      </p>

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

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Points clés à retenir</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          <li>Les jeux brise-glace pour adultes vont de 30 secondes à 20 minutes d&apos;activités de confiance</li>
          <li>Les meilleurs jeux ne nécessitent aucun matériel et s&apos;adaptent à tous les groupes de 2 à 50+</li>
          <li>Choisissez la catégorie selon votre objectif : rapide (énergie), connaissance (lien), équipe (collaboration), virtuel (distanciel), profond (confiance)</li>
          <li>La plupart des jeux durent 5 à 15 minutes pour les soirées, les rendez-vous et le team-building</li>
          <li>Un bon animateur donne des règles claires, garde le rythme et permet à chacun de passer son tour</li>
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Que sont les jeux brise-glace pour adultes ?</h2>
        <p>
          Les jeux brise-glace pour adultes sont des activités courtes et structurées qui aident les
          personnes à se détendre, à se connecter et à démarrer des conversations en groupe. Contrairement
          aux jeux pour enfants, ils reposent sur la conversation, l&apos;imagination et des interactions
          légères plutôt que sur des règles complexes. Les meilleurs ne nécessitent aucun matériel,
          s&apos;expliquent en moins de 30 secondes et fonctionnent dans tous les contextes — soirées,
          premiers rendez-vous, séminaires et appels virtuels. Leur vrai rôle n&apos;est pas le
          divertissement (même s&apos;ils doivent être amusants). C&apos;est de réduire la friction sociale
          qui empêche les gens d&apos;être eux-mêmes.
        </p>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Tableau comparatif par taille de groupe et durée</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                {comparisonTable.headers.map((h) => (
                  <th key={h} className="text-left py-3 px-2 font-semibold text-slate-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonTable.rows.map((row, i) => (
                <tr key={i} className="border-b border-white/5">
                  {row.map((cell, j) => (
                    <td key={j} className="py-3 px-2">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Jeux brise-glace rapides (10 jeux)</h2>
        <p>
          Ces jeux prennent moins de 5 minutes chacun et ne nécessitent aucune préparation.
          Utilisez-les pour réveiller une salle silencieuse ou passer d&apos;une activité à l&apos;autre.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {jeuxRapides.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Jeux pour faire connaissance (10 jeux)</h2>
        <p>
          Ces jeux vont au-delà des noms et des titres. Ils révèlent des histoires, des particularités
          et des points communs. Parfaits pour les rendez-vous, les nouvelles équipes ou toute
          situation où l&apos;on veut vraiment apprendre à se connaître.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {jeuxConnaissance.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Jeux d&apos;équipe (10 jeux)</h2>
        <p>
          Les jeux d&apos;équipe développent la collaboration, la communication et une saine compétition.
          Idéaux pour les séminaires, les équipes sportives ou tout groupe qui doit mieux
          fonctionner ensemble.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {jeuxEquipe.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Jeux virtuels (10 jeux)</h2>
        <p>
          Les groupes à distance font face à un mur plus difficile à traverser. Ces jeux coupent
          la fatigue des écrans et apportent une vraie énergie aux appels vidéo et aux équipes
          réparties.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {jeuxVirtuels.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Jeux profonds (10 jeux)</h2>
        <p>
          Utilisez-les quand le groupe est prêt pour quelque chose de vrai. Les jeux profonds
          construisent la confiance, l&apos;empathie et une connexion authentique. Ils fonctionnent
          mieux en petits groupes avec un peu de temps.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {jeuxProfonds.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>
      </section>

      <blockquote className="border-l-4 border-neon-pink pl-6 my-8 italic text-slate-200 text-lg">
        La bonne question au bon moment vaut plus que n&apos;importe quel jeu. Les brise-glace ne sont
        que l&apos;échafaudage — le vrai travail, c&apos;est d&apos;être curieux.
      </blockquote>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Comment choisir le bon jeu</h2>
        <p>
          Trois questions vous guideront vers la bonne catégorie :
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed mb-4">
          <li><strong>Ces personnes se connaissent-elles ?</strong> Les inconnus ont besoin de jeux rapides et légers. Les amis ou collègues peuvent gérer des formats plus profonds.</li>
          <li><strong>Combien de temps avez-vous ?</strong> Moins de 5 minutes → jeux rapides. 15+ minutes → connaissance ou profond.</li>
          <li><strong>Quel est l&apos;objectif ?</strong> Énergie et rires → rapides. Lien et confiance → profonds. Collaboration → équipe.</li>
        </ul>
        <p>
          Mélangez les catégories dans une session. Commencez par un jeu rapide pour l&apos;échauffement,
          enchaînez avec un jeu de connaissance, et terminez par un jeu d&apos;équipe ou profond pour
          une fin mémorable.
        </p>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Pourquoi jouer à des brise-glace ?</h2>
        <p>
          Les adultes oublient comment jouer. Entre l&apos;enfance et les responsabilités, le plaisir non
          structuré est remplacé par les banalités et l&apos;efficacité. Les jeux brise-glace pour adultes
          redonnent la permission d&apos;être idiot, curieux et ouvert. Ils nous rappellent que la
          connexion n&apos;a pas besoin d&apos;être compliquée — il suffit d&apos;une structure assez simple
          pour que tout le monde puisse participer.
        </p>
      </section>

      <p>
        Ces suggestions fonctionnent mieux pour des groupes d&apos;adultes en recherche de fun social. Pour les très grands groupes (50+) ou les contextes professionnels, envisagez des plateformes dédiées de team building.
      </p>

      <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
        <h3 className="text-xl font-semibold mb-2">Des jeux frais à chaque fois ?</h3>
        <p className="text-slate-200 leading-relaxed mb-4">
          Captain Bond génère des jeux brise-glace sur mesure pour n&apos;importe quel groupe et
          contexte. Sans préparation, sans répétition — le bon jeu au bon moment.
        </p>
        <Link
          href="/fr/soiree"
          className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
        >
          Essayez Captain Bond mode soirée
        </Link>
      </aside>
    </article>
  );
}
