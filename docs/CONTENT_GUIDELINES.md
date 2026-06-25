# RÈGLES D'ÉCRITURE DU CONTENU (DATABASE)

La manière dont les questions sont écrites est plus importante que le code lui-même. Une mauvaise question tue le jeu instantanément. 
Voici les directives pour remplir la base de données de questions.

## 0. L'Architecture Data (Intensité & Tags)
Toute question ajoutée dans la base de données (via `prisma/seed.ts` ou l'interface) doit obligatoirement posséder :
- **Un `intensityLevel` (1 à 3)** :
  - `1` : Chill, Absurde, Flirt léger.
  - `2` : Spicy, Débat, Tension douce.
  - `3` : Deep, Vulnérabilité, Risque émotionnel.
- **Des `tags` (Tableau de chaînes)** :
  - `#icebreaker`, `#date_safe`, `#couples_only`, `#nsfw`, `#funny`. 
L'algorithme "DJ Émotionnel" se base exclusivement sur ces deux champs pour générer la montagne russe parfaite en cours de partie.

## 1. La Règle des 70/30 (La Montagne Russe)
Dans le mode `Date Night`, l'algorithme ne doit jamais tirer 3 questions "Deep" à la suite. Le jeu doit proposer une courbe émotionnelle :
- **70% de Légèreté (Flirt, Humour, Absurde)** : Baisse la garde du joueur. Libère de l'ocytocine.
- **30% de Connexion Profonde** : Frappe plus fort car la personne est détendue.
*Exemple de Séquence* : [Icebreaker] -> [Flirt] -> [Deep] -> [Absurde] -> [Deep].

## 2. Le Copywriting du Malaise
La bonne question "Deep" n'est pas une question violente ("As-tu déjà trompé ?"). C'est une question subtile qui oblige l'introspection ("Quel est le mensonge que tu te racontes le plus souvent ?").
- **À éviter** : Les questions fermées (Oui/Non).
- **À éviter** : Les questions qui demandent un effort de mémoire trop long.
- **À privilégier** : Les questions de projection ("Si je devais...", "Qu'est-ce que tu envies le plus chez...").

## 3. Le Droit à l'Esquive Invoquée
Certaines questions sont volontairement écrites pour être "passées". Elles existent uniquement pour tester les limites du groupe.
L'acte de dire *"Woah, non, je passe celle-là"* crée autant d'ambiance et de rire que d'y répondre. Le jeu ne juge pas le silence.

## 4. L'Économie de Mots
Une question affichée sur la TV ou sur un téléphone posé sur une table doit être lue d'un seul coup d'œil, souvent avec un peu d'alcool dans le sang ou dans l'obscurité.
- **Maximum 2 phrases.**
- **Pas de vocabulaire complexe.**
- **Impact brut.**
