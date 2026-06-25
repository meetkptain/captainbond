import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// Native fetch is supported in Node 18+

// Load local environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// We use the service role key because this is an admin script bypassing RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
  console.error('❌ Erreur : Veuillez renseigner NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY et GEMINI_API_KEY dans votre fichier .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Prompt template requesting structured JSON from Gemini.
 */
const SYSTEM_PROMPT = `Tu es un expert en culture réunionnaise, histoire, expressions créoles et gastronomie péi.
Génère 10 questions de quiz amusantes et authentiques pour un jeu de soirée réunionnais.
Tu dois répondre EXCLUSIVEMENT sous forme d'un tableau JSON valide, sans markdown, sans en-tête.

Format JSON attendu :
[
  {
    "mode": "VRAI_FAUX" | "QUIZ_FLASH",
    "text": "L'énoncé de la question en français (avec quelques mots ou expressions créoles si approprié)",
    "correctAnswer": "true" | "false" (si VRAI_FAUX) ou "index_de_l_option_correcte" de "0" à "3" (si QUIZ_FLASH),
    "options": [] (vide pour VRAI_FAUX, tableau de 4 chaînes de caractères pour QUIZ_FLASH),
    "explanation": "Une explication courte et drôle ou culturelle de la réponse",
    "category": "HISTOIRE" | "GEOGRAPHIE" | "GASTRONOMIE" | "EXPRESSIONS" | "PERSONNALITES" | "GENERAL",
    "difficulty": 1 | 2 | 3,
    "isPremium": false
  }
]`;

async function generateQuestions() {
  console.log('🤖 Appel à l\'API Gemini pour générer des questions péi...');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              { text: 'Génère 10 questions inédites.' }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json' // Force raw JSON output
        }
      })
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API failed: ${errText}`);
  }

  const result = await response.json();
  const rawText = result.candidates[0].content.parts[0].text;
  const questions = JSON.parse(rawText.trim());

  console.log(`✓ ${questions.length} questions générées par l'IA.`);
  return questions;
}

async function run() {
  try {
    const questions = await generateQuestions();
    
    // Assign a UUID to each question
    const formattedQuestions = questions.map(q => ({
      id: crypto.randomUUID(),
      ...q
    }));

    console.log('⚡ Insertion dans la base de données Supabase...');
    const { data, error } = await supabase
      .from('Question')
      .insert(formattedQuestions)
      .select();

    if (error) throw error;

    console.log(`🎉 Succès ! ${data.length} questions ont été générées et insérées en BDD.`);
  } catch (err) {
    console.error('❌ Une erreur est survenue :', err);
  }
}

run();
