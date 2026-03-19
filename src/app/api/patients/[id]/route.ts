import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize } from "@/lib/validate";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "patients");
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;

  if (isDemoMode) {
    const patient = demoStore.getPatient(id);
    if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ patient });
  }

  const { prisma } = await import("@/lib/prisma");
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      allergies: true,
      medications: { orderBy: { createdAt: "desc" } },
      medicalRecords: { orderBy: { date: "desc" }, take: 20 },
      vitals: { orderBy: { recordedAt: "desc" }, take: 10 },
    },
  });
  if (!patient || patient.practiceId !== guard.practiceId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ patient });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "patients");
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;
  const body = await request.json();

  if (isDemoMode) {
    const patient = demoStore.updatePatient(id, body);
    if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ patient });
  }

  const { prisma } = await import("@/lib/prisma");
  const existing = await prisma.patient.findUnique({ where: { id } });
  if (!existing || existing.practiceId !== guard.practiceId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  const stringFields = ["name", "phone", "email", "gender", "idNumber", "address", "medicalAid", "medicalAidNo", "bloodType", "emergencyName", "emergencyPhone", "notes", "status"];
  for (const f of stringFields) {
    if (body[f] !== undefined) data[f] = sanitize(String(body[f]));
  }
  if (body.dateOfBirth !== undefined) data.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;

  const patient = await prisma.patient.update({ where: { id }, data });
  return NextResponse.json({ patient });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "patients");
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;

  if (isDemoMode) {
    demoStore.deletePatient(id);
    return NextResponse.json({ ok: true });
  }

  const { prisma } = await import("@/lib/prisma");
  const existing = await prisma.patient.findUnique({ where: { id } });
  if (!existing || existing.practiceId !== guard.practiceId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.patient.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
