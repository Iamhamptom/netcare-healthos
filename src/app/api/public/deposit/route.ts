import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";
import { prisma } from "@/lib/prisma";

/** POST /api/public/deposit — Initialize Paystack deposit payment (no auth required) */
export async function POST(request: Request) {
  const rl = rateLimitByIp(request, "public/deposit", { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });

  const body = await request.json();
  const { bookingId, amount, email } = body;

  // Validate
  if (!bookingId || !amount || !email) {
    return NextResponse.json({ error: "Missing required fields: bookingId, amount, email" }, { status: 400 });
  }

  if (typeof amount !== "number" || amount <= 0 || amount > 50000) {
    return NextResponse.json({ error: "Invalid deposit amount" }, { status: 400 });
  }

  if (typeof email !== "string" || !email.includes("@") || email.length > 100) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const reference = `dep_${bookingId}_${Date.now()}`;

  // Demo mode — return fake authorization URL
  if (isDemoMode) {
    return NextResponse.json({
      authorization_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/callback?reference=${reference}`,
      reference,
    });
  }

  // Live — verify booking exists and deposit is expected
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.depositPaid) {
    return NextResponse.json({ error: "Deposit already paid" }, { status: 409 });
  }

  if (booking.depositAmount <= 0) {
    return NextResponse.json({ error: "No deposit required for this booking" }, { status: 400 });
  }

  // Initialize Paystack transaction
  const amountInCents = Math.round(amount * 100);
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/callback?reference=${reference}`;

  try {
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        email,
        amount: amountInCents,
        reference,
        callback_url: callbackUrl,
        currency: "ZAR",
        metadata: {
          bookingId,
          type: "booking_deposit",
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      console.error("Paystack initialize error:", paystackData);
      return NextResponse.json({ error: "Payment initialization failed" }, { status: 502 });
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
    });
  } catch (err) {
    console.error("Paystack request error:", err);
    return NextResponse.json({ error: "Payment service unavailable" }, { status: 503 });
  }
}
