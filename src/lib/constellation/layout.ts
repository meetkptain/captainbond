import type { TreeNode, TreeConnection } from '@/lib/db/types';

export interface StarPosition {
  id: string;
  x: number;
  y: number;
  category: string;
  intensity: number;
  resonance: number;
  answeredBy: string[];
  isPair: boolean;
}

const DEFAULT_CATEGORIES = [
  'CHILL',
  'ICEBREAKER',
  'DEEP',
  'SPICY',
  'DATE',
  'PARTY',
] as const;

function categoryIndex(category: string): number {
  const idx = DEFAULT_CATEGORIES.indexOf(category as (typeof DEFAULT_CATEGORIES)[number]);
  return idx === -1 ? 0 : idx;
}

function daysSince(iso?: string): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 0;
  return Math.max(0, (Date.now() - t) / 86400000);
}

export function computeLayout(
  nodes: TreeNode[],
  connections: TreeConnection[],
  opts?: { width?: number; height?: number },
): StarPosition[] {
  const width = opts?.width ?? 1080;
  const height = opts?.height ?? 1920;
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.42;

  const resonanceMap = new Map<string, number>();
  for (const c of connections) {
    const r = Math.min(1, Math.max(0, c.resonance));
    const curSource = resonanceMap.get(c.sourceId) ?? 0;
    if (r > curSource) resonanceMap.set(c.sourceId, r);
    const curTarget = resonanceMap.get(c.targetId) ?? 0;
    if (r > curTarget) resonanceMap.set(c.targetId, r);
  }

  const perCategoryCount = new Map<string, number>();

  return nodes.map((node) => {
    const idx = categoryIndex(node.category);
    const within = perCategoryCount.get(node.category) ?? 0;
    perCategoryCount.set(node.category, within + 1);

    const sector = (idx / DEFAULT_CATEGORIES.length) * Math.PI * 2;
    const angle = sector + (within % 7) * 0.12;

    const ageDays = daysSince(node.answeredAt);
    const radius = maxR * (0.35 + 0.6 * Math.min(1, ageDays / 30));

    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);

    const resonance = resonanceMap.get(node.id) ?? 0;

    return {
      id: node.id,
      x,
      y,
      category: node.category,
      intensity: node.intensity ?? 1,
      resonance,
      answeredBy: node.answeredBy,
      isPair: resonance > 0,
    };
  });
}
