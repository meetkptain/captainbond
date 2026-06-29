'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import type { OrbeState } from '@/lib/db/types';

interface TotemOrbeProps {
  state: OrbeState;
  size?: number;
  className?: string;
  lastRitualAt?: string | null;
  role?: 'A' | 'B';
  onDragProgress?: (progress: number) => void;
  onDragEnd?: () => void;
  onEmitCrossParticle?: (y: number, vy: number, hue: number) => void;
  incomingParticle?: { y: number; vy: number; hue: number } | null;
}

/**
 * Orbe individuel du Totem (Canvas 2D avec bruit de Perlin simplifié).
 * Chaque partenaire voit son propre Orbe sur son téléphone.
 * Supporte le Touch & Drag vers les bordures de l'écran et la Brume WebGL (particules traversantes).
 */
export function TotemOrbe({
  state,
  size = 280,
  className = '',
  lastRitualAt,
  role = 'A',
  onDragProgress,
  onDragEnd,
  onEmitCrossParticle,
  incomingParticle,
}: TotemOrbeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const dragProgressRef = useRef(0);
  const isDraggingRef = useRef(false);
  const incomingParticlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; alpha: number; age: number; hue: number }>>([]);

  // Détection de l'inactivité (sommeil du Totem > 48h)
  const isAsleep = useMemo(() => {
    if (!lastRitualAt) return false;
    const hours = (new Date().getTime() - new Date(lastRitualAt).getTime()) / (1000 * 60 * 60);
    return hours > 48;
  }, [lastRitualAt]);

  // Memoize les couleurs HSL
  const colors = useMemo(() => {
    const hue = state.hue;
    const sat = isAsleep ? 5 : state.saturation;
    const light = isAsleep ? 30 : state.lightness;
    const primary = `hsl(${hue}, ${sat}%, ${light}%)`;
    const secondary = `hsl(${(hue + 40) % 360}, ${sat}%, ${Math.max(10, light - 15)}%)`;
    const glow = `hsla(${hue}, ${sat}%, ${light + 20}%, 0.3)`;
    return { primary, secondary, glow, sat, light };
  }, [state.hue, state.saturation, state.lightness, isAsleep]);

  // Gérer le Touch Event
  const tapParticlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; alpha: number; age: number }>>([]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAsleep) return;
    isDraggingRef.current = true;

    // Légère vibration au toucher initial
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }

    // Générer des éclats de particules au point de contact
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const touchY = e.touches[0].clientY - rect.top;

      // Ajouter 10 particules éphémères
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        tapParticlesRef.current.push({
          x: touchX,
          y: touchY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1.0,
          age: 0,
        });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !onDragProgress) return;
    const touchX = e.touches[0].clientX;
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 360;

    let progress = 0;
    if (role === 'A') {
      // Glisser de gauche à droite (bord droit cible)
      progress = touchX / screenWidth;
    } else {
      // Glisser de droite à gauche (bord gauche cible)
      progress = 1 - touchX / screenWidth;
    }

    // Ajustement de la tolérance tactile : validation dès 95% (environ 25px du bord d'un écran standard)
    progress = Math.max(0, Math.min(1, progress));
    dragProgressRef.current = progress;
    onDragProgress(progress);

    if (progress >= 0.95 && onDragEnd) {
      isDraggingRef.current = false;
      onDragEnd();
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    dragProgressRef.current = 0;
    if (onDragProgress) onDragProgress(0);
  };

  useEffect(() => {
    if (incomingParticle) {
      const startX = role === 'A' ? size - 10 : 10;
      const speedX = role === 'A' ? -1.5 - Math.random() : 1.5 + Math.random();
      incomingParticlesRef.current.push({
        x: startX,
        y: incomingParticle.y * size,
        vx: speedX,
        vy: incomingParticle.vy,
        alpha: 1.0,
        age: 0,
        hue: incomingParticle.hue,
      });
    }
  }, [incomingParticle, role, size]);

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
    const baseRadius = size * 0.32;

    function draw() {
      const pulseFactor = isAsleep ? 0.25 : state.pulseRate;
      timeRef.current += 0.008 * pulseFactor;
      const t = timeRef.current;
      const dragProgress = dragProgressRef.current;

      ctx!.clearRect(0, 0, size, size);

      // --- Aura externe ---
      const auraGrad = ctx!.createRadialGradient(cx, cy, baseRadius * 0.5, cx, cy, baseRadius * 1.8);
      const auraAlpha = isAsleep ? 0.05 : (0.15 + state.energy * 0.1);
      auraGrad.addColorStop(0, `hsla(${state.hue}, ${colors.sat}%, ${colors.light}%, ${auraAlpha})`);
      auraGrad.addColorStop(1, 'transparent');
      ctx!.fillStyle = auraGrad;
      ctx!.fillRect(0, 0, size, size);

      // --- Corps principal (aimanté vers la cible latérale) ---
      ctx!.beginPath();
      const points = 64;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;

        const energyMod = isAsleep ? 0.1 : state.energy;
        const noise1 = Math.sin(angle * 3 + t * 1.2) * 0.08 * energyMod;
        const noise2 = Math.sin(angle * 5 - t * 0.8) * 0.05 * energyMod;
        const noise3 = Math.sin(angle * 2 + t * 2.0) * 0.03;

        // Déformation magnétique vers le bord de destination (aimant)
        let magnetMod = 0;
        if (dragProgress > 0) {
          const targetAngle = role === 'A' ? 0 : Math.PI; // Droite ou Gauche
          const angleDiff = Math.cos(angle - targetAngle);
          if (angleDiff > 0) {
            magnetMod = angleDiff * 0.4 * dragProgress;
          }
        }

        let attachmentMod = 0;
        if (!isAsleep) {
          switch (state.attachmentStyle) {
            case 'anxious':
              attachmentMod = Math.sin(angle * 7 + t * 3) * 0.06;
              break;
            case 'avoidant':
              attachmentMod = 0;
              break;
            case 'disorganized':
              attachmentMod = Math.sin(angle * 11 + t * 4) * 0.08;
              break;
            default:
              attachmentMod = Math.sin(angle * 2 + t * 0.5) * 0.02;
          }
        }

        const r = baseRadius * (1 + noise1 + noise2 + noise3 + attachmentMod + magnetMod);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.closePath();

      const bodyGrad = ctx!.createRadialGradient(
        cx - baseRadius * 0.2,
        cy - baseRadius * 0.2,
        0,
        cx,
        cy,
        baseRadius * 1.2
      );
      bodyGrad.addColorStop(0, `hsla(${(state.hue + 20) % 360}, ${colors.sat + 10}%, ${colors.light + 15}%, ${isAsleep ? 0.7 : 0.95})`);
      bodyGrad.addColorStop(0.5, colors.primary);
      bodyGrad.addColorStop(1, colors.secondary);
      ctx!.fillStyle = bodyGrad;
      ctx!.fill();

      // --- Particules ---
      if (!isAsleep) {
        const particleCount = Math.floor(state.particleDensity * 30);
        for (let p = 0; p < particleCount; p++) {
          const pAngle = (p / particleCount) * Math.PI * 2 + t * 0.3;
          const pDist = baseRadius * (0.3 + Math.sin(t + p * 1.5) * 0.3);
          const px = cx + Math.cos(pAngle) * pDist;
          const py = cy + Math.sin(pAngle) * pDist;
          const pSize = 1.5 + Math.sin(t * 2 + p) * 1;

          ctx!.beginPath();
          ctx!.arc(px, py, pSize, 0, Math.PI * 2);
          ctx!.fillStyle = `hsla(${(state.hue + 60) % 360}, 80%, 80%, ${0.4 + Math.sin(t + p) * 0.3})`;
          ctx!.fill();
        }
      }

      // --- Particules tactiles interactives (Taps) ---
      const activeTapParticles = tapParticlesRef.current;
      for (let i = activeTapParticles.length - 1; i >= 0; i--) {
        const p = activeTapParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03; // s'estompe rapidement
        p.age += 1;

        if (p.alpha <= 0 || p.age > 40) {
          activeTapParticles.splice(i, 1);
          continue;
        }

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 2.5 * p.alpha, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${(state.hue + 120) % 360}, 90%, 80%, ${p.alpha})`;
        ctx!.fill();
      }

      // --- Particules traversantes reçues (Brume WebGL) ---
      const activeIncoming = incomingParticlesRef.current;
      for (let i = activeIncoming.length - 1; i >= 0; i--) {
        const p = activeIncoming[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015;
        p.age += 1;

        if (p.alpha <= 0 || p.age > 80 || (role === 'A' && p.x < -10) || (role === 'B' && p.x > size + 10)) {
          activeIncoming.splice(i, 1);
          continue;
        }

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 3 * p.alpha, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${p.hue}, 95%, 85%, ${p.alpha})`;
        ctx!.fill();

        // Effet de halo brumeux
        const radGrad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10 * p.alpha);
        radGrad.addColorStop(0, `hsla(${p.hue}, 90%, 75%, ${p.alpha * 0.4})`);
        radGrad.addColorStop(1, 'transparent');
        ctx!.fillStyle = radGrad;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 10 * p.alpha, 0, Math.PI * 2);
        ctx!.fill();
      }

      // --- Émission de particules de drag locales vers l'autre écran ---
      if (isDraggingRef.current && dragProgress > 0) {
        // Fréquence d'émission
        if (Math.random() < 0.18) {
          const startX = role === 'A' ? size * 0.4 + dragProgress * (size * 0.5) : size * 0.6 - dragProgress * (size * 0.5);
          const startY = cy + (Math.random() - 0.5) * 30;
          const speedX = role === 'A' ? 2 + Math.random() * 2 : -2 - Math.random() * 2;
          const speedY = (Math.random() - 0.5) * 0.8;

          // Ajouter une particule locale qui va voyager
          tapParticlesRef.current.push({
            x: startX,
            y: startY,
            vx: speedX,
            vy: speedY,
            alpha: 1.0,
            age: 0,
          });
        }
      }

      // Détection des particules locales qui franchissent le bord (et donc s'émettent en réseau)
      const localParticles = tapParticlesRef.current;
      for (let i = localParticles.length - 1; i >= 0; i--) {
        const p = localParticles[i];
        const hasCrossed = role === 'A' ? p.x >= size - 5 : p.x <= 5;
        if (hasCrossed && isDraggingRef.current) {
          if (onEmitCrossParticle) {
            onEmitCrossParticle(p.y / size, p.vy, state.hue);
          }
          localParticles.splice(i, 1); // Retirer localement
        }
      }


      // --- Yeux ---
      const eyeY = cy - baseRadius * 0.15;
      const eyeSpacing = baseRadius * 0.25;

      [cx - eyeSpacing, cx + eyeSpacing].forEach((ex) => {
        ctx!.beginPath();
        if (isAsleep) {
          ctx!.arc(ex, eyeY, 4, 0, Math.PI, true);
          ctx!.strokeStyle = `rgba(255, 255, 255, 0.4)`;
          ctx!.lineWidth = 1.5;
          ctx!.stroke();
        } else {
          const blinkPhase = Math.sin(t * 0.3);
          const eyeSize = blinkPhase > 0.95 ? 1 : 3 + state.energy * 2;
          ctx!.arc(ex, eyeY, eyeSize, 0, Math.PI * 2);
          ctx!.fillStyle = `hsla(0, 0%, 100%, ${0.7 + state.energy * 0.3})`;
          ctx!.fill();
        }
      });

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [state, size, colors, isAsleep, role]);

  return (
    <div
      className={`relative flex items-center justify-center select-none touch-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="drop-shadow-2xl cursor-grab active:cursor-grabbing"
      />
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium opacity-60"
        style={{ color: colors.primary }}
      >
        {isAsleep ? '💤 Sommeil' : state.energy > 0.7 ? '✨ Vibrant' : state.energy > 0.3 ? '🌙 Serein' : '💤 Calme'}
      </div>
    </div>
  );
}
