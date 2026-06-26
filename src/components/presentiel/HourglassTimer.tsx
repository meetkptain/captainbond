'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface HourglassTimerProps {
  duration: number; // in seconds
  mode: 'manual' | 'automatic' | 'pilot';
  onComplete: () => void;
  onPause?: () => void;
  onResume?: () => void;
  isMuted?: boolean;
}

function playSynthesizedSound(type: 'bell' | 'gong', muted: boolean) {
  if (muted || typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    if (type === 'bell') {
      const freqs = [440, 554, 659, 880];
      const gains = [0.25, 0.15, 0.1, 0.05];
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
  } catch (err) {
    console.warn('AudioContext failed:', err);
  }
}

export function HourglassTimer({
  duration,
  mode,
  onComplete,
  onPause,
  onResume,
  isMuted = false
}: HourglassTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const [transitionCountdown, setTransitionCountdown] = useState(5);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTransition = useCallback(() => {
    requestAnimationFrame(() => {
      setIsTransitioning(true);
      setTransitionCountdown(5);
    });

    transitionIntervalRef.current = setInterval(() => {
      setTransitionCountdown(prev => {
        if (prev <= 1) {
          if (transitionIntervalRef.current) clearInterval(transitionIntervalRef.current);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onComplete]);

  useEffect(() => {
    // Reset timer when duration changes
    requestAnimationFrame(() => {
      setTimeLeft(duration);
      setIsPaused(false);
      setIsTransitioning(false);
      setTransitionCountdown(5);
    });
  }, [duration]);

  useEffect(() => {
    if (isPaused || isTransitioning) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    if (timeLeft <= 0) {
      playSynthesizedSound('bell', isMuted);
      if (mode === 'automatic' || mode === 'pilot') {
        startTransition();
      } else {
        // Manual mode just stops at 0 and waits
        onComplete();
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timeLeft, isPaused, isTransitioning, mode, onComplete, startTransition, isMuted]);

  useEffect(() => {
    return () => {
      if (transitionIntervalRef.current) clearInterval(transitionIntervalRef.current);
    };
  }, []);

  const togglePause = () => {
    setIsPaused(prev => {
      const next = !prev;
      if (next && onPause) onPause();
      if (!next && onResume) onResume();
      return next;
    });
  };

  const skipTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (transitionIntervalRef.current) clearInterval(transitionIntervalRef.current);
    onComplete();
  };

  const progress = duration > 0 ? timeLeft / duration : 0;
  
  // Hourglass SVG sand calculation
  // Max height of sand in top bulb is 50px, shifting y from 25 to 75
  const topSandHeight = 50 * progress;
  const topSandY = 75 - topSandHeight;

  // Max height of sand in bottom bulb is 50px, shifting y from 135 to 85
  const bottomSandHeight = 50 * (1 - progress);
  const bottomSandY = 135 - bottomSandHeight;

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-slate-900/40 border border-slate-800 rounded-3xl backdrop-blur-sm max-w-sm mx-auto">
      {/* SVG Hourglass */}
      <div className="relative flex items-center justify-center w-36 h-48">
        <svg width="120" height="160" viewBox="0 0 120 160" className="drop-shadow-[0_0_15px_rgba(212,175,55,0.15)]">
          {/* Glass frame outlines */}
          <path
            d="M 20 15 L 100 15 A 8 8 0 0 1 100 20 L 100 25 C 100 55, 80 75, 65 79 A 2 2 0 0 0 65 81 C 80 85, 100 105, 100 135 L 100 140 A 8 8 0 0 1 100 145 L 20 145 A 8 8 0 0 1 20 140 L 20 135 C 20 105, 40 85, 55 81 A 2 2 0 0 0 55 79 C 40 75, 20 55, 20 25 L 20 20 A 8 8 0 0 1 20 15 Z"
            stroke="#475569"
            strokeWidth="3.5"
            fill="none"
          />
          
          {/* Wooden Stands (Top & Bottom bases) */}
          <rect x="12" y="7" width="96" height="8" rx="2" fill="#D4AF37" opacity="0.9" />
          <rect x="12" y="145" width="96" height="8" rx="2" fill="#D4AF37" opacity="0.9" />

          {/* Top bulb glass inner background reflection */}
          <path d="M 23 25 C 23 52, 41 71, 56 76 L 64 76 C 79 71, 97 52, 97 25 Z" fill="#1e293b" opacity="0.5" />
          
          {/* Bottom bulb glass inner background reflection */}
          <path d="M 23 135 C 23 108, 41 89, 56 84 L 64 84 C 79 89, 97 108, 97 135 Z" fill="#1e293b" opacity="0.5" />

          {/* TOP SAND (disappearing) */}
          {timeLeft > 0 && (
            <path
              d={`M 25 25 L 95 25 C 95 50, 80 ${topSandY}, 60 ${topSandY} C 40 ${topSandY}, 25 50, 25 25 Z`}
              fill="#D4AF37"
              className="transition-all duration-1000 ease-linear"
            />
          )}

          {/* BOTTOM SAND (accumulating) */}
          <path
            d={`M 25 135 L 95 135 C 95 125, 80 ${bottomSandY}, 60 ${bottomSandY} C 40 ${bottomSandY}, 25 125, 25 135 Z`}
            fill="#D4AF37"
            className="transition-all duration-1000 ease-linear"
          />

          {/* Drip Line of Sand */}
          {timeLeft > 0 && !isPaused && !isTransitioning && (
            <line
              x1="60"
              y1="78"
              x2="60"
              y2="132"
              stroke="#D4AF37"
              strokeWidth="2.5"
              strokeDasharray="4, 3"
              className="animate-[dash_1s_linear_infinite]"
            />
          )}
        </svg>

        {/* Numeric time display (in background or underneath, clean text) */}
        {!isTransitioning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-2">
            <span className="text-xl font-bold font-mono tracking-tight text-slate-100 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* Transition Toast */}
      {isTransitioning && (
        <div className="text-center bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-xl text-sm font-medium animate-pulse">
          Joueur suivant dans <span className="font-bold">{transitionCountdown}</span>s...
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3 w-full">
        {!isTransitioning && (
          <button
            onClick={togglePause}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-slate-200 hover:text-slate-100 font-semibold rounded-xl border border-slate-700/60 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isPaused ? (
              <>
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Reprendre
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pause
              </>
            )}
          </button>
        )}

        <button
          onClick={skipTimer}
          className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-650 text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1"
        >
          {isTransitioning ? 'Suivant' : 'Passer'}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      {/* Styled animation helper for standard React stylesheet */}
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -14;
          }
        }
      `}</style>
    </div>
  );
}
