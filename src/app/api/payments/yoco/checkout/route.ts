import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { createCheckout, PLAN_AMOUNTS, SETUP_FEES, PLAN_LABELS } from "@/lib/yoco";

export async function POST(request: Request) {
  const guard = await guardRoute(request, "yoco-checkout");
  if (isErrorResponse(guard)) return guard;

  const { plan, type } = await request.json();

  if (!plan || !PLAN_AMOUNTS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const isSetup = type === "setup";
  const amount = isSetup ? SETUP_FEES[plan] : PLAN_AMOUNTS[plan];
  const description = isSetup
    ? `Netcare Health OS OS — ${PLAN_LABELS[plan]} Setup Fee`
    : `Netcare Health OS OS — ${PLAN_LABELS[plan]} Monthly Subscription`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://healthops-platform.vercel.app";

  try {
    const checkout = await createCheckout({
      amountInCents: amount,
      description,
      successUrl: `${baseUrl}/dashboard/settings?payment=success&plan=${plan}&type=${type}`,
      cancelUrl: `${baseUrl}/dashboard/settings?payment=cancelled`,
      metadata: {
        practiceId: guard.practiceId,
        userId: guard.user.id,
        plan,
        type: type || "subscription",
      },
    });

    return NextResponse.json({
      checkoutId: checkout.id,
      redirectUrl: checkout.redirectUrl,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Payment failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
