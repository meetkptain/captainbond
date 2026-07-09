import { listUserPartyTreeNodes } from '@/lib/db/repositories/treeRepository';
import { addNode } from '@/lib/db/repositories/coupleTreeRepository';
import type { TreeNode } from '@/lib/db/types';

/**
 * Categories reused from party answers as couple starter stars (M3 cross-sell).
 * We keep only ICEBREAKER + DEEP — light/chill party noise would dilute the
 * couple resonance signal, and SPICY/PARTY context doesn't transfer cleanly.
 */
const PARTY_SEED_CATEGORIES = new Set(['ICEBREAKER', 'DEEP']);

/**
 * Imports the user's OWN party (room) answers into their couple tree as seed
 * stars. Only the calling user's answers cross context (RGPD-safe: it's their
 * data moving from their party profile to their couple profile). Returns the
 * number of imported nodes.
 */
export async function importPartyAnswersIntoCouple(
  userId: string,
  treeId: string,
): Promise<number> {
  const partyNodes = await listUserPartyTreeNodes(userId, 12);
  const seen = new Set<string>();
  let imported = 0;

  for (const node of partyNodes as TreeNode[]) {
    const category = (node.category || '').toUpperCase();
    if (!PARTY_SEED_CATEGORIES.has(category)) continue;

    const text = (node.customText || '').trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);

    await addNode(treeId, {
      customText: text,
      category,
      intensity: node.intensity ?? 1,
      answeredBy: [userId],
    });
    imported += 1;
  }

  return imported;
}
