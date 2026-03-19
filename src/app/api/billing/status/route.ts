import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";
import { prisma } from "@/lib/prisma";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE = "https://api.paystack.co";

const PLAN_PRICES: Record<string, number> = {
  starter: 2999.99,      // Starter promo
  core: 15000,           // Core plan
  professional: 35000,
  enterprise: 55000,
};

export async function GET(request: Request) {
  try {
    const auth = await guardRoute(request, "billing-status");
    if (isErrorResponse(auth)) return auth;

    // Demo mode: return mock billing data
    if (isDemoMode) {
      return NextResponse.json({
        plan: "professional",
        planStatus: "active",
        priceRands: 1799,
        trialEndsAt: null,
        nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        paystackSubId: "SUB_demo123",
        paystackCustId: "CUS_demo456",
      });
    }

    const practice = await prisma.practice.findUnique({
      where: { id: auth.practiceId },
      select: {
        plan: true,
        planStatus: true,
        trialEndsAt: true,
        paystackSubId: true,
        paystackCustId: true,
      },
    });

    if (!practice) {
      return NextResponse.json({ error: "Practice not found" }, { status: 404 });
    }

    let nextBillingDate: string | null = null;

    // Fetch next billing date from Paystack if subscription is active
    if (practice.paystackSubId && practice.planStatus === "active") {
      try {
        const res = await fetch(
          `${PAYSTACK_BASE}/subscription/${practice.paystackSubId}`,
          {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
          }
        );
        const subData = await res.json();
        if (subData.status && subData.data?.next_payment_date) {
          nextBillingDate = subData.data.next_payment_date;
        }
      } catch {
        // Non-critical — proceed without next billing date
        console.warn("[billing/status] Could not fetch subscription details from Paystack");
      }
    }

    return NextResponse.json({
      plan: practice.plan,
      planStatus: practice.planStatus,
      priceRands: PLAN_PRICES[practice.plan] || 0,
      trialEndsAt: practice.trialEndsAt?.toISOString() || null,
      nextBillingDate,
      paystackSubId: practice.paystackSubId || null,
      paystackCustId: practice.paystackCustId || null,
    });
  } catch (err) {
    console.error("[billing/status] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
