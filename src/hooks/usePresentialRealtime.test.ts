// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePresentialRealtime } from './usePresentialRealtime';

const mockSubscribe = vi.hoisted(() => vi.fn());
const mockOn = vi.hoisted(() => vi.fn(() => ({ on: mockOn, subscribe: mockSubscribe })));
const mockSend = vi.hoisted(() => vi.fn());
const mockRemoveChannel = vi.hoisted(() => vi.fn());
const mockChannel = vi.hoisted(() => vi.fn(() => ({
  on: mockOn,
  send: mockSend,
})));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  },
}));

describe('usePresentialRealtime', () => {
  const defaultInput = {
    roomCode: 'ROOM',
    hostId: 'host-1',
    hostToken: 'token-1',
    players: [{ id: 'p1', name: 'Alice' }],
    modeId: 'ICEBREAKER',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubscribe.mockReturnValue({ unsubscribe: vi.fn() });
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    ) as unknown as typeof fetch;
  });

  it('returns initial state', async () => {
    const { result } = renderHook(() => usePresentialRealtime(defaultInput));
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.questions).toEqual([]);
    expect(result.current.phase).toBe('question');
    expect(result.current.currentQuestionIndex).toBe(0);
    expect(result.current.currentPlayerIndex).toBe(0);
    expect(result.current.imposteurIndex).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('creates channel with room code', async () => {
    renderHook(() => usePresentialRealtime(defaultInput));
    await waitFor(() => {
      expect(mockChannel).toHaveBeenCalledWith('room-events-ROOM');
    });
  });

  it('subscribes to broadcast events', async () => {
    renderHook(() => usePresentialRealtime(defaultInput));
    await waitFor(() => {
      expect(mockOn).toHaveBeenCalledWith('broadcast', { event: 'REQUEST_ROOM_STATE' }, expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('broadcast', { event: 'TRIGGER_SOUND' }, expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('broadcast', { event: 'TRIGGER_EMOJI' }, expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('broadcast', { event: 'TRIGGER_JOKER_SOLIDAIRE' }, expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('broadcast', { event: 'SUBMIT_SPECTATOR_VOTE' }, expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('broadcast', { event: 'INJECT_CUSTOM_DECK' }, expect.any(Function));
      expect(mockSubscribe).toHaveBeenCalled();
    });
  });

  it('cleans up channel on unmount', async () => {
    const { unmount } = renderHook(() => usePresentialRealtime(defaultInput));
    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalled();
    });
    unmount();
    expect(mockRemoveChannel).toHaveBeenCalled();
  });

  it('broadcasts initial room state after subscribing', async () => {
    renderHook(() => usePresentialRealtime(defaultInput));
    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'ROOM_STATE_UPDATE',
        payload: expect.objectContaining({
          currentQuestionText: '',
          currentPlayerName: 'Alice',
          phase: 'question',
          players: defaultInput.players,
          modeId: 'ICEBREAKER',
        }),
      });
    });
  });

  it('calls onTriggerSound when receiving TRIGGER_SOUND broadcast', async () => {
    const onTriggerSound = vi.fn();
    let soundHandler: (({ payload }: { payload: { soundType: string } }) => void) | undefined;
    mockOn.mockImplementation(((event: string, filter: Record<string, string>, handler: () => void) => {
      if (event === 'broadcast' && filter.event === 'TRIGGER_SOUND') {
        soundHandler = handler as unknown as ({ payload }: { payload: { soundType: string } }) => void;
      }
      return { on: mockOn, subscribe: mockSubscribe };
    }) as unknown as () => { on: typeof mockOn; subscribe: typeof mockSubscribe });

    renderHook(() => usePresentialRealtime({ ...defaultInput, onTriggerSound }));

    await waitFor(() => {
      expect(soundHandler).toBeDefined();
    });

    act(() => {
      soundHandler!({ payload: { soundType: 'gong' } });
    });
    expect(onTriggerSound).toHaveBeenCalledWith('gong');
  });

  it('calls onTriggerEmoji when receiving TRIGGER_EMOJI broadcast', async () => {
    const onTriggerEmoji = vi.fn();
    let emojiHandler: (({ payload }: { payload: { emoji: string } }) => void) | undefined;
    mockOn.mockImplementation(((event: string, filter: Record<string, string>, handler: () => void) => {
      if (event === 'broadcast' && filter.event === 'TRIGGER_EMOJI') {
        emojiHandler = handler as unknown as ({ payload }: { payload: { emoji: string } }) => void;
      }
      return { on: mockOn, subscribe: mockSubscribe };
    }) as unknown as () => { on: typeof mockOn; subscribe: typeof mockSubscribe });

    renderHook(() => usePresentialRealtime({ ...defaultInput, onTriggerEmoji }));

    await waitFor(() => {
      expect(emojiHandler).toBeDefined();
    });

    act(() => {
      emojiHandler!({ payload: { emoji: '🔥' } });
    });
    expect(onTriggerEmoji).toHaveBeenCalledWith('🔥');
  });

  it('calls onTriggerJoker and advances turn when receiving TRIGGER_JOKER_SOLIDAIRE broadcast', async () => {
    const onTriggerJoker = vi.fn();
    let jokerHandler: (({ payload }: { payload: { targetPlayerName: string } }) => void) | undefined;
    mockOn.mockImplementation(((event: string, filter: Record<string, string>, handler: () => void) => {
      if (event === 'broadcast' && filter.event === 'TRIGGER_JOKER_SOLIDAIRE') {
        jokerHandler = handler as unknown as ({ payload }: { payload: { targetPlayerName: string } }) => void;
      }
      return { on: mockOn, subscribe: mockSubscribe };
    }) as unknown as () => { on: typeof mockOn; subscribe: typeof mockSubscribe });

    const { result } = renderHook(() => usePresentialRealtime({
      ...defaultInput,
      players: [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
      ],
      onTriggerJoker,
    }));

    await waitFor(() => {
      expect(jokerHandler).toBeDefined();
    });

    act(() => {
      jokerHandler!({ payload: { targetPlayerName: 'Alice' } });
    });

    await waitFor(() => {
      expect(onTriggerJoker).toHaveBeenCalledWith('Alice');
      expect(result.current.currentPlayerIndex).toBe(1);
    });
  });
});
