import { supabaseAdmin } from '@/lib/supabase-admin';
import { Question } from '../types';

export { listQuestionsForDeck } from './roomQuestionRepository';

export async function findRandomCoupleQuestion(limit = 30): Promise<Question | null> {
  const { data, error } = await supabaseAdmin
    .from('Question')
    .select('*')
    .contains('audiences', ['couple'])
    .limit(limit);
  if (error) throw error;
  const questions = (data ?? []) as Question[];
  if (questions.length === 0) return null;
  return questions[Math.floor(Math.random() * questions.length)];
}

export async function getQuestionById(id: string): Promise<Question | null> {
  const { data, error } = await supabaseAdmin.from('Question').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Question | null;
}

export async function listQuestions(options: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  mode?: string;
} = {}): Promise<{ questions: Question[]; total: number }> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin.from('Question').select('*', { count: 'exact' });

  if (options.search) {
    query = query.ilike('text', `%${options.search}%`);
  }
  if (options.category) {
    query = query.eq('category', options.category.toUpperCase());
  }
  if (options.mode) {
    query = query.eq('mode', options.mode.toUpperCase());
  }

  const { data, count, error } = await query.order('createdAt', { ascending: false }).range(from, to);
  if (error) throw error;
  return { questions: (data || []) as Question[], total: count || 0 };
}

export async function listQuestionsByIds(ids: string[]): Promise<Question[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabaseAdmin.from('Question').select('*').in('id', ids);
  if (error) throw error;
  return (data || []) as Question[];
}

export async function countQuestions(): Promise<number> {
  const { count, error } = await supabaseAdmin.from('Question').select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count || 0;
}

export async function createQuestion(input: Partial<Question>): Promise<Question> {
  const { data, error } = await supabaseAdmin.from('Question').insert(input).select().single();
  if (error) throw error;
  return data as Question;
}

export async function createQuestions(inputs: Partial<Question>[]): Promise<Question[]> {
  const { data, error } = await supabaseAdmin.from('Question').insert(inputs).select();
  if (error) throw error;
  return (data || []) as Question[];
}

export async function updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
  const { data, error } = await supabaseAdmin.from('Question').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Question;
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('Question').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertQuestions(inputs: Partial<Question>[]): Promise<void> {
  const { error } = await supabaseAdmin.from('Question').upsert(inputs, { onConflict: 'id' });
  if (error) throw error;
}
