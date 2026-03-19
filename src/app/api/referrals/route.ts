import { NextRequest, NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { supabaseAdmin, tables } from "@/lib/supabase";

/** GET /api/referrals — List referrals for the practice */
export async function GET(request: NextRequest) {
  const guard = await guardRoute(request, "referrals");
  if (isErrorResponse(guard)) return guard;

  const status = request.nextUrl.searchParams.get("status");
  const urgency = request.nextUrl.searchParams.get("urgency");

  const allReferrals = await db.listReferrals(guard.practiceId) as Record<string, unknown>[];

  let filtered = [...allReferrals];
  if (status && status !== "all") filtered = filtered.filter((r) => r.status === status);
  if (urgency && urgency !== "all") filtered = filtered.filter((r) => r.urgency === urgency);

  const pendingCount = allReferrals.filter((r) => r.status === "pending").length;

  return NextResponse.json({ referrals: filtered, pendingCount });
}

/** PATCH /api/referrals — Update referral status / feedback */
export async function PATCH(request: NextRequest) {
  const guard = await guardRoute(request, "referrals-update", { limit: 30 });
  if (isErrorResponse(guard)) return guard;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, status, feedbackNote, appointmentDate } = body as Record<string, string>;

  if (!id) {
    return NextResponse.json({ error: "Missing referral ID" }, { status: 400 });
  }

  const validStatuses = ["pending", "accepted", "booked", "completed", "declined"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (db.useSupabase) {
    // Verify referral belongs to this practice
    const { data: referral } = await supabaseAdmin.from(tables.referrals).select("id").eq("id", id).eq("practice_id", guard.practiceId).single();
    if (!referral) return NextResponse.json({ error: "Referral not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (appointmentDate) updateData.appointment_date = appointmentDate;
    if (feedbackNote !== undefined && feedbackNote !== "") {
      updateData.feedback_note = (feedbackNote as string).slice(0, 2000);
      updateData.feedback_sent = true;
      updateData.feedback_sent_at = new Date().toISOString();
    }

    await supabaseAdmin.from(tables.referrals).update(updateData).eq("id", id);
  } else {
    const { prisma } = await import("@/lib/prisma");

    const referral = await prisma.referral.findFirst({
      where: { id, practiceId: guard.practiceId },
    });
    if (!referral) return NextResponse.json({ error: "Referral not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate);
    if (feedbackNote !== undefined && feedbackNote !== "") {
      updateData.feedbackNote = (feedbackNote as string).slice(0, 2000);
      updateData.feedbackSent = true;
      updateData.feedbackSentAt = new Date();
    }

    await prisma.referral.update({ where: { id }, data: updateData });
  }

  return NextResponse.json({ success: true, message: "Referral updated" });
}
