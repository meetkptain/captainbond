// Category → hue (degrees). From design doc: CHILL bleu doux, ICEBREAKER vert, DEEP violet, SPICY rose/ambre, DATE ambre, PARTY violet clair.
export const CAT_HUE: Record<string, number> = {
  CHILL: 205,
  ICEBREAKER: 160,
  DEEP: 265,
  SPICY: 330,
  DATE: 45,
  PARTY: 280,
};
export const starColor = (cat: string): string =>
  `hsl(${CAT_HUE[cat] ?? 265} 80% 70%)`;

export const lineAlpha = (r: number): number => {
  const v = Math.max(0, Math.min(1, r));
  return 0.15 + 0.85 * v;
};

export function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  t: number,
  reduce: boolean,
): void {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glowR = r * 4;
  const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  glow.addColorStop(0, color);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, glowR, 0, Math.PI * 2);
  ctx.fill();
  // core dot
  ctx.fillStyle = color;
  const core = reduce ? r : r * (1 + 0.15 * Math.sin(t * 0.003 + x));
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.5, core), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
