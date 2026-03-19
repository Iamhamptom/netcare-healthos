// Simple in-memory rate limiter (no external deps)
const hits = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of hits) {
    if (val.resetAt < now) hits.delete(key);
  }
}, 300_000);

export function rateLimit(
  key: string,
  { limit = 30, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  return { allowed: entry.count <= limit, remaining };
}

export function rateLimitByIp(
  request: Request,
  route: string,
  opts?: { limit?: number; windowMs?: number }
) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return rateLimit(`${ip}:${route}`, opts);
}
