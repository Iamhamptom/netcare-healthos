import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize, validateRequired } from "@/lib/validate";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "records");
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;

  if (isDemoMode) {
    return NextResponse.json({ records: demoStore.getMedicalRecords(id) });
  }

  const { prisma } = await import("@/lib/prisma");
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "";

  const where: Record<string, unknown> = { patientId: id };
  if (type) where.type = type;

  const records = await prisma.medicalRecord.findMany({
    where,
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ records });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "records");
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;
  const body = await request.json();

  const err = validateRequired(body, ["type", "title"]);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const validTypes = ["consultation", "procedure", "lab_result", "imaging", "referral", "note"];
  if (!validTypes.includes(body.type)) {
    return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(", ")}` }, { status: 400 });
  }

  if (isDemoMode) {
    const record = demoStore.addMedicalRecord(id, body);
    return NextResponse.json({ record });
  }

  const { prisma } = await import("@/lib/prisma");
  const record = await prisma.medicalRecord.create({
    data: {
      type: body.type,
      title: sanitize(body.title),
      description: sanitize(body.description || ""),
      diagnosis: sanitize(body.diagnosis || ""),
      treatment: sanitize(body.treatment || ""),
      provider: sanitize(body.provider || ""),
      date: body.date ? new Date(body.date) : new Date(),
      patientId: id,
      practiceId: guard.practiceId,
    },
  });
  return NextResponse.json({ record }, { status: 201 });
}
