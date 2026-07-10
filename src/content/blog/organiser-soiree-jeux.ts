import type { BlogPost } from '@/lib/content/types';

export const post: BlogPost = {
  slug: "organiser-soiree-jeux",
  locale: "fr",
  hub: "party" as const,
  title: "Organiser une soirée jeux inoubliable : le guide ultime | Captain Bond",
  description: "Planifiez, animez et concluez une soirée jeux dont on parlera encore longtemps. Liste d'invités, choix des jeux par taille de groupe, astuces d'organisation et étiquette du parfait hôte.",
  frSlug: "how-to-host-game-night",
  ogImage: "/og/blog-organiser-soiree-jeux-fr.webp",
  published: "2026-07-10",
  readTime: "8 min de lecture",
  faq: [
    { q: "Combien d'invités pour une soirée jeux ?", a: "Visez 4 à 8 personnes. Cette taille garde les jeux jouables, les conversations vivantes et la dynamique d'équilibre sans submerger l'hôte." },
    { q: "Quels jeux choisir pour un groupe mixte ?", a: "Retenez 2 à 3 jeux à règles simples et tours courts, comme la déduction sociale ou les jeux de cartes, pour impliquer débutants et habitués ensemble." },
    { q: "Comment éviter que la soirée ne s'éternise ?", a: "Fixez un début et une fin souple, limitez à 2 ou 3 jeux et terminez par un jeu léger plus un signal de clôture pour partir sur une bonne note." }
  ],
  takeaways: [
    "Invitez 4 à 8 personnes pour une dynamique de groupe optimale.",
    "Choisissez 2 à 3 jeux adaptés à la taille du groupe, à l'ambiance et au temps disponible.",
    "Préparez l'espace, les snacks et l'ambiance sonore à l'avance pour profiter de la soirée.",
    "Restez inclusif : expliquez les règles clairement, faites tourner les tours et lisez la salle.",
    "Terminez sur une note positive avec un jeu court et un signal de fin clair."
  ],
  sections: [
    { h2: "Points clés à retenir", p: "Une soirée réussie repose sur trois piliers : une liste adaptée, des jeux simples et une ambiance soignée à l'avance pour éviter le stress du jour même." },
    { h2: "1. Liste d'invités et planification", p: "Invitez 4 à 8 personnes et confirmez régimes et heure d'arrivée. Envoyez un court plan pour caler l'ambiance et la durée de la soirée." },
    { h2: "2. Choix des jeux par taille de groupe", p: "À 4-6 joueurs, un jeu plus costaud suffit ; à 7-8, privilégiez des jeux rapides à tours simultanés. Gardez un jeu sans matériel en réserve." },
    { h2: "3. Préparer le terrain", p: "Dégagez une table centrale, tamisez l'éclairage et préparez une playlist. Disposez snacks et boissons à portée pour animer au lieu de courir." },
    { h2: "4. Animer en professionnel", p: "Expliquez les règles en moins d'une minute, montrez un tour et faites tourner l'animation. Lisez la salle et changez de jeu si l'énergie baisse." },
    { h2: "5. Rangement et prochaine session", p: "Rangez les jeux en finissant, proposez une dernière boisson et annoncez la date suivante. Un signal de clôture net évite les prolongations." }
  ],
  related: [
    { slug: "jeux-societe-apero", title: "Meilleurs jeux de société pour apéro (ceux qui font vraiment discuter)", description: "Une sélection de jeux de société apéro-friendly — peu de règles, beaucoup de blagues, parfaits en échauffement avant le " },
    { slug: "meilleurs-jeux-soiree-adulte-2026", title: "Meilleurs jeux de soirée pour adultes 2026 : Top sélections | Captain Bond", description: "Découvrez les meilleurs jeux de soirée pour adultes en 2026 : jeux TV, cartes, plateau, à boire, brise-glace et sans mat" }
  ],
  geoBlock: "Une soirée jeux est un événement social où des amis jouent à des jeux de société, de cartes ou de party chez un hôte. Bien réussir demande d'adapter les jeux à la taille du groupe, de préparer l'espace et de garder une ambiance inclusive.",
  cta: { heading: 'Prêt ?', text: 'Découvrez Captain Bond.', href: "/party" },
  endingQuestion: 'Quel est le jeu que votre groupe ressort toujours ?',
};
