import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { getBalance, getUsageHistory, seedDemoCredits, CREDIT_RATES, PLAN_CREDITS } from "@/lib/credits";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "credits");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    seedDemoCredits(guard.practiceId);
  }

  const balance = await getBalance(guard.practiceId);
  const recent = await getUsageHistory(guard.practiceId, 10);

  return NextResponse.json({
    balance,
    currency: "ZAR",
    rates: CREDIT_RATES,
    planCredits: PLAN_CREDITS,
    recentUsage: recent,
  });
}
