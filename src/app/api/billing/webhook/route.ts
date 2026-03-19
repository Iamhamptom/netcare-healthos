import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo";
import { rateLimitByIp } from "@/lib/rate-limit";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(body)
    .digest("hex");
  return hash === signature;
}

function planFromCode(planCode: string): string | null {
  const map: Record<string, string> = {};
  if (process.env.PAYSTACK_PLAN_STARTER) map[process.env.PAYSTACK_PLAN_STARTER] = "starter";
  if (process.env.PAYSTACK_PLAN_PROFESSIONAL) map[process.env.PAYSTACK_PLAN_PROFESSIONAL] = "professional";
  if (process.env.PAYSTACK_PLAN_ENTERPRISE) map[process.env.PAYSTACK_PLAN_ENTERPRISE] = "enterprise";
  return map[planCode] || null;
}

export async function POST(request: Request) {
  try {
    // Rate limit webhook endpoint
    const rl = rateLimitByIp(request, "billing-webhook", { limit: 100 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Demo mode: acknowledge but do nothing
    if (isDemoMode) {
      return NextResponse.json({ received: true });
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";

    if (!verifySignature(rawBody, signature)) {
      console.error("[billing/webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    console.log(`[billing/webhook] Event: ${event}`);

    switch (event) {
      case "charge.success": {
        // Payment succeeded — activate plan if metadata has practice_id
        const practiceId = data.metadata?.practice_id;
        const plan = data.metadata?.plan;
        if (practiceId && plan) {
          await prisma.practice.update({
            where: { id: practiceId },
            data: {
              plan,
              planStatus: "active",
              trialEndsAt: null,
            },
          });
          console.log(`[billing/webhook] charge.success → practice ${practiceId} activated on ${plan}`);
        }
        break;
      }

      case "subscription.create": {
        // Subscription created — store subscription ID and activate
        const practiceId = data.metadata?.practice_id;
        const subCode = data.subscription_code;
        const planCode = data.plan?.plan_code;
        const plan = planFromCode(planCode) || data.metadata?.plan;

        if (practiceId) {
          const updateData: Record<string, unknown> = {
            planStatus: "active",
            trialEndsAt: null,
          };
          if (subCode) updateData.paystackSubId = subCode;
          if (plan) updateData.plan = plan;

          await prisma.practice.update({
            where: { id: practiceId },
            data: updateData,
          });
          console.log(`[billing/webhook] subscription.create → practice ${practiceId}, sub ${subCode}`);
        }
        break;
      }

      case "subscription.not_renew": {
        // Subscription will not renew — mark as cancelled at period end
        const subCode = data.subscription_code;
        if (subCode) {
          const practice = await prisma.practice.findFirst({
            where: { paystackSubId: subCode },
          });
          if (practice) {
            await prisma.practice.update({
              where: { id: practice.id },
              data: { planStatus: "cancelled" },
            });
            console.log(`[billing/webhook] subscription.not_renew → practice ${practice.id} cancelled`);
          }
        }
        break;
      }

      case "subscription.disable": {
        // Subscription disabled — deactivate
        const subCode = data.subscription_code;
        if (subCode) {
          const practice = await prisma.practice.findFirst({
            where: { paystackSubId: subCode },
          });
          if (practice) {
            await prisma.practice.update({
              where: { id: practice.id },
              data: {
                planStatus: "cancelled",
                paystackSubId: "",
              },
            });
            console.log(`[billing/webhook] subscription.disable → practice ${practice.id} disabled`);
          }
        }
        break;
      }

      default:
        console.log(`[billing/webhook] Unhandled event: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[billing/webhook] Error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
