import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";

/**
 * Payment Collection API — Pre-payment for consultations via Yoco
 *
 * POST /api/payments/collect
 * Creates a Yoco checkout for patient pre-payment at booking time.
 *
 * Flow: Patient books via WhatsApp → AI sends payment link → Patient pays → Booking confirmed
 */

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "payments/collect", { limit: 20 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  try {
    const {
      amount,           // Amount in cents (e.g., 260000 for R2,600)
      currency = "ZAR",
      patientName,
      patientEmail,
      patientPhone,
      serviceName,      // "New Patient Consultation"
      practiceId,
      bookingId,
      metadata = {},
    } = await request.json();

    if (!amount || !patientName || !serviceName) {
      return NextResponse.json({ error: "amount, patientName, serviceName required" }, { status: 400 });
    }

    const yocoSecretKey = process.env.YOCO_SECRET_KEY;
    if (!yocoSecretKey) {
      // Return a mock checkout for demo mode
      return NextResponse.json({
        checkoutId: `demo-${Date.now()}`,
        redirectUrl: `https://healthos.visiocorp.co/payment/success?demo=true&amount=${amount}`,
        status: "demo",
        message: "Payment system in demo mode. In production, patient would be redirected to Yoco checkout.",
        amount: amount / 100,
        currency,
        patient: patientName,
        service: serviceName,
      });
    }

    // Create Yoco checkout session
    const yocoRes = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${yocoSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://healthos.visiocorp.co"}/payment/success?bookingId=${bookingId || ""}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://healthos.visiocorp.co"}/payment/cancel`,
        failureUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://healthos.visiocorp.co"}/payment/failed`,
        metadata: {
          patientName,
          patientEmail: patientEmail || "",
          patientPhone: patientPhone || "",
          serviceName,
          practiceId: practiceId || "rheumcare",
          bookingId: bookingId || "",
          ...metadata,
        },
      }),
    });

    const checkout = await yocoRes.json();

    if (!yocoRes.ok) {
      return NextResponse.json({ error: "Payment checkout creation failed", details: checkout }, { status: 500 });
    }

    return NextResponse.json({
      checkoutId: checkout.id,
      redirectUrl: checkout.redirectUrl,
      status: "created",
      amount: amount / 100,
      currency,
      patient: patientName,
      service: serviceName,
    });
  } catch {
    return NextResponse.json({ error: "Payment collection failed" }, { status: 500 });
  }
}
