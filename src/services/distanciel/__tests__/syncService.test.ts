import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  joinRemoteSession,
  leaveRemoteSession,
  broadcastNodeAnswered,
  broadcastStickRotation,
  broadcastNodeSelected,
  broadcastQuestionValidated
} from '../syncService';

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockImplementation((cb) => {
    if (cb) cb('SUBSCRIBED');
    return mockChannel;
  }),
  send: vi.fn().mockResolvedValue(null),
  track: vi.fn().mockResolvedValue(null),
};

vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';

describe('syncService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('joins remote session and subscribes to broadcast events', () => {
    const roomId = 'room-1';
    const playerId = 'player-1';
    const onEvent = vi.fn();

    const channel = joinRemoteSession(roomId, playerId, onEvent);

    expect(supabase.channel).toHaveBeenCalledWith(`room-sync-${roomId}`, expect.any(Object));
    expect(mockChannel.on).toHaveBeenCalledWith('broadcast', { event: 'sync' }, expect.any(Function));
    expect(mockChannel.subscribe).toHaveBeenCalled();
    expect(channel).toBe(mockChannel);
  });

  it('leaves remote session', () => {
    const roomId = 'room-1';
    joinRemoteSession(roomId, 'player-1', () => {});
    
    leaveRemoteSession(roomId);
    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });

  it('broadcasts node answered event', async () => {
    const roomId = 'room-1';
    joinRemoteSession(roomId, 'player-1', () => {});

    await broadcastNodeAnswered(roomId, 'player-1', 'node-1', ['Sam', 'Alex']);

    expect(mockChannel.send).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'sync',
      payload: expect.objectContaining({
        type: 'node_answered',
        senderId: 'player-1',
        payload: expect.objectContaining({
          nodeId: 'node-1',
          answeredBy: ['Sam', 'Alex'],
        }),
      }),
    });
  });

  it('broadcasts stick rotation', async () => {
    const roomId = 'room-1';
    joinRemoteSession(roomId, 'player-1', () => {});

    await broadcastStickRotation(roomId, 'player-1', 'player-2');

    expect(mockChannel.send).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'sync',
      payload: {
        type: 'stick_rotated',
        senderId: 'player-1',
        payload: { nextPlayerId: 'player-2' },
      },
    });
  });

  it('broadcasts node selection', async () => {
    const roomId = 'room-1';
    joinRemoteSession(roomId, 'player-1', () => {});

    await broadcastNodeSelected(roomId, 'player-1', 'node-3');

    expect(mockChannel.send).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'sync',
      payload: {
        type: 'node_selected',
        senderId: 'player-1',
        payload: { nodeId: 'node-3' },
      },
    });
  });

  it('broadcasts question validation', async () => {
    const roomId = 'room-1';
    joinRemoteSession(roomId, 'player-1', () => {});

    await broadcastQuestionValidated(roomId, 'player-1', 'node-4', true);

    expect(mockChannel.send).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'sync',
      payload: {
        type: 'question_validated',
        senderId: 'player-1',
        payload: { nodeId: 'node-4', validated: true },
      },
    });
  });
});
