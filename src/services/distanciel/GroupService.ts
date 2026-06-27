import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface GroupMember {
  playerId: string;
  name: string;
  isHost: boolean;
  joinedAt: string;
}

export type GroupPayloads = {
  'member_joined': { member: GroupMember };
  'state_changed': { currentQuestionId: string | null; status: string; round: number };
  'player_voted': { playerId: string; questionId: string; answer: string };
  'audio_signal': { signal: unknown; toPlayerId: string };
};

export type GroupEvent = {
  [K in keyof GroupPayloads]: {
    type: K;
    payload: GroupPayloads[K];
    senderId: string;
  };
}[keyof GroupPayloads];

const activeGroupChannels = new Map<string, RealtimeChannel>();

export function joinGroupSession(
  groupId: string,
  playerId: string,
  playerName: string,
  isHost: boolean,
  onEvent: (event: GroupEvent) => void,
  onPresenceSync: (members: GroupMember[]) => void
): RealtimeChannel {
  const existing = activeGroupChannels.get(groupId);
  if (existing) {
    supabase.removeChannel(existing);
  }

  const channel = supabase.channel(`group-sync-${groupId}`, {
    config: {
      broadcast: { self: false },
      presence: { key: playerId }
    },
  });

  channel
    .on('broadcast', { event: 'group_sync' }, (response) => {
      onEvent(response.payload as GroupEvent);
    })
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const members: GroupMember[] = [];
      Object.entries(state).forEach(([pId, presences]) => {
        const p = presences[0] as unknown as { name: string; isHost: boolean; joinedAt: string };
        if (p) {
          members.push({
            playerId: pId,
            name: p.name,
            isHost: p.isHost,
            joinedAt: p.joinedAt,
          });
        }
      });
      onPresenceSync(members);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          name: playerName,
          isHost,
          joinedAt: new Date().toISOString(),
        });
      }
    });

  activeGroupChannels.set(groupId, channel);
  return channel;
}

export function leaveGroupSession(groupId: string): void {
  const channel = activeGroupChannels.get(groupId);
  if (channel) {
    supabase.removeChannel(channel);
    activeGroupChannels.delete(groupId);
  }
}

export async function broadcastGroupState(
  groupId: string,
  senderId: string,
  currentQuestionId: string | null,
  status: string,
  round: number
): Promise<void> {
  const channel = activeGroupChannels.get(groupId);
  if (!channel) return;

  await channel.send({
    type: 'broadcast',
    event: 'group_sync',
    payload: {
      type: 'state_changed',
      payload: { currentQuestionId, status, round },
      senderId,
    } as GroupEvent,
  });
}

export async function broadcastPlayerVote(
  groupId: string,
  senderId: string,
  playerId: string,
  questionId: string,
  answer: string
): Promise<void> {
  const channel = activeGroupChannels.get(groupId);
  if (!channel) return;

  await channel.send({
    type: 'broadcast',
    event: 'group_sync',
    payload: {
      type: 'player_voted',
      payload: { playerId, questionId, answer },
      senderId,
    } as GroupEvent,
  });
}
