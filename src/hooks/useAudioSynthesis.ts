'use client';

import { useCallback } from 'react';

export type PresentialSound =
  | 'buzzer'
  | 'applaudissements'
  | 'rires'
  | 'violon'
  | 'joker_bell'
  | 'bell'
  | 'gong'
  | 'chime';

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  return new AudioContextClass();
}

function playBuzzer(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(100, ctx.currentTime);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}

function playApplause(ctx: AudioContext) {
  const bufferSize = ctx.sampleRate * 0.1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  for (let delay = 0; delay < 0.6; delay += 0.15) {
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    const gain = ctx.createGain();
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.08);
    noise.start(ctx.currentTime + delay);
  }
}

function playLaugh(ctx: AudioContext) {
  for (let delay = 0; delay < 0.5; delay += 0.18) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(250 + Math.random() * 50, ctx.currentTime + delay);
    osc.frequency.exponentialRampToValueAtTime(
      380 + Math.random() * 50,
      ctx.currentTime + delay + 0.12
    );
    gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.12);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.12);
  }
}

function playViolin(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(330, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(360, ctx.currentTime + 0.8);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.6);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
  osc.start();
  osc.stop(ctx.currentTime + 0.8);
}

function playJokerBell(ctx: AudioContext) {
  const freqs = [880, 1109, 1318, 1760];
  freqs.forEach((f, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, ctx.currentTime);
    gain.gain.setValueAtTime(0.05 - idx * 0.01, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2 - idx * 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  });
}

function playBell(ctx: AudioContext) {
  const freqs = [440, 554, 659, 880];
  const gains = [0.3, 0.2, 0.1, 0.05];
  const now = ctx.currentTime;
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gainNode.gain.setValueAtTime(gains[idx], now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 2);
  });
}

function playChime(ctx: AudioContext) {
  const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
  const now = ctx.currentTime;
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.1);
    gainNode.gain.setValueAtTime(0.12, now + idx * 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.8);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now + idx * 0.1);
    osc.stop(now + idx * 0.1 + 0.8);
  });
}

function playGong(ctx: AudioContext) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.exponentialRampToValueAtTime(105, now + 3);
  gainNode.gain.setValueAtTime(0.001, now);
  gainNode.gain.linearRampToValueAtTime(0.5, now + 0.15);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 3.5);

  const chime = ctx.createOscillator();
  const chimeGain = ctx.createGain();
  chime.type = 'sine';
  chime.frequency.setValueAtTime(293.66, now);
  chimeGain.gain.setValueAtTime(0.001, now);
  chimeGain.gain.linearRampToValueAtTime(0.12, now + 0.15);
  chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
  chime.connect(chimeGain);
  chimeGain.connect(ctx.destination);
  chime.start(now);
  chime.stop(now + 2.5);
}

export function useAudioSynthesis() {
  const play = useCallback((sound: PresentialSound, muted: boolean) => {
    if (muted || typeof window === 'undefined') return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      switch (sound) {
        case 'buzzer':
          playBuzzer(ctx);
          break;
        case 'applaudissements':
          playApplause(ctx);
          break;
        case 'rires':
          playLaugh(ctx);
          break;
        case 'violon':
          playViolin(ctx);
          break;
        case 'joker_bell':
          playJokerBell(ctx);
          break;
        case 'bell':
          playBell(ctx);
          break;
        case 'chime':
          playChime(ctx);
          break;
        case 'gong':
          playGong(ctx);
          break;
        default:
          break;
      }
    } catch (e) {
      console.error('Audio synthesis failed:', e);
    }
  }, []);

  return { play };
}
