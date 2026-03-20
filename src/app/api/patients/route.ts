import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize, validateRequired, clampInt } from "@/lib/validate";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "patients");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ patients: demoStore.getPatients() });
  }

  // POPIA: Verify data_processing consent exists for this practice before returning patient data
  const { prisma } = await import("@/lib/prisma");
  const consentCount = await prisma.consentRecord.count({
    where: {
      practiceId: guard.practiceId,
      consentType: "data_processing",
      granted: true,
      revokedAt: null,
    },
  });
  if (consentCount === 0) {
    return NextResponse.json(
      { error: "POPIA consent required before accessing patient data" },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const limit = clampInt(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 1, 100) ?? 100;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { practiceId: guard.practiceId };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }
  if (status) where.status = status;

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      include: { allergies: true, medications: { where: { active: true } } },
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.patient.count({ where }),
  ]);
  return NextResponse.json({ patients, total, page, limit });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "patients");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const err = validateRequired(body, ["name", "phone"]);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  if (isDemoMode) {
    const patient = demoStore.addPatient(body);
    return NextResponse.json({ patient });
  }

  const { prisma } = await import("@/lib/prisma");
  const patient = await prisma.patient.create({
    data: {
      name: sanitize(body.name),
      phone: sanitize(body.phone),
      email: sanitize(body.email || ""),
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      gender: sanitize(body.gender || ""),
      idNumber: sanitize(body.idNumber || ""),
      address: sanitize(body.address || ""),
      medicalAid: sanitize(body.medicalAid || ""),
      medicalAidNo: sanitize(body.medicalAidNo || ""),
      bloodType: sanitize(body.bloodType || ""),
      emergencyName: sanitize(body.emergencyName || ""),
      emergencyPhone: sanitize(body.emergencyPhone || ""),
      notes: sanitize(body.notes || ""),
      practiceId: guard.practiceId,
    },
  });
  return NextResponse.json({ patient }, { status: 201 });
}
