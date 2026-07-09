import {
  createTreeForCouple,
} from '@/services/distanciel/treeService';
import {
  listNodes,
  addNode,
} from '@/lib/db/repositories/coupleTreeRepository';
import { getCoupleById } from '@/lib/db/repositories/coupleRepository';
import { COUPLE_SEED_QUESTIONS } from '@/lib/couple/seedQuestions';
import { AppError } from '@/lib/errors';

/**
 * Seeds a "starter sky" for a couple on creation so the constellation is
 * never empty on day 0.
 *
 * We insert prompt stars directly (no external embedding call) so the seed
 * is reliable on the edge runtime and never blocks couple creation. Real
 * resonance connections are created later by ritual answers, which flow
 * through `addNodeToTree` (embedding + pgvector similarity).
 *
 * Idempotent: if the tree already holds a full set of seed nodes, it is
 * skipped (also protects against re-runs of couple creation).
 */
export async function seedStarterSky(coupleId: string): Promise<void> {
  const couple = await getCoupleById(coupleId);
  if (!couple) {
    throw new AppError('NOT_FOUND', `Couple ${coupleId} introuvable.`);
  }

  const tree = await createTreeForCouple(coupleId);
  const existing = await listNodes(tree.id);
  if (existing.length >= COUPLE_SEED_QUESTIONS.length) {
    return;
  }

  const answeredBy = [couple.user1Id, couple.user2Id];
  for (const question of COUPLE_SEED_QUESTIONS) {
    await addNode(tree.id, {
      customText: question.text,
      category: question.category,
      intensity: question.intensity,
      answeredBy,
    });
  }
}
