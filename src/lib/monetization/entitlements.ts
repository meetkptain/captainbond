import { supabaseAdmin } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';
import { cacheGet, cacheSet, cacheDelete } from '@/lib/cache';
import { getPackBySku, PackScope } from './catalog';

export interface Entitlements {
  userId: string;
  hasActivePass: boolean;
  passExpiresAt: string | null;
  hasActiveSubscription: boolean;
  subscriptionStatus: string;
  hasLifetime: boolean;
  purchasedPackIds: string[];
  accessibleModes: string[]; // '*' = all
  accessibleFeatures: string[]; // '*' = all
}

export interface RoomPassInfo {
  paidByUserId: string | null;
  passExpiresAt: string | null;
  isActive: boolean;
}

const SUBSCRIPTION_ACTIVE_STATUSES = new Set(['ACTIVE']);

interface PackJoinRow {
  Pack?: { scope?: PackScope | null } | null;
}

interface UserPackJoinRow extends PackJoinRow {
  packId: string;
}

function mergeScopes(packs: { scope: PackScope | null }[]): { modes: Set<string>; features: Set<string> } {
  const modes = new Set<string>();
  const features = new Set<string>();
  for (const p of packs) {
    if (!p.scope) continue;
    if (p.scope.modes) {
      for (const m of p.scope.modes) modes.add(m);
    }
    if (p.scope.features) {
      for (const f of p.scope.features) features.add(f);
    }
  }
  return { modes, features };
}

export async function getUserEntitlements(userId: string): Promise<Entitlements | null> {
  const cacheKey = `entitlements:${userId}`;
  const cached = await cacheGet<Entitlements>(cacheKey);
  if (cached) return cached;

  const now = new Date().toISOString();

  // Récupérer l'utilisateur
  const { data: user, error: userError } = await supabaseAdmin
    .from('User')
    .select('id, activePassExpiresAt, subscriptionStatus')
    .eq('id', userId)
    .maybeSingle();

  if (userError) {
    logger.error('Error fetching user entitlements', { userId }, userError);
    return null;
  }
  if (!user) return null;

  const passExpiresAt = user.activePassExpiresAt ? new Date(user.activePassExpiresAt).toISOString() : null;
  const hasActivePass = !!passExpiresAt && passExpiresAt > now;

  const hasActiveSubscription = SUBSCRIPTION_ACTIVE_STATUSES.has(user.subscriptionStatus);

  // Packs lifetime / thématiques
  const { data: userPacks, error: packsError } = await supabaseAdmin
    .from('UserPack')
    .select('packId, Pack:packId(scope)')
    .eq('userId', userId);

  if (packsError) {
    logger.error('Error fetching user packs', { userId }, packsError);
  }

  const typedUserPacks = (userPacks || []) as UserPackJoinRow[];
  const purchasedPackIds: string[] = typedUserPacks.map((up) => up.packId);
  const hasLifetime = purchasedPackIds.length > 0; // Simplification : tout pack lifetime crée un UserPack

  // Passes temporaires (pour l'historique / analytics)
  const { data: userPasses } = await supabaseAdmin
    .from('UserPass')
    .select('packId, expiresAt, Pack:packId(scope)')
    .eq('userId', userId)
    .gt('expiresAt', now);

  // Scope merge : passes actives + abonnement + lifetime packs
  const activeScopes: { scope: PackScope | null }[] = [];

  if (hasActivePass || hasActiveSubscription) {
    // On considère que Pass / Subscription donnent accès à tout
    activeScopes.push({ scope: { modes: ['*'], features: ['*'] } });
  }

  for (const up of typedUserPacks) {
    activeScopes.push({ scope: up.Pack?.scope ?? null });
  }
  for (const up of (userPasses || []) as UserPackJoinRow[]) {
    activeScopes.push({ scope: up.Pack?.scope ?? null });
  }

  const { modes, features } = mergeScopes(activeScopes);

  const entitlements: Entitlements = {
    userId,
    hasActivePass,
    passExpiresAt,
    hasActiveSubscription,
    subscriptionStatus: user.subscriptionStatus,
    hasLifetime,
    purchasedPackIds,
    accessibleModes: Array.from(modes),
    accessibleFeatures: Array.from(features),
  };

  await cacheSet(cacheKey, entitlements, 60);
  return entitlements;
}

export async function invalidateUserEntitlements(userId: string): Promise<void> {
  await cacheDelete(`entitlements:${userId}`);
}

export function canAccessMode(entitlements: Entitlements | null, modeId: string): boolean {
  if (!entitlements) return false;
  if (entitlements.accessibleModes.includes('*')) return true;
  return entitlements.accessibleModes.includes(modeId);
}

export function canViewProfile(entitlements: Entitlements | null): boolean {
  if (!entitlements) return false;
  if (entitlements.accessibleFeatures.includes('*')) return true;
  return entitlements.accessibleFeatures.includes('profiles') || entitlements.accessibleFeatures.includes('profile');
}

export function canViewCoupleProfile(entitlements: Entitlements | null): boolean {
  if (!entitlements) return false;
  if (entitlements.accessibleFeatures.includes('*')) return true;
  return (
    entitlements.accessibleFeatures.includes('profiles') ||
    entitlements.accessibleFeatures.includes('profile') ||
    entitlements.accessibleFeatures.includes('profile_couple')
  );
}

export async function getRoomPassInfo(roomId: string): Promise<RoomPassInfo> {
  const cacheKey = `roompass:${roomId}`;
  const cached = await cacheGet<RoomPassInfo>(cacheKey);
  if (cached) return cached;

  const { data: room, error } = await supabaseAdmin
    .from('Room')
    .select('paidByUserId, passExpiresAt')
    .eq('id', roomId)
    .maybeSingle();

  if (error || !room) {
    return { paidByUserId: null, passExpiresAt: null, isActive: false };
  }

  const passExpiresAt = room.passExpiresAt ? new Date(room.passExpiresAt).toISOString() : null;
  const isActive = !!passExpiresAt && passExpiresAt > new Date().toISOString();
  const info: RoomPassInfo = {
    paidByUserId: room.paidByUserId ?? null,
    passExpiresAt,
    isActive,
  };

  await cacheSet(cacheKey, info, 30);
  return info;
}

export async function invalidateRoomPassInfo(roomId: string): Promise<void> {
  await cacheDelete(`roompass:${roomId}`);
}

export async function getPlayerEntitlements(playerId: string): Promise<Entitlements | null> {
  const { data: player, error } = await supabaseAdmin
    .from('Player')
    .select('userId')
    .eq('id', playerId)
    .maybeSingle();

  if (error || !player?.userId) return null;
  return getUserEntitlements(player.userId);
}

export async function roomHasActivePass(roomId: string): Promise<boolean> {
  const info = await getRoomPassInfo(roomId);
  return info.isActive;
}

export async function userHasPurchasedPack(userId: string, sku: string): Promise<boolean> {
  const pack = await getPackBySku(sku);
  if (!pack) return false;

  const { data: purchase } = await supabaseAdmin
    .from('Purchase')
    .select('id')
    .eq('userId', userId)
    .eq('packId', pack.id)
    .eq('status', 'COMPLETED')
    .maybeSingle();

  if (purchase) return true;

  const { data: userPack } = await supabaseAdmin
    .from('UserPack')
    .select('id')
    .eq('userId', userId)
    .eq('packId', pack.id)
    .maybeSingle();

  return !!userPack;
}
