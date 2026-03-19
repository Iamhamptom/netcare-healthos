import { NextResponse } from "next/server";
import { searchICD10 } from "@/lib/icd10-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "20");

  const results = searchICD10(query, limit);
  return NextResponse.json({ results, total: results.length });
}
