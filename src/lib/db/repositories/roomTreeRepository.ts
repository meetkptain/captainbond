import { supabaseAdmin } from '@/lib/supabase-admin';
import { Tree, TreeNode, TreeConnection } from '../types';

export async function getTreeByRoom(roomId: string): Promise<Tree | null> {
  const { data, error } = await supabaseAdmin
    .from('Tree')
    .select('*')
    .eq('roomId', roomId)
    .is('coupleId', null)
    .maybeSingle();
  if (error) throw error;
  return data as Tree | null;
}

export async function createTreeForRoom(roomId: string): Promise<Tree> {
  const { data, error } = await supabaseAdmin
    .from('Tree')
    .insert({ roomId, coupleId: null })
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
