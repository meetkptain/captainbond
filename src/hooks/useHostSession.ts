'use client';

import { useMemo } from 'react';
import { safeJsonParseRecord } from '@/lib/json';

export interface HostSession {
  hostId: string | null;
  hostToken: string | null;
}

export function getHostSession(roomCode: string): HostSession {
  if (typeof window === 'undefined') return { hostId: null, hostToken: null };
  const raw = sessionStorage.getItem(`host_${roomCode}`) || '{}';
  const parsed = safeJsonParseRecord(raw);
  return {
    hostId: typeof parsed?.hostId === 'string' ? parsed.hostId : null,
    hostToken: typeof parsed?.hostToken === 'string' ? parsed.hostToken : null,
  };
}

export function useHostSession(roomCode: string): HostSession {
  return useMemo(() => getHostSession(roomCode), [roomCode]);
}
