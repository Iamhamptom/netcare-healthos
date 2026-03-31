import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize, validateRequired } from "@/lib/validate";

/** GET /api/engagement/campaigns — List patient health campaigns */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "engagement-campaigns");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      campaigns: [
        { id: "c1", name: "Flu Vaccine 2026 — Over 65s", type: "preventive", channel: "whatsapp", status: "completed", sentCount: 142, deliveredCount: 138, respondedCount: 45, bookedCount: 32, createdAt: "2026-03-01" },
        { id: "c2", name: "Diabetes HbA1c Recall — Q1 2026", type: "chronic", channel: "multi", status: "sending", sentCount: 78, deliveredCount: 74, respondedCount: 22, bookedCount: 15, createdAt: "2026-03-15" },
        { id: "c3", name: "Annual Wellness Screening — Lapsed Patients", type: "screening", channel: "whatsapp", status: "draft", sentCount: 0, deliveredCount: 0, respondedCount: 0, bookedCount: 0, createdAt: "2026-03-28" },
      ],
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const campaigns = await prisma.patientCampaign.findMany({
    where: { practiceId: guard.practiceId },
    include: { _count: { select: { recipients: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    campaigns: campaigns.map((c) => ({
      ...c,
      targetCriteria: JSON.parse(c.targetCriteria || "{}"),
      recipientCount: c._count.recipients,
    })),
  });
}

/** POST /api/engagement/campaigns — Create a new health campaign */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "engagement-campaigns", { limit: 10 });
  if (isErrorResponse(guard)) return guard;
  const body = await request.json();

  const err = validateRequired(body, ["name", "type", "channel", "messageTemplate"]);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  if (isDemoMode) {
    return NextResponse.json({ campaign: { id: "demo-campaign", ...body, status: "draft" } });
  }

  const { prisma } = await import("@/lib/prisma");

  // Build patient query from target criteria
  const criteria = body.targetCriteria || {};
  const where: Record<string, unknown> = { practiceId: guard.practiceId, status: "active" };
  if (criteria.gender) where.gender = criteria.gender;
  if (criteria.medicalAid) where.medicalAid = { contains: criteria.medicalAid };
  if (criteria.lastVisitBefore) where.lastVisit = { lt: new Date(criteria.lastVisitBefore) };

  let patients = await prisma.patient.findMany({
    where: where as any,
    select: { id: true, name: true, phone: true, email: true, dateOfBirth: true },
    take: 2000,
  });

  // Age filter
  if (criteria.ageMin || criteria.ageMax) {
    const now = new Date();
    patients = patients.filter((p) => {
      if (!p.dateOfBirth) return false;
      const age = Math.floor((now.getTime() - p.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (criteria.ageMin && age < criteria.ageMin) return false;
      if (criteria.ageMax && age > criteria.ageMax) return false;
      return true;
    });
  }

  const campaign = await prisma.patientCampaign.create({
    data: {
      name: sanitize(body.name),
      description: sanitize(body.description || ""),
      type: body.type,
      channel: body.channel,
      messageTemplate: body.messageTemplate,
      targetCriteria: JSON.stringify(criteria),
      status: body.scheduledAt ? "scheduled" : "draft",
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      practiceId: guard.practiceId,
    },
  });

  // Add matching patients as recipients
  if (patients.length > 0) {
    await prisma.campaignRecipient.createMany({
      data: patients.map((p) => ({
        campaignId: campaign.id,
        patientId: p.id,
        patientName: p.name,
        phone: p.phone,
        email: p.email,
      })),
    });
  }

  return NextResponse.json({
    campaign: { ...campaign, targetCriteria: criteria },
    recipientCount: patients.length,
  });
}
