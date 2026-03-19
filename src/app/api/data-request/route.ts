import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["access", "correction", "deletion", "objection"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, requestType, details, idNumber } = body;

    if (!name || !email || !requestType) {
      return NextResponse.json(
        { error: "Name, email, and request type are required" },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(requestType)) {
      return NextResponse.json(
        { error: "Invalid request type" },
        { status: 400 }
      );
    }

    // In production, this would insert into a data_requests table
    // For now, log the request (demo mode compatible)
    console.log("[DATA-REQUEST]", {
      name,
      email,
      requestType,
      details: details?.slice(0, 500),
      idLastFour: idNumber?.slice(-4),
      timestamp: new Date().toISOString(),
      ip: req.headers.get("x-forwarded-for") || "unknown",
    });

    // TODO: When Prisma is available in production mode:
    // await prisma.dataRequest.create({ data: { name, email, requestType, details, status: 'pending' } })
    // TODO: Send confirmation email via Resend

    return NextResponse.json({
      success: true,
      message: "Data subject request received. We will respond within 30 days.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
