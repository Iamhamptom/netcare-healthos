import { NextResponse, NextRequest } from "next/server";
import { guardPlatformAdmin } from "@/lib/api-helpers";
import { getBridgeSource } from "@/lib/data-sources";

export async function GET(request: NextRequest) {
  const guard = await guardPlatformAdmin(request, "bridge");
  if (guard instanceof NextResponse) return guard;

  try {
    const source = getBridgeSource();
    const integrations = await source.getIntegrationStatus();
    return NextResponse.json({ integrations });
  } catch (err) {
    console.error("Bridge API error:", err);
    return NextResponse.json({ error: "Failed to fetch integration status" }, { status: 500 });
  }
}
