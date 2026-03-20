// POST /api/switching/edifact — Generate EDIFACT MEDCLM message from claim data
// PUT /api/switching/edifact — Parse raw EDIFACT message into structured data

import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import {
  generateEDIFACT,
  parseEDIFACT,
  validateEDIFACTMessage,
  claimToEDIFACT,
  parseEDIFACTResponse,
} from "@/lib/switching";

export async function POST(req: Request) {
  const guard = await guardRoute(req, "switching-edifact");
  if (isErrorResponse(guard)) return guard;
  try {
    const body = await req.json();
    const { claim, batchNumber, correctionType, messageRef } = body;

    if (!claim) {
      return NextResponse.json({ error: "Claim data is required" }, { status: 400 });
    }

    // Generate EDIFACT
    const edifact = generateEDIFACT(claim, { batchNumber, correctionType, messageRef });

    // Also convert to structured EDIFACTMessage for validation
    const message = claimToEDIFACT(claim);
    const validation = validateEDIFACTMessage(message);

    return NextResponse.json({
      edifact,
      message,
      validation,
      spec: "PHISC MEDCLM v0:912:ZA",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const guard = await guardRoute(req, "switching-edifact-parse");
  if (isErrorResponse(guard)) return guard;
  try {
    const body = await req.json();
    const { raw, type } = body;

    if (!raw) {
      return NextResponse.json({ error: "Raw EDIFACT string is required" }, { status: 400 });
    }

    if (type === "response") {
      const parsed = parseEDIFACTResponse(raw);
      return NextResponse.json({ parsed, type: "response" });
    }

    const parsed = parseEDIFACT(raw);
    const validation = validateEDIFACTMessage(parsed);

    return NextResponse.json({
      parsed,
      validation,
      type: "claim",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
