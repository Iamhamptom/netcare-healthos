import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { send3DayReminders, sendDueReminders, sendCheckinDetails, sendFollowups, sendReviewRequests } from "@/lib/booking-engine";

/** POST /api/reminders/run — Cron endpoint to trigger all reminder jobs
 *  Call this every hour via Vercel Cron or external scheduler.
 *  Authorization: Bearer key or internal-only.
 */
export async function POST(request: Request) {
  // Simple auth — check for gateway key or internal cron header
  const auth = request.headers.get("authorization");
  const cronSecret = request.headers.get("x-cron-secret");
  const gatewayKey = process.env.HEALTHOPS_GATEWAY_KEY || process.env.VISIO_GATEWAY_KEY;

  const isAuthed = (auth && gatewayKey && auth === `Bearer ${gatewayKey}`) ||
    (cronSecret && gatewayKey && cronSecret === gatewayKey);

  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoMode) {
    return NextResponse.json({
      reminders: { sent: 0 },
      checkins: { sent: 0 },
      followups: { sent: 0 },
      message: "Demo mode — no real notifications sent",
    });
  }

  // Run all notification jobs (3-day + 24h + 2h + follow-up + review)
  const [day3, reminders, _checkins, _followups, _reviews] = await Promise.allSettled([
    send3DayReminders(),
    sendDueReminders(),
    sendCheckinDetails(),
    sendFollowups(),
    sendReviewRequests(),
  ]);

  return NextResponse.json({
    day3Reminders: day3.status === "fulfilled" ? { sent: day3.value.length } : { error: String(day3.reason) },
    reminders: reminders.status === "fulfilled" ? { sent: reminders.value.length } : { error: String(reminders.reason) },
    checkins: _checkins.status === "fulfilled" ? { sent: "ok" } : { error: String(_checkins.reason) },
    followups: _followups.status === "fulfilled" ? { sent: "ok" } : { error: String(_followups.reason) },
    reviews: _reviews.status === "fulfilled" ? _reviews.value : { error: String(_reviews.reason) },
    message: "Reminder jobs completed",
  });
}

/** GET /api/reminders/run — Vercel Cron handler (Vercel calls GET for cron jobs) */
export async function GET(request: Request) {
  // Vercel Cron sends CRON_SECRET in authorization header
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Allow Vercel cron or gateway key auth
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    const gatewayKey = process.env.HEALTHOPS_GATEWAY_KEY || process.env.VISIO_GATEWAY_KEY;
    if (!gatewayKey || auth !== `Bearer ${gatewayKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (isDemoMode) {
    return NextResponse.json({ status: "ok", message: "Demo mode — no reminders sent" });
  }

  const [day3, reminders, _checkins, _followups, _reviews] = await Promise.allSettled([
    send3DayReminders(),
    sendDueReminders(),
    sendCheckinDetails(),
    sendFollowups(),
    sendReviewRequests(),
  ]);

  return NextResponse.json({
    day3Reminders: day3.status === "fulfilled" ? { sent: day3.value.length } : { error: String(day3.reason) },
    reminders: reminders.status === "fulfilled" ? { sent: reminders.value.length } : { error: String(reminders.reason) },
    reviews: _reviews.status === "fulfilled" ? _reviews.value : { error: String(_reviews.reason) },
    message: "Cron job completed",
  });
}
