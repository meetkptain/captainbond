import { supabaseAdmin } from '@/lib/supabase-admin';
import { Tree, TreeNode, TreeConnection } from '../types';

export async function getTreeByCouple(coupleId: string): Promise<Tree | null> {
  const { data, error } = await supabaseAdmin
    .from('Tree')
    .select('*')
    .eq('coupleId', coupleId)
    .is('roomId', null)
    .maybeSingle();
  if (error) throw error;
  return data as Tree | null;
}

export async function createTreeForCouple(coupleId: string): Promise<Tree> {
  const { data, error } = await supabaseAdmin
    .from('Tree')
    .insert({ coupleId, roomId: null })
    .select()
    .single();
  if (error) throw error;
  return data as Tree;
}

export async function addNode(treeId: string, input: Partial<TreeNode>): Promise<TreeNode> {
  const { data, error } = await supabaseAdmin.from('TreeNode').insert({ ...input, treeId }).select().single();
  if (error) throw error;
  return data as TreeNode;
}

export async function listNodes(treeId: string): Promise<TreeNode[]> {
  const { data, error } = await supabaseAdmin
    .from('TreeNode')
    .select('*')
    .eq('treeId', treeId)
    .order('answeredAt', { ascending: true });
  if (error) throw error;
  return (data || []) as TreeNode[];
}

export async function listConnections(treeId: string): Promise<TreeConnection[]> {
  const { data, error } = await supabaseAdmin.from('TreeConnection').select('*').eq('treeId', treeId);
  if (error) throw error;
  return (data || []) as TreeConnection[];
}

export async function createConnection(input: Partial<TreeConnection>): Promise<TreeConnection> {
  const { data, error } = await supabaseAdmin.from('TreeConnection').insert(input).select().single();
  if (error) throw error;
  return data as TreeConnection;
}

export async function findSimilarNodes(
  treeId: string,
  embedding: number[],
  threshold = 0.75,
  limit = 5
): Promise<{ id: string; resonance: number }[]> {
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
