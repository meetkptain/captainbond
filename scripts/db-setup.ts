import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

// Chargement manuel de .env.local pour s'assurer que DATABASE_URL est disponible
try {
  const envPath = join(process.cwd(), '.env.local');
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      let val = valueParts.join('=').trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key.trim()] = val;
    }
  }
  console.log('✅ Environnement .env.local chargé manuellement.');
} catch (e) {
  console.log('⚠️ Impossible de charger .env.local, utilisation des variables globales.');
}

const prisma = new PrismaClient();

// Helper to construct normalized 1536-dimensional vectors
function getNormalizedVector(alignment: number, perspicacity: number, deception: number): number[] {
  const vec = new Array(1536).fill(0);
  const magnitude = Math.sqrt(alignment ** 2 + perspicacity ** 2 + deception ** 2);
  if (magnitude > 0) {
    vec[0] = alignment / magnitude;
    vec[1] = perspicacity / magnitude;
    vec[2] = deception / magnitude;
  } else {
    vec[0] = 0.577; // 1/sqrt(3)
    vec[1] = 0.577;
    vec[2] = 0.577;
  }
  return vec;
}

function vectorToSqlString(vec: number[]): string {
  return `[${vec.join(',')}]`;
}

async function main() {
  console.log('🔄 Démarrage de la migration de base de données (pgvector)...');

  try {
    // 1. Activer l'extension pgvector
    console.log('📦 Activation de l\'extension "vector"...');
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');

    // 2. Créer la table ArchetypeReference
    console.log('🗄️ Création de la table "ArchetypeReference"...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ArchetypeReference" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "emoji" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "embedding" vector(1536) NOT NULL
      );
    `);

    // 3. Ajouter la colonne psychologicalVector à UserStats si absente
    console.log('👤 Ajout de la colonne "psychologicalVector" sur UserStats...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "UserStats" ADD COLUMN IF NOT EXISTS "psychologicalVector" vector(1536);
    `);

    // 4. Insérer/mettre à jour les archetypes de référence
    console.log('🌱 Seeding des archétypes de référence...');
    const archetypes = [
      {
        id: 'manipulateur_bienveillant',
        name: 'Le Manipulateur Bienveillant',
        emoji: '🎭',
        description: "Tu lis en tes amis comme dans un livre ouvert. Tu sais exactement ce qu'ils attendent de toi, et tu t'en sers avec une précision chirurgicale. Dangereux, mais charmant.",
        alignment: 50,
        perspicacity: 80,
        deception: 80
      },
      {
        id: 'franc_tireur',
        name: 'Le Franc-Tireur Incompris',
        emoji: '🔥',
        description: "Tu comprends les règles sociales, mais tu choisis délibérément de les briser. Ton honnêteté brutale fait de toi l'élément imprévisible de la soirée. On t'aime ou on te craint — jamais entre les deux.",
        alignment: 20,
        perspicacity: 70,
        deception: 40
      },
      {
        id: 'observateur_silencieux',
        name: "L'Observateur Silencieux",
        emoji: '👁️',
        description: "Tu ne fais pas de vagues, mais rien ne t'échappe. Tu es la boîte noire de ton groupe d'amis. Tu sais tout de leurs secrets, et ils l'ignorent. Ton calme apparent cache une intelligence sociale redoutable.",
        alignment: 80,
        perspicacity: 80,
        deception: 30
      },
      {
        id: 'maitre_du_chaos',
        name: 'Le Maître du Chaos',
        emoji: '💥',
        description: "Tu ne joues pas pour gagner, tu joues pour voir le monde brûler. Tes réponses n'ont aucun sens logique, sauf celui de semer la zizanie. Le chaos est ton élément naturel, et la soirée serait ennuyeuse sans toi.",
        alignment: 20,
        perspicacity: 30,
        deception: 80
      },
      {
        id: 'diplomate_ne',
        name: 'Le Diplomate-Né',
        emoji: '🕊️',
        description: "Tu es la colle du groupe. Tu votes avec le consensus non par faiblesse, mais par stratégie sociale. Tu sais que maintenir l'harmonie te donne un pouvoir invisible que les rebelles n'auront jamais.",
        alignment: 80,
        perspicacity: 50,
        deception: 20
      },
      {
        id: 'agent_double',
        name: "L'Agent Double",
        emoji: '🕶️',
        description: "Tu es un caméléon social. Tu t'adaptes à chaque situation, chaque groupe, chaque question. Personne n'a réussi à te cerner ce soir, et c'est exactement ce que tu voulais.",
        alignment: 50,
        perspicacity: 50,
        deception: 50
      }
    ];

    for (const arch of archetypes) {
      const vec = getNormalizedVector(arch.alignment, arch.perspicacity, arch.deception);
      const sqlVecStr = vectorToSqlString(vec);

      // Upsert
      await prisma.$executeRawUnsafe(`
        INSERT INTO "ArchetypeReference" (id, name, emoji, description, embedding)
        VALUES ($1, $2, $3, $4, $5::vector)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            emoji = EXCLUDED.emoji,
            description = EXCLUDED.description,
            embedding = EXCLUDED.embedding;
      `, arch.id, arch.name, arch.emoji, arch.description, sqlVecStr);
    }

    // 5. Créer la fonction match_closest_archetypes si elle n'existe pas
    console.log('⚙️ Création de la fonction SQL RPC "match_closest_archetypes"...');
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION match_closest_archetypes(user_vector vector(1536), match_limit int)
      RETURNS TABLE (
        id text,
        name text,
        emoji text,
        description text,
        similarity float
      )
      LANGUAGE sql STABLE AS $$
        SELECT 
          id,
          name, 
          emoji, 
          description,
          1 - (embedding <=> user_vector) AS similarity
        FROM "ArchetypeReference"
        ORDER BY embedding <=> user_vector
        LIMIT match_limit;
      $$;
    `);

    console.log('✅ Base de données migrée et initialisée avec pgvector avec succès !');
  } catch (error) {
    console.error('❌ Erreur de migration pgvector :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
