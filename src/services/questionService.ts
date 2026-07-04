import {
  listQuestions,
  createQuestion,
  createQuestions,
  updateQuestion,
  deleteQuestion,
  upsertQuestions,
} from '@/lib/db/repositories';
import { Question } from '@/lib/db/types';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { safeJsonParse, safeJsonParseRecord } from '@/lib/json';
import { withRetry } from '@/lib/db/withRetry';
import { fetchWithTimeout } from '@/lib/fetch';
import { normalizeQuestionInput } from '@/lib/questions/normalize';

export interface QuestionListOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  mode?: string;
}

export async function getQuestionsList(options: QuestionListOptions) {
  return listQuestions(options);
}

export async function addQuestion(input: Partial<Question>) {
  const normalized = normalizeQuestionInput(input);
  return createQuestion({ ...normalized, createdAt: new Date().toISOString() });
}

export async function addQuestionsBulk(inputs: Partial<Question>[]) {
  const formatted = inputs.map((q) => ({
    ...normalizeQuestionInput(q, undefined, {
      message: 'Champs manquants sur une question (text, mode, category)',
    }),
    createdAt: new Date().toISOString(),
  }));
  return createQuestions(formatted);
}

export async function patchQuestion(id: string, updates: Partial<Question>) {
  const patch: Partial<Question> = {};
  if (updates.text !== undefined) patch.text = updates.text.trim();
  if (updates.mode !== undefined) patch.mode = updates.mode.toUpperCase();
  if (updates.correctAnswer !== undefined) patch.correctAnswer = String(updates.correctAnswer).trim();
  if (updates.options !== undefined) patch.options = updates.options;
  if (updates.category !== undefined) patch.category = updates.category.toUpperCase();
  if (updates.difficulty !== undefined) patch.difficulty = parseInt(String(updates.difficulty), 10) || 1;
  if (updates.isPremium !== undefined) patch.isPremium = !!updates.isPremium;
  if (updates.explanation !== undefined) patch.explanation = updates.explanation ? updates.explanation.trim() : null;
  if (updates.packId !== undefined) patch.packId = updates.packId || null;
  if (updates.tags !== undefined) patch.tags = updates.tags;
  if (updates.metadata !== undefined) patch.metadata = updates.metadata;
  return updateQuestion(id, patch);
}

export async function removeQuestion(id: string) {
  return deleteQuestion(id);
}

// ---------- CSV sync ----------

function parseCSV(csvText: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let entry = '';

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        entry += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(entry.trim());
      entry = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(entry.trim());
      result.push(row);
      row = [];
      entry = '';
    } else {
      entry += char;
    }
  }

  if (entry || row.length > 0) {
    row.push(entry.trim());
    result.push(row);
  }

  return result;
}

export async function syncQuestionsFromCsv(csvText: string): Promise<{ count: number }> {
  const parsedData = parseCSV(csvText);
  if (parsedData.length < 2) {
    throw new AppError('BAD_REQUEST', 'CSV file is empty or lacks headers.');
  }

  const headers = parsedData[0];
  const questionsToUpsert: Partial<Question>[] = [];

  for (let i = 1; i < parsedData.length; i++) {
    const row = parsedData[i];
    if (row.length < headers.length) continue;

    const q: Record<string, string> = {};
    headers.forEach((header, index) => {
      q[header] = row[index] || '';
    });

    const isImposterMode = q.mode?.toUpperCase() === 'IMPOSTEUR';
    if (!q.text || !q.mode || (!isImposterMode && !q.correctAnswer)) continue;

    let parsedMetadata: Record<string, unknown> | null = null;
    if (q.metadata) {
      parsedMetadata = safeJsonParseRecord(q.metadata);
    }

    questionsToUpsert.push(
      normalizeQuestionInput({
        id: q.id,
        text: q.text.replace(/^["']|["']$/g, ''),
        mode: q.mode,
        correctAnswer: q.correctAnswer,
        options: q.options ? q.options.split('|').map((o) => o.trim()) : [],
        category: q.category || 'GENERAL',
        difficulty: q.difficulty,
        isPremium: q.isPremium === 'TRUE' || q.isPremium === 'true' || q.isPremium === '1',
        explanation: q.explanation,
        packId: null,
        tags: [],
        metadata: parsedMetadata,
      }),
    );
  }

  if (questionsToUpsert.length > 0) {
    await upsertQuestions(questionsToUpsert);
  }

  return { count: questionsToUpsert.length };
}

// ---------- Gemini generation ----------

export interface GenerateQuestionsInput {
  theme: string;
  count: number | string;
  mode: string;
  category: string;
  difficulty?: number | string;
}

function buildGeminiPrompt(mode: string, theme: string, count: number, category: string): string {
  let formatInstructions = '';

  if (mode === 'QUIZ_FLASH') {
    formatInstructions = `Chaque question doit être un QCM au format JSON :
    {
      "text": "...",
      "options": ["Choix A (correct)", "Choix B", "Choix C", "Choix D"],
      "correctAnswer": "0",
      "explanation": "..."
    }
    Mélange l'ordre des options.`;
  } else if (mode === 'VRAI_FAUX') {
    formatInstructions = `Chaque question doit être une affirmation Vrai ou Faux au format JSON :
    {
      "text": "...",
      "correctAnswer": "true" ou "false",
      "options": [],
      "explanation": "..."
    }`;
  } else if (mode === 'DEBAT') {
    formatInstructions = `Chaque entrée doit être un sujet de débat au format JSON :
    {
      "text": "...",
      "correctAnswer": "",
      "options": [],
      "explanation": ""
    }`;
  } else if (mode === 'IMPOSTEUR') {
    formatInstructions = `Chaque entrée doit être un duo de mots au format JSON :
    {
      "text": "Thème du duel",
      "wordForCivil": "...",
      "wordForImpostor": "...",
      "explanation": "..."
    }`;
  } else {
    formatInstructions = `Chaque entrée doit être un défi physique ou une consigne au format JSON :
    {
      "text": "...",
      "correctAnswer": "",
      "options": [],
      "explanation": ""
    }`;
  }

  return `Tu es un expert en game design pour le jeu de société réunionnais KOZÉ.
Génère un tableau JSON strict contenant précisément ${count} questions/défis originaux sur le thème : "${theme}".
Mode de jeu requis : "${mode}".
Catégorie générale : "${category}".

${formatInstructions}

Renvoie uniquement le tableau JSON, sans texte d'introduction ni conclusion, sans bloc de code markdown.`;
}

export async function generateQuestions(input: GenerateQuestionsInput): Promise<Question[]> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new AppError('INTERNAL_ERROR', 'La clé d\'API Gemini n\'est pas configurée.', { status: 500 });
  }

  if (!input.theme || !input.count || !input.mode || !input.category) {
    throw new AppError('VALIDATION_ERROR', 'Champs manquants : theme, count, mode, category');
  }

  const questionCount = Math.min(Math.max(parseInt(String(input.count), 10) || 5, 1), 15);
  const difficultyNum = parseInt(String(input.difficulty), 10) || 1;

  const promptText = buildGeminiPrompt(input.mode, input.theme, questionCount, input.category);
  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

  const res = await withRetry(
    () =>
      fetchWithTimeout(geminiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
        timeout: 20000,
      }),
    { maxRetries: 2, baseDelayMs: 500 }
  );

  if (!res.ok) {
    const errText = await res.text();
    logger.error('Gemini API error', { status: res.status, statusText: res.statusText, body: errText?.substring(0, 100) });
    throw new AppError('SERVICE_UNAVAILABLE', `Gemini API error: ${res.statusText}`);
  }

  const resData = await res.json();
  const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new AppError('SERVICE_UNAVAILABLE', 'Gemini API returned an empty payload.');
  }

  const rawQuestions = safeJsonParse<unknown[]>(rawText.trim(), []);
  if (!Array.isArray(rawQuestions)) {
    throw new AppError('SERVICE_UNAVAILABLE', 'Gemini did not return a valid JSON array.');
  }

  return rawQuestions.map((q: unknown) => {
    const raw = q as Record<string, unknown>;
    const isImposteur = input.mode.toUpperCase() === 'IMPOSTEUR';
    const metadata = isImposteur
      ? { wordForCivil: String(raw.wordForCivil || ''), wordForImpostor: String(raw.wordForImpostor || '') }
      : null;

    return {
      id: crypto.randomUUID(),
      text: String(raw.text || ''),
      mode: input.mode.toUpperCase(),
      correctAnswer: raw.correctAnswer !== undefined ? String(raw.correctAnswer) : '',
      options: Array.isArray(raw.options) ? raw.options.map(String) : [],
      category: input.category.toUpperCase(),
      difficulty: difficultyNum,
      isPremium: false,
      explanation: raw.explanation ? String(raw.explanation) : null,
      tags: [input.theme.toLowerCase().trim(), input.mode.toLowerCase()],
      metadata,
    } as Question;
  });
}
