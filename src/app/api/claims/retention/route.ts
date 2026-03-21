import { NextRequest, NextResponse } from "next/server";
import { RETENTION_PERIODS, getCutoffDate } from "@/lib/retention-config";

// POPIA / HPCSA Data Retention — Auto-delete expired data
// Triggered by Vercel cron job (add to vercel.json)
// Header: CRON_SECRET verification for security
//
// NOTE: Medical records, bookings, patient records, and consent records
// are NEVER auto-deleted (HPCSA requirement).

export async function GET(req: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    const results: Record<string, { deleted: number; cutoff: string; reason: string }> = {};

    // 1. Claims analyses — 12 months (POPIA minimal retention)
    const claimsCutoff = getCutoffDate(RETENTION_PERIODS.claimsAnalysis);
    const claimsDeleted = await prisma.claimsAnalysis.deleteMany({
      where: { createdAt: { lt: claimsCutoff } },
    });
    results.claimsAnalysis = {
      deleted: claimsDeleted.count,
      cutoff: claimsCutoff.toISOString(),
      reason: RETENTION_PERIODS.claimsAnalysis.reason,
    };

    // 2. Audit logs — 7 years (HPCSA record-keeping)
    const auditCutoff = getCutoffDate(RETENTION_PERIODS.auditLogs);
    const auditDeleted = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: auditCutoff } },
    });
    results.auditLogs = {
      deleted: auditDeleted.count,
      cutoff: auditCutoff.toISOString(),
      reason: RETENTION_PERIODS.auditLogs.reason,
    };

    // 3. Notifications — 6 months (operational relevance)
    const notifCutoff = getCutoffDate(RETENTION_PERIODS.notifications);
    const notifDeleted = await prisma.notification.deleteMany({
      where: { createdAt: { lt: notifCutoff } },
    });
    results.notifications = {
      deleted: notifDeleted.count,
      cutoff: notifCutoff.toISOString(),
      reason: RETENTION_PERIODS.notifications.reason,
    };

    // 4. Reset tokens — 24 hours (security best practice)
    // Note: In-memory tokens are cleaned by reset-tokens.ts interval.
    // Supabase tokens (ho_reset_tokens) are cleaned here if available.
    let resetTokensDeleted = 0;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { supabaseAdmin } = await import("@/lib/supabase");
        const tokenCutoff = getCutoffDate(RETENTION_PERIODS.resetTokens);
        const { count } = await supabaseAdmin
          .from("ho_reset_tokens")
          .delete()
          .lt("created_at", tokenCutoff.toISOString())
          .eq("used", true);
        resetTokensDeleted = count ?? 0;
      } catch {
        console.warn("[retention] Could not clean Supabase reset tokens — table may not exist");
      }
    }
    results.resetTokens = {
      deleted: resetTokensDeleted,
      cutoff: getCutoffDate(RETENTION_PERIODS.resetTokens).toISOString(),
      reason: RETENTION_PERIODS.resetTokens.reason,
    };

    // === NEVER AUTO-DELETE (HPCSA compliance) ===
    // - Medical records (medicalRecords: 999 years)
    // - Bookings (bookings: 999 years — part of clinical record)
    // - Patient records (patientRecords: 999 years)
    // - Consent records (consentRecords: 999 years)
    // - Invoices are kept 5 years per SARS but not auto-deleted here
    //   (manual review required for financial records)

    // Total summary
    const totalDeleted = Object.values(results).reduce((sum, r) => sum + r.deleted, 0);

    // Log for audit
    console.log(`[retention] Cleanup complete. Total deleted: ${totalDeleted}`);
    for (const [key, val] of Object.entries(results)) {
      if (val.deleted > 0) {
        console.log(`[retention] ${key}: ${val.deleted} records removed (cutoff: ${val.cutoff})`);
      }
    }

    return NextResponse.json({
      totalDeleted,
      results,
      message: `POPIA/HPCSA retention cleanup: ${totalDeleted} records removed`,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[retention] Cleanup error:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
