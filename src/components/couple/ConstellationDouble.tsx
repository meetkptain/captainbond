'use client';
import { useRef, useEffect } from 'react';
import { computeLayout } from '@/lib/constellation/layout';
import { drawStar, lineAlpha, starColor } from '@/lib/constellation/render';
import type { TreeNode, TreeConnection } from '@/lib/db/types';

export interface ConstellationDoubleProps {
  nodes: TreeNode[];
  connections: TreeConnection[];
  onSelect: (id: string) => void;
  width?: number;
  height?: number;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export default function ConstellationDouble({ nodes, connections, onSelect, width = 1080, height = 1920, canvasRef }: ConstellationDoubleProps) {
  const canvasRefProp = useRef<HTMLCanvasElement>(null);
  // keep latest props for the RAF closure without restarting the loop
  const propsRef = useRef({ nodes, connections, onSelect });
  propsRef.current = { nodes, connections, onSelect };

  useEffect(() => {
    const canvas = canvasRefProp.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const positions = computeLayout(propsRef.current.nodes, propsRef.current.connections, { width, height });

    let raf = 0;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Background: subtle night gradient (no pure black per design: frame 0 must not be black)
      const bg = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height));
      bg.addColorStop(0, '#0b1026');
      bg.addColorStop(1, '#05060f');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Connections first (additive = two-sky overlap glow)
      ctx.globalCompositeOperation = 'lighter';
      for (const c of propsRef.current.connections) {
        const a = positions.find((p) => p.id === c.sourceId);
        const b = positions.find((p) => p.id === c.targetId);
        if (!a || !b) continue;
        ctx.strokeStyle = `rgba(255, 215, 120, ${lineAlpha(c.resonance)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      // Stars
      for (const p of positions) {
        drawStar(ctx, p.x, p.y, 2 + p.intensity, starColor(p.category), t, reduce);
      }
      ctx.globalCompositeOperation = 'source-over';
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw(0);
    return () => cancelAnimationFrame(raf);
  }, [nodes, connections, width, height]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRefProp.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const positions = computeLayout(propsRef.current.nodes, propsRef.current.connections, { width, height });
    let best: { id: string; d: number } | null = null;
    for (const p of positions) {
      const d = Math.hypot(p.x - px, p.y - py);
      if (!best || d < best.d) best = { id: p.id, d };
    }
    if (best && best.d < 40 * (canvas.width / 1080)) propsRef.current.onSelect(best.id);
  };

  return (
    <canvas
      ref={(el) => {
        if (canvasRef) canvasRef.current = el;
        canvasRefProp.current = el;
      }}
      width={width}
      height={height}
      onClick={handleClick}
      className="w-full h-auto rounded-2xl touch-manipulation"
      role="img"
      aria-label="Constellation de résonance du couple"
    />
  );
}
