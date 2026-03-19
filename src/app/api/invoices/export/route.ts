import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { demoStore } from "@/lib/demo-data";

function csvEscape(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return "";
  try {
    const dt = typeof d === "string" ? new Date(d) : d;
    return dt.toISOString().split("T")[0];
  } catch {
    return String(d);
  }
}

export async function GET(request: Request) {
  const guard = await guardRoute(request, "invoices-export");
  if (isErrorResponse(guard)) return guard;

  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const statusFilter = url.searchParams.get("status") || "all";

  type InvoiceRow = Record<string, unknown>;
  let invoices: InvoiceRow[];

  if (isDemoMode) {
    invoices = demoStore.getInvoices() as InvoiceRow[];
  } else {
    const { prisma } = await import("@/lib/prisma");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = { practiceId: guard.practiceId };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to + "T23:59:59.999Z");
    }
    if (statusFilter && statusFilter !== "all") {
      where.status = statusFilter;
    }

    invoices = (await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })) as unknown as InvoiceRow[];
  }

  // Apply filters for demo mode
  if (isDemoMode) {
    if (from) {
      const fromDate = new Date(from);
      invoices = invoices.filter(inv => new Date(String(inv.createdAt)) >= fromDate);
    }
    if (to) {
      const toDate = new Date(to + "T23:59:59.999Z");
      invoices = invoices.filter(inv => new Date(String(inv.createdAt)) <= toDate);
    }
    if (statusFilter && statusFilter !== "all") {
      invoices = invoices.filter(inv => inv.status === statusFilter);
    }
  }

  // Build CSV
  const headers = [
    "Invoice No",
    "Date",
    "Patient",
    "Total",
    "Paid",
    "Balance",
    "Status",
    "Medical Aid Claim",
    "Claim Status",
  ];

  const rows = invoices.map(inv => [
    csvEscape(String(inv.invoiceNo || "")),
    csvEscape(fmtDate(inv.createdAt as string)),
    csvEscape(String(inv.patientName || "")),
    String(Number(inv.total || 0).toFixed(2)),
    String(Number(inv.amountPaid || 0).toFixed(2)),
    String(Number(inv.balance || 0).toFixed(2)),
    csvEscape(String(inv.status || "")),
    String(Number(inv.medicalAidClaim || 0).toFixed(2)),
    csvEscape(String(inv.claimStatus || "")),
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

  const year = new Date().getFullYear();
  const filename = `invoices-${year}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(Buffer.byteLength(csv, "utf-8")),
    },
  });
}
