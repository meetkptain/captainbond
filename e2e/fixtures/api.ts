import { request } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

export interface CreatedRoom {
  roomCode: string;
  roomId: string;
  hostId: string;
  hostToken: string;
}

export interface JoinedPlayer {
  playerName: string;
  roomId: string;
  roomCode: string;
  cookies: string;
}

export async function createRoom(hostName = 'James'): Promise<CreatedRoom> {
  const context = await request.newContext();
  const response = await context.post('/api/room/create', {
    data: { targetType: 'GROUP', playerName: hostName },
    failOnStatusCode: true,
  });
  const body = await response.json();
  await context.dispose();
  return {
    roomCode: body.roomCode,
    roomId: body.roomId,
    hostId: body.hostId,
    hostToken: body.hostToken,
  };
}

export async function joinRoom(roomCode: string, playerName = 'Bond'): Promise<JoinedPlayer> {
  const context = await request.newContext();
  const response = await context.post('/api/room/join', {
    data: { roomCode, playerName, consent: true },
    failOnStatusCode: true,
  });
  const body = await response.json();
  const setCookie = response.headers()['set-cookie'];
  const cookies = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie || '';
  await context.dispose();
  return {
    playerName: body.playerName,
    roomId: body.roomId,
    roomCode: body.roomCode,
    cookies,
  };
}

export async function adminLogin(password: string): Promise<string> {
  const context = await request.newContext();
  const response = await context.post('/api/admin/login', {
    data: { password },
    failOnStatusCode: true,
  });
  const cookie = response.headers()['set-cookie'];
  await context.dispose();
  if (Array.isArray(cookie)) {
    return cookie.join('; ');
  }
  return cookie || '';
}

export async function cleanupPlayer(roomCode: string, cookies?: string): Promise<void> {
  const context = await request.newContext({
    extraHTTPHeaders: cookies ? { Cookie: cookies } : undefined,
  });
  await context.post('/api/player/delete-me', {
    data: { roomCode },
  });
  await context.dispose();
}

export async function cleanupRoom(roomCode: string, hostId: string, hostToken: string): Promise<void> {
  const context = await request.newContext();
  await context.post('/api/room/end', {
    data: { roomCode, hostId, hostToken },
  });
  await context.dispose();
}

export interface CreatedCouple {
  coupleId: string;
  userAId: string;
  userAEmail: string;
  userBId: string;
  userBEmail: string;
  userACookies: string;
  userBCookies: string;
}

export interface CreatedRitual {
  dailyQuestionId: string;
  theme: string;
  text: string;
}

export async function createCouple(): Promise<CreatedCouple> {
  const timestamp = Date.now();
  const userAEmail = `e2e-couple-a-${timestamp}@example.com`;
  const userBEmail = `e2e-couple-b-${timestamp}@example.com`;
  const password = 'E2ETestPassword123!';

  // Create auth users with confirmed emails
  const { data: userA, error: errorA } = await supabaseAdmin.auth.admin.createUser({
    email: userAEmail,
    password,
    email_confirm: true,
  });
  if (errorA || !userA.user) throw errorA || new Error('Failed to create user A');

  const { data: userB, error: errorB } = await supabaseAdmin.auth.admin.createUser({
    email: userBEmail,
    password,
    email_confirm: true,
  });
  if (errorB || !userB.user) throw errorB || new Error('Failed to create user B');

  // Sign in to get sessions
  const { data: sessionA } = await supabaseAdmin.auth.signInWithPassword({
    email: userAEmail,
    password,
  });
  const { data: sessionB } = await supabaseAdmin.auth.signInWithPassword({
    email: userBEmail,
    password,
  });

  const tokenA = sessionA.session?.access_token;
  const tokenB = sessionB.session?.access_token;
  if (!tokenA || !tokenB) throw new Error('Failed to sign in test users');

  const userACookies = `sb-access-token=${tokenA}`;
  const userBCookies = `sb-access-token=${tokenB}`;

  // Create couple as user A
  const context = await request.newContext({
    extraHTTPHeaders: { Authorization: `Bearer ${tokenA}` },
  });
  const response = await context.post('/api/couple/join', {
    data: { partnerId: userB.user.id },
    failOnStatusCode: true,
  });
  const body = await response.json();
  await context.dispose();

  return {
    coupleId: body.couple.id,
    userAId: userA.user.id,
    userAEmail,
    userBId: userB.user.id,
    userBEmail,
    userACookies,
    userBCookies,
  };
}

export async function cleanupCouple(couple: CreatedCouple): Promise<void> {
  // Delete couple
  await supabaseAdmin.from('Couple').delete().eq('id', couple.coupleId);
  // Delete auth users
  await supabaseAdmin.auth.admin.deleteUser(couple.userAId);
  await supabaseAdmin.auth.admin.deleteUser(couple.userBId);
}

export async function createCoupleRitual(coupleId: string, overrides?: Partial<{ text: string; theme: string; intensity: number }>): Promise<CreatedRitual> {
  const theme = overrides?.theme ?? 'RECONNECTION';
  const text = overrides?.text ?? 'Quel petit rituel pourrait nous rapprocher aujourd\'hui ?';
  const intensity = overrides?.intensity ?? 1;
  const now = new Date();
  const releasedAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0).toISOString();

  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .insert({
      coupleId,
      customText: text,
      theme,
      intensity,
      releasedAt,
      isAnswered: false,
      user1Answered: false,
      user2Answered: false,
      isRevealed: false,
      analysisStatus: 'PENDING',
      isSkipped: false,
      isSafeZoneActive: false,
    })
    .select('id, theme, customText')
    .single();

  if (error || !data) throw error || new Error('Failed to create ritual');
  return {
    dailyQuestionId: data.id,
    theme: data.theme,
    text: data.customText,
  };
}
