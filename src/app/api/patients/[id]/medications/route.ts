import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize, validateRequired } from "@/lib/validate";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "medications");
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;

  if (isDemoMode) {
    return NextResponse.json({ medications: demoStore.getMedications(id) });
  }

  const { prisma } = await import("@/lib/prisma");
  const medications = await prisma.medication.findMany({
    where: { patientId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ medications });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "medications");
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;
  const body = await request.json();

  const err = validateRequired(body, ["name"]);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  if (isDemoMode) {
    const med = demoStore.addMedication(id, body);
    return NextResponse.json({ medication: med });
  }

  const { prisma } = await import("@/lib/prisma");
  const medication = await prisma.medication.create({
    data: {
      name: sanitize(body.name),
      dosage: sanitize(body.dosage || ""),
      frequency: sanitize(body.frequency || ""),
      prescriber: sanitize(body.prescriber || ""),
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      active: body.active !== false,
      patientId: id,
    },
  });
  return NextResponse.json({ medication }, { status: 201 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "medications");
  if (isErrorResponse(guard)) return guard;
  const body = await request.json();

  if (!body.medicationId) return NextResponse.json({ error: "Missing medicationId" }, { status: 400 });

  if (isDemoMode) {
    const med = demoStore.updateMedication(body.medicationId, body);
    return NextResponse.json({ medication: med });
  }

  const { prisma } = await import("@/lib/prisma");
  const data: Record<string, unknown> = {};
  if (body.active !== undefined) data.active = body.active;
  if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;

  const medication = await prisma.medication.update({ where: { id: body.medicationId }, data });
  return NextResponse.json({ medication });
}
