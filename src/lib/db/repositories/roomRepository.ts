import { supabaseAdmin } from '@/lib/supabase-admin';
import { Room, Player } from '../types';

export async function getRoomById(id: string): Promise<Room | null> {
  const { data, error } = await supabaseAdmin.from('Room').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Room | null;
}

export async function getRoomByCode(code: string): Promise<Room | null> {
  const { data, error } = await supabaseAdmin
    .from('Room')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .maybeSingle();
  if (error) throw error;
  return data as Room | null;
}

export async function getRoomByCodeWithPlayers(code: string): Promise<{ room: Room | null; players: Pick<Player, 'id' | 'isHost'>[] }> {
  const room = await getRoomByCode(code);
  if (!room) return { room: null, players: [] };
  const { data: players, error } = await supabaseAdmin
    .from('Player')
    .select('id, isHost')
    .eq('roomId', room.id);
  if (error) throw error;
  return { room, players: players || [] };
}

export async function createRoom(input: Partial<Room>): Promise<Room> {
  const { data, error } = await supabaseAdmin.from('Room').insert(input).select().single();
  if (error) throw error;
  return data as Room;
}

export async function updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
  const { data, error } = await supabaseAdmin.from('Room').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Room;
}

export async function updateRoomStatus(id: string, status: Room['status']): Promise<void> {
  const { error } = await supabaseAdmin.from('Room').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function listActiveRooms(): Promise<Room[]> {
  const { data, error } = await supabaseAdmin
    .from('Room')
    .select('*')
    .neq('status', 'ENDED')
    .order('createdAt', { ascending: false });
  if (error) throw error;
  return (data || []) as Room[];
}

export async function roomExistsWithCode(code: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin.from('Room').select('code').eq('code', code).maybeSingle();
  if (error) throw error;
  return !!data;
}
