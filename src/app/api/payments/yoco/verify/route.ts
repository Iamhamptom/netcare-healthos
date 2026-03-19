import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { getCheckout } from "@/lib/yoco";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const guard = await guardRoute(request, "yoco-verify");
  if (isErrorResponse(guard)) return guard;

  const { checkoutId } = await request.json();
  if (!checkoutId) {
    return NextResponse.json({ error: "Checkout ID required" }, { status: 400 });
  }

  try {
    const checkout = await getCheckout(checkoutId);
    if (!checkout) {
      return NextResponse.json({ error: "Checkout not found" }, { status: 404 });
    }

    if (checkout.status === "completed") {
      const plan = checkout.metadata?.plan;
      if (plan) {
        await db.updatePractice(guard.practiceId, {
          plan,
          planStatus: "active",
        });
      }
    }

    return NextResponse.json({
      status: checkout.status,
      amount: checkout.amount,
      plan: checkout.metadata?.plan,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
