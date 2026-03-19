import { NextResponse } from "next/server";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";
import { db } from "@/lib/db";

const STAGES = ["lead", "contacted", "demo_scheduled", "proposal_sent", "won", "onboarding", "active", "at_risk", "churned"];

export async function GET(request: Request) {
  const guard = await guardPlatformAdmin(request, "admin-clients");
  if (isErrorResponse(guard)) return guard;

  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage");
  const search = searchParams.get("search");
  const planTier = searchParams.get("planTier");

  const filters: { stage?: string; search?: string; planTier?: string } = {};
  if (stage && stage !== "all") filters.stage = stage;
  if (planTier && planTier !== "all") filters.planTier = planTier;
  if (search) filters.search = search;

  const clients = await db.listClients(filters) as Record<string, unknown>[];

  // Get all clients for stage counts (unfiltered)
  const allClients = await db.listClients() as Record<string, unknown>[];

  const totalValue = clients.reduce((sum: number, c) => sum + ((c.monthlyValue as number) || 0), 0);
  const countByStage: Record<string, number> = {};
  for (const s of STAGES) {
    countByStage[s] = allClients.filter((c) => c.stage === s).length;
  }

  return NextResponse.json({ clients, stats: { totalValue, countByStage } });
}

export async function POST(request: Request) {
  const guard = await guardPlatformAdmin(request, "admin-clients");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  if (!body.practiceName || !body.doctorName) {
    return NextResponse.json({ error: "practiceName and doctorName are required" }, { status: 400 });
  }

  const client = await db.createClient({
    practiceName: body.practiceName,
    doctorName: body.doctorName,
    specialty: body.specialty || "",
    location: body.location || "",
    phone: body.phone || "",
    email: body.email || "",
    website: body.website || "",
    stage: body.stage || "lead",
    planTier: body.planTier || "professional",
    monthlyValue: body.monthlyValue ?? 35000,
    source: body.source || "",
    practiceId: body.practiceId || null,
    assignedTo: body.assignedTo || "",
    nextAction: body.nextAction || "",
    nextActionDue: body.nextActionDue || null,
    notes: body.notes || "",
  }) as Record<string, unknown>;

  await db.createActivity({
    clientId: client.id,
    type: "stage_change",
    title: "Lead created",
    description: `${body.doctorName} added to pipeline`,
    createdBy: "Dr. Hampton",
  });

  return NextResponse.json({ client }, { status: 201 });
}
