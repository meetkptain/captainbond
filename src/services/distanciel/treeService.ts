import {
  getTreeByCouple,
  createTreeForCouple as createCoupleTreeRecord,
  addNode,
  createConnection,
  findSimilarNodes,
} from '@/lib/db/repositories/coupleTreeRepository';
import {
  getTreeByRoom,
  createTreeForRoom as createRoomTreeRecord,
} from '@/lib/db/repositories/roomTreeRepository';
import { getQuestionById } from '@/lib/db/repositories/questionRepository';
import { Tree, TreeNode } from '@/lib/db/types';
import { getEmbedding } from '@/lib/gemini';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * Creates a semantic tree for a couple if one doesn't exist
 * @param coupleId Unique couple ID
 */
export async function createTreeForCouple(coupleId: string): Promise<Tree> {
  const existing = await getTreeByCouple(coupleId);
  if (existing) return existing;

  return createCoupleTreeRecord(coupleId);
}

/**
 * Creates a semantic tree for a group room if one doesn't exist
 * @param roomId Unique room ID
 */
export async function createTreeForRoom(roomId: string): Promise<Tree> {
  const existing = await getTreeByRoom(roomId);
  if (existing) return existing;

  return createRoomTreeRecord(roomId);
}

interface AddNodeInput {
  questionId?: string | null;
  customText?: string | null;
  answeredBy: string[];
}

/**
 * Adds a node to the neural tree, calculates its embedding,
 * searches for similar nodes in the tree, and creates connections.
 */
export async function addNodeToTree(treeId: string, input: AddNodeInput): Promise<TreeNode> {
  if (!input.questionId && !input.customText) {
    throw new AppError('VALIDATION_ERROR', 'questionId ou customText est requis.');
  }

  // 1. Resolve text to embed, intensity, and category
  let text = '';
  let intensity = 1;
  let category = 'GENERAL';

  if (input.questionId) {
    const question = await getQuestionById(input.questionId);
    if (!question) {
      throw new AppError('NOT_FOUND', `Question avec l'ID ${input.questionId} introuvable.`);
    }
    text = question.text;
    intensity = question.intensityLevel ?? 1;
    category = question.category ?? 'GENERAL';
  } else if (input.customText) {
    text = input.customText;
  }

  // 2. Fetch embedding from Gemini API
  let embedding: number[] | null = null;
  try {
    embedding = await getEmbedding(text);
  } catch (err) {
    logger.error('Failed to fetch embedding from Gemini', { text }, err instanceof Error ? err : new Error(String(err)));
    // We proceed without embedding to keep the game playable even if AI is offline
  }

  // 3. Create the TreeNode
  const node = await addNode(treeId, {
    questionId: input.questionId,
    customText: input.customText,
    intensity,
    category,
    answeredBy: input.answeredBy,
    embedding,
  });

  // 4. If embedding was successful, run similarity resonance check on other tree nodes
  if (embedding && embedding.length > 0) {
    try {
      // Find similar nodes with similarity >= 0.75 (cosine distance <= 0.25)
      const similarNodes = await findSimilarNodes(treeId, embedding, 0.75, 10);

      // Filter out the node itself
      const validMatches = similarNodes.filter((m) => m.id !== node.id);

      for (const match of validMatches) {
        await createConnection({
          treeId,
          sourceId: node.id,
          targetId: match.id,
          resonance: match.resonance,
          type: 'SIMILARITY',
        });
        logger.debug('Created resonance connection in tree', {
          treeId,
          source: node.id,
          target: match.id,
          resonance: match.resonance,
        });
      }
    } catch (err) {
      logger.error('Failed to create tree connections', { treeId, nodeId: node.id }, err instanceof Error ? err : new Error(String(err)));
    }
  }

  return node;
}
