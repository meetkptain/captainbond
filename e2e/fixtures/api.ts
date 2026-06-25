import { request } from '@playwright/test';

export interface CreatedRoom {
  roomCode: string;
  roomId: string;
  hostId: string;
  hostToken: string;
}

export interface JoinedPlayer {
  playerId: string;
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
    playerId: body.playerId,
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

export async function cleanupPlayer(playerId: string, roomCode: string, cookies?: string): Promise<void> {
  const context = await request.newContext({
    extraHTTPHeaders: cookies ? { Cookie: cookies } : undefined,
  });
  await context.post('/api/player/delete-me', {
    data: { playerId, roomCode },
  });
  await context.dispose();
}
