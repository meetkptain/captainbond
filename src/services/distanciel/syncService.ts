import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type SyncPayloads = {
  'node_answered': { nodeId: string; answeredBy: string[]; answeredAt: string };
  'stick_rotated': { nextPlayerId: string };
  'node_selected': { nodeId: string | null };
  'question_validated': { nodeId: string; validated: boolean };
};

export type SyncEvent = {
  [K in keyof SyncPayloads]: {
    type: K;
    payload: SyncPayloads[K];
    senderId: string;
  };
}[keyof SyncPayloads];

const activeChannels = new Map<string, RealtimeChannel>();

export function joinRemoteSession(
  roomId: string,
  playerId: string,
  onEvent: (event: SyncEvent) => void
): RealtimeChannel {
  const existing = activeChannels.get(roomId);
  if (existing) {
    supabase.removeChannel(existing);
  }

  const channel = supabase.channel(`room-sync-${roomId}`, {
    config: {
      broadcast: { self: false },
      presence: { key: playerId }
    },
  });

  channel
    .on('broadcast', { event: 'sync' }, (response) => {
      onEvent(response.payload as SyncEvent);
    })
    .subscribe();

  activeChannels.set(roomId, channel);
  return channel;
}

export function leaveRemoteSession(roomId: string): void {
  const channel = activeChannels.get(roomId);
  if (channel) {
    supabase.removeChannel(channel);
    activeChannels.delete(roomId);
  }
}

export async function broadcastNodeAnswered(
  roomId: string,
  senderId: string,
  nodeId: string,
  answeredBy: string[]
): Promise<void> {
  const channel = activeChannels.get(roomId);
  if (!channel) return;

  await channel.send({
    type: 'broadcast',
    event: 'sync',
    payload: {
      type: 'node_answered',
      payload: { nodeId, answeredBy, answeredAt: new Date().toISOString() },
      senderId,
    } as SyncEvent,
  });
}

export async function broadcastStickRotation(
  roomId: string,
  senderId: string,
  nextPlayerId: string
): Promise<void> {
  const channel = activeChannels.get(roomId);
  if (!channel) return;

  await channel.send({
    type: 'broadcast',
    event: 'sync',
    payload: {
      type: 'stick_rotated',
      payload: { nextPlayerId },
      senderId,
    } as SyncEvent,
  });
}

export async function broadcastNodeSelected(
  roomId: string,
  senderId: string,
  nodeId: string | null
): Promise<void> {
  const channel = activeChannels.get(roomId);
  if (!channel) return;

  await channel.send({
    type: 'broadcast',
    event: 'sync',
    payload: {
      type: 'node_selected',
      payload: { nodeId },
      senderId,
    } as SyncEvent,
  });
}

export async function broadcastQuestionValidated(
  roomId: string,
  senderId: string,
  nodeId: string,
  validated: boolean
): Promise<void> {
  const channel = activeChannels.get(roomId);
  if (!channel) return;

  await channel.send({
    type: 'broadcast',
    event: 'sync',
    payload: {
      type: 'question_validated',
      payload: { nodeId, validated },
      senderId,
    } as SyncEvent,
  });
}
