import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";
import { demoUser } from "@/lib/demo-data";
import { db } from "@/lib/db";

/** Standard auth + rate limit guard for API routes. Returns { user, practiceId } or a Response. */
export async function guardRoute(
  request: Request,
  route: string,
  opts?: { limit?: number }
) {
  // Rate limit
  const rl = rateLimitByIp(request, route, { limit: opts?.limit ?? 30 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Demo mode — return demo user with practice
  if (isDemoMode) {
    return {
      user: { id: demoUser.id, practiceId: demoUser.practice.id, role: demoUser.role, name: demoUser.name },
      practiceId: demoUser.practice.id,
    };
  }

  const user = await db.getUserById(session.userId) as Record<string, unknown> | null;
  if (!user?.practiceId) {
    return NextResponse.json({ error: "No practice linked" }, { status: 400 });
  }

  return { user: { id: user.id as string, practiceId: user.practiceId as string, role: user.role as string, name: user.name as string }, practiceId: user.practiceId as string };
}

/** Guard for platform admin routes (Netcare Health OS team only). */
export async function guardPlatformAdmin(
  request: Request,
  route: string,
  opts?: { limit?: number }
) {
  const rl = rateLimitByIp(request, route, { limit: opts?.limit ?? 30 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Demo mode
  if (isDemoMode) {
    return { user: { id: demoUser.id, role: demoUser.role, name: demoUser.name } };
  }

  const user = await db.getUserById(session.userId) as Record<string, unknown> | null;
  if (!user || user.role !== "platform_admin") {
    return NextResponse.json({ error: "Platform admin access required" }, { status: 403 });
  }

  return { user: { id: user.id as string, role: user.role as string, name: user.name as string } };
}

/** Guard for investor portal routes. */
export async function guardInvestor(
  request: Request,
  route: string,
  opts?: { limit?: number }
) {
  const rl = rateLimitByIp(request, route, { limit: opts?.limit ?? 30 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Demo mode
  if (isDemoMode) {
    return { user: { id: demoUser.id, role: demoUser.role, name: demoUser.name } };
  }

  const user = await db.getUserById(session.userId) as Record<string, unknown> | null;
  if (!user || (user.role !== "investor" && user.role !== "platform_admin" && user.role !== "doctor")) {
    return NextResponse.json({ error: "Investor access required" }, { status: 403 });
  }

  return { user: { id: user.id as string, role: user.role as string, name: user.name as string } };
}

/** Check if guardRoute returned an error response */
export function isErrorResponse(result: unknown): result is NextResponse {
  return result instanceof NextResponse;
}
