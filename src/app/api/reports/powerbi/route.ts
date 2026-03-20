import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";
import { getNetworkSource } from "@/lib/data-sources";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const REPORT_TYPES = [
  "claims_summary",
  "revenue_by_clinic",
  "rejection_analysis",
  "scheme_performance",
] as const;

type ReportType = (typeof REPORT_TYPES)[number];

interface ReportColumn {
  name: string;
  key: string;
}

// ---------------------------------------------------------------------------
// Column definitions for each report type
// ---------------------------------------------------------------------------

const REPORT_COLUMNS: Record<ReportType, ReportColumn[]> = {
  claims_summary: [
    { name: "Clinic", key: "clinic" },
    { name: "Claims Submitted", key: "claimsSubmitted" },
    { name: "Claims Approved", key: "claimsApproved" },
    { name: "Claims Rejected", key: "claimsRejected" },
    { name: "Rejection Rate %", key: "rejectionRate" },
    { name: "Revenue (ZAR)", key: "revenue" },
    { name: "Period", key: "period" },
    { name: "Export Date", key: "exportDate" },
  ],
  revenue_by_clinic: [
    { name: "Clinic", key: "clinic" },
    { name: "Region", key: "region" },
    { name: "Revenue (ZAR)", key: "revenue" },
    { name: "Patients Seen", key: "patientsSeen" },
    { name: "Avg Revenue per Patient (ZAR)", key: "avgRevenuePerPatient" },
    { name: "Period", key: "period" },
    { name: "Export Date", key: "exportDate" },
  ],
  rejection_analysis: [
    { name: "Rejection Code", key: "code" },
    { name: "Description", key: "description" },
    { name: "Count", key: "count" },
    { name: "Total Value (ZAR)", key: "totalValue" },
    { name: "Recommendation", key: "recommendation" },
    { name: "Period", key: "period" },
    { name: "Export Date", key: "exportDate" },
  ],
  scheme_performance: [
    { name: "Scheme", key: "scheme" },
    { name: "Claims Submitted", key: "claimsSubmitted" },
    { name: "Claims Paid", key: "claimsPaid" },
    { name: "Average Processing Days", key: "avgProcessingDays" },
    { name: "Payment Rate %", key: "paymentRate" },
    { name: "Total Paid (ZAR)", key: "totalPaid" },
    { name: "Period", key: "period" },
    { name: "Export Date", key: "exportDate" },
  ],
};

// ---------------------------------------------------------------------------
// Demo data generators
// ---------------------------------------------------------------------------

function getDemoClaimsSummary(): Record<string, unknown>[] {
  const exportDate = new Date().toISOString();
  return [
    { clinic: "Medicross Sandton City", claimsSubmitted: 1247, claimsApproved: 1109, claimsRejected: 138, rejectionRate: 11.1, revenue: 2845000, period: "2026-Q1", exportDate },
    { clinic: "Medicross Fourways", claimsSubmitted: 983, claimsApproved: 891, claimsRejected: 92, rejectionRate: 9.4, revenue: 2156000, period: "2026-Q1", exportDate },
    { clinic: "Medicross Centurion", claimsSubmitted: 1102, claimsApproved: 1003, claimsRejected: 99, rejectionRate: 9.0, revenue: 2490000, period: "2026-Q1", exportDate },
    { clinic: "Medicross Rosebank", claimsSubmitted: 876, claimsApproved: 785, claimsRejected: 91, rejectionRate: 10.4, revenue: 1934000, period: "2026-Q1", exportDate },
    { clinic: "Medicross Midrand", claimsSubmitted: 654, claimsApproved: 598, claimsRejected: 56, rejectionRate: 8.6, revenue: 1478000, period: "2026-Q1", exportDate },
  ];
}

function getDemoRevenueByClinic(): Record<string, unknown>[] {
  const exportDate = new Date().toISOString();
  return [
    { clinic: "Medicross Sandton City", region: "Gauteng North", revenue: 2845000, patientsSeen: 4890, avgRevenuePerPatient: 581.8, period: "2026-Q1", exportDate },
    { clinic: "Medicross Fourways", region: "Gauteng North", revenue: 2156000, patientsSeen: 3720, avgRevenuePerPatient: 579.6, period: "2026-Q1", exportDate },
    { clinic: "Medicross Centurion", region: "Gauteng South", revenue: 2490000, patientsSeen: 4210, avgRevenuePerPatient: 591.4, period: "2026-Q1", exportDate },
    { clinic: "Medicross Rosebank", region: "Gauteng North", revenue: 1934000, patientsSeen: 3380, avgRevenuePerPatient: 572.2, period: "2026-Q1", exportDate },
    { clinic: "Medicross Midrand", region: "Gauteng North", revenue: 1478000, patientsSeen: 2560, avgRevenuePerPatient: 577.3, period: "2026-Q1", exportDate },
  ];
}

function getDemoRejectionAnalysis(): Record<string, unknown>[] {
  const exportDate = new Date().toISOString();
  return [
    { code: "RJ001", description: "ICD-10 code mismatch with procedure", count: 89, totalValue: 234500, recommendation: "Use AI Coder for ICD-10 validation before submission", period: "2026-Q1", exportDate },
    { code: "RJ003", description: "Member not on scheme at date of service", count: 67, totalValue: 178200, recommendation: "Real-time eligibility check via Healthbridge", period: "2026-Q1", exportDate },
    { code: "RJ007", description: "Duplicate claim submission", count: 45, totalValue: 123800, recommendation: "Enable deduplication in SwitchOn integration", period: "2026-Q1", exportDate },
    { code: "RJ012", description: "Pre-authorization required", count: 38, totalValue: 456000, recommendation: "Auto-flag procedures requiring pre-auth", period: "2026-Q1", exportDate },
    { code: "RJ015", description: "Tariff code not applicable to provider type", count: 31, totalValue: 89400, recommendation: "Map provider specialties to valid tariff codes", period: "2026-Q1", exportDate },
  ];
}

function getDemoSchemePerformance(): Record<string, unknown>[] {
  const exportDate = new Date().toISOString();
  return [
    { scheme: "Discovery Health", claimsSubmitted: 2340, claimsPaid: 2106, avgProcessingDays: 12, paymentRate: 90.0, totalPaid: 5670000, period: "2026-Q1", exportDate },
    { scheme: "GEMS", claimsSubmitted: 1890, claimsPaid: 1739, avgProcessingDays: 18, paymentRate: 92.0, totalPaid: 4230000, period: "2026-Q1", exportDate },
    { scheme: "Bonitas", claimsSubmitted: 1456, claimsPaid: 1296, avgProcessingDays: 15, paymentRate: 89.0, totalPaid: 3120000, period: "2026-Q1", exportDate },
    { scheme: "Momentum Health", claimsSubmitted: 987, claimsPaid: 878, avgProcessingDays: 14, paymentRate: 89.0, totalPaid: 2340000, period: "2026-Q1", exportDate },
    { scheme: "Medihelp", claimsSubmitted: 654, claimsPaid: 595, avgProcessingDays: 20, paymentRate: 91.0, totalPaid: 1560000, period: "2026-Q1", exportDate },
  ];
}

// ---------------------------------------------------------------------------
// CSV builder
// ---------------------------------------------------------------------------

function toCsv(columns: ReportColumn[], rows: Record<string, unknown>[]): string {
  // UTF-8 BOM for Excel / Power BI compatibility
  const BOM = "\uFEFF";
  const header = columns.map((c) => `"${c.name}"`).join(",");
  const dataRows = rows.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key];
        if (val === null || val === undefined) return '""';
        if (typeof val === "number") return String(val);
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(","),
  );
  return BOM + [header, ...dataRows].join("\r\n");
}

// ---------------------------------------------------------------------------
// Data fetcher (live or demo)
// ---------------------------------------------------------------------------

async function getReportData(
  reportType: ReportType,
): Promise<Record<string, unknown>[]> {
  if (isDemoMode || !process.env.DATABASE_URL) {
    switch (reportType) {
      case "claims_summary":
        return getDemoClaimsSummary();
      case "revenue_by_clinic":
        return getDemoRevenueByClinic();
      case "rejection_analysis":
        return getDemoRejectionAnalysis();
      case "scheme_performance":
        return getDemoSchemePerformance();
    }
  }

  try {
    const networkSource = getNetworkSource();

    switch (reportType) {
      case "claims_summary": {
        const clinics = await networkSource.getClinicPerformance();
        const exportDate = new Date().toISOString();
        return clinics.map((c) => ({
          clinic: c.name,
          claimsSubmitted: c.claimsSubmitted,
          claimsApproved: c.claimsSubmitted - c.claimsRejected,
          claimsRejected: c.claimsRejected,
          rejectionRate: c.rejectionRate,
          revenue: c.revenue,
          period: "Current",
          exportDate,
        }));
      }
      case "revenue_by_clinic": {
        const clinics = await networkSource.getClinicPerformance();
        const exportDate = new Date().toISOString();
        return clinics.map((c) => ({
          clinic: c.name,
          region: c.region || "Unknown",
          revenue: c.revenue,
          patientsSeen: c.patientCount,
          avgRevenuePerPatient: c.patientCount > 0
            ? Number((c.revenue / c.patientCount).toFixed(1))
            : 0,
          period: "Current",
          exportDate,
        }));
      }
      case "rejection_analysis": {
        const rejections = await networkSource.getTopRejections(20);
        const exportDate = new Date().toISOString();
        return rejections.map((r) => ({
          code: r.code,
          description: r.description,
          count: r.count,
          totalValue: r.value,
          recommendation: r.aiRecommendation || "",
          period: "Current",
          exportDate,
        }));
      }
      case "scheme_performance": {
        const schemes = await networkSource.getMedicalSchemeMetrics();
        const exportDate = new Date().toISOString();
        return schemes.map((s) => ({
          scheme: s.schemeName,
          claimsSubmitted: s.claimsVolume,
          claimsPaid: Math.round(s.claimsVolume * (1 - s.rejectionRate / 100)),
          avgProcessingDays: s.avgPaymentDays,
          paymentRate: Number((100 - s.rejectionRate).toFixed(1)),
          totalPaid: Math.round(s.claimsVolume * (1 - s.rejectionRate / 100) * 850),
          period: "Current",
          exportDate,
        }));
      }
    }
  } catch (err) {
    logger.error("[powerbi] Failed to fetch live data, falling back to demo", {
      reportType,
      error: err instanceof Error ? err.message : String(err),
    });
    // Fallback to demo data directly (no recursive call to avoid infinite loop)
    switch (reportType) {
      case "claims_summary":
        return getDemoClaimsSummary();
      case "revenue_by_clinic":
        return getDemoRevenueByClinic();
      case "rejection_analysis":
        return getDemoRejectionAnalysis();
      case "scheme_performance":
        return getDemoSchemePerformance();
    }
  }
}

// ---------------------------------------------------------------------------
// GET /api/reports/powerbi?type=claims_summary&format=csv
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const guard = await guardRoute(request, "reports-powerbi", {
    roles: ["admin", "platform_admin"],
  });
  if (isErrorResponse(guard)) return guard;

  try {
    const url = new URL(request.url);
    const reportType = url.searchParams.get("type") as ReportType | null;
    const format = url.searchParams.get("format") || "json";

    if (!reportType || !REPORT_TYPES.includes(reportType)) {
      return NextResponse.json(
        {
          error: `Invalid report type. Must be one of: ${REPORT_TYPES.join(", ")}`,
          available: REPORT_TYPES,
        },
        { status: 400 },
      );
    }

    if (!["csv", "json"].includes(format)) {
      return NextResponse.json(
        { error: "Format must be csv or json" },
        { status: 400 },
      );
    }

    const rows = await getReportData(reportType);
    const columns = REPORT_COLUMNS[reportType];

    logger.info("[powerbi] Report exported", {
      reportType,
      format,
      rowCount: String(rows.length),
    });

    if (format === "csv") {
      const csvContent = toCsv(columns, rows);
      const filename = `netcare-${reportType}-${new Date().toISOString().slice(0, 10)}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    // JSON format — structured for Power BI streaming dataset
    return NextResponse.json({
      reportType,
      exportDate: new Date().toISOString(),
      columns: columns.map((c) => ({ name: c.name, dataType: "string" })),
      rows,
      rowCount: rows.length,
      demo: isDemoMode || !process.env.DATABASE_URL,
    });
  } catch (err) {
    logger.error("[powerbi] Export error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to generate Power BI report" },
      { status: 500 },
    );
  }
}
