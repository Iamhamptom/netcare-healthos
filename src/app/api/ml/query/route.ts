// POST /api/ml/query — RAG-powered medical AI query
// Uses Ollama local models + Supabase pgvector knowledge base

import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { ragQuery, ragClaimsQuery, ragComplianceQuery, ragSchemeQuery } from "@/lib/ml";

export async function POST(req: Request) {
  const guard = await guardRoute(req, "ml-query", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await req.json();
    const { query, mode, scheme, options } = body;

    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    let result;
    switch (mode) {
      case "claims":
        result = await ragClaimsQuery(query);
        break;
      case "compliance":
        result = await ragComplianceQuery(query);
        break;
      case "scheme":
        result = await ragSchemeQuery(query, scheme);
        break;
      default:
        result = await ragQuery(query, options);
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "ML query failed" }, { status: 500 });
  }
}
