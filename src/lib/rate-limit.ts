import 'server-only';

/**
 * In-memory sliding-window rate limiter.
 *
 * Scope and limits: the counter lives in the memory of one serverless
 * instance. On Vercel that means the effective limit is "N per window per warm
 * instance", not a globally exact number. That is deliberate — it stops a
 * single client hammering public tracking or the booking endpoint without
 * adding a Redis dependency to an MVP.
 *
 * If you later need exact global limits (or want to survive a distributed
 * attack), swap this module for Upstash Redis / Vercel KV. The call sites only
 * use `checkRateLimit`, so nothing else changes.
 */

type Bucket = { hits: number[]; };

const buckets = new Map<string, Bucket>();

/** Stops the map growing without bound on a long-lived instance. */
const MAX_BUCKETS = 10_000;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  if (buckets.size > MAX_BUCKETS) buckets.clear();

  const bucket = buckets.get(key) ?? { hits: [] };
  const hits = bucket.hits.filter((timestamp) => timestamp > cutoff);

  if (hits.length >= limit) {
    buckets.set(key, { hits });
    const oldest = hits[0] ?? now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  hits.push(now);
  buckets.set(key, { hits });

  return { allowed: true, remaining: limit - hits.length, retryAfterSeconds: 0 };
}

/**
 * Best-effort client identity. On Vercel `x-forwarded-for` is set by the edge
 * and cannot be spoofed by the client; elsewhere it is a hint, which is why
 * this is only ever used for rate limiting and never for authorisation.
 */
export function clientKey(headers: Headers, prefix: string): string {
  const forwarded = headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown';
  return `${prefix}:${ip}`;
}

export const RATE_LIMITS = {
  /** Public tracking lookups — generous, people retype numbers. */
  tracking: { limit: 30, windowMs: 60_000 },
  /** Bookings from one IP. */
  booking: { limit: 8, windowMs: 10 * 60_000 },
  /** Bulky-goods requests from one IP. */
  bulky: { limit: 6, windowMs: 10 * 60_000 },
  /** Signed upload URLs. */
  upload: { limit: 40, windowMs: 10 * 60_000 },
} as const;
