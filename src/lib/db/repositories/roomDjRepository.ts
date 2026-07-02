import { supabaseAdmin } from '@/lib/supabase-admin';
import { DJProfile, DJQuestion } from '../types';

export async function getProfileByRoom(roomId: string): Promise<DJProfile | null> {
  const { data, error } = await supabaseAdmin
    .from('DJProfile')
    .select('*')
    .eq('roomId', roomId)
    .is('coupleId', null)
    .maybeSingle();
  if (error) throw error;
  return data as DJProfile | null;
}

export async function createProfileForRoom(roomId: string, input: Partial<DJProfile> = {}): Promise<DJProfile> {
  const { data, error } = await supabaseAdmin
    .from('DJProfile')
    .insert({ ...input, roomId, coupleId: null })
    .select()
    .single();
  if (error) throw error;
  return data as DJProfile;
}

export async function updateProfile(id: string, updates: Partial<DJProfile>): Promise<DJProfile> {
  const { data, error } = await supabaseAdmin.from('DJProfile').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as DJProfile;
}

export async function createQuestion(input: Partial<DJQuestion>): Promise<DJQuestion> {
  const { data, error } = await supabaseAdmin.from('DJQuestion').insert(input).select().single();
  if (error) throw error;
  return data as DJQuestion;
}

export async function getQuestionById(id: string): Promise<DJQuestion | null> {
  const { data, error } = await supabaseAdmin.from('DJQuestion').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as DJQuestion | null;
}

export async function updateQuestion(id: string, updates: Partial<DJQuestion>): Promise<DJQuestion> {
  const { data, error } = await supabaseAdmin.from('DJQuestion').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as DJQuestion;
}
