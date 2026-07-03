import { supabaseAdmin } from '@/lib/supabase-admin';
import { createLogger } from '@/lib/logger';
import { getTreeByCouple } from '@/lib/db/repositories/coupleTreeRepository';
import {
  getTreeProgress,
  upsertTreeProgress,
  getTreeProgressHistory,
} from '@/lib/db/repositories/treeProgressRepository';
import { AppError } from '@/lib/errors';

const logger = createLogger({ route: 'treeProgressService' });

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getPreviousMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function computeTreeProgress(coupleId: string): Promise<void> {
  const month = getCurrentMonth();

  const existing = await getTreeProgress(coupleId, month);
  if (existing) {
    logger.info('Tree progress already exists for month', { coupleId, month });
    return;
  }

  const tree = await getTreeByCouple(coupleId);
  if (!tree) {
    logger.info('No tree found for couple', { coupleId });
    return;
  }

  // Compter les nœuds et connexions
  const [nodesResult, connectionsResult] = await Promise.all([
    supabaseAdmin
      .from('TreeNode')
      .select('id, theme', { count: 'exact' })
      .eq('treeId', tree.id),
    supabaseAdmin
      .from('TreeConnection')
      .select('resonance')
      .eq('treeId', tree.id),
  ]);

  if (nodesResult.error) throw nodesResult.error;
  if (connectionsResult.error) throw connectionsResult.error;

  const nodeCount = nodesResult.count ?? 0;
  const connections = connectionsResult.data ?? [];
  const connectionCount = connections.length;

  // Calculer la similarité moyenne
  const avgSimilarity = connectionCount > 0
    ? connections.reduce((sum, c) => sum + ((c as { resonance: number }).resonance ?? 0), 0) / connectionCount
    : 0;

  // Thème dominant
  const themeCounts: Record<string, number> = {};
  for (const node of (nodesResult.data ?? []) as Array<{ theme: string | null }>) {
    const theme = node.theme || 'general';
    themeCounts[theme] = (themeCounts[theme] || 0) + 1;
  }
  const dominantTheme = Object.entries(themeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'general';

  // Lien le plus fort
  let strongestLink: Record<string, unknown> | null = null;
  if (connectionCount > 0) {
    const sorted = [...connections].sort(
      (a, b) => ((b as { resonance: number }).resonance ?? 0) - ((a as { resonance: number }).resonance ?? 0)
    );
    const strongest = sorted[0] as { sourceId: string; targetId: string; resonance: number };
    strongestLink = {
      sourceId: strongest.sourceId,
      targetId: strongest.targetId,
      resonance: strongest.resonance,
    };
  }

  await upsertTreeProgress({
    coupleId,
    nodeCount,
    connectionCount,
    avgSimilarity: Math.round(avgSimilarity * 100) / 100,
    dominantTheme,
    strongestLink: strongestLink ?? undefined,
    month,
  });

  logger.info('Tree progress computed', { coupleId, month, nodeCount, connectionCount });
}

export async function getCoupleTreeProgress(
  coupleId: string,
  limit = 6
): Promise<Array<{
  month: string;
  nodeCount: number;
  connectionCount: number;
  avgSimilarity: number;
  dominantTheme: string;
  strongestLink: Record<string, unknown> | null;
}>> {
  const history = await getTreeProgressHistory(coupleId, limit);
  return history.map((h) => ({
    month: h.month,
    nodeCount: h.nodeCount,
    connectionCount: h.connectionCount,
    avgSimilarity: h.avgSimilarity,
    dominantTheme: h.dominantTheme,
    strongestLink: h.strongestLink,
  }));
}
