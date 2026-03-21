import { NextResponse, NextRequest } from "next/server";

/**
 * GET /api/reports/run — Cron endpoint
 * Runs daily at 7 AM (configured in vercel.json).
 * Checks which scheduled reports are due and triggers generation.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch scheduled reports
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // SSRF protection — only allow fetching from the app's own domain
    const allowedOrigin = new URL(baseUrl).origin;

    const schedulesRes = await fetch(`${allowedOrigin}/api/reports/schedule`, {
      headers: { cookie: request.headers.get("cookie") || "" },
    });

    if (!schedulesRes.ok) {
      console.log("[reports/run] Could not fetch schedules — skipping cron run");
      return NextResponse.json({ message: "Skipped — could not fetch schedules", generated: 0 });
    }

    const { schedules } = await schedulesRes.json();
    const now = new Date();
    let generated = 0;

    for (const schedule of schedules) {
      if (!schedule.active) continue;

      const nextSend = new Date(schedule.nextSendAt);
      if (nextSend > now) continue;

      // Report is due — generate it
      console.log(`[reports/run] Generating scheduled report: ${schedule.reportName} (${schedule.reportType})`);

      try {
        const genRes = await fetch(`${allowedOrigin}/api/reports/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            cookie: request.headers.get("cookie") || "",
          },
          body: JSON.stringify({
            type: schedule.reportType,
            format: "json",
            period: "mtd",
          }),
        });

        if (genRes.ok) {
          generated++;
          console.log(`[reports/run] Report generated: ${schedule.reportName}`);
          // In production: email to schedule.recipients via Resend/SendGrid
          console.log(`[reports/run] Would email to: ${schedule.recipients.join(", ")}`);
        }
      } catch (err) {
        console.error(`[reports/run] Failed to generate ${schedule.reportName}:`, err);
      }
    }

    return NextResponse.json({
      message: `Cron complete. Generated ${generated} reports.`,
      generated,
      checkedAt: now.toISOString(),
    });
  } catch (err) {
    console.error("[reports/run] Cron error:", err);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
