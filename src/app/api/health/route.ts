import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const startTime = Date.now();

export async function GET(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rl = rateLimit(`health:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const checks: Record<string, string> = {
    database: "ok",
    supabase: "not_configured",
    ai: "not_configured",
  };

  // Check database (Prisma / SQLite)
  try {
    const { isDemoMode } = await import("@/lib/is-demo");
    if (isDemoMode) {
      checks.database = "ok";
    } else {
      const { prisma } = await import("@/lib/prisma");
      await prisma.$queryRawUnsafe("SELECT 1");
      checks.database = "ok";
    }
  } catch {
    checks.database = "error";
  }

  // Check Supabase
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { supabaseAdmin } = await import("@/lib/supabase");
      const { error } = await supabaseAdmin.from("practices").select("id").limit(1);
      checks.supabase = error ? "error" : "ok";
    } catch {
      checks.supabase = "error";
    }
  }

  // Check AI (Gemini key configured)
  if (process.env.GEMINI_API_KEY) {
    checks.ai = "ok";
  }

  const allHealthy = Object.values(checks).every((v) => v === "ok" || v === "not_configured");

  return NextResponse.json({
    status: allHealthy ? "healthy" : "degraded",
    version: "v54",
    timestamp: new Date().toISOString(),
    checks,
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
}
