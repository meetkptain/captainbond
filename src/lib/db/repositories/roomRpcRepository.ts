import { supabaseAdmin } from '@/lib/supabase-admin';

export interface JoinRoomRpcInput {
  roomCode: string;
  playerName: string;
  playerId: string;
  maxPlayers: number | null;
  consentGivenAt: string;
}

export interface JoinRoomRpcResult {
  player_id: string;
  room_id: string;
  room_code: string;
}

export async function joinRoomRpc(input: JoinRoomRpcInput): Promise<JoinRoomRpcResult> {
  const { data, error } = await supabaseAdmin.rpc('join_room', {
    p_room_code: input.roomCode.trim(),
    p_player_name: input.playerName.trim(),
    p_player_id: input.playerId,
    p_max_players: input.maxPlayers,
    p_consent_given_at: input.consentGivenAt,
  });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return result as JoinRoomRpcResult;
}

export interface RecordVoteRpcInput {
  playerId: string;
  roomCode: string;
  questionId: string;
  answer: string;
}

export async function recordVoteRpc(input: RecordVoteRpcInput): Promise<string> {
  const { data, error } = await supabaseAdmin.rpc('record_vote', {
    p_player_id: input.playerId,
    p_room_code: input.roomCode.toUpperCase().trim(),
    p_question_id: input.questionId,
    p_answer: input.answer.trim(),
  });
  if (error) throw error;
  const responseId = (data as { responseId?: string } | null)?.responseId;
  if (!responseId) throw new Error('record_vote did not return a responseId');
  return responseId;
}

export interface UpsertRevealScoresRpcInput {
  roomId: string;
  responseUpdates: Array<{ response_id: string; is_correct: boolean }>;
  scoreUpserts: Array<{ player_id: string; points_to_add: number }>;
}

export async function upsertRevealScoresRpc(input: UpsertRevealScoresRpcInput): Promise<void> {
  const { error } = await supabaseAdmin.rpc('upsert_reveal_scores', {
    p_room_id: input.roomId,
    p_response_updates: input.responseUpdates,
    p_score_upserts: input.scoreUpserts,
  });
  if (error) throw error;
}
