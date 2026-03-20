import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";
import { demoUser, demoUsers, demoPlatformAdmin } from "@/lib/demo-data";
import { db } from "@/lib/db";

/** Standard auth + rate limit guard for API routes. Returns { user, practiceId } or a Response. */
export async function guardRoute(
  request: Request,
  route: string,
  opts?: { limit?: number; roles?: string[] }
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
    const matchedUser = Object.values(demoUsers).find(u => u.id === session.userId) || demoUser;
    const user = { id: matchedUser.id, practiceId: matchedUser.practice.id, role: matchedUser.role, name: matchedUser.name, email: matchedUser.email };

    // Check role if required
    if (opts?.roles && opts.roles.length > 0 && !opts.roles.includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    return { user, practiceId: matchedUser.practice.id };
  }

  const user = await db.getUserById(session.userId) as Record<string, unknown> | null;
  if (!user?.practiceId) {
    return NextResponse.json({ error: "No practice linked" }, { status: 400 });
  }

  const userData = { id: user.id as string, practiceId: user.practiceId as string, role: user.role as string, name: user.name as string, email: (user.email as string) || "" };

  // Check role if required
  if (opts?.roles && opts.roles.length > 0 && !opts.roles.includes(userData.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  return { user: userData, practiceId: user.practiceId as string };
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

  // Demo mode — check if the logged-in user is a platform_admin
  if (isDemoMode) {
    const matchedUser = Object.values(demoUsers).find(u => u.id === session.userId);
    if (matchedUser && matchedUser.role === "platform_admin") {
      return { user: { id: matchedUser.id, role: matchedUser.role, name: matchedUser.name } };
    }
    // Fallback: check the demoPlatformAdmin
    if (session.userId === demoPlatformAdmin.id) {
      return { user: { id: demoPlatformAdmin.id, role: demoPlatformAdmin.role, name: demoPlatformAdmin.name } };
    }
    return NextResponse.json({ error: "Platform admin access required" }, { status: 403 });
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
