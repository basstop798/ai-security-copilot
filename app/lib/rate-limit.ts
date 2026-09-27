/**
 * Minimal in-memory per-IP rate limit. Good enough for a single dev
 * server during the hackathon demo — NOT for a real multi-instance
 * production deployment (state is process-local, resets on restart).
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

/** True if this identifier (e.g. client IP) is within its rate limit. */
export function checkRateLimit(id: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const timestamps = (hits.get(id) ?? []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = timestamps[0];
    hits.set(id, timestamps);
    return { allowed: false, retryAfterMs: WINDOW_MS - (now - oldest) };
  }

  timestamps.push(now);
  hits.set(id, timestamps);
  return { allowed: true };
}
