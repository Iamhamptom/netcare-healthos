#!/usr/bin/env npx tsx
/**
 * RAG v3 Reindex Script — Netcare Health OS
 *
 * Reads documents.jsonl, batches 100 at a time, embeds with Gemini/OpenAI,
 * and inserts into Supabase rag_chunks table.
 *
 * Usage:
 *   npx tsx scripts/reindex-rag-v3.ts                    # Full reindex
 *   npx tsx scripts/reindex-rag-v3.ts --skip-embeddings  # Keyword-only (no API cost)
 *   npx tsx scripts/reindex-rag-v3.ts --stats            # Show index stats
 *   npx tsx scripts/reindex-rag-v3.ts --build-index      # Build IVFFlat vector index
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — Supabase service role key
 *   GOOGLE_API_KEY or GEMINI_API_KEY — For Gemini embeddings (primary)
 *   OPENAI_API_KEY — For OpenAI embeddings (fallback)
 */

import path from "path";
import dotenv from "dotenv";

// Load .env from project root
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  const args = process.argv.slice(2);

  // Validate env vars
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL is not set");
    process.exit(1);
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY is not set");
    process.exit(1);
  }

  const hasEmbeddingKey =
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.OPENAI_API_KEY;

  if (!hasEmbeddingKey && !args.includes("--skip-embeddings") && !args.includes("--stats")) {
    console.error(
      "ERROR: No embedding API key found. Set GOOGLE_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY."
    );
    console.error("       Or use --skip-embeddings to index without vectors (keyword search only).");
    process.exit(1);
  }

  // Import dynamically after env is loaded
  const { reindexAll, buildVectorIndex, getIndexStats } = await import(
    "../src/lib/rag-v3/indexer"
  );

  // ── Stats mode ──────────────────────────────────────────────
  if (args.includes("--stats")) {
    console.log("\n📊 RAG v3 Index Statistics\n");

    try {
      const stats = await getIndexStats();
      console.log(`  Total chunks:     ${stats.totalChunks.toLocaleString()}`);
      console.log(`  With embeddings:  ${stats.withEmbeddings.toLocaleString()}`);
      console.log(`  Avg tokens/chunk: ${stats.avgTokens}`);
      console.log(`\n  Categories:`);

      const sortedCats = Object.entries(stats.categories).sort(
        (a, b) => b[1] - a[1]
      );
      for (const [cat, count] of sortedCats) {
        console.log(`    ${cat.padEnd(15)} ${count.toLocaleString()}`);
      }
    } catch (err) {
      console.error("  Failed to get stats:", err);
      console.error("  (Has the migration been applied? Run the SQL in supabase/migrations/20260324_rag_v3.sql)");
    }

    return;
  }

  // ── Build vector index mode ─────────────────────────────────
  if (args.includes("--build-index")) {
    console.log("\n🔨 Building IVFFlat vector index...\n");

    try {
      await buildVectorIndex();
      console.log("  Vector index built successfully!\n");
    } catch (err) {
      console.error("  Failed to build vector index:", err);
      process.exit(1);
    }

    return;
  }

  // ── Full reindex mode ───────────────────────────────────────
  const skipEmbeddings = args.includes("--skip-embeddings");
  const documentsPath = path.join(
    __dirname,
    "..",
    "ml",
    "rag-index",
    "documents.jsonl"
  );

  console.log("\n🚀 RAG v3 Full Reindex\n");
  console.log(`  Documents:  ${documentsPath}`);
  console.log(`  Embeddings: ${skipEmbeddings ? "SKIPPED (keyword-only)" : hasEmbeddingKey ? "Enabled" : "No key"}`);
  console.log(`  Provider:   ${process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY ? "Gemini" : "OpenAI"}`);
  console.log(`  Supabase:   ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log("");

  const startTime = Date.now();

  try {
    const result = await reindexAll(documentsPath, {
      batchSize: 100,
      clearExisting: true,
      skipEmbeddings,
      onProgress: (indexed, total) => {
        const pct = Math.round((indexed / total) * 100);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = (indexed / ((Date.now() - startTime) / 1000)).toFixed(1);
        process.stdout.write(
          `\r  Progress: ${indexed.toLocaleString()}/${total.toLocaleString()} (${pct}%) — ${elapsed}s elapsed, ${rate} docs/sec`
        );
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n\n✅ Reindex complete in ${elapsed}s\n`);
    console.log(`  Total documents: ${result.total.toLocaleString()}`);
    console.log(`  Indexed:         ${result.indexed.toLocaleString()}`);
    console.log(`  Chunks created:  ${result.chunks.toLocaleString()}`);
    console.log(`  Errors:          ${result.errors.toLocaleString()}`);
    console.log(`  Skipped:         ${result.skipped.toLocaleString()}`);

    if (!skipEmbeddings && result.chunks > 0) {
      console.log("\n  Next step: Build the vector index:");
      console.log("    npx tsx scripts/reindex-rag-v3.ts --build-index\n");
    }

    if (skipEmbeddings) {
      console.log("\n  Note: Indexed without embeddings (keyword search only).");
      console.log("  To add embeddings later, rerun without --skip-embeddings.\n");
    }
  } catch (err) {
    console.error("\n❌ Reindex failed:", err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
