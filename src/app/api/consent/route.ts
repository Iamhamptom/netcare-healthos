import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { demoStore } from "@/lib/demo-data";
import { sanitize, clampInt } from "@/lib/validate";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "consent");
  if (isErrorResponse(guard)) return guard;

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId") || undefined;

  if (isDemoMode) {
    return NextResponse.json({ consents: demoStore.getConsents(patientId) });
  }

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = clampInt(parseInt(searchParams.get("limit") || "100", 10) || 100, 1, 100) ?? 100;
  const skip = (page - 1) * limit;

  const { prisma } = await import("@/lib/prisma");
  const where: Record<string, unknown> = { practiceId: guard.practiceId };
  if (patientId) where.patientId = patientId;
  const [consents, total] = await Promise.all([
    prisma.consentRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.consentRecord.count({ where }),
  ]);
  return NextResponse.json({ consents, total, page, limit });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "consent");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  if (!body.patientName || !body.consentType) {
    return NextResponse.json({ error: "Patient name and consent type are required" }, { status: 400 });
  }

  const validTypes = ["treatment", "data_processing", "marketing", "research"];
  if (!validTypes.includes(body.consentType)) {
    return NextResponse.json({ error: "Invalid consent type" }, { status: 400 });
  }

  if (isDemoMode) {
    const c = demoStore.addConsent({
      patientName: sanitize(body.patientName),
      patientId: body.patientId || "",
      consentType: body.consentType,
      granted: body.granted !== false,
      method: body.method || "digital",
      ipAddress: body.ipAddress || "",
      notes: sanitize(body.notes || ""),
    });
    return NextResponse.json({ consent: c }, { status: 201 });
  }

  const { prisma } = await import("@/lib/prisma");
  const consent = await prisma.consentRecord.create({
    data: {
      patientName: sanitize(body.patientName),
      patientId: body.patientId || "",
      consentType: body.consentType,
      granted: body.granted !== false,
      method: body.method || "digital",
      ipAddress: body.ipAddress || "",
      notes: sanitize(body.notes || ""),
      practiceId: guard.practiceId,
    },
  });
  return NextResponse.json({ consent }, { status: 201 });
}

export async function PATCH(request: Request) {
  const guard = await guardRoute(request, "consent");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "Consent ID required" }, { status: 400 });
  }

  if (isDemoMode) {
    const c = demoStore.revokeConsent(body.id);
    if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ consent: c });
  }

  const { prisma } = await import("@/lib/prisma");
  const consent = await prisma.consentRecord.update({
    where: { id: body.id },
    data: { granted: false, revokedAt: new Date() },
  });
  return NextResponse.json({ consent });
}
