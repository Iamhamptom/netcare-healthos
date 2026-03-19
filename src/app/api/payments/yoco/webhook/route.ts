import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, payload } = body;

    // Yoco webhook events
    if (type === "payment.succeeded" && payload?.metadata?.practiceId) {
      const { practiceId, plan } = payload.metadata;
      if (plan) {
        await db.updatePractice(practiceId, {
          plan,
          planStatus: "active",
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
