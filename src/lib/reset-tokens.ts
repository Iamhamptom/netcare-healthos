/**
 * Reset token store — uses Supabase in production, in-memory Map for local dev.
 * On Vercel serverless, in-memory Map is ephemeral (each invocation may be a new instance),
 * so we persist tokens in a Supabase table when SUPABASE_SERVICE_ROLE_KEY is available.
 *
 * Required Supabase table:
 *   CREATE TABLE IF NOT EXISTS ho_reset_tokens (
 *     token TEXT PRIMARY KEY,
 *     user_email TEXT NOT NULL,
 *     expires_at TIMESTAMPTZ NOT NULL,
 *     used BOOLEAN DEFAULT false,
 *     created_at TIMESTAMPTZ DEFAULT now()
 *   );
 */

const USE_SUPABASE = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

// In-memory fallback for local dev
const memoryStore = new Map<string, { email: string; expiresAt: number }>();

// Clean up expired tokens from memory store every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [token, data] of memoryStore) {
      if (data.expiresAt < now) memoryStore.delete(token);
    }
  }, 600_000);
}

async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("./supabase");
  return supabaseAdmin;
}

export const resetTokens = {
  async set(token: string, data: { email: string; expiresAt: number }) {
    if (!USE_SUPABASE) {
      memoryStore.set(token, data);
      return;
    }
    const sb = await getSupabaseAdmin();
    await sb.from("ho_reset_tokens").upsert({
      token,
      user_email: data.email,
      expires_at: new Date(data.expiresAt).toISOString(),
      used: false,
    });
  },

  async get(token: string): Promise<{ email: string; expiresAt: number } | undefined> {
    if (!USE_SUPABASE) {
      return memoryStore.get(token);
    }
    const sb = await getSupabaseAdmin();
    const { data } = await sb
      .from("ho_reset_tokens")
      .select("user_email, expires_at, used")
      .eq("token", token)
      .eq("used", false)
      .single();
    if (!data) return undefined;
    return {
      email: data.user_email,
      expiresAt: new Date(data.expires_at).getTime(),
    };
  },

  async delete(token: string) {
    if (!USE_SUPABASE) {
      memoryStore.delete(token);
      return;
    }
    // Mark as used rather than deleting (audit trail)
    const sb = await getSupabaseAdmin();
    await sb.from("ho_reset_tokens").update({ used: true }).eq("token", token);
  },

  async has(token: string): Promise<boolean> {
    const result = await this.get(token);
    return result !== undefined;
  },
};
