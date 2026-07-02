import { describe, it, expect, vi } from 'vitest';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getTreeByRoom, createTreeForRoom, addNode, listNodes, listConnections, createConnection } from '../roomTreeRepository';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'tree-1', roomId: 'room-1', coupleId: null }, error: null }),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: 'tree-2', roomId: 'room-1', coupleId: null }, error: null }),
        })),
      })),
    })),
  },
}));

describe('roomTreeRepository', () => {
  it('fetches a tree by room scoped to room context', async () => {
    const tree = await getTreeByRoom('room-1');
    expect(tree).toMatchObject({ id: 'tree-1', roomId: 'room-1', coupleId: null });
    expect(supabaseAdmin.from).toHaveBeenCalledWith('Tree');
  });

  it('creates a tree for a room', async () => {
    const tree = await createTreeForRoom('room-1');
    expect(tree).toMatchObject({ id: 'tree-2', roomId: 'room-1', coupleId: null });
    expect(supabaseAdmin.from).toHaveBeenCalledWith('Tree');
  });
});
