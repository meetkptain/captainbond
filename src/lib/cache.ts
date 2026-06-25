/**
 * Minimal Redis-backed cache helpers.
 * Gracefully degrades to in-memory only when Redis is not configured.
 */

import { Redis } from '@upstash/redis';

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedis();
const localCache = new Map<string, { value: string; expiresAt: number }>();

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    if (redis) {
      const value = await redis.get<string>(key);
      if (value) return JSON.parse(value) as T;
      return null;
    }

    const entry = localCache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return JSON.parse(entry.value) as T;
    }
    localCache.delete(key);
    return null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    if (redis) {
      await redis.set(key, serialized, { ex: ttlSeconds });
      return;
    }
    localCache.set(key, { value: serialized, expiresAt: Date.now() + ttlSeconds * 1000 });
  } catch {
    // Cache failures should not break business logic.
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    if (redis) {
      await redis.del(key);
      return;
    }
    localCache.delete(key);
  } catch {
    // Ignore.
  }
}
