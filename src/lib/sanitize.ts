/**
 * Shared input sanitization helpers.
 * These are meant to run after Zod validation; they do not replace validation.
 */

export function sanitizeString(input: string): string {
  // Collapse multiple whitespace characters and trim edges.
  return input.replace(/\s+/g, ' ').trim();
}

export function sanitizeRoomCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
}

export function sanitizeUrl(input: string): string {
  try {
    const url = new URL(input);
    // Reject javascript/data schemes to avoid injection vectors.
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return '';
    }
    return url.toString();
  } catch {
    return '';
  }
}
