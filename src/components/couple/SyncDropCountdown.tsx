'use client';

import React, { useState, useEffect, useRef } from 'react';

/* ────────────────────────────── Types ────────────────────────────── */

interface SyncDropCountdownProps {
  targetHour?: number;       // Default 20 (8pm)
  isReady: boolean;          // Both partners have answered
  partnerName: string;       // Name of the partner
  onRevealTime: () => void;  // Callback when 20h arrives
}

/* ────────────────────────────── Styles ────────────────────────────── */

const keyframes = `
@keyframes sd-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}
@keyframes sd-digit-enter {
  from { transform: translateY(-8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes sd-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes sd-glow-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(245,158,11,0.1), inset 0 0 20px rgba(245,158,11,0.03); }
  50% { box-shadow: 0 0 40px rgba(245,158,11,0.2), inset 0 0 30px rgba(245,158,11,0.06); }
}
@keyframes sd-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes sd-celebrate-ring {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1.6); opacity: 0; }
}
@keyframes sd-celebrate-check {
  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes sd-star-1 {
  0% { transform: translate(0,0) scale(1); opacity: 1; }
  100% { transform: translate(-50px,-70px) scale(0); opacity: 0; }
}
@keyframes sd-star-2 {
  0% { transform: translate(0,0) scale(1); opacity: 1; }
  100% { transform: translate(60px,-60px) scale(0); opacity: 0; }
}
@keyframes sd-star-3 {
  0% { transform: translate(0,0) scale(1); opacity: 1; }
  100% { transform: translate(-30px,-90px) scale(0); opacity: 0; }
}
@keyframes sd-star-4 {
  0% { transform: translate(0,0) scale(1); opacity: 1; }
  100% { transform: translate(45px,-50px) scale(0); opacity: 0; }
}
@keyframes sd-dot-pulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
`;

/* ────────────────────────────── Helpers ────────────────────────────── */

function getSecondsUntilTarget(targetHour: number): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(targetHour, 0, 0, 0);

  // If already past target hour today, time has arrived (or passed)
  if (now >= target) return 0;
  return Math.floor((target.getTime() - now.getTime()) / 1000);
}

function formatTime(totalSeconds: number): { hours: string; minutes: string; seconds: string } {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
  };
}

/* ────────────────────────────── Sub-components ────────────────────────────── */

function DigitBox({ value, label }: { value: string; label: string }) {
  const prevRef = useRef(value);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value;
      setAnimKey((k) => k + 1);
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex items-center justify-center w-[72px] h-[88px] md:w-[96px] md:h-[112px] rounded-2xl border border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          animation: 'sd-glow-pulse 4s ease-in-out infinite',
        }}
      >
        {/* Shimmer line */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 30%, rgba(245,158,11,0.06) 50%, transparent 70%)',
              backgroundSize: '200% 100%',
              animation: 'sd-shimmer 3s ease-in-out infinite',
            }}
          />
        </div>

        <span
          key={animKey}
          className="text-4xl md:text-5xl font-black tracking-tight"
          style={{
            fontFamily: "'Outfit', 'ui-monospace', 'SFMono-Regular', monospace",
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 40%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'sd-digit-enter 0.3s ease-out',
          }}
        >
          {value}
        </span>
      </div>
      <span
        className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-[0.15em]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex flex-col items-center gap-2 pt-1 pb-6">
      <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" style={{ animation: 'sd-dot-pulse 1.5s ease-in-out infinite' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" style={{ animation: 'sd-dot-pulse 1.5s ease-in-out infinite 0.3s' }} />
    </div>
  );
}

function CelebrationEffect() {
  const stars = [
    { color: '#f59e0b', anim: 'sd-star-1', delay: '0s' },
    { color: '#fb7185', anim: 'sd-star-2', delay: '0.1s' },
    { color: '#c084fc', anim: 'sd-star-3', delay: '0.15s' },
    { color: '#fbbf24', anim: 'sd-star-4', delay: '0.08s' },
    { color: '#38bdf8', anim: 'sd-star-1', delay: '0.2s' },
    { color: '#34d399', anim: 'sd-star-2', delay: '0.25s' },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
      {/* Expanding rings */}
      {[0, 0.3, 0.6].map((delay, i) => (
        <div
          key={i}
          className="absolute w-24 h-24 rounded-full border-2 border-amber-400/40"
          style={{ animation: `sd-celebrate-ring 1.5s ease-out ${delay}s infinite` }}
        />
      ))}
      {/* Star particles */}
      {stars.map((s, i) => (
        <svg
          key={i}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={s.color}
          className="absolute"
          style={{
            animation: `${s.anim} 1s ease-out ${s.delay} forwards`,
          }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

/* ────────────────────────────── Main Component ────────────────────────────── */

export function SyncDropCountdown({
  targetHour = 20,
  isReady,
  partnerName,
  onRevealTime,
}: SyncDropCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsUntilTarget(targetHour));
  const [revealed, setRevealed] = useState(false);
  const onRevealRef = useRef(onRevealTime);

  useEffect(() => {
    onRevealRef.current = onRevealTime;
  }, [onRevealTime]);

  // Live countdown
  useEffect(() => {
    if (!isReady || revealed) return;

    const tick = () => {
      const remaining = getSecondsUntilTarget(targetHour);
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        setRevealed(true);
        onRevealRef.current();
      }
    };

    tick(); // initial
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isReady, targetHour, revealed]);

  // Check on mount if already past
  useEffect(() => {
    if (isReady && getSecondsUntilTarget(targetHour) <= 0 && !revealed) {
      setTimeout(() => {
        setRevealed(true);
        onRevealRef.current();
      }, 0);
    }
  }, [isReady, targetHour, revealed]);

  const { hours, minutes, seconds } = formatTime(secondsLeft);
  const formattedTargetHour = `${String(targetHour).padStart(2, '0')}h00`;

  return (
    <div className="w-full max-w-md mx-auto">
      <style>{keyframes}</style>

      <div className="relative flex flex-col items-center text-center">
        {/* ── Waiting for partner ── */}
        {!isReady && (
          <div
            className="flex flex-col items-center gap-5 py-8"
            style={{ animation: 'sd-pulse 3s ease-in-out infinite' }}
          >
            {/* Waiting icon */}
            <div className="relative flex items-center justify-center w-20 h-20">
              <div
                className="absolute inset-0 rounded-full border border-amber-400/20"
                style={{ animation: 'sd-celebrate-ring 3s ease-out infinite' }}
              />
              <div className="w-16 h-16 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-400/80"
                  aria-hidden="true"
                  style={{ animation: 'sd-float 3s ease-in-out infinite' }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <p
                className="text-base font-medium text-slate-200 leading-relaxed"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                En attente de la réponse de{' '}
                <span className="text-amber-300 font-semibold">{partnerName}</span>
              </p>
              {/* Animated dots */}
              <div className="flex items-center justify-center gap-1.5">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-amber-400/60"
                    style={{ animation: `sd-dot-pulse 1.5s ease-in-out ${delay}s infinite` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Countdown ── */}
        {isReady && !revealed && (
          <div className="flex flex-col items-center gap-6 py-4">
            {/* Sealed badge */}
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-400"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span
                className="text-sm font-semibold text-slate-200 tracking-wide"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Vos réponses sont scellées
              </span>
            </div>

            {/* Timer digits */}
            <div
              className="flex items-center gap-3 md:gap-4"
              role="timer"
              aria-label={`${hours} heures ${minutes} minutes ${seconds} secondes restantes`}
            >
              <DigitBox value={hours} label="heures" />
              <Separator />
              <DigitBox value={minutes} label="minutes" />
              <Separator />
              <DigitBox value={seconds} label="secondes" />
            </div>

            {/* Sub-text */}
            <p
              className="text-sm text-slate-400 font-medium tracking-wide"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Rendez-vous ce soir à{' '}
              <span
                className="font-bold"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {formattedTargetHour}
              </span>
            </p>
          </div>
        )}

        {/* ── Reveal celebration ── */}
        {revealed && (
          <div className="relative flex flex-col items-center gap-5 py-8">
            <CelebrationEffect />

            <div
              className="flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/15 border-2 border-amber-400/50"
              style={{
                animation: 'sd-celebrate-check 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
                boxShadow: '0 0 40px rgba(245,158,11,0.3)',
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3
                className="text-xl font-bold text-slate-100"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                C&apos;est l&apos;heure !
              </h3>
              <p
                className="text-sm text-amber-300/80 font-medium"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Découvrez votre résonance ensemble
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
