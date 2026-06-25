import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';
import { RateLimitCheck, RateLimiter } from './api/withApiHandler';
import { logger } from './logger';

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn('UPSTASH_REDIS_REST_URL or TOKEN is missing in production.');
    }
    return null;
  }

  return new Redis({ url, token });
}

const redis = createRedis();

// No-op limiter used when Redis is not configured (local dev convenience).
const noOpLimiter: RateLimiter = async () => ({
  success: true,
  limit: Number.MAX_SAFE_INTEGER,
  remaining: Number.MAX_SAFE_INTEGER,
  reset: 0,
});

function createRatelimit(limit: number, window: Parameters<typeof Ratelimit.slidingWindow>[1]) {
  if (!redis) {
    return { limit: async () => ({ success: true, limit, remaining: limit, reset: 0 }) };
  }
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
  });
}

export const rateLimiters = {
  // Global per-IP safety net.
  ip: createRatelimit(100, '1 m'),
  // Room lifecycle.
  roomCreate: createRatelimit(5, '1 m'),
  // Admin actions.
  adminLogin: createRatelimit(5, '15 m'),
  adminAction: createRatelimit(30, '1 m'),
  adminSync: createRatelimit(5, '1 h'),
  // Host actions.
  hostAction: createRatelimit(60, '1 m'),
  // Monetization.
  checkout: createRatelimit(10, '1 m'),
  // Player actions.
  playerAction: createRatelimit(30, '1 m'),
  deleteMe: createRatelimit(5, '1 h'),
};

function getClientIp(req: NextRequest): string {
  // Cloudflare sets CF-Connecting-IP reliably and cannot be spoofed by clients.
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'anonymous';
}

function normalizeResult(result: {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}): RateLimitCheck {
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: typeof result.reset === 'number' ? result.reset : 0,
  };
}

export function ipLimiter(limiter: { limit: (identifier: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number }> }): RateLimiter {
  if (!redis) return noOpLimiter;

  return async (req) => {
    const ip = getClientIp(req);
    const result = await limiter.limit(ip);
    return normalizeResult(result);
  };
}

export function playerLimiter(playerId: string): RateLimiter {
  if (!redis) return noOpLimiter;

  return async () => {
    const result = await rateLimiters.playerAction.limit(playerId);
    return normalizeResult(result);
  };
}

export function deleteMeLimiter(playerId: string): RateLimiter {
  if (!redis) return noOpLimiter;

  return async () => {
    const result = await rateLimiters.deleteMe.limit(playerId);
    return normalizeResult(result);
  };
}

// Convenience preconfigured limiters for route usage.
export const createRoomLimiter = ipLimiter(rateLimiters.roomCreate);
export const adminLoginLimiter = ipLimiter(rateLimiters.adminLogin);
export const adminActionLimiter = ipLimiter(rateLimiters.adminAction);
export const adminSyncLimiter = ipLimiter(rateLimiters.adminSync);
export const hostActionLimiter = ipLimiter(rateLimiters.hostAction);
export const checkoutLimiter = ipLimiter(rateLimiters.checkout);
export const playerActionIpLimiter = ipLimiter(rateLimiters.playerAction);
export const deleteMeIpLimiter = ipLimiter(rateLimiters.deleteMe);

export async function pingRedis(): Promise<'ok' | 'skipped' | 'error'> {
  if (!redis) return 'skipped';
  try {
    const result = await redis.ping();
    return result === 'PONG' ? 'ok' : 'error';
  } catch (e) {
    logger.error('Redis ping failed', {}, e);
    return 'error';
  }
}
