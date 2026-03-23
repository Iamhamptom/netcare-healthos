#!/usr/bin/env python3
"""Load ALL data sources into RAG index — ICD-10, medicines, tariffs, CDL, rejections, modifiers, training Q&A, knowledge."""

from __future__ import annotations
import json, os, csv, random, sys
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

random.seed(42)
HOME = os.path.expanduser("~")
NETCARE = os.path.join(HOME, "netcare-healthos")
INDEX_DIR = os.path.join(NETCARE, "ml/rag-index")
DB_DIR = os.path.join(NETCARE, "docs/knowledge/databases")

docs = []
existing_ids = set()

# Load existing knowledge/scheme docs
print("Loading existing RAG docs...")
with open(os.path.join(INDEX_DIR, "documents.jsonl")) as f:
    for line in f:
        d = json.loads(line)
        docs.append(d)
        existing_ids.add(d["id"])
print(f"  Existing: {len(docs)}")

def add(doc_id, text, category, source, priority=9):
    if doc_id in existing_ids:
        return
    existing_ids.add(doc_id)
    docs.append({"id": doc_id, "text": text, "metadata": {"source": source, "filename": doc_id, "category": category, "priority": priority, "chunk_index": 0, "total_chunks": 1}})

# 1. ICD-10 — 41K codes
print("[1/7] ICD-10 codes...")
with open(os.path.join(DB_DIR, "ICD-10_MIT_2021.csv"), encoding="utf-8", errors="ignore") as f:
    for row in csv.DictReader(f):
        code = row.get("ICD10_Code", "").strip()
        desc = row.get("WHO_Full_Desc", "").strip()
        if not code or not desc: continue
        chapter = row.get("Chapter_Desc", "").strip()
        group = row.get("Group_Desc", "").strip()
        vp = row.get("Valid_ICD10_Primary", "").strip()
        gender = row.get("Gender", "").strip()
        age = row.get("Age_Range", "").strip()
        ast = row.get("Valid_ICD10_Asterisk", "").strip()
        dag = row.get("Valid_ICD10_Dagger", "").strip()

        parts = [f"ICD-10-ZA {code}: {desc}"]
        if chapter: parts.append(f"Chapter: {chapter}")
        if group: parts.append(f"Group: {group}")
        if vp:
            is_valid = vp.upper() in ("Y","YES","1","TRUE")
            parts.append(f"Valid primary: {'Yes' if is_valid else 'No'}")
        if gender: parts.append(f"Gender: {gender}")
        if age: parts.append(f"Age: {age}")
        if ast and ast.upper() in ("Y","YES","1","TRUE"): parts.append("Asterisk code (manifestation)")
        if dag and dag.upper() in ("Y","YES","1","TRUE"): parts.append("Dagger code (etiology)")
        add(f"icd10_{code}", ". ".join(parts), "icd10_code", "ICD-10_MIT_2021.csv", 10)

icd_count = len([d for d in docs if d["metadata"]["category"] == "icd10_code"])
print(f"  ICD-10: {icd_count:,}")

# 2. Medicines — 10K
print("[2/7] Medicines...")
with open(os.path.join(DB_DIR, "medicine_prices.csv"), encoding="utf-8", errors="ignore") as f:
    for row in csv.DictReader(f):
        nappi = row.get("nappi_code", "").strip()
        name = row.get("name", "").strip()
        if not nappi or not name: continue
        parts = [f"NAPPI {nappi}: {name}"]
        s = row.get("schedule", "").strip()
        if s: parts.append(f"Schedule {s}")
        form = row.get("dosage_form", "").strip()
        if form: parts.append(form)
        pack = row.get("pack_size", "").strip()
        if pack: parts.append(f"Pack: {pack}")
        sep = row.get("sep", "").strip()
        if sep: parts.append(f"SEP: R{sep}")
        disp = row.get("dispensing_fee", "").strip()
        if disp: parts.append(f"Dispensing fee: R{disp}")
        gen = row.get("is_generic", "").strip()
        if gen and gen.upper() in ("Y","YES","1","TRUE"): parts.append("Generic")
        add(f"med_{nappi}", ". ".join(parts), "medicine", "medicine_prices.csv")

med_count = len([d for d in docs if d["metadata"]["category"] == "medicine"])
print(f"  Medicines: {med_count:,}")

# 3. GEMS Tariffs — 4.2K
print("[3/7] GEMS tariffs...")
with open(os.path.join(DB_DIR, "GEMS_tariffs_2026.csv"), encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()
discs = ["014-GP", "016-ObGyn", "032-Paed"]
for line in lines[3:]:
    try:
        parts = list(csv.reader([line.strip()]))[0]
        if len(parts) >= 2 and parts[0].strip().isdigit():
            code = parts[0].strip()
            desc = parts[1].strip()[:200]
            rates = {}
            for ci, disc in enumerate(discs):
                rc = 2 + ci * 2
                if rc < len(parts) and parts[rc].strip():
                    try: rates[disc] = float(parts[rc].strip())
                    except ValueError: pass
            text = f"CCSA tariff {code}: {desc}"
            if rates:
                rp = ", ".join(f"{d}: R{r:.2f}" for d, r in rates.items())
                text += f". GEMS 2026 rates: {rp}"
            add(f"tariff_{code}", text, "tariff", "GEMS_tariffs_2026.csv")
    except: continue

tariff_count = len([d for d in docs if d["metadata"]["category"] == "tariff"])
print(f"  Tariffs: {tariff_count:,}")

# 4. Rejection codes
print("[4/7] Rejection codes...")
with open(os.path.join(DB_DIR, "rejection_codes.csv"), encoding="utf-8", errors="ignore") as f:
    for row in csv.DictReader(f):
        code = row.get("code", row.get("Code", "")).strip()
        desc = row.get("description", row.get("Description", "")).strip()
        cause = row.get("common_cause", row.get("Common_Cause", "")).strip()
        fix = row.get("fix_suggestion", row.get("Fix_Suggestion", "")).strip()
        cat = row.get("category", row.get("Category", "")).strip()
        if not code: continue
        add(f"rej_{code}", f"Rejection code {code}: {desc}. Category: {cat}. Cause: {cause}. Fix: {fix}", "rejection", "rejection_codes.csv", 10)
print(f"  Rejections: {len([d for d in docs if d['metadata']['category']=='rejection'])}")

# 5. CDL conditions
print("[5/7] CDL conditions...")
with open(os.path.join(DB_DIR, "cdl_conditions.csv"), encoding="utf-8", errors="ignore") as f:
    for row in csv.DictReader(f):
        cond = row.get("condition", row.get("Condition", "")).strip()
        icd = row.get("primary_icd10", row.get("Primary_ICD10", "")).strip()
        meds = row.get("key_medications", row.get("Key_Medications", "")).strip()
        mon = row.get("monitoring", row.get("Monitoring", "")).strip()
        if not cond: continue
        add(f"cdl_{cond[:20].replace(' ','_')}", f"CDL: {cond}. ICD-10: {icd}. Meds: {meds}. Monitoring: {mon}. Must be covered — no annual limit.", "cdl", "cdl_conditions.csv", 10)
print(f"  CDL: {len([d for d in docs if d['metadata']['category']=='cdl'])}")

# 6. Modifiers
print("[6/7] Modifiers...")
with open(os.path.join(DB_DIR, "modifier_codes.csv"), encoding="utf-8", errors="ignore") as f:
    for row in csv.DictReader(f):
        code = row.get("code", row.get("Code", "")).strip()
        desc = row.get("description", row.get("Description", "")).strip()
        if not code: continue
        add(f"mod_{code}", f"Tariff modifier {code}: {desc}", "modifier", "modifier_codes.csv")
print(f"  Modifiers: {len([d for d in docs if d['metadata']['category']=='modifier'])}")

# 7. Training Q&A — 10K sample from mega dataset
print("[7/7] Training Q&A pairs (10K sample)...")
mega_path = os.path.join(NETCARE, "ml/training-data/mega/train.jsonl")
if os.path.exists(mega_path):
    qa_all = []
    with open(mega_path) as f:
        for line in f:
            qa_all.append(json.loads(line))
    sampled = random.sample(qa_all, min(10000, len(qa_all)))
    for i, pair in enumerate(sampled):
        msgs = pair.get("messages", [])
        if len(msgs) >= 3:
            uq = msgs[1]["content"][:200]
            aa = msgs[2]["content"][:500]
            add(f"qa_{i:05d}", f"Q: {uq}\nA: {aa}", "training_qa", "training-data", 8)
    print(f"  Q&A pairs: {len([d for d in docs if d['metadata']['category']=='training_qa']):,}")

# Build index
total = len(docs)
print(f"\nTotal documents: {total:,}")
print("Writing documents...")
sys.stdout.flush()

with open(os.path.join(INDEX_DIR, "documents.jsonl"), "w") as f:
    for doc in docs:
        f.write(json.dumps(doc, ensure_ascii=False) + "\n")

print("Encoding embeddings (this will take several minutes for 65K+ docs)...")
sys.stdout.flush()

model = SentenceTransformer("all-MiniLM-L6-v2")
texts = [doc["text"] for doc in docs]
embeddings = model.encode(texts, show_progress_bar=True, batch_size=512)
embeddings = np.array(embeddings, dtype=np.float32)
faiss.normalize_L2(embeddings)

dim = embeddings.shape[1]
index = faiss.IndexFlatIP(dim)
index.add(embeddings)
faiss.write_index(index, os.path.join(INDEX_DIR, "visiocorp.faiss"))

# Summary
cats = {}
for d in docs:
    c = d["metadata"]["category"]
    cats[c] = cats.get(c, 0) + 1

print(f"\n{'='*60}")
print(f"COMPLETE RAG INDEX BUILT")
print(f"{'='*60}")
print(f"Total: {total:,} documents, {index.ntotal:,} vectors")
print(f"\nBy category:")
for cat, count in sorted(cats.items(), key=lambda x: -x[1]):
    print(f"  {cat}: {count:,}")
print(f"{'='*60}")
