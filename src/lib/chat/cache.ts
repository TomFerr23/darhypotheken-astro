/**
 * Simple in-memory response cache with 1-hour TTL.
 */

const TTL_MS = 3_600_000; // 1 hour

interface CacheEntry {
  response: string;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Normalize a cache key: lowercase, trim, remove punctuation.
 */
function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Get a cached response. Returns null if not found or expired.
 */
export function get(key: string): string | null {
  const normalized = normalizeKey(key);
  const entry = cache.get(normalized);

  if (!entry) return null;

  if (Date.now() - entry.timestamp > TTL_MS) {
    cache.delete(normalized);
    return null;
  }

  return entry.response;
}

/**
 * Cache a response.
 */
export function set(key: string, response: string): void {
  const normalized = normalizeKey(key);
  cache.set(normalized, { response, timestamp: Date.now() });
}
