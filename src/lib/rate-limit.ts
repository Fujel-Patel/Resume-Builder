/**
 * Rate limiter with per-user and per-IP buckets.
 *
 * - `checkRateLimit(store, key, { max, windowMs })` is a generic primitive.
 * - `checkRateLimitByUserId` / `checkRateLimitByIP` are convenience wrappers.
 *
 * In-memory only: replace `store` with a distributed cache (e.g. Vercel KV)
 * when scaling to multiple server instances.
 */

export type RateLimitStore = Map<string, { timestamps: number[] }>;

let store: RateLimitStore = new Map();

export function resetStore() {
  store = new Map();
}

export interface RateLimitOptions {
  max?: number; // max requests in window (default 20)
  windowMs?: number; // sliding window (default 60_000 = 1 min)
}

export async function checkRateLimit(
  key: string,
  opts: RateLimitOptions = {}
): Promise<{ ok: boolean; remaining: number; retryAfterMs: number }> {
  const max = opts.max ?? 20;
  const windowMs = opts.windowMs ?? 60_000;

  const now = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };
  const recent = entry.timestamps.filter((ts) => now - ts < windowMs);

  const remaining = Math.max(max - recent.length, 0);
  const oldestInWindow = recent.length ? recent[0] : now;
  const retryAfterMs = recent.length >= max ? oldestInWindow + windowMs - now : 0;

  if (recent.length >= max) {
    return { ok: false, remaining: 0, retryAfterMs };
  }

  recent.push(now);
  store.set(key, { timestamps: recent });
  return { ok: true, remaining: remaining - 1, retryAfterMs: 0 };
}

/* Convenience wrappers */

export async function checkRateLimitByUserId(
  userId: string,
  opts: RateLimitOptions = {}
) {
  return checkRateLimit(`user:${userId}`, opts);
}

export async function checkRateLimitByIP(
  ip: string,
  opts: RateLimitOptions = {}
) {
  return checkRateLimit(`ip:${ip}`, opts);
}
