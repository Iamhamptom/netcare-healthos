import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";
import { demoPractices } from "@/lib/demo-data";

export async function GET(request: Request) {
  const guard = await guardPlatformAdmin(request, "admin-practices");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ practices: demoPractices });
  }

  const { prisma } = await import("@/lib/prisma");
  const practices = await prisma.practice.findMany({
    include: {
      _count: { select: { patients: true, bookings: true, invoices: true, users: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ practices });
}

/** PATCH /api/admin/practices — Update a practice (plan, status, settings) */
export async function PATCH(request: Request) {
  const guard = await guardPlatformAdmin(request, "admin-practices");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Practice ID required" }, { status: 400 });

  // Only allow safe fields to be updated
  const allowedFields = ["plan", "planStatus", "name", "type", "phone", "address", "bookingEnabled", "trialEndsAt"];
  const safeUpdates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in updates) safeUpdates[key] = updates[key];
  }

  if (isDemoMode) {
    return NextResponse.json({ practice: { id, ...safeUpdates }, message: "Updated (demo)" });
  }

  const { prisma } = await import("@/lib/prisma");
  const practice = await prisma.practice.update({
    where: { id },
    data: safeUpdates,
  });
  return NextResponse.json({ practice });
}
