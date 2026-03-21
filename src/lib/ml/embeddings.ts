// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Embedding Pipeline — Convert knowledge base into vector embeddings
// Uses Ollama local models for embedding generation
// Stores in Supabase pgvector for RAG retrieval
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const EMBEDDING_MODEL = "thewindmom/llama3-med42-8b:latest"; // Medical domain model — 4096-dim embeddings
const CHUNK_SIZE = 1000; // Characters per chunk
const CHUNK_OVERLAP = 200; // Overlap between chunks for context continuity

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    section: string;
    category: string;
    chunkIndex: number;
    totalChunks: number;
  };
  embedding?: number[];
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  promptTokens: number;
}

// ─── Ollama Embedding Generation ────────────────────────────────────────────

/**
 * Generate embeddings using Ollama local model.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama embedding error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as { embeddings: number[][] };
  return data.embeddings[0];
}

/**
 * Generate embeddings for a batch of texts.
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  // Process in batches of 10 to avoid overwhelming Ollama
  for (let i = 0; i < texts.length; i += 10) {
    const batch = texts.slice(i, i + 10);
    const batchResults = await Promise.all(
      batch.map(text => generateEmbedding(text))
    );
    results.push(...batchResults);
  }
  return results;
}

// ─── Document Chunking ──────────────────────────────────────────────────────

/**
 * Split a document into overlapping chunks for embedding.
 * Respects paragraph boundaries where possible.
 */
export function chunkDocument(content: string, source: string, category: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  // Split by sections (markdown headers)
  const sections = content.split(/(?=^#{1,3}\s)/m);
  let chunkIndex = 0;

  for (const section of sections) {
    if (section.trim().length === 0) continue;

    // Extract section title
    const titleMatch = section.match(/^#{1,3}\s+(.+)/);
    const sectionTitle = titleMatch ? titleMatch[1].trim() : "General";

    // If section is small enough, keep as one chunk
    if (section.length <= CHUNK_SIZE) {
      chunks.push({
        id: `${source}-${chunkIndex}`,
        content: section.trim(),
        metadata: { source, section: sectionTitle, category, chunkIndex, totalChunks: 0 },
      });
      chunkIndex++;
      continue;
    }

    // Split large sections by paragraphs
    const paragraphs = section.split(/\n\n+/);
    let currentChunk = "";

    for (const para of paragraphs) {
      if ((currentChunk + "\n\n" + para).length > CHUNK_SIZE && currentChunk.length > 0) {
        chunks.push({
          id: `${source}-${chunkIndex}`,
          content: currentChunk.trim(),
          metadata: { source, section: sectionTitle, category, chunkIndex, totalChunks: 0 },
        });
        chunkIndex++;
        // Keep overlap
        const words = currentChunk.split(" ");
        currentChunk = words.slice(-Math.floor(CHUNK_OVERLAP / 5)).join(" ") + "\n\n" + para;
      } else {
        currentChunk += (currentChunk ? "\n\n" : "") + para;
      }
    }

    if (currentChunk.trim()) {
      chunks.push({
        id: `${source}-${chunkIndex}`,
        content: currentChunk.trim(),
        metadata: { source, section: sectionTitle, category, chunkIndex, totalChunks: 0 },
      });
      chunkIndex++;
    }
  }

  // Update total chunks count
  for (const chunk of chunks) {
    chunk.metadata.totalChunks = chunks.length;
  }

  return chunks;
}

// ─── Supabase Vector Storage ────────────────────────────────────────────────

/**
 * Store embedded chunks in Supabase pgvector table.
 */
export async function storeEmbeddings(
  chunks: DocumentChunk[],
  supabaseUrl: string,
  supabaseKey: string,
): Promise<{ stored: number; errors: number }> {
  let stored = 0;
  let errors = 0;

  for (const chunk of chunks) {
    if (!chunk.embedding) continue;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/ho_kb_embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          id: chunk.id,
          content: chunk.content,
          source: chunk.metadata.source,
          section: chunk.metadata.section,
          category: chunk.metadata.category,
          chunk_index: chunk.metadata.chunkIndex,
          embedding: chunk.embedding,
        }),
      });

      if (response.ok) stored++;
      else errors++;
    } catch {
      errors++;
    }
  }

  return { stored, errors };
}

/**
 * Semantic search over embedded knowledge base.
 */
export async function searchKnowledgeBase(
  query: string,
  supabaseUrl: string,
  supabaseKey: string,
  options?: { limit?: number; category?: string; threshold?: number },
): Promise<{ content: string; source: string; section: string; similarity: number }[]> {
  const queryEmbedding = await generateEmbedding(query);
  const limit = options?.limit ?? 5;
  const threshold = options?.threshold ?? 0.7;

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/match_kb_documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_category: options?.category || null,
    }),
  });

  if (!response.ok) {
    console.error("KB search error:", response.status);
    return [];
  }

  return response.json();
}
