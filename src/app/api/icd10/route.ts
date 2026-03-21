import { NextResponse, NextRequest } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClaimsSource } from "@/lib/data-sources";
import { searchICD10 as searchStatic } from "@/lib/icd10-data";

export async function GET(request: NextRequest) {
  const rl = await rateLimitByIp(request, "icd10", { limit: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const code = url.searchParams.get("code");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  // Validate a specific code
  if (code) {
    try {
      const source = getClaimsSource();
      const result = await source.validateICD10(code);
      return NextResponse.json(result);
    } catch {
      const results = searchStatic(code, 1);
      return NextResponse.json({
        valid: results.length > 0,
        code,
        description: results[0]?.description || "",
        specificity: results.length > 0 ? "sufficient" : "invalid",
        pmbCondition: false,
        requiresAuth: false,
        warnings: results.length === 0 ? [`Code ${code} not found`] : [],
        suggestions: [],
      });
    }
  }

  // Search
  try {
    const source = getClaimsSource();
    const results = await source.searchICD10(query, limit);
    if (results.length > 0) {
      return NextResponse.json({ results, total: results.length });
    }
  } catch {
    // Fallback to static data on Supabase error
  }

  const results = searchStatic(query, limit);
  return NextResponse.json({ results, total: results.length });
}
