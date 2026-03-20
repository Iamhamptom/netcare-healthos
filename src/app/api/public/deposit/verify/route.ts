import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";
// Direct prisma import: Payment/deposit models are Prisma-only, not yet in Supabase db abstraction
import { prisma } from "@/lib/prisma";

/** POST /api/public/deposit/verify — Verify Paystack deposit payment (no auth required) */
export async function POST(request: Request) {
  const rl = rateLimitByIp(request, "public/deposit/verify", { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });

  const body = await request.json();
  const { reference } = body;

  if (!reference || typeof reference !== "string") {
    return NextResponse.json({ error: "Missing required field: reference" }, { status: 400 });
  }

  // Extract bookingId from reference (format: dep_{bookingId}_{timestamp})
  const parts = reference.split("_");
  if (parts.length < 3 || parts[0] !== "dep") {
    return NextResponse.json({ error: "Invalid payment reference" }, { status: 400 });
  }
  const bookingId = parts[1];

  // Demo mode — always succeed
  if (isDemoMode) {
    return NextResponse.json({
      verified: true,
      message: "Deposit verified (demo mode)",
      bookingId,
    });
  }

  // Live — verify booking exists
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.depositPaid) {
    return NextResponse.json({
      verified: true,
      message: "Deposit already verified",
      bookingId,
    });
  }

  // Verify with Paystack
  try {
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      console.error("Paystack verify error:", paystackData);
      return NextResponse.json({ error: "Payment verification failed" }, { status: 502 });
    }

    const txStatus = paystackData.data?.status;

    if (txStatus !== "success") {
      return NextResponse.json({
        verified: false,
        message: `Payment not successful. Status: ${txStatus}`,
        bookingId,
      });
    }

    // Payment confirmed — update booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        depositPaid: true,
        paymentRef: reference,
      },
    });

    return NextResponse.json({
      verified: true,
      message: "Deposit payment verified successfully",
      bookingId,
    });
  } catch (err) {
    console.error("Paystack verify request error:", err);
    return NextResponse.json({ error: "Payment service unavailable" }, { status: 503 });
  }
}
