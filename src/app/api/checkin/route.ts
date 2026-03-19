import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { demoStore } from "@/lib/demo-data";
import { sanitize } from "@/lib/validate";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "checkin");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ checkIns: demoStore.getCheckIns() });
  }

  const { prisma } = await import("@/lib/prisma");
  // Only show today's check-ins
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkIns = await prisma.checkIn.findMany({
    where: { practiceId: guard.practiceId, createdAt: { gte: today } },
    orderBy: { arrivedAt: "asc" },
  });
  return NextResponse.json({ checkIns });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "checkin");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  if (!body.patientName) {
    return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
  }

  if (isDemoMode) {
    const ci = demoStore.addCheckIn({
      patientName: sanitize(body.patientName),
      patientId: body.patientId || "",
      notes: sanitize(body.notes || ""),
    });
    return NextResponse.json({ checkIn: ci }, { status: 201 });
  }

  const { prisma } = await import("@/lib/prisma");
  const checkIn = await prisma.checkIn.create({
    data: {
      patientName: sanitize(body.patientName),
      patientId: body.patientId || "",
      notes: sanitize(body.notes || ""),
      practiceId: guard.practiceId,
    },
  });
  return NextResponse.json({ checkIn }, { status: 201 });
}

export async function PATCH(request: Request) {
  const guard = await guardRoute(request, "checkin");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  if (!body.id || !body.status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  const validStatuses = ["waiting", "in_consultation", "checked_out", "no_show"];
  if (!validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (isDemoMode) {
    const ci = demoStore.updateCheckIn(body.id, { status: body.status, notes: body.notes });
    if (!ci) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ checkIn: ci });
  }

  const { prisma } = await import("@/lib/prisma");
  const data: Record<string, unknown> = { status: body.status };
  if (body.status === "in_consultation") data.seenAt = new Date();
  if (body.status === "checked_out") data.leftAt = new Date();

  const checkIn = await prisma.checkIn.update({
    where: { id: body.id },
    data,
  });
  return NextResponse.json({ checkIn });
}
