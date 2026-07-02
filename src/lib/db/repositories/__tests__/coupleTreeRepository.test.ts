import { describe, it, expect, vi } from 'vitest';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  getTreeByCouple,
  createTreeForCouple,
  addNode,
  listNodes,
  listConnections,
  createConnection,
  findSimilarNodes,
} from '../coupleTreeRepository';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'tree-1', coupleId: 'couple-1', roomId: null }, error: null }),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: 'tree-2', coupleId: 'couple-1', roomId: null }, error: null }),
        })),
      })),
    })),
    rpc: vi.fn().mockResolvedValue({ data: [{ id: 'node-1', resonance: 0.85 }], error: null }),
  },
}));

describe('coupleTreeRepository', () => {
  it('fetches a tree by couple scoped to couple context', async () => {
    const tree = await getTreeByCouple('couple-1');
    expect(tree).toMatchObject({ id: 'tree-1', coupleId: 'couple-1', roomId: null });
    expect(supabaseAdmin.from).toHaveBeenCalledWith('Tree');
  });

  it('creates a tree for a couple', async () => {
    const tree = await createTreeForCouple('couple-1');
    expect(tree).toMatchObject({ id: 'tree-2', coupleId: 'couple-1', roomId: null });
    expect(supabaseAdmin.from).toHaveBeenCalledWith('Tree');
  });

  it('finds similar nodes via RPC', async () => {
    const matches = await findSimilarNodes('tree-1', [0.1, 0.2, 0.3]);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({ id: 'node-1', resonance: 0.85 });
  });
});
