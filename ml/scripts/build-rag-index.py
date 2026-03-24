#!/usr/bin/env python3
"""
VisioCorp RAG Index Builder
Indexes all VisioCorp knowledge into a local vector store for Llama RAG queries.

Uses sentence-transformers for embeddings and FAISS for vector search.
No external API calls — runs 100% locally.

Install: pip install sentence-transformers faiss-cpu
"""

import json
import os
import glob
import re
import hashlib
from pathlib import Path
from datetime import datetime

HOME = os.path.expanduser("~")
INDEX_DIR = os.path.join(HOME, "netcare-healthos/ml/rag-index")
CHUNK_SIZE = 800  # tokens approx (chars / 4)
CHUNK_OVERLAP = 200

# ─── Document Sources ────────────────────────────────────────────────────────

DOCUMENT_SOURCES = [
    # Memory files (institutional knowledge)
    {"path": os.path.join(HOME, ".claude/projects/-Users-hga/memory/*.md"), "category": "memory", "priority": 10},
    # CLAUDE.md (operations playbook)
    {"path": os.path.join(HOME, ".claude/projects/-Users-hga/CLAUDE.md"), "category": "playbook", "priority": 10},
    # Steinberg KB
    {"path": os.path.join(HOME, "visio-workspace/steinberg/*.md"), "category": "steinberg", "priority": 8},
    {"path": os.path.join(HOME, "visio-workspace/steinberg/openai/*.md"), "category": "steinberg_openai", "priority": 8},
    # Outreach templates
    {"path": os.path.join(HOME, "visio-workspace/steinberg/outreach/*.md"), "category": "outreach", "priority": 9},
    # Health KB (compiled intelligence)
    {"path": os.path.join(HOME, "netcare-healthos/docs/knowledge/*.md"), "category": "health_kb", "priority": 9},
    # Research papers
    {"path": os.path.join(HOME, "netcare-healthos/docs/*.md"), "category": "research", "priority": 7},
    # Strategy documents
    {"path": os.path.join(HOME, "netcare-healthos/*.md"), "category": "strategy", "priority": 8},
    # Health KB extracted documents
    {"path": os.path.join(HOME, "netcare-healthos/docs/knowledge/extracted/*.md"), "category": "health_extracted", "priority": 6},
    # Legal docs
    {"path": os.path.join(HOME, "netcare-healthos/docs/legal/*.md"), "category": "legal", "priority": 7},
    {"path": os.path.join(HOME, "netcare-healthos/docs/audit-package/*.md"), "category": "audit", "priority": 7},
    # Policies
    {"path": os.path.join(HOME, "netcare-healthos/docs/policies/*.md"), "category": "policies", "priority": 7},
    # Health sector intel
    {"path": os.path.join(HOME, "netcare-healthos/SA-*.md"), "category": "health_intel", "priority": 8},
    # Contact profiles
    {"path": os.path.join(HOME, "netcare-healthos/SARA-*.md"), "category": "contacts", "priority": 9},
    {"path": os.path.join(HOME, "netcare-healthos/THIRUSHEN-*.md"), "category": "contacts", "priority": 9},
    # HealthOps docs
    {"path": os.path.join(HOME, "healthops-platform/docs/**/*.md"), "category": "healthops", "priority": 6},
]


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks at paragraph boundaries."""
    # Split on double newlines (paragraphs)
    paragraphs = re.split(r'\n\n+', text)

    chunks = []
    current_chunk = ""

    for para in paragraphs:
        if len(current_chunk) + len(para) > chunk_size * 4:  # ~chars to tokens
            if current_chunk:
                chunks.append(current_chunk.strip())
            # Start new chunk with overlap
            words = current_chunk.split()
            overlap_text = " ".join(words[-overlap:]) if len(words) > overlap else ""
            current_chunk = overlap_text + "\n\n" + para
        else:
            current_chunk += "\n\n" + para

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks


def load_documents() -> list[dict]:
    """Load and chunk all documents from configured sources."""
    documents = []

    for source in DOCUMENT_SOURCES:
        files = glob.glob(source["path"], recursive=True)

        for fpath in files:
            try:
                with open(fpath) as f:
                    content = f.read()
            except:
                continue

            # Skip tiny files
            if len(content) < 100:
                continue

            # Remove YAML frontmatter
            content = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL)

            fname = os.path.basename(fpath)
            rel_path = os.path.relpath(fpath, HOME)

            # Chunk the document
            chunks = chunk_text(content)

            for i, chunk in enumerate(chunks):
                doc_id = hashlib.md5(f"{fpath}:{i}".encode()).hexdigest()[:12]
                documents.append({
                    "id": doc_id,
                    "text": chunk,
                    "metadata": {
                        "source": rel_path,
                        "filename": fname,
                        "category": source["category"],
                        "priority": source["priority"],
                        "chunk_index": i,
                        "total_chunks": len(chunks),
                    }
                })

    return documents


def build_index(documents: list[dict]):
    """Build FAISS index from documents using sentence-transformers."""
    try:
        from sentence_transformers import SentenceTransformer
        import faiss
        import numpy as np
    except ImportError:
        print("❌ Missing dependencies. Install with:")
        print("   pip install sentence-transformers faiss-cpu")
        print("\n📝 Saving documents as JSON for manual indexing...")
        save_documents_json(documents)
        return

    print(f"🔧 Loading embedding model...")
    model = SentenceTransformer("all-MiniLM-L6-v2")  # 384-dim, fast, good quality

    print(f"📐 Encoding {len(documents)} chunks...")
    texts = [doc["text"] for doc in documents]
    embeddings = model.encode(texts, show_progress_bar=True, batch_size=32)
    embeddings = np.array(embeddings, dtype=np.float32)

    # Normalize for cosine similarity
    faiss.normalize_L2(embeddings)

    # Build index
    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)  # Inner product = cosine after normalization
    index.add(embeddings)

    # Save index
    os.makedirs(INDEX_DIR, exist_ok=True)
    faiss.write_index(index, os.path.join(INDEX_DIR, "visiocorp.faiss"))

    # Save document metadata
    metadata = []
    for doc in documents:
        metadata.append({
            "id": doc["id"],
            "metadata": doc["metadata"],
            "text_preview": doc["text"][:200],
        })

    with open(os.path.join(INDEX_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    # Save full documents for retrieval
    with open(os.path.join(INDEX_DIR, "documents.jsonl"), "w") as f:
        for doc in documents:
            f.write(json.dumps(doc, ensure_ascii=False) + "\n")

    print(f"✅ Index built: {len(documents)} chunks, {dim}-dim embeddings")
    print(f"   📁 {INDEX_DIR}/visiocorp.faiss")
    print(f"   📁 {INDEX_DIR}/metadata.json")
    print(f"   📁 {INDEX_DIR}/documents.jsonl")


def save_documents_json(documents: list[dict]):
    """Fallback: save documents as JSON if FAISS not available."""
    os.makedirs(INDEX_DIR, exist_ok=True)

    with open(os.path.join(INDEX_DIR, "documents.jsonl"), "w") as f:
        for doc in documents:
            f.write(json.dumps(doc, ensure_ascii=False) + "\n")

    # Save a summary
    categories = {}
    for doc in documents:
        cat = doc["metadata"]["category"]
        categories[cat] = categories.get(cat, 0) + 1

    summary = {
        "total_chunks": len(documents),
        "categories": categories,
        "generated": datetime.now().isoformat(),
        "note": "Install sentence-transformers and faiss-cpu to build vector index",
    }

    with open(os.path.join(INDEX_DIR, "summary.json"), "w") as f:
        json.dump(summary, f, indent=2)

    print(f"✅ Documents saved (no vector index — install deps for full RAG)")
    print(f"   📁 {INDEX_DIR}/documents.jsonl ({len(documents)} chunks)")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"      {cat}: {count}")


def main():
    print("🏗️  VisioCorp RAG Index Builder")
    print("=" * 50)

    # Load all documents
    print("\n📂 Loading documents from all sources...")
    documents = load_documents()

    # Stats
    categories = {}
    for doc in documents:
        cat = doc["metadata"]["category"]
        categories[cat] = categories.get(cat, 0) + 1

    print(f"\n📊 Document stats:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"   {cat}: {count} chunks")
    print(f"   TOTAL: {len(documents)} chunks")

    # Build index
    print(f"\n🔨 Building index...")
    build_index(documents)

    print(f"\n🎯 Done! RAG index ready at {INDEX_DIR}")


if __name__ == "__main__":
    main()
