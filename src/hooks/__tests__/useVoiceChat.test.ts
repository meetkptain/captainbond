// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceChat } from '../useVoiceChat';

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockImplementation((cb) => {
    if (cb) cb('SUBSCRIBED');
    return mockChannel;
  }),
  send: vi.fn().mockResolvedValue(null),
};

vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';

describe('useVoiceChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock navigator.mediaDevices
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
          getAudioTracks: () => [{ enabled: true }],
        }),
      },
      configurable: true,
      writable: true,
    });

    // Mock RTCPeerConnection
    Object.defineProperty(globalThis, 'RTCPeerConnection', {
      value: vi.fn().mockImplementation(() => ({
        addTrack: vi.fn(),
        createOffer: vi.fn().mockResolvedValue({ sdp: 'offer' }),
        createAnswer: vi.fn().mockResolvedValue({ sdp: 'answer' }),
        setLocalDescription: vi.fn().mockResolvedValue(null),
        setRemoteDescription: vi.fn().mockResolvedValue(null),
        addIceCandidate: vi.fn().mockResolvedValue(null),
        close: vi.fn(),
      })),
      configurable: true,
      writable: true,
    });
  });

  it('does not initialize audio stream if not enabled', () => {
    const { result } = renderHook(() =>
      useVoiceChat({ groupId: 'g-1', playerId: 'p-1', isEnabled: false })
    );

    expect(result.current.isMuted).toBe(false);
    expect(result.current.connectedPeers).toEqual([]);
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });

  it('requests mic access and joins voice signaling channel if enabled', async () => {
    renderHook(() =>
      useVoiceChat({ groupId: 'g-1', playerId: 'p-1', isEnabled: true })
    );

    // Wait for the async effect to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(supabase.channel).toHaveBeenCalledWith('voice-signaling-g-1');
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('allows muting and unmuting the local stream', async () => {
    const mockTrack = { enabled: true, stop: vi.fn() };
    const mockStream = {
      getTracks: () => [mockTrack],
      getAudioTracks: () => [mockTrack],
    };
    
    vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValue(mockStream as unknown as MediaStream);

    const { result } = renderHook(() =>
      useVoiceChat({ groupId: 'g-1', playerId: 'p-1', isEnabled: true })
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Toggle mute
    act(() => {
      result.current.toggleMute();
    });

    expect(mockTrack.enabled).toBe(false);
    expect(result.current.isMuted).toBe(true);

    // Toggle again
    act(() => {
      result.current.toggleMute();
    });

    expect(mockTrack.enabled).toBe(true);
    expect(result.current.isMuted).toBe(false);
  });
});
