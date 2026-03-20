import { NextResponse, NextRequest } from "next/server";
import { guardPlatformAdmin } from "@/lib/api-helpers";
import { getSavingsSource } from "@/lib/data-sources";

export async function GET(request: NextRequest) {
  const guard = await guardPlatformAdmin(request, "savings");
  if (guard instanceof NextResponse) return guard;

  const source = getSavingsSource();
  const url = new URL(request.url);
  const clinicId = url.searchParams.get("clinic_id") || undefined;

  try {
    const monthly = await source.getMonthlySavings(clinicId);

    const totals = {
      claims: 0, era: 0, debtors: 0, capitation: 0, compliance: 0, pharmacy: 0,
    };
    for (const m of monthly) {
      totals.claims += m.claims;
      totals.era += m.era;
      totals.debtors += m.debtors;
      totals.capitation += m.capitation;
      totals.compliance += m.compliance;
      totals.pharmacy += m.pharmacy;
    }

    const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
    const monthCount = monthly.length || 1;
    const annualized = Math.round((grandTotal / monthCount) * 12);

    return NextResponse.json({ monthly, totals, grandTotal, annualized, monthCount });
  } catch (err) {
    console.error("Savings API error:", err);
    return NextResponse.json({ error: "Failed to fetch savings data" }, { status: 500 });
  }
}
