import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";
import { prisma } from "@/lib/prisma";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE = "https://api.paystack.co";

const PLAN_CODES: Record<string, string | undefined> = {
  starter: process.env.PAYSTACK_PLAN_STARTER,
  core: process.env.PAYSTACK_PLAN_CORE,
  professional: process.env.PAYSTACK_PLAN_PROFESSIONAL,
  enterprise: process.env.PAYSTACK_PLAN_ENTERPRISE,
};

const PLAN_AMOUNTS: Record<string, number> = {
  starter: 299999,       // R2,999.99 in kobo (Starter promo)
  core: 1500000,         // R15,000 in kobo
  professional: 3500000, // R35,000 in kobo
  enterprise: 5500000,   // R55,000 in kobo
};

async function paystackFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
      ...opts.headers,
    },
  });
  return res.json();
}

export async function POST(request: Request) {
  try {
    const auth = await guardRoute(request, "billing-subscribe");
    if (isErrorResponse(auth)) return auth;

    const body = await request.json();
    const { plan } = body as { plan?: string };

    if (!plan || !PLAN_CODES[plan]) {
      return NextResponse.json(
        { error: "Invalid plan. Choose starter, core, professional, or enterprise." },
        { status: 400 }
      );
    }

    // Demo mode: return fake authorization URL
    if (isDemoMode) {
      return NextResponse.json({
        authorization_url: `https://checkout.paystack.com/demo-${plan}`,
        reference: `demo-ref-${Date.now()}`,
        plan,
      });
    }

    const practice = await prisma.practice.findUnique({
      where: { id: auth.practiceId },
      include: { users: { where: { id: auth.user.id }, select: { email: true, name: true } } },
    });

    if (!practice) {
      return NextResponse.json({ error: "Practice not found" }, { status: 404 });
    }

    const userEmail = practice.users[0]?.email;
    if (!userEmail) {
      return NextResponse.json({ error: "User email required for billing" }, { status: 400 });
    }

    // Create or retrieve Paystack customer
    let customerId = practice.paystackCustId;

    if (!customerId) {
      const custRes = await paystackFetch("/customer", {
        method: "POST",
        body: JSON.stringify({
          email: userEmail,
          first_name: practice.users[0]?.name || practice.name,
          metadata: { practice_id: practice.id, practice_name: practice.name },
        }),
      });

      if (!custRes.status) {
        return NextResponse.json(
          { error: "Failed to create Paystack customer", detail: custRes.message },
          { status: 502 }
        );
      }

      customerId = custRes.data.customer_code;

      await prisma.practice.update({
        where: { id: practice.id },
        data: { paystackCustId: customerId },
      });
    }

    // Initialize transaction with plan
    const planCode = PLAN_CODES[plan]!;
    const reference = `healthops-${practice.id}-${Date.now()}`;

    const txRes = await paystackFetch("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email: userEmail,
        amount: PLAN_AMOUNTS[plan],
        plan: planCode,
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://healthops.vercel.app"}/admin/billing?status=success`,
        metadata: {
          practice_id: practice.id,
          plan,
          custom_fields: [
            { display_name: "Practice", variable_name: "practice", value: practice.name },
            { display_name: "Plan", variable_name: "plan", value: plan },
          ],
        },
      }),
    });

    if (!txRes.status) {
      return NextResponse.json(
        { error: "Failed to initialize transaction", detail: txRes.message },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorization_url: txRes.data.authorization_url,
      reference: txRes.data.reference,
      plan,
    });
  } catch (err) {
    console.error("[billing/subscribe] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
