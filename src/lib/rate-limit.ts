import { supabaseAdmin } from "./supabase";

// Check if Supabase is available for distributed rate limiting
const USE_SUPABASE_RATE_LIMIT = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

// ─── In-memory fallback (local dev / no Supabase) ───
const hits = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of hits) {
    if (val.resetAt < now) hits.delete(key);
  }
}, 300_000);

function rateLimitInMemory(
  key: string,
  { limit = 30, windowMs = 60_000 }: { limit?: number; windowMs?: number }
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

// ─── Supabase-backed distributed rate limiter ───
async function rateLimitSupabase(
  ip: string,
  route: string,
  { limit = 30 }: { limit?: number; windowMs?: number }
): Promise<{ allowed: boolean; remaining: number }> {
  // Timeout: if Supabase doesn't respond in 3s, fall back to in-memory
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Supabase rate limit timeout")), 3000)
  );
  try {
    return await Promise.race([rateLimitSupabaseInner(ip, route, { limit }), timeout]);
  } catch {
    return rateLimitInMemory(`${ip}:${route}`, { limit });
  }
}

async function rateLimitSupabaseInner(
  ip: string,
  route: string,
  { limit = 30 }: { limit?: number }
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    // Check current count within the last minute
    const { data, error: selectError } = await supabaseAdmin
      .from("ho_rate_limits")
      .select("id, count")
      .eq("ip", ip)
      .eq("route", route)
      .gte("window_start", new Date(Date.now() - 60_000).toISOString())
      .order("window_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (selectError) throw selectError;

    if (!data) {
      // No entry — create one
      const { error: insertError } = await supabaseAdmin
        .from("ho_rate_limits")
        .insert({ ip, route, count: 1 });

      if (insertError) throw insertError;
      return { allowed: true, remaining: limit - 1 };
    }

    // Entry exists — increment
    const newCount = data.count + 1;
    const { error: updateError } = await supabaseAdmin
      .from("ho_rate_limits")
      .update({ count: newCount })
      .eq("id", data.id);

    if (updateError) throw updateError;

    const remaining = Math.max(0, limit - newCount);
    return { allowed: newCount <= limit, remaining };
  } catch {
    // On any Supabase error, fall back to in-memory
    return rateLimitInMemory(`${ip}:${route}`, { limit });
  } finally {
    // Probabilistic cleanup: run on ~10% of requests
    if (Math.random() < 0.1) {
      const cutoff = new Date(Date.now() - 5 * 60_000).toISOString();
      supabaseAdmin
        .from("ho_rate_limits")
        .delete()
        .lt("window_start", cutoff)
        .then(() => {});
    }
  }
}

// ─── Public API ───

export function rateLimit(
  key: string,
  opts: { limit?: number; windowMs?: number } = {}
): { allowed: boolean; remaining: number } {
  return rateLimitInMemory(key, opts);
}

export async function rateLimitByIp(
  request: Request,
  route: string,
  opts?: { limit?: number; windowMs?: number }
): Promise<{ allowed: boolean; remaining: number }> {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";

  if (USE_SUPABASE_RATE_LIMIT) {
    return rateLimitSupabase(ip, route, { limit: opts?.limit ?? 30, windowMs: opts?.windowMs ?? 60_000 });
  }

  return rateLimitInMemory(`${ip}:${route}`, opts ?? {});
}
