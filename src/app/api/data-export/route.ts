import { NextResponse, NextRequest } from "next/server";
import { guardRoute } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";

function isErrorResponse(v: unknown): v is NextResponse {
  return v instanceof NextResponse;
}

/** POPIA Section 23 — Data Portability: Self-service export of all user/practice data */
export async function GET(request: NextRequest) {
  const guard = await guardRoute(request, "data-export", { limit: 5 });
  if (isErrorResponse(guard)) return guard;

  const format = new URL(request.url).searchParams.get("format") || "json";

  try {
    let exportData: Record<string, unknown>;

    if (isDemoMode) {
      exportData = {
        exportDate: new Date().toISOString(),
        practiceId: guard.practiceId,
        format: "POPIA Section 23 Data Export",
        user: { id: guard.user.id, name: guard.user.name, email: "redacted@demo.mode", role: guard.user.role },
        patients: demoStore.getPatients().slice(0, 20),
        bookings: demoStore.getBookings().slice(0, 20),
        invoices: demoStore.getInvoices().slice(0, 20),
        notifications: demoStore.getNotifications().slice(0, 20),
        consentRecords: demoStore.getConsents().slice(0, 10),
        metadata: { totalPatients: demoStore.getPatients().length, totalBookings: demoStore.getBookings().length, totalInvoices: demoStore.getInvoices().length, note: "Demo mode — sample data only" },
      };
    } else {
      const { db } = await import("@/lib/db");
      const [patients, bookings] = await Promise.all([
        db.listPatients(guard.practiceId),
        db.listBookings(guard.practiceId),
      ]);
      exportData = {
        exportDate: new Date().toISOString(),
        practiceId: guard.practiceId,
        format: "POPIA Section 23 Data Export",
        user: { id: guard.user.id, name: guard.user.name, role: guard.user.role },
        patients,
        bookings,
        invoices: [],
        metadata: { totalPatients: (patients as unknown[]).length, totalBookings: (bookings as unknown[]).length, totalInvoices: 0 },
      };
    }

    if (format === "csv") {
      const lines = ["POPIA Section 23 Data Export", `Date: ${exportData.exportDate}`, `Practice: ${exportData.practiceId}`, "", "--- PATIENTS ---"];
      const pts = exportData.patients as Record<string, unknown>[];
      if (pts.length > 0) {
        lines.push(Object.keys(pts[0]).join(","));
        pts.forEach(p => lines.push(Object.values(p).map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")));
      }
      const csvContent = "\uFEFF" + lines.join("\n");
      return new NextResponse(csvContent, {
        headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="data-export-${new Date().toISOString().split("T")[0]}.csv"` },
      });
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="data-export-${new Date().toISOString().split("T")[0]}.json"` },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
  }
}
