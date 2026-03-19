import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";
import { addCredits, seedDemoCredits } from "@/lib/credits";

export async function POST(request: Request) {
  const guard = await guardPlatformAdmin(request, "credits-topup");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  if (!body.practiceId || !body.amount || Number(body.amount) <= 0) {
    return NextResponse.json({ error: "practiceId and positive amount are required" }, { status: 400 });
  }

  if (isDemoMode) {
    seedDemoCredits(body.practiceId);
  }

  const description = body.description || "Manual top-up by platform admin";
  const result = await addCredits(body.practiceId, Number(body.amount), description);

  return NextResponse.json({
    balance: result.balance,
    entry: result.entry,
  }, { status: 201 });
}
