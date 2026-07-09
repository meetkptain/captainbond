import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db/repositories/coupleRepository', () => ({
  getCoupleById: vi.fn(),
}));
vi.mock('@/lib/db/repositories/coupleTreeRepository', () => ({
  listNodes: vi.fn(),
  addNode: vi.fn(),
}));
vi.mock('@/lib/db/repositories/treeRepository', () => ({
  listUserPartyTreeNodes: vi.fn(),
}));
vi.mock('@/services/distanciel/treeService', () => ({
  createTreeForCouple: vi.fn(),
}));

import { getCoupleById } from '@/lib/db/repositories/coupleRepository';
import { listNodes, addNode } from '@/lib/db/repositories/coupleTreeRepository';
import { listUserPartyTreeNodes } from '@/lib/db/repositories/treeRepository';
import { createTreeForCouple } from '@/services/distanciel/treeService';
import { seedStarterSky } from './coupleTreeSeedService';
import { COUPLE_SEED_QUESTIONS } from '@/lib/couple/seedQuestions';

const mockedGetCouple = vi.mocked(getCoupleById);
const mockedListNodes = vi.mocked(listNodes);
const mockedAddNode = vi.mocked(addNode);
const mockedCreateTree = vi.mocked(createTreeForCouple);
const mockedPartyList = vi.mocked(listUserPartyTreeNodes);

const couple = { id: 'c1', user1Id: 'u1', user2Id: 'u2' };

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetCouple.mockResolvedValue(couple as never);
  mockedCreateTree.mockResolvedValue({ id: 't1' } as never);
  mockedListNodes.mockResolvedValue([] as never);
  mockedAddNode.mockResolvedValue({ id: 'n' } as never);
  mockedPartyList.mockResolvedValue([] as never);
});

describe('seedStarterSky', () => {
  it('seeds one node per seed question with category + intensity + both partners', async () => {
    await seedStarterSky('c1');

    expect(mockedCreateTree).toHaveBeenCalledWith('c1');
    expect(mockedAddNode).toHaveBeenCalledTimes(COUPLE_SEED_QUESTIONS.length);

    const first = COUPLE_SEED_QUESTIONS[0];
    expect(mockedAddNode).toHaveBeenCalledWith('t1', {
      customText: first.text,
      category: first.category,
      intensity: first.intensity,
      answeredBy: ['u1', 'u2'],
    });
  });

  it('is idempotent when the tree already holds a full seed set', async () => {
    mockedListNodes.mockResolvedValue(
      Array.from({ length: COUPLE_SEED_QUESTIONS.length }, (_, i) => ({ id: `n${i}` })) as never,
    );

    await seedStarterSky('c1');

    expect(mockedAddNode).not.toHaveBeenCalled();
  });

  it('throws NOT_FOUND when the couple does not exist', async () => {
    mockedGetCouple.mockResolvedValue(null as never);

    await expect(seedStarterSky('missing')).rejects.toThrow();
    expect(mockedCreateTree).not.toHaveBeenCalled();
  });
});
