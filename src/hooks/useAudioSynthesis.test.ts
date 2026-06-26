import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { useAudioSynthesis, PresentialSound } from './useAudioSynthesis';

describe('useAudioSynthesis', () => {
  let audioContextMock: {
    createOscillator: ReturnType<typeof vi.fn>;
    createGain: ReturnType<typeof vi.fn>;
    createBuffer: ReturnType<typeof vi.fn>;
    createBufferSource: ReturnType<typeof vi.fn>;
    currentTime: number;
    sampleRate: number;
    destination: object;
  };
  let playFn: ((sound: PresentialSound, muted: boolean) => void) | null = null;

  function TestComponent() {
    const { play } = useAudioSynthesis();
    playFn = play;
    return null;
  }

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

    audioContextMock = {
      createOscillator: vi.fn(() => oscillatorMock),
      createGain: vi.fn(() => gainMock),
      createBuffer: vi.fn(() => bufferMock),
      createBufferSource: vi.fn(() => bufferSourceMock),
      currentTime: 0,
      sampleRate: 48000,
      destination: {},
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

    playFn = null;
    renderToString(React.createElement(TestComponent));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing when muted', () => {
    if (!playFn) throw new Error('play function not captured');
    playFn('buzzer', true);
    expect(audioContextMock.createOscillator).not.toHaveBeenCalled();
    expect(audioContextMock.createBufferSource).not.toHaveBeenCalled();
  });

  it('plays buzzer when unmuted', () => {
    if (!playFn) throw new Error('play function not captured');
    playFn('buzzer', false);
    expect(globalThis.window.AudioContext).toHaveBeenCalled();
    expect(audioContextMock.createOscillator).toHaveBeenCalled();
  });
});
