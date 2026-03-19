import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";

// Paystack sends webhooks for subscription lifecycle events
// Docs: https://paystack.com/docs/payments/webhooks/
export async function POST(request: Request) {
  if (isDemoMode) {
    return NextResponse.json({ message: "Webhook received (demo mode)" });
  }

  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature") || "";

  // Validate signature
  const { validateWebhookSignature } = await import("@/lib/paystack");
  if (!validateWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);
  const { prisma } = await import("@/lib/prisma");

  switch (event.event) {
    case "subscription.create": {
      const sub = event.data;
      const practiceId = sub.metadata?.practice_id;
      if (!practiceId) break;

      await prisma.practice.update({
        where: { id: practiceId },
        data: {
          paystackSubId: sub.subscription_code,
          paystackCustId: sub.customer?.customer_code || "",
          plan: sub.metadata?.plan || "starter",
          planStatus: "active",
        },
      });
      break;
    }

    case "charge.success": {
      // Recurring charge succeeded — ensure practice stays active
      const charge = event.data;
      const practiceId = charge.metadata?.practice_id;
      if (!practiceId) break;

      await prisma.practice.update({
        where: { id: practiceId },
        data: { planStatus: "active" },
      });
      break;
    }

    case "invoice.payment_failed": {
      // Payment failed — mark as past_due
      const invoice = event.data;
      const sub = invoice.subscription;
      if (!sub?.metadata?.practice_id) break;

      await prisma.practice.update({
        where: { id: sub.metadata.practice_id },
        data: { planStatus: "past_due" },
      });
      break;
    }

    case "subscription.not_renew":
    case "subscription.disable": {
      // Subscription cancelled
      const sub = event.data;
      const practiceId = sub.metadata?.practice_id;
      if (!practiceId) break;

      await prisma.practice.update({
        where: { id: practiceId },
        data: { planStatus: "cancelled" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
