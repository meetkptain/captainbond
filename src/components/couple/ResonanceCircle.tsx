'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

/* ────────────────────────────── Types ────────────────────────────── */

interface ResonanceCircleProps {
  resonanceScore: number;      // 0 to 1
  partnerAName: string;
  partnerBName: string;
  isRevealed: boolean;         // If false, show blurred/locked state
  isAnimating?: boolean;       // Trigger reveal animation
}

/* ────────────────────────────── Styles ────────────────────────────── */

const keyframes = `
@keyframes rc-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.025); }
}
@keyframes rc-pulse-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.9; }
}
@keyframes rc-reveal-a {
  0% { transform: translateX(-40px) scale(0.85); opacity: 0.3; }
  40% { transform: translateX(10px) scale(1.08); opacity: 0.8; }
  70% { transform: translateX(var(--final-x-a)) scale(1.04); opacity: 1; }
  100% { transform: translateX(var(--final-x-a)) scale(1); opacity: 1; }
}
@keyframes rc-reveal-b {
  0% { transform: translateX(40px) scale(0.85); opacity: 0.3; }
  40% { transform: translateX(-10px) scale(1.08); opacity: 0.8; }
  70% { transform: translateX(var(--final-x-b)) scale(1.04); opacity: 1; }
  100% { transform: translateX(var(--final-x-b)) scale(1); opacity: 1; }
}
@keyframes rc-score-pop {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  60% { transform: scale(1.15) rotate(2deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes rc-shimmer {
  0% { stop-opacity: 0.4; }
  50% { stop-opacity: 0.8; }
  100% { stop-opacity: 0.4; }
}
@keyframes rc-lock-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}
`;

/* ────────────────────────────── Component ────────────────────────────── */

export function ResonanceCircle({
  resonanceScore,
  partnerAName,
  partnerBName,
  isRevealed,
  isAnimating = false,
}: ResonanceCircleProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clamp score
  const score = Math.max(0, Math.min(1, resonanceScore));
  const scorePercent = Math.round(score * 100);

  // Circle geometry — overlap driven by score
  const viewBoxSize = 300;
  const circleR = 75;
  const maxSeparation = circleR * 2; // no overlap
  const minSeparation = 0;           // full overlap
  const separation = maxSeparation - score * (maxSeparation - minSeparation);
  const centerY = viewBoxSize / 2;
  const centerXA = viewBoxSize / 2 - separation / 2;
  const centerXB = viewBoxSize / 2 + separation / 2;

  // CSS custom props for reveal animation endpoints
  const finalXA = useMemo(() => -(separation / 2), [separation]);
  const finalXB = useMemo(() => separation / 2, [separation]);

  // Manage reveal animation timing
  useEffect(() => {
    if (isRevealed && isAnimating && !hasAnimated) {
      setTimeout(() => {
        setHasAnimated(true);
      }, 0);
      const timer = setTimeout(() => setShowScore(true), 1200);
      return () => clearTimeout(timer);
    }
    if (isRevealed && !isAnimating) {
      setTimeout(() => {
        setShowScore(true);
      }, 0);
    }
  }, [isRevealed, isAnimating, hasAnimated]);

  // Reset on un-reveal
  useEffect(() => {
    if (!isRevealed) {
      setTimeout(() => {
        setHasAnimated(false);
        setShowScore(false);
      }, 0);
    }
  }, [isRevealed]);

  /* ── Intersection path (overlap area for blend) ── */
  const overlapD = useMemo(() => {
    if (separation >= circleR * 2) return ''; // no overlap
    const d = separation;
    const r = circleR;
    if (d <= 0) {
      // full overlap — draw full circle
      return `M ${viewBoxSize / 2 - r},${centerY}
              a ${r},${r} 0 1,0 ${r * 2},0
              a ${r},${r} 0 1,0 ${-r * 2},0 Z`;
    }
    const a = Math.acos(d / (2 * r));
    const h = r * Math.sin(a);
    const midX = viewBoxSize / 2;
    return `
      M ${midX},${centerY - h}
      A ${r},${r} 0 0,1 ${midX},${centerY + h}
      A ${r},${r} 0 0,1 ${midX},${centerY - h}
      Z
    `;
  }, [separation, circleR, viewBoxSize, centerY]);

  // Better lens-shaped overlap using proper intersection
  const lensPath = useMemo(() => {
    if (separation >= circleR * 2) return '';
    const d = separation;
    const r = circleR;
    if (d <= 0) {
      return `M ${viewBoxSize / 2 - r},${centerY}
              a ${r},${r} 0 1,0 ${r * 2},0
              a ${r},${r} 0 1,0 ${-r * 2},0 Z`;
    }
    // Intersection points
    const h = Math.sqrt(r * r - (d * d) / 4);
    const midX = viewBoxSize / 2;
    const topY = centerY - h;
    const botY = centerY + h;

    // Arc from top to bottom using circle A (left), then back using circle B (right)
    const largeArc = d < r ? 1 : 0;
    return `
      M ${midX},${topY}
      A ${r},${r} 0 ${largeArc},0 ${midX},${botY}
      A ${r},${r} 0 ${largeArc},0 ${midX},${topY}
      Z
    `;
  }, [separation, circleR, viewBoxSize, centerY]);

  const animating = isRevealed && isAnimating && hasAnimated;
  const settled = isRevealed && !isAnimating;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[320px] mx-auto select-none"
      style={
        {
          '--final-x-a': `${finalXA}px`,
          '--final-x-b': `${finalXB}px`,
        } as React.CSSProperties
      }
      role="img"
      aria-label={
        isRevealed
          ? `Score de résonance: ${scorePercent}% entre ${partnerAName} et ${partnerBName}`
          : 'Résonance scellée'
      }
    >
      <style>{keyframes}</style>

      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="w-full h-auto"
        style={{
          filter: !isRevealed ? 'blur(12px)' : 'none',
          transition: 'filter 0.8s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <defs>
          {/* Rose gradient for Partner A */}
          <radialGradient id="rc-grad-a" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.9">
              {animating && (
                <animate attributeName="stop-opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="2" />
              )}
            </stop>
            <stop offset="100%" stopColor="#e11d48" stopOpacity="0.3" />
          </radialGradient>

          {/* Sky gradient for Partner B */}
          <radialGradient id="rc-grad-b" cx="60%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9">
              {animating && (
                <animate attributeName="stop-opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="2" />
              )}
            </stop>
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3" />
          </radialGradient>

          {/* Overlap blend gradient */}
          <linearGradient id="rc-grad-overlap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7" />
          </linearGradient>

          {/* Score glow filter */}
          <filter id="rc-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Circle glow */}
          <filter id="rc-circle-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Glow layers behind circles */}
        <circle
          cx={centerXA}
          cy={centerY}
          r={circleR}
          fill="#fb7185"
          opacity="0.15"
          filter="url(#rc-circle-glow)"
          style={{
            animation: settled ? 'rc-breathe 4s ease-in-out infinite' : undefined,
            transformOrigin: `${centerXA}px ${centerY}px`,
          }}
        />
        <circle
          cx={centerXB}
          cy={centerY}
          r={circleR}
          fill="#38bdf8"
          opacity="0.15"
          filter="url(#rc-circle-glow)"
          style={{
            animation: settled ? 'rc-breathe 4s ease-in-out infinite 0.5s' : undefined,
            transformOrigin: `${centerXB}px ${centerY}px`,
          }}
        />

        {/* Partner A circle */}
        <g
          style={{
            transformOrigin: `${viewBoxSize / 2}px ${centerY}px`,
            animation: animating
              ? 'rc-reveal-a 1.6s cubic-bezier(0.34,1.56,0.64,1) forwards'
              : settled
                ? 'rc-breathe 4s ease-in-out infinite'
                : undefined,
            transform: settled ? `translateX(${finalXA}px)` : undefined,
          }}
        >
          <circle
            cx={viewBoxSize / 2}
            cy={centerY}
            r={circleR}
            fill="url(#rc-grad-a)"
            stroke="#fb7185"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
        </g>

        {/* Partner B circle */}
        <g
          style={{
            transformOrigin: `${viewBoxSize / 2}px ${centerY}px`,
            animation: animating
              ? 'rc-reveal-b 1.6s cubic-bezier(0.34,1.56,0.64,1) forwards'
              : settled
                ? 'rc-breathe 4s ease-in-out infinite 0.5s'
                : undefined,
            transform: settled ? `translateX(${finalXB}px)` : undefined,
          }}
        >
          <circle
            cx={viewBoxSize / 2}
            cy={centerY}
            r={circleR}
            fill="url(#rc-grad-b)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
        </g>

        {/* Overlap lens */}
        {lensPath && (isRevealed || hasAnimated) && (
          <path
            d={lensPath}
            fill="url(#rc-grad-overlap)"
            style={{
              opacity: showScore ? 1 : 0,
              transition: 'opacity 0.6s ease-in',
              animation: settled ? 'rc-pulse-glow 3s ease-in-out infinite' : undefined,
            }}
          />
        )}

        {/* Score text in center */}
        {showScore && (
          <g
            filter="url(#rc-glow)"
            style={{
              animation: animating || hasAnimated
                ? 'rc-score-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards'
                : undefined,
              transformOrigin: `${viewBoxSize / 2}px ${centerY}px`,
            }}
          >
            <text
              x={viewBoxSize / 2}
              y={centerY - 8}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="36"
              fontWeight="800"
              fontFamily="'Outfit', sans-serif"
              style={{ letterSpacing: '-0.02em' }}
            >
              {scorePercent}%
            </text>
            <text
              x={viewBoxSize / 2}
              y={centerY + 22}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="11"
              fontWeight="500"
              fontFamily="'Inter', sans-serif"
              opacity="0.7"
              style={{ letterSpacing: '0.06em', textTransform: 'uppercase' } as React.CSSProperties}
            >
              résonance
            </text>
          </g>
        )}

        {/* Partner A name */}
        <text
          x={Math.max(45, centerXA)}
          y={centerY + circleR + 24}
          textAnchor="middle"
          fill="#fb7185"
          fontSize="13"
          fontWeight="600"
          fontFamily="'Inter', sans-serif"
          opacity={isRevealed ? 0.9 : 0}
          style={{ transition: 'opacity 0.6s ease' }}
        >
          {partnerAName}
        </text>

        {/* Partner B name */}
        <text
          x={Math.min(viewBoxSize - 45, centerXB)}
          y={centerY + circleR + 24}
          textAnchor="middle"
          fill="#38bdf8"
          fontSize="13"
          fontWeight="600"
          fontFamily="'Inter', sans-serif"
          opacity={isRevealed ? 0.9 : 0}
          style={{ transition: 'opacity 0.6s ease' }}
        >
          {partnerBName}
        </text>
      </svg>

      {/* Locked overlay */}
      {!isRevealed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
          {/* Lock icon SVG */}
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
            style={{ animation: 'rc-lock-pulse 3s ease-in-out infinite' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-400/80"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p
            className="text-sm font-medium text-slate-300/90 tracking-wide"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Scellé jusqu&apos;à 20h
          </p>
        </div>
      )}
    </div>
  );
}
