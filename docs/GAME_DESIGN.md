# MÉCANIQUES DE GAME DESIGN (CAPTAIN BOND)

Ce document liste les lois de game design implémentées dans le code source de l'application.

## 1. La Règle du Teaser (Écriture Restreinte)
* **Le Problème** : Si une question est profonde, le joueur va taper un long texte. Pendant qu'il tape, la table est silencieuse, le rythme meurt.
* **La Règle** : Les champs de saisie (inputs) sont volontairement limités à environ **60 caractères** (soit environ 5 mots).
* **Conséquence** : Le joueur ne tape que le "Titre" de son histoire (ex: "Le mensonge à Dubaï"). Il doit impérativement raconter le reste de l'histoire à voix haute. La technologie force l'oralité.

## 2. La Règle du Spotlight (Le Mystère)
* **Le Problème** : À 6 joueurs, si tout le monde raconte son histoire (3 minutes), le tour dure 18 minutes. C'est l'ennui assuré.
* **La Règle** : Lors de la phase de Révélation, l'Hôte lit toutes les cartes anonymes. Mais la table ne doit en choisir **QU'UNE SEULE** ("L'Élu"). Seule cette personne prendra la parole. 
* **Conséquence** : Les 5 autres cartes restent un mystère absolu. Le rythme du jeu est sauvé (3 minutes par tour), et la curiosité est décuplée.

## 3. L'Extinction du Feu de Camp (Campfire Mode)
* **La Règle** : Lors d'une phase de révélation critique (Deep Connection), l'écran de la Télévision (le feu de camp commun) devient volontairement **NOIR**.
* **Conséquence** : Les joueurs ne peuvent plus regarder la TV passivement. Ils sont obligés de tourner la tête et de se regarder entre eux pendant que l'hôte lit l'écran de son propre téléphone.

## 4. La Jauge de Tension (Appui Long)
* **La Règle** : Dans les modes ultra-intimes (Date Night), le clic frénétique est interdit. Le bouton "Suivant" requiert un maintien continu (Hold) de 2 secondes.
* **Conséquence** : Le geste physique ralentit. L'interface impose un rythme contemplatif, forçant l'humain à s'ancrer dans le moment présent.

## 5. Le Tribunal Social (Zéro Écriture)
* **La Règle** : Dans les modes légers (Icebreaker), les claviers disparaissent. L'application scanne la salle et transforme les prénoms des joueurs en gros boutons. Les interactions se font uniquement par le vote.
* **Conséquence** : L'effort cognitif est réduit à zéro. Le rythme s'accélère, permettant aux joueurs de se concentrer sur les éclats de rire et la justification de leur vote de mauvaise foi, le verre à la main.

## 6. L'Algorithme du DJ Émotionnel (Le Refroidissement)
* **Le Problème** : L'aléatoire pur tue l'ambiance. Tirer 3 questions profondes à la suite étouffe une table.
* **La Règle** : L'application possède une "Règle de Refroidissement". Si une carte jouée est de niveau d'intensité 3 (Deep/Vulnérabilité), la carte suivante est **obligatoirement** contrainte à un niveau d'intensité 1 ou 2 (Flirt/Rire).
* **Conséquence** : Le moteur de jeu crée une véritable "montagne russe" (playlist) émotionnelle, offrant de grandes respirations d'air frais après une séquence lourde.

## 7. La Loi de Dunbar (Les Limites de Joueurs)
L'intimité ne "scale" pas (ne passe pas à l'échelle).
- Le mode *Deep Connection* est bloqué à **6 joueurs maximum**. Au-delà, l'humain est incapable de générer de l'empathie pure (instinct de meute vs tribu).
- Le mode *Date Night* est strictement limité à **2 joueurs**. À 3, l'anonymat brisé et la dynamique de flirt deviennent bizarres ou écrasants.
