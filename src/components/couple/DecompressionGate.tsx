'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';

interface Step {
  message: string;
  icon: IconName;
  pulse: boolean;
}

const STEPS: Step[] = [
  { message: 'Posez vos téléphones à plat', icon: 'sprout', pulse: false },
  { message: 'Respirez ensemble', icon: 'heart', pulse: true },
  { message: 'Regardez-vous dans les yeux', icon: 'sparkles', pulse: false },
];

const STEP_DURATION = 20; // seconds per step
const TOTAL_DURATION = STEP_DURATION * STEPS.length;

interface Props {
  onComplete: () => void;
}

export function DecompressionGate({ onComplete }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stepIndex = Math.min(Math.floor(elapsed / STEP_DURATION), STEPS.length - 1);
  const stepElapsed = elapsed - stepIndex * STEP_DURATION;
  const secondsLeft = STEP_DURATION - stepElapsed;

  // SVG circle progress for current step
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const progress = stepElapsed / STEP_DURATION;
  const dashOffset = circumference * (1 - progress);

  const currentStep = STEPS[stepIndex];

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= TOTAL_DURATION) {
          clearInterval(intervalRef.current!);
          return TOTAL_DURATION;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (elapsed >= TOTAL_DURATION) {
      onComplete();
    }
  }, [elapsed, onComplete]);

  return (
    <div style={overlayStyle}>
      {/* Step dots */}
      <div style={dotsStyle}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: i <= stepIndex ? '#ffffff' : 'rgba(255,255,255,0.2)',
              transition: 'background 0.4s',
            }}
          />
        ))}
      </div>

      {/* Central content */}
      <div style={centerStyle}>
        {/* SVG progress ring */}
        <div style={{ position: 'relative', width: 144, height: 144 }}>
          <svg
            width="144"
            height="144"
            viewBox="0 0 144 144"
            style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
          >
            {/* Track */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="4"
            />
            {/* Progress */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            />
          </svg>

          {/* Icon inside ring */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <div
              style={{
                color: '#ffffff',
                animation: currentStep.pulse
                  ? 'decomp-pulse 4s ease-in-out infinite'
                  : undefined,
              }}
            >
              <Icon name={currentStep.icon} style={{ width: 36, height: 36 }} />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
              {secondsLeft}
            </span>
          </div>
        </div>

        {/* Message */}
        <p style={messageStyle}>{currentStep.message}</p>

        {/* Sub-label */}
        <p style={subLabelStyle}>
          Étape {stepIndex + 1} / {STEPS.length}
        </p>
      </div>

      {/* Skip button */}
      <button style={skipStyle} onClick={onComplete}>
        Passer
      </button>

      {/* Keyframes injected via style tag */}
      <style>{`
        @keyframes decomp-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: '#000',
  opacity: 0.97,
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0,
  // override opacity: the div IS the overlay so we need it fully opaque
};

const dotsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  marginBottom: '3rem',
};

const centerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2rem',
};

const messageStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '1.75rem',
  fontWeight: 600,
  textAlign: 'center',
  lineHeight: 1.3,
  maxWidth: 320,
  margin: 0,
  letterSpacing: '-0.01em',
};

const subLabelStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.35)',
  fontSize: '0.8125rem',
  margin: 0,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

const skipStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '2.5rem',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'rgba(255,255,255,0.35)',
  fontSize: '0.8125rem',
  padding: '0.5rem 1.25rem',
  borderRadius: '2rem',
  cursor: 'pointer',
  letterSpacing: '0.04em',
};
