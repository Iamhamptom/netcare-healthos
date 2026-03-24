#!/usr/bin/env python3
"""
VisioCorp RAG Query Server
Query the local RAG index to get relevant context for Llama.

Usage:
  # Single query
  python3 rag-query.py "What's the Netcare deal status?"

  # Start as HTTP server (for LM Studio / Llama integration)
  python3 rag-query.py --serve --port 8765

  # Export context for a topic (paste into LM Studio system prompt)
  python3 rag-query.py --export "healthcare claims strategy"
"""

import json
import os
import sys
import argparse
from pathlib import Path

HOME = os.path.expanduser("~")
INDEX_DIR = os.path.join(HOME, "netcare-healthos/ml/rag-index")
TOP_K = 5


def load_index():
    """Load FAISS index and documents."""
    docs_path = os.path.join(INDEX_DIR, "documents.jsonl")
    faiss_path = os.path.join(INDEX_DIR, "visiocorp.faiss")

    # Load documents
    documents = []
    with open(docs_path) as f:
        for line in f:
            documents.append(json.loads(line))

    # Try FAISS
    index = None
    model = None
    try:
        import faiss
        import numpy as np
        from sentence_transformers import SentenceTransformer

        if os.path.exists(faiss_path):
            index = faiss.read_index(faiss_path)
            model = SentenceTransformer("all-MiniLM-L6-v2")
    except ImportError:
        pass

    return documents, index, model


def search_faiss(query: str, documents, index, model, top_k: int = TOP_K) -> list[dict]:
    """Search using FAISS vector similarity."""
    import numpy as np
    import faiss

    query_embedding = model.encode([query])
    query_embedding = np.array(query_embedding, dtype=np.float32)
    faiss.normalize_L2(query_embedding)

    scores, indices = index.search(query_embedding, top_k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < len(documents):
            doc = documents[idx].copy()
            doc["score"] = float(score)
            results.append(doc)

    return results


def search_keyword(query: str, documents, top_k: int = TOP_K) -> list[dict]:
    """Fallback: keyword search when FAISS not available."""
    query_terms = query.lower().split()

    scored = []
    for doc in documents:
        text_lower = doc["text"].lower()
        score = 0
        for term in query_terms:
            score += text_lower.count(term)

        # Boost by priority
        score *= (1 + doc["metadata"]["priority"] / 20)

        if score > 0:
            doc_copy = doc.copy()
            doc_copy["score"] = score
            scored.append(doc_copy)

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]


def query(query_text: str, top_k: int = TOP_K) -> list[dict]:
    """Query the RAG index."""
    documents, index, model = load_index()

    if index and model:
        return search_faiss(query_text, documents, index, model, top_k)
    else:
        return search_keyword(query_text, documents, top_k)


def format_context(results: list[dict]) -> str:
    """Format search results as context for LLM."""
    parts = []
    for i, r in enumerate(results, 1):
        source = r["metadata"]["source"]
        cat = r["metadata"]["category"]
        parts.append(f"[{i}] ({cat} — {source})\n{r['text']}")

    return "\n\n---\n\n".join(parts)


def serve(port: int = 8765):
    """Start HTTP server for RAG queries."""
    from http.server import HTTPServer, BaseHTTPRequestHandler

    documents, index, model = load_index()

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            q = body.get("query", "")
            k = body.get("top_k", TOP_K)

            if index and model:
                results = search_faiss(q, documents, index, model, k)
            else:
                results = search_keyword(q, documents, k)

            context = format_context(results)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "query": q,
                "context": context,
                "results": len(results),
                "sources": [r["metadata"]["source"] for r in results],
            }).encode())

        def log_message(self, format, *args):
            pass  # Suppress logs

    server = HTTPServer(("0.0.0.0", port), Handler)
    print(f"🚀 RAG server running on http://localhost:{port}")
    print(f"   POST /  →  {{'query': 'your question', 'top_k': 5}}")
    print(f"   {len(documents)} chunks indexed")
    server.serve_forever()


def main():
    parser = argparse.ArgumentParser(description="VisioCorp RAG Query")
    parser.add_argument("query", nargs="?", help="Query text")
    parser.add_argument("--serve", action="store_true", help="Start HTTP server")
    parser.add_argument("--port", type=int, default=8765, help="Server port")
    parser.add_argument("--top-k", type=int, default=TOP_K, help="Number of results")
    parser.add_argument("--export", type=str, help="Export context for a topic")
    args = parser.parse_args()

    if args.serve:
        serve(args.port)
    elif args.export:
        results = query(args.export, args.top_k)
        context = format_context(results)
        print(context)
    elif args.query:
        results = query(args.query, args.top_k)
        print(f"\n🔍 Query: {args.query}")
        print(f"📊 {len(results)} results\n")
        for r in results:
            print(f"  [{r['score']:.2f}] {r['metadata']['category']} — {r['metadata']['source']}")
            print(f"    {r['text'][:150]}...")
            print()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
