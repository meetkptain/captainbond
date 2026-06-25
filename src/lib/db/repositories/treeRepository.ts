import { supabaseAdmin } from '@/lib/supabase-admin';
import { Tree, TreeNode, TreeConnection } from '../types';

export async function getTreeById(id: string): Promise<Tree | null> {
  const { data, error } = await supabaseAdmin.from('Tree').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Tree | null;
}

export async function getTreeByCouple(coupleId: string): Promise<Tree | null> {
  const { data, error } = await supabaseAdmin.from('Tree').select('*').eq('coupleId', coupleId).maybeSingle();
  if (error) throw error;
  return data as Tree | null;
}

export async function getTreeByRoom(roomId: string): Promise<Tree | null> {
  const { data, error } = await supabaseAdmin.from('Tree').select('*').eq('roomId', roomId).maybeSingle();
  if (error) throw error;
  return data as Tree | null;
}

export async function createTree(input: Partial<Tree>): Promise<Tree> {
  const { data, error } = await supabaseAdmin.from('Tree').insert(input).select().single();
  if (error) throw error;
  return data as Tree;
}

export async function createTreeNode(input: Partial<TreeNode>): Promise<TreeNode> {
  const { data, error } = await supabaseAdmin.from('TreeNode').insert(input).select().single();
  if (error) throw error;
  return data as TreeNode;
}

export async function getTreeNodeById(id: string): Promise<TreeNode | null> {
  const { data, error } = await supabaseAdmin.from('TreeNode').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as TreeNode | null;
}

export async function listTreeNodes(treeId: string): Promise<TreeNode[]> {
  const { data, error } = await supabaseAdmin.from('TreeNode').select('*').eq('treeId', treeId).order('answeredAt', { ascending: true });
  if (error) throw error;
  return data as TreeNode[];
}

export async function createTreeConnection(input: Partial<TreeConnection>): Promise<TreeConnection> {
  const { data, error } = await supabaseAdmin.from('TreeConnection').insert(input).select().single();
  if (error) throw error;
  return data as TreeConnection;
}

export async function listTreeConnections(treeId: string): Promise<TreeConnection[]> {
  const { data, error } = await supabaseAdmin.from('TreeConnection').select('*').eq('treeId', treeId);
  if (error) throw error;
  return data as TreeConnection[];
}

/**
 * Invokes match_tree_nodes RPC to find nodes in the tree that are semantically similar.
 * @param treeId Target neural tree ID
 * @param embedding Query text vector embedding
 * @param threshold Similarity threshold [0, 1]
 * @param limit Max match count
 */
export async function findSimilarTreeNodes(
  treeId: string,
  embedding: number[],
  threshold = 0.75,
  limit = 5
): Promise<{ id: string; resonance: number }[]> {
  // Format embedding as string pgvector representation: '[0.123,0.456,...]'
  const embeddingString = `[${embedding.join(',')}]`;
  const { data, error } = await supabaseAdmin.rpc('match_tree_nodes', {
    query_tree_id: treeId,
    query_embedding: embeddingString,
    match_threshold: threshold,
    match_count: limit,
  });
  if (error) throw error;
  return (data || []) as { id: string; resonance: number }[];
}
