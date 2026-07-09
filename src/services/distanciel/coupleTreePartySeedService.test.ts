import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db/repositories/treeRepository', () => ({
  listUserPartyTreeNodes: vi.fn(),
}));
vi.mock('@/lib/db/repositories/coupleTreeRepository', () => ({
  addNode: vi.fn(),
}));

import { listUserPartyTreeNodes } from '@/lib/db/repositories/treeRepository';
import { addNode } from '@/lib/db/repositories/coupleTreeRepository';
import { importPartyAnswersIntoCouple } from './coupleTreePartySeedService';

const mockedList = vi.mocked(listUserPartyTreeNodes);
const mockedAdd = vi.mocked(addNode);

beforeEach(() => {
  vi.clearAllMocks();
  mockedAdd.mockResolvedValue({ id: 'n' } as never);
});

const partyNodes = [
  { id: 'p1', category: 'ICEBREAKER', customText: 'Question inutile ?', intensity: 1 },
  { id: 'p2', category: 'ICEBREAKER', customText: 'Question inutile ?', intensity: 1 }, // dup text
  { id: 'p3', category: 'DEEP', customText: 'Ma plus grande peur', intensity: 2 },
  { id: 'p4', category: 'PARTY', customText: 'Soiree mythique', intensity: 1 }, // excluded
  { id: 'p5', category: 'CHILL', customText: 'Serie boucle', intensity: 1 }, // excluded
];

describe('importPartyAnswersIntoCouple', () => {
  it('imports only ICEBREAKER + DEEP, dedupes by text, as the user own answers', async () => {
    mockedList.mockResolvedValue(partyNodes as never);

    const count = await importPartyAnswersIntoCouple('u1', 't1');

    expect(count).toBe(2); // ICEBREAKER (deduped) + DEEP
    expect(mockedAdd).toHaveBeenCalledTimes(2);
    expect(mockedAdd).toHaveBeenCalledWith('t1', {
      customText: 'Question inutile ?',
      category: 'ICEBREAKER',
      intensity: 1,
      answeredBy: ['u1'],
    });
    expect(mockedAdd).toHaveBeenCalledWith('t1', {
      customText: 'Ma plus grande peur',
      category: 'DEEP',
      intensity: 2,
      answeredBy: ['u1'],
    });
  });

  it('returns 0 and adds nothing when there are no party nodes', async () => {
    mockedList.mockResolvedValue([] as never);
    const count = await importPartyAnswersIntoCouple('u1', 't1');
    expect(count).toBe(0);
    expect(mockedAdd).not.toHaveBeenCalled();
  });
});
