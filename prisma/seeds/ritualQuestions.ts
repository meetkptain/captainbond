export interface RitualQuestionSeed {
  id: string;
  text: string;
  theme: string;
  intensityLevel: number;
  suggestedAction: string;
  therapistGuide: string;
}

export const ritualQuestions: RitualQuestionSeed[] = [
  // ─── RECONNECTION ───
  {
    id: 'ritual-reconnection-merci-concret',
    text: "Qu'est-ce que ton/ta partenaire a fait récemment qui t'a fait te sentir aimé(e) ?",
    theme: 'RECONNECTION',
    intensityLevel: 1,
    suggestedAction: 'Avant de dormir, dites-vous un merci concret.',
    therapistGuide:
      'Prenez 3 minutes. Chacun raconte un moment récent où ce geste a compté. Pas de jugement, juste écouter.',
  },
  {
    id: 'ritual-reconnection-besoin-relation',
    text: 'De quoi as-tu besoin en ce moment dans notre relation ?',
    theme: 'RECONNECTION',
    intensityLevel: 2,
    suggestedAction:
      'Demandez à votre partenaire : "Qu\'est-ce que je peux faire pour toi cette semaine ?"',
    therapistGuide:
      'Écoutez sans chercher à résoudre. Le but est de comprendre, pas de réparer.',
  },
  {
    id: 'ritual-reconnection-qualite-oubliee',
    text: "Quelle est une qualité de ton/ta partenaire que tu oublies trop souvent d'apprécier ?",
    theme: 'RECONNECTION',
    intensityLevel: 1,
    suggestedAction: 'Écrivez cette qualité dans un message vocal de 30 secondes.',
    therapistGuide:
      "Partagez ce message avec sincérité. Recevoir une qualité perçue par l'autre renforce le lien.",
  },
  {
    id: 'ritual-reconnection-petit-rituel',
    text: 'Quel petit rituel quotidien pourrait nous aider à nous sentir plus proches ?',
    theme: 'RECONNECTION',
    intensityLevel: 1,
    suggestedAction: 'Choisissez ensemble un rituel et essayez-le demain.',
    therapistGuide:
      "Un rituel ne doit pas être grand. Un café partagé, un câlin de 20 secondes, un mot doux suffisent.",
  },
  {
    id: 'ritual-reconnection-sentir-seul',
    text: "Qu'est-ce qui te fait te sentir seul(e) même quand nous sommes ensemble ?",
    theme: 'RECONNECTION',
    intensityLevel: 2,
    suggestedAction:
      "Aujourd'hui, faites une activité ensemble sans téléphone pendant 15 minutes.",
    therapistGuide:
      "Cette question demande du courage. Accordez-vous du temps pour en parler sans se défendre.",
  },
  {
    id: 'ritual-reconnection-souvenir-sourire',
    text: 'Quel souvenir récent ensemble te fait sourire ?',
    theme: 'RECONNECTION',
    intensityLevel: 1,
    suggestedAction: 'Regardez une photo de ce moment ensemble ce soir.',
    therapistGuide:
      'Revivre un souvenir positif ensemble active les mêmes émotions et renforce la connexion.',
  },

  // ─── COMMUNICATION ───
  {
    id: 'ritual-communication-entendu',
    text: "Quand je te parle, qu'est-ce qui t'aide à te sentir vraiment entendu(e) ?",
    theme: 'COMMUNICATION',
    intensityLevel: 1,
    suggestedAction:
      "Pratiquez 5 minutes d'écoute active : l'un parle, l'autre reformule.",
    therapistGuide:
      "Reformuler ne signifie pas être d'accord. Cela signifie : 'J'ai bien entendu ce que tu dis.'",
  },
  {
    id: 'ritual-communication-sujet-evite',
    text: "Quel sujet avons-nous tendance à éviter ? Pourquoi ?",
    theme: 'COMMUNICATION',
    intensityLevel: 2,
    suggestedAction:
      "Aujourd'hui, abordez ce sujet pendant 10 minutes dans un lieu calme.",
    therapistGuide:
      "Les sujets évités prennent de la place. Nommez-les doucement, sans obligation de tout résoudre.",
  },
  {
    id: 'ritual-communication-langue-amour',
    text: "Quelle est ta langue d'amour principale en ce moment ?",
    theme: 'COMMUNICATION',
    intensityLevel: 1,
    suggestedAction: "Faites un geste dans la langue d'amour de l'autre aujourd'hui.",
    therapistGuide:
      "Les langages d'amour évoluent. Ce qui comptait hier peut ne plus être le même aujourd'hui.",
  },
  {
    id: 'ritual-communication-aide-colere',
    text: "Quand tu es en colère, comment peux-tu m'aider à te comprendre ?",
    theme: 'COMMUNICATION',
    intensityLevel: 2,
    suggestedAction:
      'Inventez un mot-code pour dire "J\'ai besoin d\'une pause" sans agressivité.',
    therapistGuide:
      "La colère cache souvent un besoin. Aider l'autre à comprendre, c'est désamorcer ensemble.",
  },
  {
    id: 'ritual-communication-parole-touchee',
    text: "Quelle est une chose que j'ai dite récemment qui t'a touché(e) ?",
    theme: 'COMMUNICATION',
    intensityLevel: 1,
    suggestedAction: 'Répétez cette phrase ou ce geste aujourd\'hui.',
    therapistGuide:
      'Nommer ce qui touche encourage ce qui nous nourrit mutuellement.',
  },
  {
    id: 'ritual-communication-desaccord',
    text:
      'Comment pourrions-nous mieux gérer un désaccord sans que personne ne se sente blessé ?',
    theme: 'COMMUNICATION',
    intensityLevel: 2,
    suggestedAction: 'Écrivez ensemble une "règle d\'or" pour vos désaccords.',
    therapistGuide:
      "Un désaccord n'est pas une menace. C'est une opportunité de mieux se connaître.",
  },

  // ─── INTIMACY ───
  {
    id: 'ritual-intimacy-geste-tendresse',
    text: 'Quel geste de tendresse te manque le plus en ce moment ?',
    theme: 'INTIMACY',
    intensityLevel: 1,
    suggestedAction: 'Offrez ce geste aujourd\'hui, sans attendre de retour.',
    therapistGuide:
      "La tendresse ne doit pas être transactionnelle. Un geste donné librement nourrit les deux.",
  },
  {
    id: 'ritual-intimacy-confiance-vulnerable',
    text: "Qu'est-ce qui te met en confiance pour être vulnérable avec moi ?",
    theme: 'INTIMACY',
    intensityLevel: 2,
    suggestedAction:
      'Partagez un souvenir où vous vous êtes senti(e) en confiance avec l\'autre.',
    therapistGuide:
      'La vulnérabilité grandit dans la confiance. Rappelez-vous ensemble ces moments.',
  },
  {
    id: 'ritual-intimacy-attention-desire',
    text: "Quelle est une petite attention qui te fait sentir désiré(e) ?",
    theme: 'INTIMACY',
    intensityLevel: 1,
    suggestedAction: 'Faites cette attention aujourd\'hui.',
    therapistGuide:
      'Le désir se nourrit de petites attentions répétées, pas seulement de grands moments.',
  },
  {
    id: 'ritual-intimacy-signifie-intimite',
    text: "Qu'est-ce que l'intimité signifie pour toi aujourd'hui ?",
    theme: 'INTIMACY',
    intensityLevel: 2,
    suggestedAction:
      'Créez un moment de 15 minutes rien que pour vous deux, sans distraction.',
    therapistGuide:
      "L'intimité n'est pas que physique. C'est aussi le partage de ce qui est vrai.",
  },
  {
    id: 'ritual-intimacy-compliment',
    text: 'Quel compliment aimeriez-vous entendre plus souvent ?',
    theme: 'INTIMACY',
    intensityLevel: 1,
    suggestedAction: 'Dites ce compliment à voix haute aujourd\'hui.',
    therapistGuide:
      'Les compliments sincères activent le système de récompense et renforcent le lien.',
  },
  {
    id: 'ritual-intimacy-proche-physique',
    text: "Qu'est-ce qui te fait te sentir proche de moi physiquement ?",
    theme: 'INTIMACY',
    intensityLevel: 2,
    suggestedAction: 'Partagez un câlin de 20 secondes minimum aujourd\'hui.',
    therapistGuide:
      'Le contact physique libère de l\'oxytocine. Même un câlin long a un effet réel.',
  },

  // ─── SHARED_PROJECT ───
  {
    id: 'ritual-shared-reve-2-ans',
    text:
      "Quel est un rêve que tu aimerais réaliser avec moi dans les 2 prochaines années ?",
    theme: 'SHARED_PROJECT',
    intensityLevel: 1,
    suggestedAction:
      'Notez ce rêve quelque part et discutez d\'une première petite étape.',
    therapistGuide:
      "Un projet commun donne du sens à la relation. Même un petit rêve compte.",
  },
  {
    id: 'ritual-shared-valeurs-couple',
    text: "Quelles sont les 3 valeurs les plus importantes pour toi dans notre couple ?",
    theme: 'SHARED_PROJECT',
    intensityLevel: 2,
    suggestedAction:
      'Comparez vos listes et trouvez une valeur commune à célébrer cette semaine.',
    therapistGuide:
      'Les valeurs partagées sont la boussole du couple. Nommez-les régulièrement.',
  },
  {
    id: 'ritual-shared-tradition-creer',
    text: "Quelle est une tradition que nous devrions créer ensemble ?",
    theme: 'SHARED_PROJECT',
    intensityLevel: 1,
    suggestedAction: 'Testez une première version de cette tradition ce week-end.',
    therapistGuide:
      "Les traditions créent de l'appartenance. Elles n'ont pas besoin d'être parfaites.",
  },
  {
    id: 'ritual-shared-defi-surmonte',
    text:
      "Quel est un défi que nous avons surmonté ensemble et dont nous pouvons être fiers ?",
    theme: 'SHARED_PROJECT',
    intensityLevel: 1,
    suggestedAction:
      "Racontez cette histoire à quelqu'un ou écrivez-la ensemble.",
    therapistGuide:
      'Se souvenir des défis surmontés renforce la confiance dans le avenir.',
  },
  {
    id: 'ritual-shared-10-ans',
    text: "Comment imaginez-vous notre relation dans 10 ans ?",
    theme: 'SHARED_PROJECT',
    intensityLevel: 2,
    suggestedAction:
      'Dessinez ou écrivez une carte postale de votre vie dans 10 ans.',
    therapistGuide:
      "Projeter ensemble active l'engagement. Ce n'est pas un contrat, c'est une direction.",
  },
  {
    id: 'ritual-shared-ameliorer-mois',
    text: "Quelle est une petite chose que nous pouvons améliorer ensemble ce mois-ci ?",
    theme: 'SHARED_PROJECT',
    intensityLevel: 1,
    suggestedAction:
      'Choisissez une action concrète et planifiez quand vous la ferez.',
    therapistGuide:
      "L'amélioration continue, même minime, crée un sentiment de progression partagée.",
  },
];
