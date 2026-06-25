/**
 * Safe JSON parsing helpers.
 * Never throws; returns a default value on malformed input.
 */

export function safeJsonParse<T>(input: string | null | undefined, fallback: T): T {
  if (!input) return fallback;
  try {
    return JSON.parse(input) as T;
  } catch {
    return fallback;
  }
}

export function safeJsonParseRecord(input: string | null | undefined): Record<string, unknown> | null {
  const parsed = safeJsonParse<unknown>(input, null);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as Record<string, unknown>;
  }
  return null;
}
