/**
 * Simple in-memory sliding window rate limiter.
 * Limits: 10 requests per minute, 50 per hour.
 */

const requestLog = new Map<string, number[]>();

const LIMITS = {
  perMinute: { max: 10, windowMs: 60_000 },
  perHour: { max: 50, windowMs: 3_600_000 },
} as const;

// Clean up entries older than 1 hour every 5 minutes
const CLEANUP_INTERVAL = 300_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - LIMITS.perHour.windowMs;
  for (const [ip, timestamps] of requestLog.entries()) {
    const filtered = timestamps.filter((t) => t > cutoff);
    if (filtered.length === 0) {
      requestLog.delete(ip);
    } else {
      requestLog.set(ip, filtered);
    }
  }
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfter?: number;
} {
  cleanup();

  const now = Date.now();
  const timestamps = requestLog.get(ip) ?? [];

  // Check per-minute limit
  const minuteAgo = now - LIMITS.perMinute.windowMs;
  const recentMinute = timestamps.filter((t) => t > minuteAgo);
  if (recentMinute.length >= LIMITS.perMinute.max) {
    const oldestInWindow = recentMinute[0];
    const retryAfter = Math.ceil(
      (oldestInWindow + LIMITS.perMinute.windowMs - now) / 1000
    );
    return { allowed: false, retryAfter };
  }

  // Check per-hour limit
  const hourAgo = now - LIMITS.perHour.windowMs;
  const recentHour = timestamps.filter((t) => t > hourAgo);
  if (recentHour.length >= LIMITS.perHour.max) {
    const oldestInWindow = recentHour[0];
    const retryAfter = Math.ceil(
      (oldestInWindow + LIMITS.perHour.windowMs - now) / 1000
    );
    return { allowed: false, retryAfter };
  }

  // Allowed — record this request
  timestamps.push(now);
  requestLog.set(ip, timestamps);

  return { allowed: true };
}
