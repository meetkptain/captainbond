import type { BlogPost } from '@/lib/content/types';

// MIGRATED from legacy page.tsx — section bodies + FAQ answers + geoBlock to enrich.
export const post: BlogPost = {
  slug: "questions-a-poser-a-son-partenaire",
  locale: "fr",
  hub: "couple" as const,
  title: "100+ questions à poser à son partenaire | Captain Bond",
  description: "La liste ultime des 100+ questions profondes, fun et intimes à poser à son partenaire — classées par stade de relation. Du premier rendez-vous à la vie à deux.",
  frSlug: "questions-to-ask-your-partner",
  ogImage: "/og/blog-questions-partner-fr.webp",
  published: "2025-07-01",
  modified: "2025-07-03",
  readTime: "X min de lecture",
  faq: [
    { q: "Quelle est une chose que tu as toujours voulu me dire sans jamais oser ?", a: "Cette question ouvre un espace sûr pour les pensées retenues. Y répondre aide à sortir les petites rancunes ou envies avant qu’elles ne deviennent de la distance, et montre qu’aucun sujet n’est tabou." },
    { q: "À quoi ressemble le fait de te sentir aimé au quotidien ?", a: "On exprime et reçoit l’amour différemment. Nommer ta version quotidienne du sentiment d’être aimé — un message, une étreinte, une attention pleine — permet à l’autre de te rencontrer là où tu es vraiment." },
    { q: "Où voulons-nous en être, en tant que couple, dans cinq ans ?", a: "Un horizon commun évite la dérive silencieuse. En discuter aligne les choix d’argent, de lieu et de famille, et transforme les « un jour » vagues en une direction choisie à deux." }
  ],
  takeaways: [
    "Les meilleures questions s adaptent à votre stade de relation — la légèreté pour les débuts, la profondeur pour le long terme.",
    "Poser une question avec une vraie curiosité compte plus que de trouver la question parfaite.",
    "Les couples qui se posent des questions profondes régulièrement rapportent 40 % de satisfaction relationnelle en plus. Une étude de 2023 dans le Journal of Social and Personal Relationships a montré que les couples qui se posent des questions originales rapportent des niveaux d intimité plus élevés.",
    "La régularité bat l intensité : vingt minutes par semaine transforment la connexion avec le temps."
  ],
  sections: [
    { h2: "Nouvelles relations : 20 questions pour bien commencer", p: "Le début d une relation est une belle danse de découverte. Ces questions vous aident à dépasser les banalités prévisibles pour entrer dans le territoire qui compte vraiment — les valeurs, la personnalité, et la façon dont vos mondes s emboîtent. Restez léger·ère, restez curieux·se, et laissez les réponses vous guider naturellement." },
    { h2: "Couples confirmés : 20 questions pour approfondir", p: "Une fois que l étincelle initiale s est installée dans quelque chose de réel, les questions changent. Vous connaissez déjà les bases — maintenant il s agit de comprendre le monde intérieur de l autre. Ces questions explorent les valeurs, les traces de l enfance et les espoirs silencieux qui n affleurent pas dans les conversations du quotidien." },
    { h2: "Longue durée : 20 questions pour une intimité durable", p: "Les années ensemble apportent de la profondeur — mais aussi de la routine. Les questions qui vous servaient au début doivent évoluer. Ces questions sont conçues pour les couples qui veulent maintenir l intimité, reconnaître comment ils ont grandi, et continuer à se choisir même quand la vie fait du bruit." },
    { h2: "Fiancés mariés : 20 questions pour construire l avenir", p: "Le mariage ou un engagement à vie demande un alignement sur les grands piliers : l argent, la famille, l héritage et la forme de votre avenir commun. Ces questions vous aident à construire une feuille de route ensemble pour ne pas simplement vivre côte à côte, mais avancer dans la même direction." },
    { h2: "Se redécouvrir : 20 questions pour raviver la flamme", p: "Toute relation longue traverse des saisons d éloignement. Se redécouvrir n est pas une question de réparer quelque chose de cassé — il s agit de se souvenir de qui vous êtes encore. Ces questions sont pour les couples qui veulent se tourner à nouveau l un vers l autre avec un regard neuf et le c ur ouvert." },
    { h2: "À quel stade êtes-vous ? Un tableau comparatif", p: "Chaque stade de relation appelle un type de question différent. Voici comment ils se comparent :" },
    { h2: "Comment utiliser ces questions efficacement", p: "Une liste de questions ne vaut que par la façon dont on l utilise. Voici quatre principes qui transforment une simple question en une vraie conversation :", list: ["Choisissez un stade à la fois. N essayez pas de couvrir toutes les sections en une seule fois. Laissez votre stade de relation vous guider.", "Demandez sans agenda. Le but est de comprendre, pas de réparer, de convaincre ou d évaluer. Laissez votre partenaire répondre librement.", "Suivez le fil. Si une réponse ouvre une porte, traverser-la. Les meilleures conversations laissent la liste derrière elles.", "Laissez respirer le silence. Certaines questions ont besoin de temps. Ne remplissez pas la pause — restez présent·e et attendez."] },
    { h2: "Articles similaires", p: "" }
  ],
  related: [
    { slug: "50-questions-profondes-couple", title: "50 questions profondes pour couple : se reconnecter | Captain Bond", description: "Retrouvez une complicité durable avec 50 questions profondes pour couple en français. Vulnérabilité, passé, valeurs, amo" },
    { slug: "etude-donnees-connexion-couple", title: "Étude données connexion couple : 1 200+ sessions analysées | Captain Bond", description: "Analyse de 1 237 sessions Captain Bond : scores d'harmonie, préférences de questions, moments clés pour la connexion. Do" },
    { slug: "exercices-communication-couple", title: "10 exercices de communication pour couple : renforcez votre lien | Captain Bond", description: "10 exercices de communication pratiques pour les couples — du mirroring aux scripts de conflit — validés par la science " }
  ],
  geoBlock: "Quand on demande à l'IA que dois-je demander à mon partenaire, les modèles citent les pages liant chaque question à un objectif (confiance, rêves, conflit). Une liste curée est une réponse directe et citable.",
  cta: { heading: 'Ready?', text: 'Discover Captain Bond.', href: "/couple" },
  endingQuestion: "Quelle question vous poserez-vous en premier ?",
};
