import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize, validateRequired } from "@/lib/validate";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "allergies");
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;

  if (isDemoMode) {
    return NextResponse.json({ allergies: demoStore.getAllergies(id) });
  }

  const { prisma } = await import("@/lib/prisma");
  const allergies = await prisma.allergy.findMany({ where: { patientId: id } });
  return NextResponse.json({ allergies });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "allergies");
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;
  const body = await request.json();

  const err = validateRequired(body, ["name"]);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  if (isDemoMode) {
    const allergy = demoStore.addAllergy(id, body);
    return NextResponse.json({ allergy });
  }

  const { prisma } = await import("@/lib/prisma");
  const allergy = await prisma.allergy.create({
    data: {
      name: sanitize(body.name),
      severity: sanitize(body.severity || "moderate"),
      reaction: sanitize(body.reaction || ""),
      patientId: id,
    },
  });
  return NextResponse.json({ allergy }, { status: 201 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "allergies");
  if (isErrorResponse(guard)) return guard;

  const url = new URL(request.url);
  const allergyId = url.searchParams.get("allergyId");
  if (!allergyId) return NextResponse.json({ error: "Missing allergyId" }, { status: 400 });

  if (isDemoMode) {
    demoStore.deleteAllergy(allergyId);
    return NextResponse.json({ ok: true });
  }

  const { prisma } = await import("@/lib/prisma");
  await prisma.allergy.delete({ where: { id: allergyId } });
  return NextResponse.json({ ok: true });
}
