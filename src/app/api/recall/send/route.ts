/**
 * POST /api/recall/send
 * Send recall reminders for due items via email (Resend).
 * Can be triggered manually or via cron.
 *
 * Body: { recallItemIds?: string[] } — optional, sends all due if omitted
 */

import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const guard = await guardRoute(request, "recall-send", { limit: 10 });
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json().catch(() => ({}));
    const { recallItemIds } = body as { recallItemIds?: string[] };

    if (isDemoMode) {
      // Demo mode: simulate sending
      return NextResponse.json({
        sent: 3,
        results: [
          { id: "demo-1", patientName: "T.N.", status: "sent", channel: "email" },
          { id: "demo-2", patientName: "S.M.", status: "sent", channel: "email" },
          { id: "demo-3", patientName: "K.D.", status: "sent", channel: "email" },
        ],
        message: "[DEMO] 3 recall reminders sent via email",
      });
    }

    const { prisma } = await import("@/lib/prisma");

    // Get due recall items (not yet contacted)
    const where: Record<string, unknown> = {
      practiceId: guard.practiceId,
      contacted: false,
      dueDate: { lte: new Date() },
    };
    if (recallItemIds?.length) {
      where.id = { in: recallItemIds };
    }

    const dueItems = await prisma.recallItem.findMany({ where, take: 50 });

    if (dueItems.length === 0) {
      return NextResponse.json({ sent: 0, message: "No due recall items found" });
    }

    // Send via Resend
    const results: Array<{ id: string; patientName: string; status: string; channel: string }> = [];

    for (const item of dueItems) {
      try {
        const { sendEmail } = await import("@/lib/resend");
        // Only send if we have patient contact info
        const email = (item as Record<string, unknown>).email as string | undefined;
        if (email) {
          await sendEmail({
            to: email,
            subject: `Reminder: ${item.reason} — Your appointment is due`,
            html: `
              <div style="font-family: system-ui, sans-serif; max-width: 520px;">
                <h2 style="color: #1D3443;">Appointment Reminder</h2>
                <p>Dear ${item.patientName.split(" ")[0]},</p>
                <p>This is a friendly reminder that your <strong>${item.reason}</strong> is due.</p>
                <p>Please contact us to schedule your appointment at your earliest convenience.</p>
                <p style="color: #666; font-size: 13px; margin-top: 24px;">
                  If you have already scheduled or completed this visit, please disregard this message.
                </p>
              </div>
            `,
          });
          results.push({ id: item.id, patientName: item.patientName, status: "sent", channel: "email" });
        } else if (item.phone) {
          // Phone available but no email — log for manual follow-up
          results.push({ id: item.id, patientName: item.patientName, status: "phone_only", channel: "manual" });
        } else {
          results.push({ id: item.id, patientName: item.patientName, status: "no_contact", channel: "none" });
        }

        // Mark as contacted
        await prisma.recallItem.update({
          where: { id: item.id },
          data: { contacted: true },
        });
      } catch (err) {
        results.push({ id: item.id, patientName: item.patientName, status: "failed", channel: "error" });
      }
    }

    const sentCount = results.filter(r => r.status === "sent").length;
    return NextResponse.json({ sent: sentCount, total: dueItems.length, results });
  } catch (err) {
    console.error("[recall/send] Error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Send failed" }, { status: 500 });
  }
}
