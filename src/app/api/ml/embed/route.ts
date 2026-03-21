// POST /api/ml/embed — Embed and store knowledge base documents
// GET /api/ml/embed — Search the embedded knowledge base

import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import {
  chunkDocument,
  generateBatchEmbeddings,
  storeEmbeddings,
  searchKnowledgeBase,
} from "@/lib/ml";

export async function GET(req: Request) {
  const guard = await guardRoute(req, "ml-embed-search");
  if (isErrorResponse(guard)) return guard;

  const url = new URL(req.url);
  const query = url.searchParams.get("q");
  const category = url.searchParams.get("category") || undefined;
  const limit = parseInt(url.searchParams.get("limit") || "5", 10);

  if (!query) {
    return NextResponse.json({ error: "q parameter is required" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const results = await searchKnowledgeBase(query, supabaseUrl, supabaseKey, {
    limit: isNaN(limit) ? 5 : limit,
    category,
  });

  return NextResponse.json({ query, results, count: results.length });
}

export async function POST(req: Request) {
  const guard = await guardRoute(req, "ml-embed-create", { limit: 5 });
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await req.json();
    const { content, source, category } = body;

    if (!content || !source) {
      return NextResponse.json({ error: "content and source are required" }, { status: 400 });
    }

    // Chunk the document
    const chunks = chunkDocument(content, source, category || "general");

    // Generate embeddings
    const texts = chunks.map(c => c.content);
    const embeddings = await generateBatchEmbeddings(texts);

    // Attach embeddings to chunks
    for (let i = 0; i < chunks.length; i++) {
      chunks[i].embedding = embeddings[i];
    }

    // Store in Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        chunks: chunks.length,
        embeddingDimensions: embeddings[0]?.length || 0,
        stored: false,
        message: "Embeddings generated but Supabase not configured for storage",
      });
    }

    const result = await storeEmbeddings(chunks, supabaseUrl, supabaseKey);

    return NextResponse.json({
      chunks: chunks.length,
      embeddingDimensions: embeddings[0]?.length || 0,
      stored: result.stored,
      errors: result.errors,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Embedding failed" }, { status: 500 });
  }
}
