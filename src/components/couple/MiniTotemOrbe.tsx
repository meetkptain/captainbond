'use client';

import React, { useRef, useEffect } from 'react';

interface MiniTotemOrbeProps {
  score: number;       // Score d'harmonie du jour (0.0 à 1.0)
  hue?: number;        // Couleur dominante de la journée
  size?: number;
  className?: string;
}

/**
 * Mini-Orbe pour le Journal Lumineux (Historique).
 * Dessine une sphère miniature stylisée reflétant l'harmonie ou les tensions de ce jour-là.
 * Extrêmement léger (animation désactivée au repos pour préserver le CPU, s'anime uniquement au survol).
 */
export function MiniTotemOrbe({ score, hue = 220, size = 44, className = '' }: MiniTotemOrbeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

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
    const r = size * 0.35;

    // Dessin statique par défaut (pas de boucle d'animation gourmande pour la liste)
    function drawStatic() {
      ctx!.clearRect(0, 0, size, size);

      // Fond de lueur (Glow)
      const auraGrad = ctx!.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.5);
      auraGrad.addColorStop(0, `hsla(${hue}, 70%, 65%, ${0.2 * score})`);
      auraGrad.addColorStop(1, 'transparent');
      ctx!.fillStyle = auraGrad;
      ctx!.fillRect(0, 0, size, size);

      // Corps du Mini-Orbe (légèrement cabossé si score bas = tension)
      ctx!.beginPath();
      const points = 32;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        // Déformation si tension (score bas)
        const tensionMod = (1 - score) * 0.15 * Math.sin(angle * 5);
        const radius = r * (1 + tensionMod);

        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.closePath();

      const bodyGrad = ctx!.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r * 1.1);
      bodyGrad.addColorStop(0, `hsla(${(hue + 20) % 360}, 80%, 75%, 0.9)`);
      bodyGrad.addColorStop(0.5, `hsl(${hue}, 65%, 55%)`);
      bodyGrad.addColorStop(1, `hsl(${(hue + 40) % 360}, 60%, 40%)`);
      ctx!.fillStyle = bodyGrad;
      ctx!.fill();

      // Faille centrale noire si tension forte
      if (score < 0.6) {
        ctx!.strokeStyle = `rgba(15, 23, 42, ${0.4 + (0.6 - score)})`;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.moveTo(cx, cy - r * 0.5);
        ctx!.lineTo(cx - 2, cy);
        ctx!.lineTo(cx + 1, cy + r * 0.5);
        ctx!.stroke();
      } else {
        // Points lumineux d'alignement
        ctx!.fillStyle = '#FFFFFF';
        ctx!.beginPath();
        ctx!.arc(cx - r * 0.2, cy - r * 0.2, 1.5, 0, Math.PI * 2);
        ctx!.arc(cx + r * 0.2, cy - r * 0.2, 1.5, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    drawStatic();

    // Optionnel : Animation légère lors du hover (gérée par CSS sur le canvas parent)
  }, [score, hue, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className={`transition-transform duration-300 hover:scale-125 cursor-pointer ${className}`}
    />
  );
}
