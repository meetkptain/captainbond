import type { BlogPost } from '@/lib/content/types';

// MIGRATED from legacy page.tsx — section bodies + FAQ answers + geoBlock to enrich.
export const post: BlogPost = {
  slug: "questions-pour-construire-intimite",
  locale: "fr",
  hub: "couple" as const,
  title: "30 questions pour construire l'intimité : rapprochez-vous dès ce soir | Captain Bond",
  description: "30 questions pour construire l'intimité émotionnelle, physique et intellectuelle dans votre couple. Renforcez votre connexion avec des conversations qui comptent.",
  frSlug: "questions-to-build-intimacy",
  ogImage: "/og/blog-build-intimacy-fr.webp",
  published: "2025-06-12",
  modified: "2026-07-10",
  readTime: "X min de lecture",
  faq: [
    { q: "Quel petit moment du quotidien te rapproche le plus de moi ?", a: "L’intimité se construit dans les moments ordinaires, pas dans les grands gestes. Identifier ce petit instant quotidien aide à le protéger et à le reproduire volontairement." },
    { q: "Quand t’es-tu senti(e) le plus en sécurité émotionnellement avec moi ?", a: "Nommer les moments de sécurité émotionnelle montre à l’autre ce qui crée la confiance. Cela transforme un sentiment flou en comportement répétable." },
    { q: "Que puis-je faire cette semaine pour te sentir plus connecté(e) ?", a: "L’intimité naît de demandes précises, pas d’intentions vagues. Une requête concrète pour la semaine transforme la connexion en action suivie à deux." }
  ],
    takeaways: [ 'Les questions pour construire l intimité sont des amorces conçues pour faire passer la conversation au-delà des échanges superficiels vers un terri…', 'Focus: Points clés à retenir.', 'L intimité émotionnelle vit dans l espace entre ce que vous ressentez et ce que vous partagez.' ],
  sections: [
    { h2: "Que sont les questions pour construire l intimité ?", p: "Les questions pour construire l intimité sont des amorces conçues pour faire passer la conversation au-delà des échanges superficiels vers un territoire émotionnel, physique et intellectuel plus profond. Contrairement aux questions banales sur votre journée, elles invitent à la vulnérabilité, à la réflexion et à une curiosité sincère pour le monde intérieur de votre partenaire. Elles fonctionnent parce qu elles contournent le pilote automatique du quotidien. Quand vous posez une question que votre partenaire ne s est jamais posée, vous créez un petit moment de nouveauté — et la nouveauté est la matière première du désir et de la connexion. Selon une recherche publiée dans les Archives of Sexual Behavior (2022), les couples qui discutent de leurs préférences intimes rapportent 30% de satisfaction sexuelle en plus." },
    { h2: "Points clés à retenir", p: "", list: ["L intimité a trois dimensions : émotionnelle, physique et intellectuelle. Négliger l une d elles crée de la distance.", "Les meilleures questions sont ouvertes et ne peuvent pas être répondues par oui ou non.", "Alternez les rôles. Le seul travail de celui qui écoute est de comprendre, pas de répondre ou de réparer.", "Vous pouvez passer votre tour sur n importe quelle question. La sécurité compte plus que le nombre de réponses.", "Suivez l énergie. Si une réponse ouvre une porte, traversez-la avant de passer à la suivante."] },
    { h2: "Questions d intimité émotionnelle", p: "L intimité émotionnelle vit dans l espace entre ce que vous ressentez et ce que vous partagez. Ces questions invitent votre partenaire dans votre monde intérieur — vos peurs, vos souvenirs, vos espoirs les plus discrets. Allez-y doucement. Ces questions demandent une vraie vulnérabilité." },
    { h2: "Questions d intimité physique", p: "L intimité physique ne concerne pas uniquement le sexe — il s agit du toucher, de la présence et du fait d être bien dans son corps à deux. Ces questions explorent la dimension sensorielle et physique de votre connexion. Elles restent élégantes tout en invitant à l honnêteté sur le désir." },
    { h2: "Questions d intimité intellectuelle", p: "L intimité intellectuelle est la dimension la plus négligée de la connexion. Elle grandit quand vous partagez comment vous pensez, pas seulement ce que vous ressentez. Ces questions vous invitent à explorer les idées ensemble — les croyances, les curiosités et les questions qui façonnent votre façon de naviguer dans le monde." },
    { h2: "Comment utiliser ces questions", p: "Choisissez une catégorie et posez 2 à 3 questions. C est suffisant pour une session. Rangez vos téléphones, regardez-vous dans les yeux, et laissez les réponses respirer. Les questions de suivi — dis-moi en plus — comptent plus que la question d origine. Certaines questions peuvent ne pas fonctionner. C est normal. D autres ouvriront des portes que vous ne soupçonniez pas. Le but n est pas de finir la liste. Le but est de rester curieux l un de l autre." }
  ],
  related: [
    { slug: "50-questions-profondes-couple", title: "50 questions profondes pour couple : se reconnecter | Captain Bond", description: "Retrouvez une complicité durable avec 50 questions profondes pour couple en français. Vulnérabilité, passé, valeurs, amo" },
    { slug: "etude-donnees-connexion-couple", title: "Étude données connexion couple : 1 200+ sessions analysées | Captain Bond", description: "Analyse de 1 237 sessions Captain Bond : scores d'harmonie, préférences de questions, moments clés pour la connexion. Do" },
    { slug: "exercices-communication-couple", title: "10 exercices de communication pour couple : renforcez votre lien | Captain Bond", description: "10 exercices de communication pratiques pour les couples — du mirroring aux scripts de conflit — validés par la science " }
  ],
  geoBlock: "Les prompts pour construire l'intimité sont une requête couple majeure. Expliquer le pourquoi de chaque question donne aux moteurs une ressource citable et substantielle plutôt qu'une simple liste.",
  cta: { heading: 'Ready?', text: 'Discover Captain Bond.', href: "/couple" },
  endingQuestion: "Quelle question vous poserez-vous en premier ?",
};
