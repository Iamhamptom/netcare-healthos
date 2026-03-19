import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoPractice } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

// GET — current subscription status
export async function GET(request: Request) {
  const guard = await guardRoute(request, "subscription");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      subscription: {
        plan: demoPractice.plan,
        status: demoPractice.planStatus,
        trialEndsAt: demoPractice.trialEndsAt,
        paystackSubId: demoPractice.paystackSubId || null,
        nextPaymentDate: null,
        amount: { starter: 2999.99, core: 15000, professional: 35000, enterprise: 55000 }[demoPractice.plan] || 0,
      },
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const practice = await prisma.practice.findUnique({ where: { id: guard.practiceId } });
  if (!practice) return NextResponse.json({ error: "Practice not found" }, { status: 404 });

  let paystackSub = null;
  if (practice.paystackSubId) {
    try {
      const { getSubscription } = await import("@/lib/paystack");
      paystackSub = await getSubscription(practice.paystackSubId);
    } catch { /* paystack might be unconfigured */ }
  }

  return NextResponse.json({
    subscription: {
      plan: practice.plan,
      status: practice.planStatus,
      trialEndsAt: practice.trialEndsAt,
      paystackSubId: practice.paystackSubId || null,
      nextPaymentDate: paystackSub?.next_payment_date || null,
      amount: { starter: 2999.99, core: 15000, professional: 35000, enterprise: 55000 }[practice.plan] || 0,
    },
  });
}

// POST — initialize a subscription checkout
export async function POST(request: Request) {
  const guard = await guardRoute(request, "subscription");
  if (isErrorResponse(guard)) return guard;

  const { plan } = await request.json();
  if (!["starter", "core", "professional", "enterprise"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (isDemoMode) {
    return NextResponse.json({
      checkout_url: "#demo-checkout",
      reference: "demo-ref-" + Date.now(),
      message: "In demo mode — no real checkout. Plan would be upgraded to: " + plan,
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({ where: { id: guard.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  try {
    const { initializeSubscription } = await import("@/lib/paystack");
    const result = await initializeSubscription(user.email, plan, guard.practiceId, {
      user_id: user.id,
      user_name: user.name,
    });

    return NextResponse.json({
      checkout_url: result.authorization_url,
      reference: result.reference,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Paystack initialization failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH — cancel subscription
export async function PATCH(request: Request) {
  const guard = await guardRoute(request, "subscription");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ message: "Subscription cancelled (demo mode)" });
  }

  const { prisma } = await import("@/lib/prisma");
  const practice = await prisma.practice.findUnique({ where: { id: guard.practiceId } });
  if (!practice?.paystackSubId) {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }

  try {
    const { getSubscription, cancelSubscription } = await import("@/lib/paystack");
    const sub = await getSubscription(practice.paystackSubId);
    if (sub?.email_token) {
      await cancelSubscription(practice.paystackSubId, sub.email_token);
    }

    await prisma.practice.update({
      where: { id: guard.practiceId },
      data: { planStatus: "cancelled" },
    });

    return NextResponse.json({ message: "Subscription cancelled" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cancellation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
