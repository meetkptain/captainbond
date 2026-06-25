import { supabaseAdmin } from '@/lib/supabase-admin';
import { DJProfile, DJQuestion, DailyQuestion } from '../types';

export async function getDJProfileById(id: string): Promise<DJProfile | null> {
  const { data, error } = await supabaseAdmin.from('DJProfile').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as DJProfile | null;
}

export async function getDJProfileByCouple(coupleId: string): Promise<DJProfile | null> {
  const { data, error } = await supabaseAdmin.from('DJProfile').select('*').eq('coupleId', coupleId).maybeSingle();
  if (error) throw error;
  return data as DJProfile | null;
}

export async function getDJProfileByRoom(roomId: string): Promise<DJProfile | null> {
  const { data, error } = await supabaseAdmin.from('DJProfile').select('*').eq('roomId', roomId).maybeSingle();
  if (error) throw error;
  return data as DJProfile | null;
}

export async function createDJProfile(input: Partial<DJProfile>): Promise<DJProfile> {
  const { data, error } = await supabaseAdmin.from('DJProfile').insert(input).select().single();
  if (error) throw error;
  return data as DJProfile;
}

export async function updateDJProfile(id: string, updates: Partial<DJProfile>): Promise<DJProfile> {
  const { data, error } = await supabaseAdmin.from('DJProfile').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as DJProfile;
}

export async function createDJQuestion(input: Partial<DJQuestion>): Promise<DJQuestion> {
  const { data, error } = await supabaseAdmin.from('DJQuestion').insert(input).select().single();
  if (error) throw error;
  return data as DJQuestion;
}

export async function getDJQuestionById(id: string): Promise<DJQuestion | null> {
  const { data, error } = await supabaseAdmin.from('DJQuestion').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as DJQuestion | null;
}

export async function listDJQuestions(profileId: string): Promise<DJQuestion[]> {
  const { data, error } = await supabaseAdmin.from('DJQuestion').select('*').eq('profileId', profileId).order('createdAt', { ascending: false });
  if (error) throw error;
  return data as DJQuestion[];
}

export async function updateDJQuestionStatus(id: string, updates: Partial<DJQuestion>): Promise<DJQuestion> {
  const { data, error } = await supabaseAdmin.from('DJQuestion').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as DJQuestion;
}
