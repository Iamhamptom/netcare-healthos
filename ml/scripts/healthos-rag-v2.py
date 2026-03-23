#!/usr/bin/env python3
"""
HealthOS-Med RAG v2 — World-Class Retrieval-Augmented Generation
================================================================
5 upgrades over v1:
  1. Medical embeddings (BioLord-2023-C, 768-dim, trained on medical text)
  2. Hybrid search (FAISS vector + BM25 keyword, weighted merge)
  3. Cross-encoder reranker (ms-marco-MiniLM, scores every result against query)
  4. Query decomposition (break complex questions into sub-queries)
  5. Feedback loop (log every interaction, learn from corrections)

Architecture:
  User query
    → Query decomposition (if complex)
    → For each sub-query:
        → Exact lookup (ICD-10, tariffs, medicines — key-value)
        → FAISS vector search (medical embeddings)
        → BM25 keyword search
        → Merge results (0.5 vector + 0.3 keyword + 0.2 exact)
        → Cross-encoder rerank top 20 → pick top 5
    → Assemble context (deduplicate, order by relevance)
    → Return structured context

Usage:
  python3 ml/scripts/healthos-rag-v2.py --port 8800
"""

from __future__ import annotations

import json
import os
import sys
import csv
import re
import hashlib
import time
import argparse
from typing import Optional, List, Dict, Any, Tuple
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

HOME = os.path.expanduser("~")
NETCARE_DIR = os.path.join(HOME, "netcare-healthos")
INDEX_DIR = os.path.join(NETCARE_DIR, "ml/rag-index")
DB_DIR = os.path.join(NETCARE_DIR, "docs/knowledge/databases")
FEEDBACK_PATH = os.path.join(INDEX_DIR, "feedback.jsonl")
MODEL_PATH = os.path.join(NETCARE_DIR, "ml/models/healthos-fused-v3")

TOP_K_RETRIEVE = 20  # Retrieve 20 candidates
TOP_K_FINAL = 8      # Return top 8 after reranking
MAX_CONTEXT_CHARS = 6000

SYSTEM_PROMPT_BASE = """You are HealthOS-Med, a South African healthcare AI expert. You have authoritative knowledge of ICD-10-ZA (41,009 codes), CCSA tariff codes, NAPPI pharmaceutical codes, all SA medical scheme profiles, 270 PMB conditions, 27 CDL chronic conditions, the Medical Schemes Act 131 of 1998, POPIA 2026 compliance, and SA clinical guidelines.

CRITICAL: Use the retrieved context below to answer. For code lookups, return EXACT data. Never fabricate. GEMS = Government Employees Medical Scheme. SA uses ICD-10 (not US ICD-10-CM), CCSA codes (not CPT)."""


# ═══════════════════════════════════════════════════════════════════════════════
# EXACT LOOKUP (ICD-10, tariffs, medicines — key-value, instant)
# ═══════════════════════════════════════════════════════════════════════════════

class ExactLookup:
    def __init__(self):
        self.icd10 = {}
        self.tariffs = {}
        self.medicines = {}
        self.rejection_codes = {}
        self.modifiers = {}
        self.cdl = {}

    def load(self):
        print("  [Exact] Loading databases...")

        # ICD-10
        path = os.path.join(DB_DIR, "ICD-10_MIT_2021.csv")
        if os.path.exists(path):
            with open(path, encoding="utf-8", errors="ignore") as f:
                for row in csv.DictReader(f):
                    code = row.get("ICD10_Code", "").strip()
                    if code and len(code) >= 3:
                        self.icd10[code.upper()] = row
                        self.icd10[code.upper().replace(".", "")] = row
            print(f"    ICD-10: {len(self.icd10):,}")

        # Tariffs
        path = os.path.join(DB_DIR, "GEMS_tariffs_2026.csv")
        if os.path.exists(path):
            with open(path, encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
            discs = ["014-GP", "016-ObGyn", "032-Paed"]
            for line in lines[3:]:
                try:
                    parts = list(csv.reader([line.strip()]))[0]
                    if len(parts) >= 2 and parts[0].strip().isdigit():
                        code = parts[0].strip()
                        desc = parts[1].strip()
                        rates = {}
                        for ci, disc in enumerate(discs):
                            rc = 2 + ci * 2
                            if rc < len(parts) and parts[rc].strip():
                                try:
                                    rates[disc] = float(parts[rc].strip())
                                except ValueError:
                                    pass
                        self.tariffs[code] = {"code": code, "description": desc, "rates": rates}
                except Exception:
                    continue
            print(f"    Tariffs: {len(self.tariffs):,}")

        # Medicines
        path = os.path.join(DB_DIR, "medicine_prices.csv")
        if os.path.exists(path):
            with open(path, encoding="utf-8", errors="ignore") as f:
                for row in csv.DictReader(f):
                    nappi = row.get("nappi_code", "").strip()
                    name = row.get("name", "").strip()
                    if nappi:
                        self.medicines[nappi] = row
                    if name:
                        self.medicines[name.upper()] = row
            print(f"    Medicines: {len(self.medicines):,}")

        # Rejection codes
        path = os.path.join(DB_DIR, "rejection_codes.csv")
        if os.path.exists(path):
            with open(path, encoding="utf-8", errors="ignore") as f:
                for row in csv.DictReader(f):
                    code = row.get("code", row.get("Code", "")).strip()
                    if code:
                        self.rejection_codes[code] = row
            print(f"    Rejections: {len(self.rejection_codes)}")

        # CDL
        path = os.path.join(DB_DIR, "cdl_conditions.csv")
        if os.path.exists(path):
            with open(path, encoding="utf-8", errors="ignore") as f:
                for row in csv.DictReader(f):
                    cond = row.get("condition", row.get("Condition", "")).strip()
                    if cond:
                        self.cdl[cond.upper()] = row
            print(f"    CDL: {len(self.cdl)}")

        # Modifiers
        path = os.path.join(DB_DIR, "modifier_codes.csv")
        if os.path.exists(path):
            with open(path, encoding="utf-8", errors="ignore") as f:
                for row in csv.DictReader(f):
                    code = row.get("code", row.get("Code", "")).strip()
                    if code:
                        self.modifiers[code] = row
            print(f"    Modifiers: {len(self.modifiers)}")

    def lookup(self, query: str) -> Optional[str]:
        results = []
        query_upper = query.upper()

        # ICD-10
        for match in re.findall(r'\b([A-Z]\d{2}\.?\d{0,2})\b', query_upper):
            for try_code in [match, match.replace(".", "")]:
                if try_code in self.icd10:
                    results.append(f"ICD-10-ZA {try_code}: {json.dumps(self.icd10[try_code], ensure_ascii=False)}")
                    break

        # Tariffs
        for match in re.findall(r'\b(\d{3,4})\b', query):
            if match in self.tariffs:
                t = self.tariffs[match]
                results.append(f"CCSA Tariff {match}: {t['description'][:200]}. Rates: {json.dumps(t['rates'])}")

        # NAPPI
        for match in re.findall(r'\b(\d{7,10})\b', query):
            if match in self.medicines:
                results.append(f"NAPPI {match}: {json.dumps(self.medicines[match], ensure_ascii=False)}")

        return "\n\n".join(results) if results else None


# ═══════════════════════════════════════════════════════════════════════════════
# HYBRID RAG (FAISS + BM25 + Reranker)
# ═══════════════════════════════════════════════════════════════════════════════

class HybridRAG:
    def __init__(self):
        self.documents = []
        self.faiss_index = None
        self.embed_model = None
        self.bm25 = None
        self.reranker = None
        self.doc_texts = []

    def load(self):
        print("  [RAG] Loading documents...")
        docs_path = os.path.join(INDEX_DIR, "documents.jsonl")
        with open(docs_path) as f:
            for line in f:
                self.documents.append(json.loads(line))
        self.doc_texts = [d["text"] for d in self.documents]
        print(f"    Documents: {len(self.documents):,}")

        # 1. Medical embeddings + FAISS
        print("  [RAG] Loading medical embedding model (BioLord)...")
        try:
            from sentence_transformers import SentenceTransformer
            self.embed_model = SentenceTransformer("FremyCompany/BioLord-2023-C")
            print(f"    BioLord: {self.embed_model.get_sentence_embedding_dimension()}d")
        except Exception:
            print("    BioLord failed, using MiniLM fallback")
            from sentence_transformers import SentenceTransformer
            self.embed_model = SentenceTransformer("all-MiniLM-L6-v2")

        # Load or build FAISS
        import faiss
        import numpy as np
        faiss_path = os.path.join(INDEX_DIR, "visiocorp-v2.faiss")
        dim = self.embed_model.get_sentence_embedding_dimension()

        if os.path.exists(faiss_path):
            self.faiss_index = faiss.read_index(faiss_path)
            if self.faiss_index.ntotal == len(self.documents):
                print(f"    FAISS: {self.faiss_index.ntotal:,} vectors (cached)")
            else:
                print(f"    FAISS stale ({self.faiss_index.ntotal} != {len(self.documents)}), rebuilding...")
                self._build_faiss(faiss_path, dim)
        else:
            print(f"    Building FAISS index ({len(self.documents):,} docs)...")
            self._build_faiss(faiss_path, dim)

        # 2. BM25 keyword search
        print("  [RAG] Building BM25 index...")
        from rank_bm25 import BM25Okapi
        tokenized = [doc.lower().split() for doc in self.doc_texts]
        self.bm25 = BM25Okapi(tokenized)
        print(f"    BM25: {len(tokenized):,} docs indexed")

        # 3. Cross-encoder reranker
        print("  [RAG] Loading reranker...")
        try:
            from sentence_transformers import CrossEncoder
            self.reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
            print("    Reranker: ms-marco-MiniLM loaded")
        except Exception as e:
            print(f"    Reranker failed: {e}")

    def _build_faiss(self, faiss_path: str, dim: int):
        import faiss
        import numpy as np

        emb_path = os.path.join(INDEX_DIR, "embeddings-v2.npy")
        n = len(self.documents)

        fp = np.memmap(emb_path, dtype=np.float32, mode="w+", shape=(n, dim))
        for i in range(0, n, 1000):
            batch = self.doc_texts[i:i+1000]
            emb = self.embed_model.encode(batch, batch_size=64, show_progress_bar=False)
            fp[i:i+len(batch)] = np.array(emb, dtype=np.float32)
            if (i+1000) % 5000 == 0 or i+1000 >= n:
                print(f"      Encoded {min(i+1000, n):,}/{n:,}")
                sys.stdout.flush()
        fp.flush()

        # Build index in chunks
        self.faiss_index = faiss.IndexFlatIP(dim)
        for i in range(0, n, 5000):
            end = min(i+5000, n)
            chunk = np.array(np.memmap(emb_path, dtype=np.float32, mode="r", shape=(n, dim))[i:end])
            faiss.normalize_L2(chunk)
            self.faiss_index.add(chunk)

        faiss.write_index(self.faiss_index, faiss_path)
        print(f"    FAISS built: {self.faiss_index.ntotal:,} vectors")

    def search(self, query: str, top_k: int = TOP_K_FINAL) -> List[Dict]:
        import numpy as np
        import faiss

        # Step 1: FAISS vector search (top 20)
        q_emb = self.embed_model.encode([query])
        q_emb = np.array(q_emb, dtype=np.float32)
        faiss.normalize_L2(q_emb)
        scores_v, indices_v = self.faiss_index.search(q_emb, TOP_K_RETRIEVE)

        vector_results = {}
        for score, idx in zip(scores_v[0], indices_v[0]):
            if 0 <= idx < len(self.documents):
                vector_results[idx] = float(score)

        # Step 2: BM25 keyword search (top 20)
        tokenized_query = query.lower().split()
        bm25_scores = self.bm25.get_scores(tokenized_query)
        top_bm25 = np.argsort(bm25_scores)[-TOP_K_RETRIEVE:][::-1]

        keyword_results = {}
        max_bm25 = max(bm25_scores[top_bm25[0]], 0.001)
        for idx in top_bm25:
            if bm25_scores[idx] > 0:
                keyword_results[int(idx)] = float(bm25_scores[idx] / max_bm25)

        # Step 3: Merge scores (0.6 vector + 0.4 keyword)
        all_indices = set(vector_results.keys()) | set(keyword_results.keys())
        merged = []
        for idx in all_indices:
            v_score = vector_results.get(idx, 0)
            k_score = keyword_results.get(idx, 0)
            combined = 0.6 * v_score + 0.4 * k_score
            # Boost high-priority docs
            priority = self.documents[idx]["metadata"].get("priority", 5)
            combined *= (1 + priority / 20)
            merged.append((idx, combined))

        merged.sort(key=lambda x: x[1], reverse=True)
        candidates = merged[:TOP_K_RETRIEVE]

        # Step 4: Cross-encoder rerank
        if self.reranker and candidates:
            pairs = [(query, self.doc_texts[idx]) for idx, _ in candidates]
            rerank_scores = self.reranker.predict(pairs)
            reranked = [(candidates[i][0], float(rerank_scores[i])) for i in range(len(candidates))]
            reranked.sort(key=lambda x: x[1], reverse=True)
        else:
            reranked = candidates

        # Return top-k
        results = []
        seen_texts = set()
        for idx, score in reranked[:top_k]:
            doc = self.documents[idx]
            text_hash = hashlib.md5(doc["text"][:100].encode()).hexdigest()
            if text_hash in seen_texts:
                continue
            seen_texts.add(text_hash)
            results.append({
                "text": doc["text"],
                "metadata": doc["metadata"],
                "score": score,
            })

        return results


# ═══════════════════════════════════════════════════════════════════════════════
# QUERY DECOMPOSITION
# ═══════════════════════════════════════════════════════════════════════════════

def decompose_query(query: str) -> List[str]:
    """Break complex queries into sub-queries for better retrieval."""
    queries = [query]

    # Extract specific codes mentioned
    icd_codes = re.findall(r'\b[A-Z]\d{2}\.?\d{0,2}\b', query.upper())
    for code in icd_codes:
        queries.append(f"ICD-10 code {code}")

    tariff_codes = re.findall(r'\btariff\s*(?:code\s*)?(\d{3,4})\b', query.lower())
    for code in tariff_codes:
        queries.append(f"CCSA tariff code {code}")

    nappi_codes = re.findall(r'\b(\d{7,10})\b', query)
    for code in nappi_codes:
        queries.append(f"NAPPI code {code}")

    # Extract scheme names
    schemes = re.findall(r'\b(Discovery|GEMS|Bonitas|Momentum|Medshield|Bestmed|Medihelp)\b', query, re.IGNORECASE)
    for scheme in schemes:
        queries.append(f"{scheme} medical scheme rules")

    # Keywords that suggest additional sub-queries
    if "cdl" in query.lower() or "chronic" in query.lower():
        queries.append("CDL chronic disease list conditions")
    if "pmb" in query.lower() or "prescribed minimum" in query.lower():
        queries.append("prescribed minimum benefits PMB rules")
    if "reject" in query.lower():
        queries.append("claims rejection reasons and fixes")
    if "popia" in query.lower() or "privacy" in query.lower():
        queries.append("POPIA health data compliance")

    return list(dict.fromkeys(queries))  # Deduplicate preserving order


# ═══════════════════════════════════════════════════════════════════════════════
# FEEDBACK LOOP
# ═══════════════════════════════════════════════════════════════════════════════

class FeedbackStore:
    def __init__(self):
        self.path = FEEDBACK_PATH

    def log(self, query: str, context: str, response: str, rating: Optional[str] = None):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "query": query[:500],
            "context_length": len(context),
            "response": response[:500],
            "rating": rating,
        }
        with open(self.path, "a") as f:
            f.write(json.dumps(entry) + "\n")

    def get_stats(self) -> Dict:
        if not os.path.exists(self.path):
            return {"total": 0, "positive": 0, "negative": 0}
        total = positive = negative = 0
        with open(self.path) as f:
            for line in f:
                total += 1
                entry = json.loads(line)
                if entry.get("rating") == "positive":
                    positive += 1
                elif entry.get("rating") == "negative":
                    negative += 1
        return {"total": total, "positive": positive, "negative": negative}


# ═══════════════════════════════════════════════════════════════════════════════
# MODEL (fine-tuned HealthOS-Med)
# ═══════════════════════════════════════════════════════════════════════════════

class HealthOSModel:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.loaded = False

    def load(self):
        if not os.path.exists(MODEL_PATH):
            print(f"  [Model] SKIP: {MODEL_PATH} not found")
            return
        from mlx_lm import load
        from mlx_lm.sample_utils import make_sampler
        print("  [Model] Loading fine-tuned model...")
        self.model, self.tokenizer = load(MODEL_PATH)
        self.loaded = True
        print(f"    Model loaded from {MODEL_PATH}")

    def generate(self, system_prompt: str, user_query: str, max_tokens: int = 500) -> str:
        if not self.loaded:
            return "Model not loaded"
        from mlx_lm import generate
        from mlx_lm.sample_utils import make_sampler

        prompt = (
            f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n"
            f"{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n"
            f"{user_query}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
        )
        sampler = make_sampler(temp=0.3)
        return generate(self.model, self.tokenizer, prompt=prompt, max_tokens=max_tokens, sampler=sampler)


# ═══════════════════════════════════════════════════════════════════════════════
# UNIFIED SERVER
# ═══════════════════════════════════════════════════════════════════════════════

class HealthOSServer:
    def __init__(self):
        self.lookup = ExactLookup()
        self.rag = HybridRAG()
        self.model = HealthOSModel()
        self.feedback = FeedbackStore()

    def load_all(self):
        print("=" * 60)
        print("HealthOS-Med RAG v2 — World-Class Retrieval")
        print("=" * 60)
        self.lookup.load()
        self.rag.load()
        self.model.load()
        print("=" * 60)
        print("All systems loaded.")
        print("=" * 60)

    def retrieve(self, query: str) -> Tuple[str, Dict]:
        context_parts = []
        sources = {"exact": [], "vector": [], "keyword": [], "reranked": []}

        # Decompose query
        sub_queries = decompose_query(query)

        # Exact lookup (always first)
        exact = self.lookup.lookup(query)
        if exact:
            context_parts.append(f"=== EXACT DATABASE LOOKUP ===\n{exact}")
            sources["exact"].append("database")

        # Hybrid RAG search (union of sub-query results)
        seen = set()
        all_rag_results = []
        for sq in sub_queries[:3]:  # Max 3 sub-queries
            results = self.rag.search(sq, top_k=TOP_K_FINAL)
            for r in results:
                text_hash = hashlib.md5(r["text"][:100].encode()).hexdigest()
                if text_hash not in seen:
                    seen.add(text_hash)
                    all_rag_results.append(r)
                    sources["reranked"].append(f"{r['metadata']['category']}:{r['metadata']['filename']}")

        # Take top results by score
        all_rag_results.sort(key=lambda x: x["score"], reverse=True)
        top_results = all_rag_results[:TOP_K_FINAL]

        if top_results:
            rag_text = "\n\n---\n\n".join(
                f"[{r['metadata']['category']}]\n{r['text']}" for r in top_results
            )
            context_parts.append(f"=== KNOWLEDGE BASE ===\n{rag_text}")

        context = "\n\n".join(context_parts)

        # Truncate (keep exact lookup intact)
        if len(context) > MAX_CONTEXT_CHARS and exact:
            exact_section = f"=== EXACT DATABASE LOOKUP ===\n{exact}"
            remaining = MAX_CONTEXT_CHARS - len(exact_section) - 100
            if remaining > 500 and top_results:
                trimmed = []
                total = 0
                for r in top_results:
                    chunk = f"[{r['metadata']['category']}]\n{r['text']}"
                    if total + len(chunk) < remaining:
                        trimmed.append(chunk)
                        total += len(chunk)
                context = exact_section + "\n\n=== KNOWLEDGE BASE ===\n" + "\n---\n".join(trimmed)
            else:
                context = exact_section
        elif len(context) > MAX_CONTEXT_CHARS:
            context = context[:MAX_CONTEXT_CHARS]

        return context, sources

    def generate(self, query: str, max_tokens: int = 500) -> Dict:
        context, sources = self.retrieve(query)

        system_prompt = SYSTEM_PROMPT_BASE
        if context:
            system_prompt += f"\n\n{context}"

        response = self.model.generate(system_prompt, query, max_tokens)

        # Log feedback
        self.feedback.log(query, context, response)

        return {
            "query": query,
            "response": response,
            "sources": sources,
            "context_length": len(context),
            "timestamp": datetime.now().isoformat(),
        }


def create_handler(server: HealthOSServer):
    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length)) if length > 0 else {}
            query = body.get("query", body.get("prompt", ""))
            max_tokens = body.get("max_tokens", 500)

            if self.path == "/generate":
                result = server.generate(query, max_tokens)
            elif self.path == "/rag":
                context, sources = server.retrieve(query)
                result = {"query": query, "context": context, "sources": sources}
            elif self.path == "/raw":
                response = server.model.generate(SYSTEM_PROMPT_BASE, query, max_tokens)
                result = {"query": query, "response": response}
            elif self.path == "/feedback":
                rating = body.get("rating", "")
                server.feedback.log(query, "", "", rating)
                result = {"status": "logged"}
            else:
                self.send_response(404)
                self.end_headers()
                return

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(result, ensure_ascii=False, indent=2).encode())

        def do_GET(self):
            if self.path == "/health":
                result = {"status": "ok", "version": "v2", "model": server.model.loaded, "rag_docs": len(server.rag.documents), "exact_icd10": len(server.lookup.icd10), "exact_tariffs": len(server.lookup.tariffs), "exact_medicines": len(server.lookup.medicines)}
            elif self.path == "/stats":
                result = {
                    "version": "v2-hybrid",
                    "rag_chunks": len(server.rag.documents),
                    "icd10_codes": len(server.lookup.icd10),
                    "tariff_codes": len(server.lookup.tariffs),
                    "medicines": len(server.lookup.medicines),
                    "rejection_codes": len(server.lookup.rejection_codes),
                    "cdl_conditions": len(server.lookup.cdl),
                    "modifiers": len(server.lookup.modifiers),
                    "feedback": server.feedback.get_stats(),
                    "model": MODEL_PATH,
                    "embedding": "BioLord-2023-C (768d)",
                    "search": "hybrid (FAISS + BM25 + cross-encoder rerank)",
                }
            else:
                self.send_response(404)
                self.end_headers()
                return

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(result, indent=2).encode())

        def do_OPTIONS(self):
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()

        def log_message(self, format, *args):
            print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")

    return Handler


def main():
    parser = argparse.ArgumentParser(description="HealthOS-Med RAG v2")
    parser.add_argument("--port", type=int, default=8800)
    parser.add_argument("--query", type=str)
    args = parser.parse_args()

    server = HealthOSServer()
    server.load_all()

    if args.query:
        result = server.generate(args.query)
        print(f"\n{result['response']}")
        print(f"\nSources: {result['sources']}")
    else:
        http = HTTPServer(("0.0.0.0", args.port), create_handler(server))
        print(f"\nHealthOS-Med RAG v2 on http://localhost:{args.port}")
        print(f"  POST /generate  — RAG + model")
        print(f"  POST /rag       — retrieval only")
        print(f"  POST /feedback  — log user feedback")
        print(f"  GET  /health    — health check")
        print(f"  GET  /stats     — full statistics")
        http.serve_forever()


if __name__ == "__main__":
    main()
