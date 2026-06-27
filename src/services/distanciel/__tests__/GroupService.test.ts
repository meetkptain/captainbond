import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  joinGroupSession,
  leaveGroupSession,
  broadcastGroupState,
  broadcastPlayerVote
} from '../GroupService';

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockImplementation((cb) => {
    if (cb) cb('SUBSCRIBED');
    return mockChannel;
  }),
  send: vi.fn().mockResolvedValue(null),
  track: vi.fn().mockResolvedValue(null),
  presenceState: vi.fn().mockReturnValue({
    'player-1': [{ name: 'Sam', isHost: true, joinedAt: '2026-06-27T12:00:00Z' }]
  }),
};

vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';

describe('GroupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('joins group session, sets up events, tracks presence and subscribes', () => {
    const groupId = 'group-1';
    const playerId = 'player-1';
    const onEvent = vi.fn();
    const onPresenceSync = vi.fn();

    const channel = joinGroupSession(groupId, playerId, 'Sam', true, onEvent, onPresenceSync);

    expect(supabase.channel).toHaveBeenCalledWith(`group-sync-${groupId}`, expect.any(Object));
    expect(mockChannel.on).toHaveBeenCalledWith('broadcast', { event: 'group_sync' }, expect.any(Function));
    expect(mockChannel.on).toHaveBeenCalledWith('presence', { event: 'sync' }, expect.any(Function));
    expect(mockChannel.subscribe).toHaveBeenCalled();
    expect(mockChannel.track).toHaveBeenCalledWith({
      name: 'Sam',
      isHost: true,
      joinedAt: expect.any(String),
    });
    expect(channel).toBe(mockChannel);
  });

  it('leaves group session', () => {
    const groupId = 'group-1';
    joinGroupSession(groupId, 'player-1', 'Sam', true, () => {}, () => {});
    
    leaveGroupSession(groupId);
    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });

  it('broadcasts group state changes', async () => {
    const groupId = 'group-1';
    joinGroupSession(groupId, 'player-1', 'Sam', true, () => {}, () => {});

    await broadcastGroupState(groupId, 'player-1', 'q-1', 'PLAYING', 2);

    expect(mockChannel.send).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'group_sync',
      payload: expect.objectContaining({
        type: 'state_changed',
        senderId: 'player-1',
        payload: { currentQuestionId: 'q-1', status: 'PLAYING', round: 2 },
      }),
    });
  });

  it('broadcasts player votes', async () => {
    const groupId = 'group-1';
    joinGroupSession(groupId, 'player-1', 'Sam', true, () => {}, () => {});

    await broadcastPlayerVote(groupId, 'player-1', 'player-1', 'q-1', 'Answer A');

    expect(mockChannel.send).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'group_sync',
      payload: expect.objectContaining({
        type: 'player_voted',
        senderId: 'player-1',
        payload: { playerId: 'player-1', questionId: 'q-1', answer: 'Answer A' },
      }),
    });
  });
});
