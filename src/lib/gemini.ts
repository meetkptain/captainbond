import { fetchWithTimeout } from '@/lib/fetch';
import { withRetry } from '@/lib/db/withRetry';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Generates content using Gemini models
 * @param prompt Prompt to send to Gemini
 * @param responseMimeType Optional MIME type constraint (e.g. 'application/json')
 */
export async function generateContent(prompt: string, responseMimeType?: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new AppError('INTERNAL_ERROR', "La clé d'API Gemini n'est pas configurée.");
  }

  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const res = await withRetry(
    () =>
      fetchWithTimeout(geminiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: responseMimeType ? { responseMimeType } : undefined,
        }),
        timeout: 20000,
      }),
    { maxRetries: 2, baseDelayMs: 500 }
  );

  if (!res.ok) {
    const errText = await res.text();
    logger.error('Gemini API generateContent error', { status: res.status, statusText: res.statusText, body: errText });
    throw new AppError('SERVICE_UNAVAILABLE', `Gemini API generateContent error: ${res.statusText}`);
  }

  const resData = await res.json();
  const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new AppError('SERVICE_UNAVAILABLE', 'Gemini API generateContent returned an empty payload.');
  }

  return rawText.trim();
}

/**
 * Calculates a vector embedding for a given text using text-embedding-004 (768 dimensions)
 * @param text The text input to calculate embeddings for
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!GEMINI_API_KEY) {
    throw new AppError('INTERNAL_ERROR', "La clé d'API Gemini n'est pas configurée.");
  }

  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;

  const res = await withRetry(
    () =>
      fetchWithTimeout(geminiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: {
            parts: [{ text }]
          }
        }),
        timeout: 10000,
      }),
    { maxRetries: 2, baseDelayMs: 500 }
  );

  if (!res.ok) {
    const errText = await res.text();
    logger.error('Gemini API embedContent error', { status: res.status, statusText: res.statusText, body: errText });
    throw new AppError('SERVICE_UNAVAILABLE', `Gemini API embedContent error: ${res.statusText}`);
  }

  const resData = await res.json();
  const embeddingValues = resData.embedding?.values;
  if (!Array.isArray(embeddingValues)) {
    throw new AppError('SERVICE_UNAVAILABLE', 'Gemini API embedContent returned an invalid or empty embedding.');
  }

  return embeddingValues;
}
