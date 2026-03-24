import { NextRequest, NextResponse } from "next/server";
import { searchICD10 } from "@/lib/claims/icd10-database";
import { searchNAPPI } from "@/lib/claims/nappi-database";
import { searchTariffs } from "@/lib/claims/tariff-database";
import { rateLimitByIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  // Rate limit (lighter auth — search is read-only, no PII)
  const rl = await rateLimitByIp(req, "claims/search", { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "icd10";

  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const results = type === "nappi"
    ? await searchNAPPI(q, 20)
    : type === "tariff"
      ? searchTariffs(q).slice(0, 20)
      : searchICD10(q, 20);

  return NextResponse.json({ results });
}
