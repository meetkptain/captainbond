import type { BlogPost } from '@/lib/content/types';

export const post: BlogPost = {
  slug: "guide-soiree-quiz-bar",
  locale: "fr",
  hub: "bar" as const,
  title: "Soirée Quiz au Bar : Guide Complet pour Animateurs | Captain Bond",
  description: "Le guide complet pour organiser une soirée quiz dans votre bar ou pub. Augmentez le chiffre d'affaires, fidélisez vos clients et créez l'événement chaque semaine.",
  frSlug: "bar-trivia-night-guide",
  ogImage: "/og/blog-guide-soiree-quiz-bar-fr.webp",
  published: "2026-07-10",
  readTime: "7 min de lecture",
  faq: [
    { q: "De combien peut augmenter le chiffre une soirée quiz ?", a: "Une quiz hebdomadaire augmente souvent la fréquentation des jours calmes de 20 à 40 % en fidélisant un public régulier qui consomme pendant deux à trois heures." },
    { q: "Quiz digital ou papier, lequel choisir ?", a: "Le digital passe à l'échelle et note automatiquement ; le papier donne une ambiance pub authentique. On démarre souvent papier puis on passe au digital avec l'affluence." },
    { q: "Comment promouvoir une soirée quiz au bar ?", a: "Fixez un créneau hebdomadaire sur les réseaux, assocez-vous à des groupes locaux et proposez un petit lot. La régularité le même jour crée un public habituel." }
  ],
  takeaways: [
    "Augmenter le chiffre du bar en semaine (sans personnel supplémentaire)",
    "Meilleurs jeux de soirée pour adultes 2026 : nos tops pour la game night",
    "Fixez la quiz le même jour chaque semaine pour fidéliser un public régulier."
  ],
  sections: [
    { h2: "Pourquoi les soirées quiz augmentent le chiffre d affaires des bars", p: "La quiz remplit les soirées les plus creuses. Un public régulier reste deux à trois heures, commande entre les manches et transforme des tables vides en revenu prévisible." },
    { h2: "Comment planifier votre soirée quiz : guide étape par étape", p: "Choisissez un soir fixe, composez 4 à 5 manches de difficulté variée, désignez un animateur et une règle de score simple. Répétez le déroulé une fois avant l'ouverture." },
    { h2: "Quiz digital vs quiz traditionnel", p: "Le digital passe à l'échelle et note instantanément ; le papier procure une ambiance authentique sans tech. Démarrez papier, puis adoptez un outil digital dès dix équipes dépassées." },
    { h2: "Promouvoir votre soirée quiz", p: "Annoncez le même créneau chaque semaine, recrutez clubs et entreprises locales et offrez un lot modique. La répétition transforme les primo-accédants en habitués." },
    { h2: "Indicateurs de succès", p: "Suivez la fréquentation, la dépense moyenne par équipe et le taux de retour semaine après semaine. Un noyau de équipes qui revient est le signe le plus clair de réussite." },
    { h2: "Limitations", p: "La quiz demande un animateur fiable et un bon micro. Évitez des questions trop pointues qui découragent les débutants, et alternez les thèmes pour garder l'ensemble des tables." },
    { h2: "Articles connexes", p: "Associez la quiz à d'autres jeux de groupe et à nos guides d'animation pour prolonger l'engagement et la consommation sur place." }
  ],
  related: [
    { slug: "jeux-societe-apero", title: "Meilleurs jeux de société pour apéro (ceux qui font vraiment discuter)", description: "Une sélection de jeux de société apéro-friendly — peu de règles, beaucoup de blagues, parfaits en échauffement avant le " },
    { slug: "meilleurs-jeux-soiree-adulte-2026", title: "Meilleurs jeux de soirée pour adultes 2026 : Top sélections | Captain Bond", description: "Découvrez les meilleurs jeux de soirée pour adultes en 2026 : jeux TV, cartes, plateau, à boire, brise-glace et sans mat" },
    { slug: "organiser-soiree-jeux", title: "Organiser une soirée jeux inoubliable : le guide ultime | Captain Bond", description: "Planifiez, animez et concluez une soirée jeux dont on parlera encore longtemps. Liste d'invités, choix des jeux par tail" }
  ],
  geoBlock: "Une soirée quiz au bar est un événement animé où des équipes répondent à des questions pour gagner des lots. Elle booste le chiffre des jours calmes, prolonge le temps de présence et fidélise les nouveaux clients par une habitude sociale récurrente.",
  cta: { heading: 'Prêt ?', text: 'Découvrez Captain Bond.', href: "/party" },
  endingQuestion: 'Quel jour de la semaine remplirait vos tables vides ?',
};
