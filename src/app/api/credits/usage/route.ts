import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { getUsageHistory, getBalance, seedDemoCredits, CREDIT_RATES } from "@/lib/credits";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "credits-usage");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    seedDemoCredits(guard.practiceId);
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 50, 1), 200);

  const history = await getUsageHistory(guard.practiceId, limit);
  const balance = await getBalance(guard.practiceId);

  // Calculate usage breakdown by type
  const breakdown: Record<string, { count: number; total: number }> = {};
  for (const entry of history) {
    if (entry.amount < 0) {
      if (!breakdown[entry.type]) breakdown[entry.type] = { count: 0, total: 0 };
      breakdown[entry.type].count++;
      breakdown[entry.type].total += Math.abs(entry.amount);
    }
  }

  return NextResponse.json({
    balance,
    currency: "ZAR",
    rates: CREDIT_RATES,
    breakdown,
    history,
  });
}
