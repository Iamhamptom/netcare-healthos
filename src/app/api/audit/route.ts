import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "audit", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ logs: [] });
  }

  const { prisma } = await import("@/lib/prisma");
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || 50), 200);

  const logs = await prisma.auditLog.findMany({
    where: { practiceId: guard.practiceId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return NextResponse.json({ logs });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "audit");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) return NextResponse.json({ ok: true });

  const body = await request.json();
  const { prisma } = await import("@/lib/prisma");

  await prisma.auditLog.create({
    data: {
      action: String(body.action || "unknown"),
      resource: String(body.resource || ""),
      details: typeof body.details === "string" ? body.details : JSON.stringify(body.details || {}),
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
      userId: guard.user.id,
      practiceId: guard.practiceId,
    },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
