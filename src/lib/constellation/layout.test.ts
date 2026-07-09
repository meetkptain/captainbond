import { describe, it, expect } from 'vitest';
import { computeLayout } from './layout';
import type { TreeNode, TreeConnection } from '@/lib/db/types';

function node(id: string, category: string, answeredAt?: string): TreeNode {
  return {
    id,
    treeId: 'tree-1',
    intensity: 2,
    category,
    answeredBy: ['p1', 'p2'],
    ...(answeredAt ? { answeredAt } : {}),
  };
}

describe('computeLayout', () => {
  it('is deterministic for same input', () => {
    const nodes: TreeNode[] = [
      node('n1', 'CHILL'),
      node('n2', 'DEEP'),
      node('n3', 'SPICY', new Date(Date.now() - 10 * 86400000).toISOString()),
    ];
    const a = computeLayout(nodes, []);
    const b = computeLayout(nodes, []);
    expect(a).toEqual(b);
  });

  it('places different categories in different sectors', () => {
    const nodes: TreeNode[] = [node('c1', 'CHILL'), node('d1', 'DEEP')];
    const [chill, deep] = computeLayout(nodes, []);
    expect(chill.x).not.toBe(deep.x);
  });

  it('marks paired nodes with resonance', () => {
    const nodes: TreeNode[] = [node('n1', 'CHILL'), node('n2', 'DEEP')];
    const connections: TreeConnection[] = [
      {
        id: 'conn-1',
        treeId: 'tree-1',
        sourceId: 'n1',
        targetId: 'n2',
        resonance: 0.8,
        type: 'RESONANCE',
      },
    ];
    const positions = computeLayout(nodes, connections);
    const n1 = positions.find((p) => p.id === 'n1')!;
    const n2 = positions.find((p) => p.id === 'n2')!;
    expect(n1.isPair).toBe(true);
    expect(n2.isPair).toBe(true);
    expect(n1.resonance).toBeCloseTo(0.8, 5);
    expect(n2.resonance).toBeCloseTo(0.8, 5);
  });
});
