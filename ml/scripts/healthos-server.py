#!/usr/bin/env python3
"""
HealthOS-Med Unified Inference Server
======================================
Combines the fine-tuned HealthOS-Med model with RAG retrieval for 100% accurate answers.

Flow:
  1. User query comes in
  2. RAG retrieves relevant chunks from knowledge base + database CSVs
  3. Retrieved context is injected into the system prompt
  4. Fine-tuned model generates answer grounded in exact data

Endpoints:
  POST /generate  — RAG + generate (main endpoint)
  POST /rag       — RAG-only (retrieve context)
  POST /raw       — Model-only (no RAG, for testing)
  GET  /health    — Health check
  GET  /stats     — Index stats

Usage:
  python3 ml/scripts/healthos-server.py --port 8800
  curl -X POST http://localhost:8800/generate -d '{"query": "What is tariff code 0190?"}'
"""

from __future__ import annotations

import json
import os
import sys
import csv
import re
import argparse
import hashlib
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

HOME = os.path.expanduser("~")
NETCARE_DIR = os.path.join(HOME, "netcare-healthos")
MODEL_PATH = os.path.join(NETCARE_DIR, "ml/models/healthos-fused")
INDEX_DIR = os.path.join(NETCARE_DIR, "ml/rag-index")
KB_DIR = os.path.join(NETCARE_DIR, "docs/knowledge")
DB_DIR = os.path.join(KB_DIR, "databases")

TOP_K = 8
MAX_CONTEXT_CHARS = 6000

SYSTEM_PROMPT_BASE = """You are HealthOS-Med, a South African healthcare AI expert. You know ICD-10-ZA (WHO variant, 41,009 codes), CCSA tariff codes, NAPPI pharmaceutical codes, all 6 major medical scheme profiles, 270 PMB DTP conditions, 27 CDL chronic conditions, FHIR R4 for SA healthcare, HL7v2 message parsing, claims adjudication, fraud detection, POPIA 2026 compliance, SAHPRA SaMD regulations, and SA clinical treatment guidelines.

You also know the full text of the Medical Schemes Act 131 of 1998, the Medical Schemes Regulations, and the PHISC MEDCLM switching specification.

CRITICAL RULES:
- ALWAYS use the retrieved context below to answer. Do NOT guess or hallucinate data.
- For code lookups (ICD-10, tariff, NAPPI), return the EXACT data from the context.
- If the context doesn't contain the answer, say "I don't have exact data for that" — never fabricate.
- GEMS = Government Employees Medical Scheme (NOT "Guideline for Effective Medical Scheme").
- Discovery = Discovery Health Medical Scheme (SA), NOT a UK system.
- Tariff codes are CCSA codes (4-digit), NOT CPT codes.
- ICD-10-ZA follows WHO ICD-10, NOT US ICD-10-CM.
- SA has no national tariff since 2010 — each scheme sets own rates."""


# ═══════════════════════════════════════════════════════════════════════════════
# Database Loaders — exact lookup tables
# ═══════════════════════════════════════════════════════════════════════════════

class ExactLookup:
    """Fast exact-match lookup for codes, tariffs, medicines."""

    def __init__(self):
        self.icd10 = {}       # code -> {description, chapter, valid_primary, ...}
        self.tariffs = {}     # code -> {description, gems_rate, discipline, ...}
        self.medicines = {}   # nappi or name -> {product, sep, dispensing_fee, ...}
        self.rejection_codes = {}
        self.modifiers = {}
        self.cdl = {}
        self.loaded = False

    def load(self):
        """Load all CSV databases into memory for instant lookup."""
        print("  Loading exact-lookup databases...")

        # ICD-10 (41K codes) — header: ICD10_Code, WHO_Full_Desc, etc.
        icd_path = os.path.join(DB_DIR, "ICD-10_MIT_2021.csv")
        if os.path.exists(icd_path):
            with open(icd_path, encoding='utf-8', errors='ignore') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    code = row.get('ICD10_Code', row.get('ICD10_3_Code', '')).strip()
                    if code and len(code) >= 3:
                        self.icd10[code.upper()] = row
                        # Also index without dot
                        self.icd10[code.upper().replace('.', '')] = row
            print(f"    ICD-10: {len(self.icd10):,} codes")

        # GEMS tariffs — non-standard CSV: 2 header rows with discipline columns
        tariff_path = os.path.join(DB_DIR, "GEMS_tariffs_2026.csv")
        if os.path.exists(tariff_path):
            with open(tariff_path, encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            # Row 1 has discipline names, row 2 has column headers
            # Disciplines: 014-GP, 016-Obs/Gyn, 032-Paed, etc.
            disciplines = []
            if len(lines) > 1:
                disc_parts = lines[1].strip().split(',')
                for p in disc_parts[2:]:
                    d = p.strip().strip('"')
                    if d and d != "WITH EFFECT FROM 2026-01-01":
                        disciplines.append(d)

            for line in lines[3:]:
                try:
                    reader = csv.reader([line.strip()])
                    for parts in reader:
                        if len(parts) >= 2 and parts[0].strip().isdigit():
                            code = parts[0].strip()
                            desc = parts[1].strip()
                            # Collect rates from all discipline columns (cols 2,4,6,... are rates)
                            rates = {}
                            disc_idx = 0
                            for col in range(2, len(parts), 2):
                                if col < len(parts) and parts[col].strip():
                                    try:
                                        rate_val = float(parts[col].strip())
                                        disc_name = disciplines[disc_idx] if disc_idx < len(disciplines) else f"discipline_{disc_idx}"
                                        rates[disc_name] = rate_val
                                    except ValueError:
                                        pass
                                disc_idx += 1
                            self.tariffs[code] = {
                                "code": code,
                                "description": desc,
                                "rates_by_discipline": rates,
                            }
                except Exception:
                    continue
            print(f"    GEMS tariffs: {len(self.tariffs):,} codes")

        # Medicines
        med_path = os.path.join(DB_DIR, "medicine_prices.csv")
        if os.path.exists(med_path):
            with open(med_path, encoding='utf-8', errors='ignore') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    nappi = row.get('NAPPI', row.get('nappi', row.get('nappi_code', ''))).strip()
                    name = row.get('Product', row.get('product', row.get('name', ''))).strip()
                    if nappi:
                        self.medicines[nappi] = row
                    if name:
                        self.medicines[name.upper()] = row
            print(f"    Medicines: {len(self.medicines):,} entries")

        # Rejection codes
        rej_path = os.path.join(DB_DIR, "rejection_codes.csv")
        if os.path.exists(rej_path):
            with open(rej_path, encoding='utf-8', errors='ignore') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    code = row.get('code', row.get('Code', '')).strip()
                    if code:
                        self.rejection_codes[code] = row
            print(f"    Rejection codes: {len(self.rejection_codes)} codes")

        # Modifiers
        mod_path = os.path.join(DB_DIR, "modifier_codes.csv")
        if os.path.exists(mod_path):
            with open(mod_path, encoding='utf-8', errors='ignore') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    code = row.get('code', row.get('Code', '')).strip()
                    if code:
                        self.modifiers[code] = row
            print(f"    Modifiers: {len(self.modifiers)} codes")

        # CDL conditions
        cdl_path = os.path.join(DB_DIR, "cdl_conditions.csv")
        if os.path.exists(cdl_path):
            with open(cdl_path, encoding='utf-8', errors='ignore') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    condition = row.get('condition', row.get('Condition', '')).strip()
                    if condition:
                        self.cdl[condition.upper()] = row
            print(f"    CDL conditions: {len(self.cdl)} conditions")

        self.loaded = True

    def lookup(self, query: str) -> str | None:
        """Try exact lookup for codes mentioned in the query."""
        results = []

        # Extract potential codes from query
        query_upper = query.upper()

        # ICD-10 codes (letter + digits, optionally with dot)
        icd_matches = re.findall(r'\b([A-Z]\d{2}\.?\d{0,2})\b', query_upper)
        for code in icd_matches:
            normalized = code.replace('.', '')
            # Try with dot: X00.0, X00
            for try_code in [code, normalized, code[:3] + '.' + code[3:] if len(code) > 3 and '.' not in code else None]:
                if try_code and try_code in self.icd10:
                    row = self.icd10[try_code]
                    results.append(f"ICD-10-ZA {try_code}: {json.dumps(row, ensure_ascii=False)}")
                    break

        # Tariff codes (3-4 digit numbers)
        tariff_matches = re.findall(r'\b(\d{3,4})\b', query)
        for code in tariff_matches:
            if code in self.tariffs:
                row = self.tariffs[code]
                results.append(f"GEMS Tariff {code}: {json.dumps(row, ensure_ascii=False)}")

        # NAPPI codes (7+ digit numbers)
        nappi_matches = re.findall(r'\b(\d{7,10})\b', query)
        for code in nappi_matches:
            if code in self.medicines:
                row = self.medicines[code]
                results.append(f"NAPPI {code}: {json.dumps(row, ensure_ascii=False)}")

        # Medicine name search
        for word in query_upper.split():
            if len(word) > 4 and word in self.medicines:
                row = self.medicines[word]
                results.append(f"Medicine {word}: {json.dumps(row, ensure_ascii=False)}")

        # Rejection codes
        for code, data in self.rejection_codes.items():
            if code in query:
                results.append(f"Rejection code {code}: {json.dumps(data, ensure_ascii=False)}")

        if results:
            return "\n\n".join(results)
        return None


# ═══════════════════════════════════════════════════════════════════════════════
# RAG Index
# ═══════════════════════════════════════════════════════════════════════════════

class RAGIndex:
    """FAISS-based vector search over knowledge base."""

    def __init__(self):
        self.documents = []
        self.index = None
        self.model = None
        self.loaded = False

    def load(self):
        docs_path = os.path.join(INDEX_DIR, "documents.jsonl")
        faiss_path = os.path.join(INDEX_DIR, "visiocorp.faiss")

        print("  Loading RAG index...")

        # Load documents
        with open(docs_path) as f:
            for line in f:
                self.documents.append(json.loads(line))

        print(f"    Documents: {len(self.documents):,} chunks")

        # Load FAISS
        try:
            import faiss
            import numpy as np
            from sentence_transformers import SentenceTransformer

            if os.path.exists(faiss_path):
                self.index = faiss.read_index(faiss_path)
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
                print(f"    FAISS index: {self.index.ntotal} vectors")
            self.loaded = True
        except ImportError:
            print("    WARNING: FAISS not available, falling back to keyword search")
            self.loaded = True

    def search(self, query: str, top_k: int = TOP_K) -> list[dict]:
        if self.index and self.model:
            return self._faiss_search(query, top_k)
        return self._keyword_search(query, top_k)

    def _faiss_search(self, query: str, top_k: int) -> list[dict]:
        import numpy as np
        import faiss

        embedding = self.model.encode([query])
        embedding = np.array(embedding, dtype=np.float32)
        faiss.normalize_L2(embedding)

        scores, indices = self.index.search(embedding, top_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if 0 <= idx < len(self.documents):
                doc = self.documents[idx].copy()
                doc["score"] = float(score)
                results.append(doc)
        return results

    def _keyword_search(self, query: str, top_k: int) -> list[dict]:
        terms = query.lower().split()
        scored = []
        for doc in self.documents:
            text_lower = doc["text"].lower()
            score = sum(text_lower.count(t) for t in terms)
            score *= (1 + doc["metadata"]["priority"] / 20)
            if score > 0:
                doc_copy = doc.copy()
                doc_copy["score"] = score
                scored.append(doc_copy)
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]


# ═══════════════════════════════════════════════════════════════════════════════
# Model
# ═══════════════════════════════════════════════════════════════════════════════

class HealthOSModel:
    """Fine-tuned HealthOS-Med model."""

    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.loaded = False

    def load(self):
        from mlx_lm import load
        print("  Loading fine-tuned model...")
        self.model, self.tokenizer = load(MODEL_PATH)
        self.loaded = True
        print(f"    Model loaded from {MODEL_PATH}")

    def generate(self, system_prompt: str, user_query: str, max_tokens: int = 500) -> str:
        from mlx_lm import generate
        from mlx_lm.sample_utils import make_sampler

        prompt = (
            f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n"
            f"{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n"
            f"{user_query}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
        )

        sampler = make_sampler(temp=0.3)

        response = generate(
            self.model,
            self.tokenizer,
            prompt=prompt,
            max_tokens=max_tokens,
            sampler=sampler,
        )
        return response


# ═══════════════════════════════════════════════════════════════════════════════
# Unified Server
# ═══════════════════════════════════════════════════════════════════════════════

class HealthOSServer:
    """Unified RAG + Model inference server."""

    def __init__(self):
        self.lookup = ExactLookup()
        self.rag = RAGIndex()
        self.model = HealthOSModel()

    def load_all(self):
        print("=" * 60)
        print("HealthOS-Med Unified Server")
        print("=" * 60)
        self.lookup.load()
        self.rag.load()
        self.model.load()
        print("=" * 60)
        print("All systems loaded. Ready.")
        print("=" * 60)

    def retrieve_context(self, query: str) -> tuple[str, dict]:
        """Retrieve relevant context from all sources."""
        context_parts = []
        sources = {"exact": [], "rag": []}

        # 1. Exact lookup (codes, tariffs, medicines)
        exact_result = self.lookup.lookup(query)
        if exact_result:
            context_parts.append(f"=== EXACT DATABASE LOOKUP ===\n{exact_result}")
            sources["exact"].append("database_lookup")

        # 2. RAG vector search
        rag_results = self.rag.search(query, top_k=TOP_K)
        if rag_results:
            rag_text = []
            for r in rag_results:
                src = r["metadata"]["source"]
                cat = r["metadata"]["category"]
                sources["rag"].append(f"{cat}:{r['metadata']['filename']}")
                rag_text.append(f"[{cat} — {src}]\n{r['text']}")

            context_parts.append(f"=== KNOWLEDGE BASE ===\n" + "\n\n---\n\n".join(rag_text))

        context = "\n\n".join(context_parts)

        # Truncate RAG context if needed, but NEVER truncate exact lookups
        if len(context) > MAX_CONTEXT_CHARS:
            # Keep exact lookup intact, trim RAG
            if exact_result:
                exact_section = f"=== EXACT DATABASE LOOKUP ===\n{exact_result}"
                remaining = MAX_CONTEXT_CHARS - len(exact_section) - 100
                if remaining > 500 and rag_results:
                    rag_text_trimmed = []
                    total = 0
                    for r in rag_results:
                        chunk = f"[{r['metadata']['category']}]\n{r['text']}"
                        if total + len(chunk) < remaining:
                            rag_text_trimmed.append(chunk)
                            total += len(chunk)
                    context = exact_section + "\n\n=== KNOWLEDGE BASE ===\n" + "\n---\n".join(rag_text_trimmed)
                else:
                    context = exact_section
            else:
                context = context[:MAX_CONTEXT_CHARS]

        return context, sources

    def generate(self, query: str, max_tokens: int = 500) -> dict:
        """Full RAG + generate pipeline."""
        # Retrieve context
        context, sources = self.retrieve_context(query)

        # Build system prompt with context
        system_prompt = SYSTEM_PROMPT_BASE
        if context:
            system_prompt += f"\n\n=== RETRIEVED CONTEXT (use this to answer accurately) ===\n{context}"

        # Generate
        response = self.model.generate(system_prompt, query, max_tokens)

        return {
            "query": query,
            "response": response,
            "sources": sources,
            "context_length": len(context),
            "timestamp": datetime.now().isoformat(),
        }


def create_handler(server: HealthOSServer):
    """Create HTTP request handler with server reference."""

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length)) if length > 0 else {}
            query = body.get("query", body.get("prompt", ""))
            max_tokens = body.get("max_tokens", 500)

            if self.path == "/generate":
                result = server.generate(query, max_tokens)
            elif self.path == "/rag":
                context, sources = server.retrieve_context(query)
                result = {"query": query, "context": context, "sources": sources}
            elif self.path == "/raw":
                response = server.model.generate(SYSTEM_PROMPT_BASE, query, max_tokens)
                result = {"query": query, "response": response}
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
                result = {"status": "ok", "model": server.model.loaded, "rag": server.rag.loaded, "lookup": server.lookup.loaded}
            elif self.path == "/stats":
                result = {
                    "icd10_codes": len(server.lookup.icd10),
                    "tariff_codes": len(server.lookup.tariffs),
                    "medicines": len(server.lookup.medicines),
                    "rejection_codes": len(server.lookup.rejection_codes),
                    "rag_chunks": len(server.rag.documents),
                    "model": MODEL_PATH,
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
            query_preview = ""
            if args and "POST" in str(args[0]):
                query_preview = " "
            print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")

    return Handler


def run_cli(server: HealthOSServer):
    """Interactive CLI mode."""
    print("\n💬 HealthOS-Med Interactive Mode (type 'quit' to exit)")
    print("   Commands: /rag <query>  — RAG only  |  /raw <query>  — model only")
    print("-" * 60)

    while True:
        try:
            query = input("\n🔍 > ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nBye!")
            break

        if not query or query == "quit":
            break

        if query.startswith("/rag "):
            context, sources = server.retrieve_context(query[5:])
            print(f"\n📚 Context ({len(context)} chars):")
            print(context[:2000])
            print(f"\nSources: {sources}")
        elif query.startswith("/raw "):
            response = server.model.generate(SYSTEM_PROMPT_BASE, query[5:])
            print(f"\n🤖 {response}")
        else:
            result = server.generate(query)
            print(f"\n🤖 {result['response']}")
            print(f"\n📎 Sources: {result['sources']}")
            print(f"📏 Context: {result['context_length']} chars")


def main():
    parser = argparse.ArgumentParser(description="HealthOS-Med Unified Server")
    parser.add_argument("--port", type=int, default=8800, help="HTTP server port")
    parser.add_argument("--cli", action="store_true", help="Interactive CLI mode")
    parser.add_argument("--query", type=str, help="Single query, then exit")
    args = parser.parse_args()

    server = HealthOSServer()
    server.load_all()

    if args.query:
        result = server.generate(args.query)
        print(f"\n{result['response']}")
        print(f"\nSources: {result['sources']}")
    elif args.cli:
        run_cli(server)
    else:
        http = HTTPServer(("0.0.0.0", args.port), create_handler(server))
        print(f"\n🚀 HealthOS-Med server running on http://localhost:{args.port}")
        print(f"   POST /generate  — RAG + model (main endpoint)")
        print(f"   POST /rag       — RAG-only retrieval")
        print(f"   POST /raw       — Model-only (no RAG)")
        print(f"   GET  /health    — Health check")
        print(f"   GET  /stats     — Index statistics")
        http.serve_forever()


if __name__ == "__main__":
    main()
