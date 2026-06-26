// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAudioSynthesis, PresentialSound, isPresentialSound } from './useAudioSynthesis';

describe('useAudioSynthesis', () => {
  let audioContextMock: {
    createOscillator: ReturnType<typeof vi.fn>;
    createGain: ReturnType<typeof vi.fn>;
    createBuffer: ReturnType<typeof vi.fn>;
    createBufferSource: ReturnType<typeof vi.fn>;
    createBiquadFilter: ReturnType<typeof vi.fn>;
    currentTime: number;
    sampleRate: number;
    state: string;
    destination: object;
    resume: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    const oscillatorMock = {
      type: '',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const gainMock = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
    const bufferSourceMock = {
      buffer: null as AudioBuffer | null,
      connect: vi.fn(),
      start: vi.fn(),
    };
    const bufferMock = {
      getChannelData: vi.fn(() => new Float32Array(4800)),
    };
    const biquadFilterMock = {
      type: '',
      frequency: { value: 0 },
      connect: vi.fn(),
    };

    audioContextMock = {
      createOscillator: vi.fn(() => oscillatorMock),
      createGain: vi.fn(() => gainMock),
      createBuffer: vi.fn(() => bufferMock),
      createBufferSource: vi.fn(() => bufferSourceMock),
      createBiquadFilter: vi.fn(() => biquadFilterMock),
      currentTime: 0,
      sampleRate: 48000,
      state: 'running',
      destination: {},
      resume: vi.fn(() => Promise.resolve()),
      close: vi.fn(() => Promise.resolve()),
    };

    Object.defineProperty(globalThis, 'window', {
      value: {
        AudioContext: vi.fn(function () {
          return audioContextMock;
        }),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing when muted', () => {
    const { result } = renderHook(() => useAudioSynthesis());
    result.current.play('buzzer', true);
    expect(audioContextMock.createOscillator).not.toHaveBeenCalled();
    expect(audioContextMock.createBufferSource).not.toHaveBeenCalled();
  });

  it('does nothing on the server (no window)', () => {
    const { result } = renderHook(() => useAudioSynthesis());
    const originalWindow = globalThis.window;
    try {
      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      result.current.play('buzzer', false);
      expect(audioContextMock.createOscillator).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
    }
  });

  it('plays buzzer when unmuted', () => {
    const { result } = renderHook(() => useAudioSynthesis());
    result.current.play('buzzer', false);
    expect(globalThis.window.AudioContext).toHaveBeenCalled();
    expect(audioContextMock.createOscillator).toHaveBeenCalled();
  });

  it('plays applause using createBuffer', () => {
    const { result } = renderHook(() => useAudioSynthesis());
    result.current.play('applaudissements', false);
    expect(audioContextMock.createBuffer).toHaveBeenCalledWith(1, expect.any(Number), 48000);
    expect(audioContextMock.createBufferSource).toHaveBeenCalled();
  });

  it('logs warning and does not throw for invalid sound type', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useAudioSynthesis());
    expect(() => result.current.play('invalid_sound' as PresentialSound, false)).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith('Unsupported presential sound type:', 'invalid_sound');
    expect(audioContextMock.createOscillator).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('resumes a suspended AudioContext', () => {
    audioContextMock.state = 'suspended';
    const { result } = renderHook(() => useAudioSynthesis());
    result.current.play('bell', false);
    expect(audioContextMock.resume).toHaveBeenCalled();
  });

  it('closes AudioContext on unmount', () => {
    const { result, unmount } = renderHook(() => useAudioSynthesis());
    result.current.play('bell', false);
    expect(audioContextMock.createOscillator).toHaveBeenCalled();
    unmount();
    expect(audioContextMock.close).toHaveBeenCalled();
  });
});

describe('isPresentialSound', () => {
  it('returns true for valid presential sounds', () => {
    expect(isPresentialSound('gong')).toBe(true);
    expect(isPresentialSound('buzzer')).toBe(true);
    expect(isPresentialSound('chime')).toBe(true);
  });

  it('returns false for invalid values', () => {
    expect(isPresentialSound('explosion')).toBe(false);
    expect(isPresentialSound(123)).toBe(false);
    expect(isPresentialSound(null)).toBe(false);
    expect(isPresentialSound(undefined)).toBe(false);
  });
});
