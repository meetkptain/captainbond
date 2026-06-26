import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { generateContent } from '@/lib/gemini';
import { AppError } from '@/lib/errors';

export const runtime = 'edge';

const generateDeckSchema = z.object({
  friends: z.array(z.string().min(1)).min(2).max(10),
  vibes: z.array(z.enum(['ICEBREAKER', 'SPICY', 'SECRETS', 'NOSTALGIA'])).min(1),
  groupContext: z.string().max(500).optional().default(''),
  dossiers: z.array(
    z.object({
      target: z.string(),
      text: z.string(),
    })
  ).optional().default([]),
});

export const POST = withApiHandler({
  bodySchema: generateDeckSchema,
  async handler({ body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const { friends, vibes, groupContext, dossiers } = body;

    const dossiersText = dossiers && dossiers.length > 0
      ? dossiers.map(d => `- Pour ${d.target}: ${d.text}`).join('\n')
      : 'Aucun dossier spécifique.';

    const prompt = `Tu es Captain Bond, un générateur de questions de soirée ultra-fun, piquant et psychologique.
Tu dois générer un deck personnalisé de EXACTEMENT 60 cartes/questions de jeu en Français, basé sur les informations du groupe suivantes :
- Amis présents autour de la table : ${friends.join(', ')}
- Ambiance / Vibes choisies : ${vibes.join(', ')}
- Contexte du groupe : ${groupContext || 'Non précisé'}
- Dossiers / Anecdotes / Secrets sur les joueurs :
${dossiersText}

Directives de génération :
1. Crée exactement 60 questions uniques, amusantes, surprenantes et engageantes.
2. Pour chaque question, détermine le type/mode parmi : 'ICEBREAKER', 'SPICY', 'DEEP_CONNECTION', 'IMPOSTEUR', 'MOST_LIKELY_TO'.
3. Les questions doivent faire référence de manière naturelle et fréquente aux amis de la liste (${friends.join(', ')}). Ex: "Est-ce que [ami] a déjà...", ou "Qui entre [ami1] et [ami2] est le plus susceptible de...".
4. Utilise intelligemment les anecdotes fournies dans les Dossiers pour créer des questions croustillantes et mémorables, sans pour autant révéler l'anecdote de manière brute. Sois créatif !
5. Les questions doivent avoir un niveau d'intensité (intensityLevel) entre 1 (léger) et 3 (très intense / croustillant / profond).
6. Si une question s'applique à des joueurs spécifiques, inclus leurs noms EXACTS (tels que fournis dans la liste d'amis) dans le tableau 'involvedPlayers' et définis 'isGeneric' à false. Si la question est générale et peut être posée à n'importe qui sans impliquer spécifiquement un ou plusieurs amis par leur prénom, définis 'isGeneric' à true et laisse 'involvedPlayers' vide.
7. Reste ludique, bienveillant mais taquin. Évite toute insulte méchante ou harcèlement.
8. Renvoie UNIQUEMENT un tableau JSON de 60 objets respectant scrupuleusement la structure suivante.

Structure JSON attendue :
[
  {
    "text": "Texte de la question en français impliquant idéalement un ou plusieurs amis",
    "mode": "ICEBREAKER" | "SPICY" | "DEEP_CONNECTION" | "IMPOSTEUR" | "MOST_LIKELY_TO",
    "intensityLevel": 1 | 2 | 3,
    "involvedPlayers": ["NomAmi1", "NomAmi2"],
    "isGeneric": false
  },
  ...
]`;

    try {
      const responseText = await generateContent(prompt, 'application/json');
      let questions = JSON.parse(responseText);

      if (!Array.isArray(questions)) {
        throw new Error("L'IA n'a pas renvoyé un tableau.");
      }

      // Add unique IDs
      questions = questions.map((q: { text?: string; mode?: string; intensityLevel?: number; involvedPlayers?: string[]; isGeneric?: boolean }, index: number) => ({
        id: `custom-q-${Date.now()}-${index}`,
        text: q.text || `Question sur le thème du jeu`,
        mode: q.mode || 'ICEBREAKER',
        intensityLevel: q.intensityLevel || 1,
        involvedPlayers: Array.isArray(q.involvedPlayers) ? q.involvedPlayers.map((name: string) => name.trim()) : [],
        isGeneric: typeof q.isGeneric === 'boolean' ? q.isGeneric : true,
      }));

      return NextResponse.json(questions);
    } catch (error) {
      console.error('Failed to generate deck:', error);
      throw new AppError('GENERATION_FAILED', 'La génération du deck personnalisé par IA a échoué. Réessaie ou modifie tes descriptions.', {
        cause: error,
      });
    }
  },
});
