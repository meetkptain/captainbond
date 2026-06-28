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
  language: z.string().optional().default('fr'),
});

export const POST = withApiHandler({
  bodySchema: generateDeckSchema,
  async handler({ body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const { friends, vibes, groupContext, dossiers, language } = body;
    const lang = language === 'en' ? 'en' : 'fr';

    const dossiersText = dossiers && dossiers.length > 0
      ? dossiers.map(d => `- Pour ${d.target}: ${d.text}`).join('\n')
      : (lang === 'en' ? 'No specific stories.' : 'Aucun dossier spécifique.');

    const prompt = lang === 'en'
      ? `You are Captain Bond, an ultra-fun, spicy, and psychological party game question generator.
You must generate a personalized deck of EXACTLY 60 game cards/questions in English, based on the following group information:
- Friends present around the table: ${friends.join(', ')}
- Chosen vibes/moods: ${vibes.join(', ')}
- Group context: ${groupContext || 'Not specified'}
- Stories/anecdotes/secrets about players:
${dossiersText}

Generation guidelines:
1. Create exactly 60 unique, funny, surprising, and engaging questions.
2. For each question, determine the type/mode among: 'ICEBREAKER', 'SPICY', 'DEEP_CONNECTION', 'IMPOSTEUR', 'MOST_LIKELY_TO'.
3. The questions should reference the friends in the list (${friends.join(', ')}) naturally and frequently. E.g. "Did [friend] ever...", or "Who between [friend1] and [friend2] is most likely to...".
4. Use the provided anecdotes in the Stories intelligently to create spicy and memorable questions, without revealing the anecdote crudely. Be creative!
5. Questions must have an intensityLevel between 1 (light) and 3 (very intense/spicy/deep).
6. If a question applies to specific players, include their EXACT names (as provided in the friends list) in the 'involvedPlayers' array and set 'isGeneric' to false. If the question is general and can be asked to anyone without specifically involving one or more friends by their first names, set 'isGeneric' to true and leave 'involvedPlayers' empty.
7. Keep it playful, kind but teasing. Avoid mean insults or harassment.
8. Return ONLY a JSON array of 60 objects strictly respecting the following structure.

Expected JSON Structure:
[
  {
    "text": "Card question text in English, ideally involving one or more friends",
    "mode": "ICEBREAKER" | "SPICY" | "DEEP_CONNECTION" | "IMPOSTEUR" | "MOST_LIKELY_TO",
    "intensityLevel": 1 | 2 | 3,
    "involvedPlayers": ["FriendName1", "FriendName2"],
    "isGeneric": false
  },
  ...
]`
      : `Tu es Captain Bond, un générateur de questions de soirée ultra-fun, piquant et psychologique.
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
        text: q.text || (lang === 'en' ? `Question about the game theme` : `Question sur le thème du jeu`),
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
