import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Suppression des anciennes questions...')
  await prisma.question.deleteMany()

  const questions = [
    // === MODE ICEBREAKER (Le Provocateur) ===
    {
      mode: 'ICEBREAKER',
      intensityLevel: 1,
      text: "Ton talent le plus inutile ?",
      metadata: { details: "Celui qui ne sert absolument à rien, mais dont tu es secrètement très fier(e)." },
      tags: ['icebreaker', 'fun']
    },
    {
      mode: 'ICEBREAKER',
      intensityLevel: 1,
      text: "La pire mode que tu aies suivie ?",
      metadata: { details: "On a tous eu cette période sombre vestimentairement parlant. Avoue tout." },
      tags: ['icebreaker']
    },
    {
      mode: 'ICEBREAKER',
      intensityLevel: 1,
      text: "Le pire endroit pour un date ?",
      metadata: { details: "Le lieu où il ne faut absolument jamais t'emmener au premier rendez-vous." },
      tags: ['icebreaker', 'dating']
    },
    {
      mode: 'ICEBREAKER',
      intensityLevel: 2,
      text: "Ton dernier mensonge par texto ?",
      metadata: { details: "Regarde ton téléphone si tu as un trou de mémoire. On veut le contexte." },
      tags: ['icebreaker', 'spicy']
    },
    {
      mode: 'ICEBREAKER',
      intensityLevel: 3,
      text: "Ton excuse préférée pour annuler ?",
      metadata: { details: "Celle que tu as sûrement utilisée le week-end dernier pour rester chez toi." },
      tags: ['icebreaker', 'debate']
    },

    // --- PITY SHIELD (Tags: positive) ---
    {
      mode: 'ICEBREAKER',
      intensityLevel: 1,
      text: "Qui a l'énergie la plus rassurante ici ?",
      metadata: { details: "La personne avec qui tu te sens bien, même en silence." },
      tags: ['icebreaker', 'positive']
    },
    {
      mode: 'ICEBREAKER',
      intensityLevel: 1,
      text: "Qui ici a le plus beau sourire quand il rit vraiment ?",
      metadata: { details: "Pas le sourire de façade pour la photo. Le vrai sourire sincère." },
      tags: ['icebreaker', 'positive']
    },
    {
      mode: 'ICEBREAKER',
      intensityLevel: 1,
      text: "Qui donne les meilleurs conseils ?",
      metadata: { details: "La personne que tu appellerais en pleine nuit si tu avais un gros problème." },
      tags: ['icebreaker', 'positive']
    },

    // === MODE SPICY (Le Provocateur) ===
    {
      mode: 'SPICY',
      intensityLevel: 1,
      text: "Ton crush honteux de célébrité ?",
      metadata: { details: "Celui ou celle que tu n'assumes pas du tout en public." },
      tags: ['spicy', 'fun']
    },
    {
      mode: 'SPICY',
      intensityLevel: 2,
      text: "Le pire message envoyé à un ex ?",
      metadata: { details: "La fameuse rechute fatale de 3h du matin. Raconte-nous le naufrage." },
      tags: ['spicy', 'drama']
    },
    {
      mode: 'SPICY',
      intensityLevel: 3,
      text: "Ton secret le mieux gardé au lit ?",
      metadata: { details: "Ce que tu aimes secrètement mais que tu n'oseras jamais demander." },
      tags: ['spicy', 'nsfw']
    },

    // === MODE IMPOSTEUR (Le Provocateur) ===
    {
      mode: 'IMPOSTEUR',
      intensityLevel: 2,
      text: "Tes 3 pires anecdotes de soirée ?",
      metadata: { theme: "Nuits d'ivresse et décadence", details: "Raconte 3 histoires de soirées. Deux sont vraies, une est fausse." },
      tags: ['imposteur', 'fun']
    },
    {
      mode: 'IMPOSTEUR',
      intensityLevel: 3,
      text: "Tes 3 pires ruptures amoureuses ?",
      metadata: { theme: "Crimes de cœur", details: "Étale tes 3 pires ruptures. Lequel de ces drames est une invention ?" },
      tags: ['imposteur', 'drama']
    },
    {
      mode: 'IMPOSTEUR',
      intensityLevel: 2,
      text: "Tes 3 pires mensonges au boulot ?",
      metadata: { theme: "Corporate Bullshit", details: "Entre la fausse gastro et la grand-mère décédée 4 fois. Trouvez le mensonge." },
      tags: ['imposteur', 'fun']
    },

    // === MODE DEEP CONNECTION (Le Thérapeute) ===
    // Note : isTimed est mis à false par défaut pour Deep Connection (géré dans le seed ci-dessous)
    {
      mode: 'DEEP_CONNECTION',
      intensityLevel: 1,
      text: "Quelle est la chose la plus surprenante que tu aies apprise sur toi-même récemment ?",
      metadata: { clinical_intention: "Mesurer la capacité d'introspection récente sans remonter dans le passé." },
      tags: ['vulnerabilite', 'date_safe', 'introspection']
    },
    {
      mode: 'DEEP_CONNECTION',
      intensityLevel: 2,
      text: "Quel est le plus grand risque que tu aies pris et qui a fondamentalement changé ta trajectoire ?",
      metadata: { clinical_intention: "Comprendre le rapport psychologique au risque, au changement et à l'agence personnelle." },
      tags: ['passe', 'vulnerabilite', 'valeurs']
    },
    {
      mode: 'DEEP_CONNECTION',
      intensityLevel: 3,
      text: "Quelle est la croyance limitante sur toi-même que tu essaies activement de déconstruire en ce moment ?",
      metadata: { clinical_intention: "Identifier le travail psychologique en cours et le récit intérieur autodestructeur." },
      tags: ['vulnerabilite', 'peurs', 'introspection']
    },

    // === MODE DATE NIGHT (Le Thérapeute) ===
    // Note : Le tag "icebreaker" a été ajouté sur les questions d'intensité 1 pour permettre le démarrage du Date Night
    {
      mode: 'DATE_NIGHT',
      intensityLevel: 1,
      text: "Quelle est ta définition exacte d'un week-end parfait à deux ?",
      metadata: { clinical_intention: "Tester la compatibilité du 'lifestyle' de base." },
      tags: ['intimite', 'date_safe', 'futur', 'icebreaker']
    },
    {
      mode: 'DATE_NIGHT',
      intensityLevel: 1,
      text: "Quel est le détail chez un(e) partenaire qui te fait fondre instantanément ?",
      metadata: { clinical_intention: "Générer de l'attraction douce et dévoiler le langage amoureux." },
      tags: ['intimite', 'date_safe', 'valeurs', 'icebreaker']
    },
    {
      mode: 'DATE_NIGHT',
      intensityLevel: 2,
      text: "Comment exprimes-tu que tu as besoin d'espace sans blesser l'autre ?",
      metadata: { clinical_intention: "Évaluer le style d'attachement (évitant vs sécurisant)." },
      tags: ['conflit', 'vulnerabilite', 'intimite', 'date_safe']
    },
    {
      mode: 'DATE_NIGHT',
      intensityLevel: 3,
      text: "Quelle est ta plus grande peur inavouée concernant l'engagement à long terme ?",
      metadata: { clinical_intention: "Aborder frontalement les peurs d'abandon, de fusion ou de perte de liberté." },
      tags: ['peurs', 'futur', 'intimite', 'trauma_warning']
    },

    // === GÉNÉRATION GEN Z (Le Trendsetter) ===
    {
      mode: 'ICEBREAKER',
      intensityLevel: 2,
      text: "Qui ici est le plus susceptible de ghoster quelqu'un pendant deux semaines, puis de réapparaître avec un 'ça dit quoi ? 👀' ?",
      metadata: { details: "Votez. Le tribunal du Ghosting est ouvert." },
      tags: ['icebreaker', 'ghosting', 'genz']
    },
    {
      mode: 'SPICY',
      intensityLevel: 2,
      text: "Ton date utilise l'émoji '🤣' de façon non-ironique à chaque phrase. Tu continues ou c'est un Ick rédhibitoire ?",
      metadata: { details: "Jugez mon Ick." },
      tags: ['spicy', 'dating_icks', 'debate']
    },
    {
      mode: 'ICEBREAKER',
      intensityLevel: 2,
      text: "Tu préfères devoir montrer l'intégralité de tes DM Insta à tes parents, ou donner accès à ton historique de recherche à cette table ?",
      metadata: { details: "Choix Cornélien." },
      tags: ['icebreaker', 'digital_footprint', 'fun']
    }
  ];

  for (const q of questions) {
    await prisma.question.create({
      data: {
        mode: q.mode,
        intensityLevel: q.intensityLevel,
        text: q.text,
        metadata: q.metadata,
        tags: q.tags,
        // Les modes Deep Connection et Date Night ne sont pas chronométrés
        isTimed: !(q.mode === 'DEEP_CONNECTION' || q.mode === 'DATE_NIGHT')
      }
    })
  }

  console.log(`✅ ${questions.length} questions ont été insérées dans la base de données.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
