'use client';

import { useRef, useEffect, useMemo } from 'react';
import type { FusionState } from '@/lib/db/types';

interface TotemFusionProps {
  state: FusionState;
  size?: number;
  className?: string;
}

// Couleurs de texture
const TEXTURE_COLORS: Record<FusionState['fusionTexture'], { h: number; s: number; l: number }> = {
  silk: { h: 260, s: 60, l: 60 },
  mercury: { h: 200, s: 30, l: 70 },
  crystal: { h: 180, s: 80, l: 65 },
  obsidian: { h: 0, s: 0, l: 15 },
  gold: { h: 45, s: 90, l: 55 },
  quartz: { h: 320, s: 40, l: 75 },
};

/**
 * Sphère de Fusion du Couple — affichée quand les téléphones sont côte à côte.
 * Visualise l'harmonie, la tension et la faille du couple.
 */
export function TotemFusion({ state, size = 320, className = '' }: TotemFusionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const textureColor = useMemo(() => TEXTURE_COLORS[state.fusionTexture] || TEXTURE_COLORS.silk, [state.fusionTexture]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const baseRadius = size * 0.35;

    function draw() {
      timeRef.current += 0.006;
      const t = timeRef.current;

      ctx!.clearRect(0, 0, size, size);

      // --- Aura de harmonie ---
      const auraSize = baseRadius * (1.5 + state.harmonyRate * 0.5);
      const auraGrad = ctx!.createRadialGradient(cx, cy, baseRadius * 0.3, cx, cy, auraSize);
      auraGrad.addColorStop(0, `hsla(${textureColor.h}, ${textureColor.s}%, ${textureColor.l}%, ${0.2 * state.harmonyRate})`);
      auraGrad.addColorStop(1, 'transparent');
      ctx!.fillStyle = auraGrad;
      ctx!.fillRect(0, 0, size, size);

      // --- Sphère de Fusion principale ---
      // Deux demi-sphères qui fusionnent ou se repoussent
      const separation = state.tensionLevel * baseRadius * 0.3;
      const leftCx = cx - separation;
      const rightCx = cx + separation;

      // Demi-sphère A (gauche)
      drawFluidOrb(ctx!, leftCx, cy, baseRadius * 0.8, t, textureColor.h, state.harmonyRate);
      // Demi-sphère B (droite)
      drawFluidOrb(ctx!, rightCx, cy, baseRadius * 0.8, t + Math.PI, (textureColor.h + 60) % 360, state.harmonyRate);

      // --- Zone de fusion (intersection) ---
      if (state.harmonyRate > 0.2) {
        const fusionGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 0.6 * state.harmonyRate);
        fusionGrad.addColorStop(0, `hsla(${(textureColor.h + 30) % 360}, 80%, 80%, ${state.harmonyRate * 0.6})`);
        fusionGrad.addColorStop(1, 'transparent');
        ctx!.globalCompositeOperation = 'screen';
        ctx!.fillStyle = fusionGrad;
        ctx!.beginPath();
        ctx!.arc(cx, cy, baseRadius * 0.6 * state.harmonyRate, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.globalCompositeOperation = 'source-over';
      }

      // --- Faille de tension ---
      if (state.faultLineVisible) {
        const faultWidth = 2 + state.tensionLevel * 3;
        ctx!.strokeStyle = `rgba(0, 0, 0, ${0.3 + state.tensionLevel * 0.5})`;
        ctx!.lineWidth = faultWidth;
        ctx!.beginPath();
        const faultAmplitude = baseRadius * 0.4 * state.tensionLevel;
        for (let fy = cy - baseRadius * 0.6; fy <= cy + baseRadius * 0.6; fy += 2) {
          const fx = cx + Math.sin((fy - cy) * 0.05 + t * 2) * faultAmplitude;
          if (fy === cy - baseRadius * 0.6) ctx!.moveTo(fx, fy);
          else ctx!.lineTo(fx, fy);
        }
        ctx!.stroke();

        // Lueur rouge le long de la faille
        ctx!.shadowColor = `hsla(0, 90%, 50%, ${state.tensionLevel * 0.5})`;
        ctx!.shadowBlur = 15;
        ctx!.stroke();
        ctx!.shadowBlur = 0;
      }

      // --- Onde de choc synchrone (quand syncScore élevé) ---
      if (state.syncScore > 0.6) {
        const wavePhase = (t * 2) % (Math.PI * 2);
        const waveRadius = baseRadius * (0.8 + Math.sin(wavePhase) * 0.3);
        const waveAlpha = (1 - Math.sin(wavePhase)) * 0.15 * state.syncScore;
        ctx!.strokeStyle = `hsla(${textureColor.h}, 70%, 80%, ${waveAlpha})`;
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.arc(cx, cy, waveRadius, 0, Math.PI * 2);
        ctx!.stroke();
      }

      // --- Stade d'évolution (couronne de particules) ---
      const crownCount = state.evolutionStage * 3;
      for (let c = 0; c < crownCount; c++) {
        const cAngle = (c / crownCount) * Math.PI * 2 + t * 0.15;
        const cDist = baseRadius * 1.2 + Math.sin(t + c * 0.8) * 8;
        const cpx = cx + Math.cos(cAngle) * cDist;
        const cpy = cy + Math.sin(cAngle) * cDist;
        ctx!.beginPath();
        ctx!.arc(cpx, cpy, 2, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${textureColor.h}, 60%, 80%, ${0.4 + Math.sin(t * 2 + c) * 0.3})`;
        ctx!.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [state, size, textureColor]);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="drop-shadow-2xl"
      />
      {/* Indicateurs */}
      <div className="flex items-center gap-4 mt-3 text-xs opacity-70">
        <span style={{ color: `hsl(${textureColor.h}, 60%, 70%)` }}>
          ♾️ Harmonie {Math.round(state.harmonyRate * 100)}%
        </span>
        <span style={{ color: state.faultLineVisible ? '#ef4444' : '#6b7280' }}>
          ⚡ Tension {Math.round(state.tensionLevel * 100)}%
        </span>
        <span className="text-amber-400">
          🌱 Stade {state.evolutionStage}
        </span>
      </div>
    </div>
  );
}

/** Dessine un orbe fluide individuel (demi-sphère de la fusion) */
function drawFluidOrb(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  t: number,
  hue: number,
  harmony: number
) {
  ctx.beginPath();
  const points = 48;
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const noise = Math.sin(angle * 4 + t * 1.5) * 0.06 * (1 - harmony * 0.5);
    const r = radius * (1 + noise);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const grad = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.2, 0, cx, cy, radius);
  grad.addColorStop(0, `hsla(${hue}, 70%, 70%, 0.9)`);
  grad.addColorStop(0.6, `hsla(${hue}, 60%, 50%, 0.7)`);
  grad.addColorStop(1, `hsla(${hue}, 50%, 30%, 0.5)`);
  ctx.fillStyle = grad;
  ctx.fill();
}
