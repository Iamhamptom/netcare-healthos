import { NextResponse, NextRequest } from "next/server";
import { guardPlatformAdmin } from "@/lib/api-helpers";

/**
 * GET /api/reports/history — Previously generated reports
 * In demo mode, returns sample history data.
 */

interface ReportHistoryEntry {
  id: string;
  reportName: string;
  reportType: string;
  period: string;
  generatedAt: string;
  generatedBy: string;
  format: string;
  sizeKb: number;
}

const day = 86400000;
const now = Date.now();

const historyStore: ReportHistoryEntry[] = [
  { id: "rpt-001", reportName: "Claims Summary", reportType: "claims_summary", period: "mtd", generatedAt: new Date(now - 1 * day).toISOString(), generatedBy: "Thirushen Pillay", format: "json", sizeKb: 24 },
  { id: "rpt-002", reportName: "Revenue Report", reportType: "revenue", period: "qtd", generatedAt: new Date(now - 2 * day).toISOString(), generatedBy: "Thirushen Pillay", format: "csv", sizeKb: 156 },
  { id: "rpt-003", reportName: "Rejection Analysis", reportType: "rejection_analysis", period: "mtd", generatedAt: new Date(now - 3 * day).toISOString(), generatedBy: "System (Scheduled)", format: "json", sizeKb: 42 },
  { id: "rpt-004", reportName: "Scheme Performance", reportType: "scheme_performance", period: "ytd", generatedAt: new Date(now - 4 * day).toISOString(), generatedBy: "Thirushen Pillay", format: "csv", sizeKb: 89 },
  { id: "rpt-005", reportName: "POPIA Compliance Status", reportType: "popia_compliance", period: "mtd", generatedAt: new Date(now - 7 * day).toISOString(), generatedBy: "System (Scheduled)", format: "json", sizeKb: 18 },
  { id: "rpt-006", reportName: "Team Activity", reportType: "team_activity", period: "mtd", generatedAt: new Date(now - 8 * day).toISOString(), generatedBy: "Thirushen Pillay", format: "json", sizeKb: 31 },
  { id: "rpt-007", reportName: "Claims Summary", reportType: "claims_summary", period: "mtd", generatedAt: new Date(now - 10 * day).toISOString(), generatedBy: "System (Scheduled)", format: "csv", sizeKb: 198 },
  { id: "rpt-008", reportName: "Revenue Report", reportType: "revenue", period: "mtd", generatedAt: new Date(now - 14 * day).toISOString(), generatedBy: "Thirushen Pillay", format: "json", sizeKb: 67 },
];

export async function GET(request: NextRequest) {
  const guard = await guardPlatformAdmin(request, "reports-history");
  if (guard instanceof NextResponse) return guard;

  return NextResponse.json({ history: historyStore });
}
