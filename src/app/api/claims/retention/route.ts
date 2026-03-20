import { NextRequest, NextResponse } from "next/server";

// POPIA Data Retention — Auto-delete analyses older than 12 months
// Triggered by Vercel cron job (add to vercel.json)
// Header: CRON_SECRET verification for security

export async function GET(req: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 12);

    // Delete analyses older than 12 months
    const deleted = await prisma.claimsAnalysis.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });

    // Log for audit
    console.log(`[claims-retention] Deleted ${deleted.count} analyses older than ${cutoffDate.toISOString()}`);

    return NextResponse.json({
      deleted: deleted.count,
      cutoffDate: cutoffDate.toISOString(),
      message: `POPIA retention: ${deleted.count} analyses removed (older than 12 months)`,
    });
  } catch (error) {
    console.error("Retention cleanup error:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
