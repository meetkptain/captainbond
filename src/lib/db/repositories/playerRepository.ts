import { supabaseAdmin } from '@/lib/supabase-admin';
import { Player } from '../types';

export async function getPlayerById(id: string): Promise<Player | null> {
  const { data, error } = await supabaseAdmin.from('Player').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Player | null;
}

export async function getPlayerInRoom(playerId: string, roomId: string): Promise<Player | null> {
  const { data, error } = await supabaseAdmin
    .from('Player')
    .select('*')
    .eq('id', playerId)
    .eq('roomId', roomId)
    .maybeSingle();
  if (error) throw error;
  return data as Player | null;
}

export async function getPlayersInRoom(roomId: string): Promise<Player[]> {
  const { data, error } = await supabaseAdmin.from('Player').select('*').eq('roomId', roomId);
  if (error) throw error;
  return (data || []) as Player[];
}

export async function getPlayersByRoomWithUserId(
  roomId: string
): Promise<Array<Pick<Player, 'id' | 'userId' | 'isHost'>>> {
  const { data, error } = await supabaseAdmin
    .from('Player')
    .select('id, userId, isHost')
    .eq('roomId', roomId)
    .not('userId', 'is', null);
  if (error) throw error;
  return (data || []) as Array<Pick<Player, 'id' | 'userId' | 'isHost'>>;
}

export async function countNonHostPlayersInRoom(roomId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('Player')
    .select('id')
    .eq('roomId', roomId)
    .eq('isHost', false);
  if (error) throw error;
  return (data || []).length;
}

export async function createPlayer(input: Partial<Player>): Promise<Player> {
  const { data, error } = await supabaseAdmin.from('Player').insert(input).select().single();
  if (error) throw error;
  return data as Player;
}

export async function updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
  const { data, error } = await supabaseAdmin.from('Player').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Player;
}

export async function updatePlayersInRoom(roomId: string, updates: Partial<Player>): Promise<void> {
  const { error } = await supabaseAdmin.from('Player').update(updates).eq('roomId', roomId);
  if (error) throw error;
}

export async function deletePlayer(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('Player').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteScoresForPlayer(playerId: string): Promise<void> {
  const { error } = await supabaseAdmin.from('Score').delete().eq('playerId', playerId);
  if (error) throw error;
}

export async function deleteResponsesForPlayer(playerId: string): Promise<void> {
  const { error } = await supabaseAdmin.from('Response').delete().eq('playerId', playerId);
  if (error) throw error;
}

export async function playerNameExistsInRoom(roomId: string, name: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('Player')
    .select('id')
    .eq('roomId', roomId)
    .eq('name', name)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}
