import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "healthbridge-export");
  if (isErrorResponse(guard)) return guard;

  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "csv";
  const period = url.searchParams.get("period") || "all";
  const status = url.searchParams.get("status") || "";
  const scheme = url.searchParams.get("scheme") || "";

  if (format !== "csv") {
    return NextResponse.json({ error: "Only CSV format is currently supported" }, { status: 400 });
  }

  let claims: ClaimRow[];

  if (isDemoMode) {
    claims = demoClaims;
  } else {
    const { prisma } = await import("@/lib/prisma");

    const where: Record<string, unknown> = { practiceId: guard.practiceId };
    if (status) where.status = status;
    if (scheme) where.medicalAidScheme = { contains: scheme };

    // Period filter
    if (period !== "all") {
      const now = new Date();
      let from: Date;
      switch (period) {
        case "month":
          from = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "quarter":
          from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          break;
        case "year":
          from = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          from = new Date(0);
      }
      where.createdAt = { gte: from };
    }

    const rows = await prisma.healthbridgeClaim.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    claims = rows.map((r: Record<string, unknown>) => ({
      dateOfService: String(r.dateOfService || ""),
      patientName: String(r.patientName || ""),
      medicalAidScheme: String(r.medicalAidScheme || ""),
      membershipNumber: String(r.membershipNumber || ""),
      lineItems: String(r.lineItems || "[]"),
      totalAmount: Number(r.totalAmount || 0),
      approvedAmount: Number(r.approvedAmount || 0),
      paidAmount: Number(r.paidAmount || 0),
      status: String(r.status || ""),
      transactionRef: String(r.transactionRef || ""),
    }));
  }

  const csvHeader = "Date,Patient,Scheme,Membership,ICD10,CPT,Description,Amount,Approved,Paid,Status,Reference";
  const csvRows: string[] = [];

  for (const claim of claims) {
    let lineItems: { icd10Code?: string; cptCode?: string; description?: string; amount?: number; quantity?: number }[] = [];
    try {
      lineItems = typeof claim.lineItems === "string" ? JSON.parse(claim.lineItems) : claim.lineItems;
    } catch {
      lineItems = [];
    }

    if (lineItems.length === 0) {
      // Single row for claims with no parseable line items
      csvRows.push(formatCsvRow([
        claim.dateOfService,
        claim.patientName,
        claim.medicalAidScheme,
        claim.membershipNumber,
        "",
        "",
        "",
        centsToZAR(claim.totalAmount),
        centsToZAR(claim.approvedAmount),
        centsToZAR(claim.paidAmount),
        claim.status,
        claim.transactionRef,
      ]));
    } else {
      // One row per line item
      for (const item of lineItems) {
        const itemTotal = (item.amount || 0) * (item.quantity || 1);
        csvRows.push(formatCsvRow([
          claim.dateOfService,
          claim.patientName,
          claim.medicalAidScheme,
          claim.membershipNumber,
          item.icd10Code || "",
          item.cptCode || "",
          item.description || "",
          centsToZAR(itemTotal),
          centsToZAR(claim.approvedAmount),
          centsToZAR(claim.paidAmount),
          claim.status,
          claim.transactionRef,
        ]));
      }
    }
  }

  const csv = [csvHeader, ...csvRows].join("\n");
  const filename = `claims-export-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

// ── Helpers ──

function centsToZAR(cents: number): string {
  return (cents / 100).toFixed(2);
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatCsvRow(fields: string[]): string {
  return fields.map(escapeCsvField).join(",");
}

// ── Types ──

interface ClaimRow {
  dateOfService: string;
  patientName: string;
  medicalAidScheme: string;
  membershipNumber: string;
  lineItems: string | unknown[];
  totalAmount: number;
  approvedAmount: number;
  paidAmount: number;
  status: string;
  transactionRef: string;
}

// ── Demo data ──

const demoClaims: ClaimRow[] = [
  {
    dateOfService: "2026-03-18",
    patientName: "John Mokoena",
    medicalAidScheme: "Discovery Health",
    membershipNumber: "900012345",
    lineItems: JSON.stringify([
      { icd10Code: "I10", cptCode: "0190", description: "GP consultation — hypertension review", quantity: 1, amount: 52000 },
      { icd10Code: "I10", cptCode: "0308", description: "ECG recording", quantity: 1, amount: 35000 },
    ]),
    totalAmount: 87000,
    approvedAmount: 87000,
    paidAmount: 87000,
    status: "accepted",
    transactionRef: "HB-SIM-001",
  },
  {
    dateOfService: "2026-03-19",
    patientName: "Priya Naidoo",
    medicalAidScheme: "Bonitas",
    membershipNumber: "800067890",
    lineItems: JSON.stringify([
      { icd10Code: "J06.9", cptCode: "0190", description: "GP consultation — URTI", quantity: 1, amount: 52000 },
    ]),
    totalAmount: 52000,
    approvedAmount: 52000,
    paidAmount: 0,
    status: "accepted",
    transactionRef: "HB-SIM-002",
  },
  {
    dateOfService: "2026-03-19",
    patientName: "Thabo Molefe",
    medicalAidScheme: "GEMS",
    membershipNumber: "700011111",
    lineItems: JSON.stringify([
      { icd10Code: "E11.9", cptCode: "0193", description: "Extended consultation — diabetes management", quantity: 1, amount: 78000 },
      { icd10Code: "E11.9", cptCode: "0382", description: "Blood glucose point-of-care", quantity: 1, amount: 6500 },
    ]),
    totalAmount: 84500,
    approvedAmount: 0,
    paidAmount: 0,
    status: "rejected",
    transactionRef: "HB-SIM-003",
  },
];
