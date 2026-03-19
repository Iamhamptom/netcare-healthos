import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { clampInt, clampFloat } from "@/lib/validate";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "vitals");
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;

  if (isDemoMode) {
    return NextResponse.json({ vitals: demoStore.getVitals(id) });
  }

  const { prisma } = await import("@/lib/prisma");
  const vitals = await prisma.vitals.findMany({
    where: { patientId: id },
    orderBy: { recordedAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ vitals });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "vitals");
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;
  const body = await request.json();

  if (isDemoMode) {
    const vital = demoStore.addVitals(id, body);
    return NextResponse.json({ vital });
  }

  const { prisma } = await import("@/lib/prisma");
  const vital = await prisma.vitals.create({
    data: {
      bloodPressureSys: clampInt(body.bloodPressureSys, 50, 300),
      bloodPressureDia: clampInt(body.bloodPressureDia, 20, 200),
      heartRate: clampInt(body.heartRate, 20, 250),
      temperature: clampFloat(body.temperature, 30, 45),
      weight: clampFloat(body.weight, 1, 500),
      height: clampFloat(body.height, 20, 300),
      oxygenSat: clampInt(body.oxygenSat, 50, 100),
      bloodGlucose: clampFloat(body.bloodGlucose, 0.5, 50),
      respiratoryRate: clampInt(body.respiratoryRate, 4, 60),
      painLevel: clampInt(body.painLevel, 0, 10),
      notes: String(body.notes || "").slice(0, 500),
      recordedBy: String(body.recordedBy || "").slice(0, 200),
      patientId: id,
      recordedAt: body.recordedAt ? new Date(body.recordedAt) : new Date(),
    },
  });
  return NextResponse.json({ vital }, { status: 201 });
}
