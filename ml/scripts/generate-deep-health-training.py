#!/usr/bin/env python3
"""
Deep Health Sector Training Data Generator
==========================================
Generates comprehensive Q&A training pairs from:
1. Full text of Medical Schemes Act + Regulations
2. Section 59 Investigation (227 pages)
3. HPCSA AI Booklet 20
4. SAHPRA AI/ML Device Guidance
5. PHISC MEDCLM Specification
6. Discovery CDL Formulary + Treatment Baskets
7. GEMS DRP + Formulary
8. Bonitas Annexure C
9. CMS Industry Report 2024
10. All 20+ compiled knowledge MDs (law, claims, coding, PMB, schemes, pharma, fraud, compliance, etc.)
11. Clinical guidelines, EHR standards, practice workflows
12. Rejection patterns, FHIR implementation, NHI readiness
13. Database CSVs (rejection codes, modifiers, tariff ranges, CDL conditions, place of service)
14. Product architecture (API routes, pages, AI products, database models)

Output: JSONL files that can be merged with existing training data for LoRA fine-tuning.
"""

from __future__ import annotations

import json
import os
import re
import csv
import hashlib
import random
from pathlib import Path
from datetime import datetime
from typing import Optional

HOME = os.path.expanduser("~")
NETCARE_DIR = os.path.join(HOME, "netcare-healthos")
KB_DIR = os.path.join(NETCARE_DIR, "docs/knowledge")
EXTRACTED_DIR = os.path.join(KB_DIR, "extracted")
DB_DIR = os.path.join(KB_DIR, "databases")
OUTPUT_DIR = os.path.join(NETCARE_DIR, "ml/training-data/deep-health")

SYSTEM_PROMPT = """You are HealthOS-Med, a South African healthcare AI expert. You know ICD-10-ZA (WHO variant, 41,009 codes), CCSA tariff codes, NAPPI pharmaceutical codes, all 6 major medical scheme profiles, 270 PMB DTP conditions, 27 CDL chronic conditions, FHIR R4 for SA healthcare, HL7v2 message parsing, claims adjudication, fraud detection, POPIA 2026 compliance, SAHPRA SaMD regulations, and SA clinical treatment guidelines. You also know the full text of the Medical Schemes Act 131 of 1998, the Medical Schemes Regulations, the Section 59 Investigation findings, HPCSA ethical rules for AI, and the PHISC MEDCLM switching specification. Always respond with accurate, SA-specific information."""

os.makedirs(OUTPUT_DIR, exist_ok=True)

seen_hashes = set()
stats = {}


def make_pair(user_msg: str, assistant_msg: str, source: str = "") -> dict | None:
    """Create a deduplicated training pair."""
    h = hashlib.md5((user_msg + assistant_msg).encode()).hexdigest()
    if h in seen_hashes:
        return None
    seen_hashes.add(h)
    stats[source.split(":")[0]] = stats.get(source.split(":")[0], 0) + 1
    return {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg.strip()},
            {"role": "assistant", "content": assistant_msg.strip()},
        ],
        "metadata": {"source": source, "generated": datetime.now().isoformat()},
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 1. DEEP LAW EXTRACTION — Medical Schemes Act, Regulations, Section 59
# ═══════════════════════════════════════════════════════════════════════════════

def extract_law_sections(filepath: str, source_name: str) -> list[dict]:
    """Parse legal documents into section-by-section Q&A pairs."""
    pairs = []
    try:
        with open(filepath) as f:
            content = f.read()
    except:
        print(f"  SKIP: {filepath} not found")
        return pairs

    fname = os.path.basename(filepath)
    doc_title = fname.replace("-", " ").replace("_", " ").replace(".md", "").title()

    # Split by sections/chapters — try multiple heading patterns
    # Legal docs use: ## Section X, # Chapter X, **Section X**, numbered sections
    sections = []

    # Try ## headers first
    parts = re.split(r'^#{1,3}\s+', content, flags=re.MULTILINE)
    if len(parts) > 3:
        for part in parts[1:]:
            lines = part.strip().split("\n")
            title = lines[0].strip()
            body = "\n".join(lines[1:]).strip()
            if len(body) > 100:
                sections.append((title, body))

    # Try **bold** section markers
    if len(sections) < 5:
        bold_parts = re.split(r'^\*\*([^*]+)\*\*\s*$', content, flags=re.MULTILINE)
        for i in range(1, len(bold_parts) - 1, 2):
            title = bold_parts[i].strip()
            body = bold_parts[i + 1].strip()
            if len(body) > 100 and len(title) > 5:
                sections.append((title, body))

    # Try "Section XX." pattern (common in legislation)
    if len(sections) < 5:
        sec_parts = re.split(r'^(Section\s+\d+[A-Za-z]?\.?\s+.+?)$', content, flags=re.MULTILINE)
        for i in range(1, len(sec_parts) - 1, 2):
            title = sec_parts[i].strip()
            body = sec_parts[i + 1].strip()
            if len(body) > 100:
                sections.append((title, body))

    # Fallback: chunk by ~2000 chars
    if len(sections) < 3:
        chunks = [content[i:i+2000] for i in range(0, len(content), 1800)]
        for idx, chunk in enumerate(chunks):
            if len(chunk) > 200:
                sections.append((f"{doc_title} — Part {idx+1}", chunk))

    print(f"  {fname}: {len(sections)} sections found")

    for title, body in sections:
        # Truncate very long sections
        body_trunc = body[:3000]

        # Generate multiple question types per section
        title_lower = title.lower()

        # Direct question
        p = make_pair(
            f"What does {title} say in the {doc_title}?",
            body_trunc,
            f"{source_name}:{fname}"
        )
        if p: pairs.append(p)

        # Explain question
        p = make_pair(
            f"Explain {title} from {doc_title}",
            body_trunc,
            f"{source_name}:{fname}"
        )
        if p: pairs.append(p)

        # If it mentions specific legal concepts, add targeted questions
        if any(w in title_lower for w in ["penalty", "offence", "contravention", "fine"]):
            p = make_pair(
                f"What are the penalties or offences described in {title}?",
                body_trunc,
                f"{source_name}:penalties"
            )
            if p: pairs.append(p)

        if any(w in title_lower for w in ["obligation", "duty", "must", "shall", "require"]):
            p = make_pair(
                f"What obligations are set out in {title}?",
                body_trunc,
                f"{source_name}:obligations"
            )
            if p: pairs.append(p)

        if any(w in title_lower for w in ["benefit", "pmb", "prescribed", "minimum"]):
            p = make_pair(
                f"What are the prescribed minimum benefit requirements in {title}?",
                body_trunc,
                f"{source_name}:pmb"
            )
            if p: pairs.append(p)

        if any(w in title_lower for w in ["registrar", "council", "cms", "authority"]):
            p = make_pair(
                f"What powers does the regulatory authority have under {title}?",
                body_trunc,
                f"{source_name}:authority"
            )
            if p: pairs.append(p)

        if any(w in title_lower for w in ["claim", "payment", "billing", "reimburse"]):
            p = make_pair(
                f"What does {title} say about claims and payment?",
                body_trunc,
                f"{source_name}:claims"
            )
            if p: pairs.append(p)

        if any(w in title_lower for w in ["fraud", "abuse", "waste", "investigation"]):
            p = make_pair(
                f"What does {title} say about fraud, waste, or abuse?",
                body_trunc,
                f"{source_name}:fraud"
            )
            if p: pairs.append(p)

    # Full document summary
    p = make_pair(
        f"Summarize the key points of the {doc_title}",
        content[:4000],
        f"{source_name}:summary"
    )
    if p: pairs.append(p)

    return pairs


# ═══════════════════════════════════════════════════════════════════════════════
# 2. COMPILED KNOWLEDGE MDs — Deep Q&A from each chapter
# ═══════════════════════════════════════════════════════════════════════════════

def extract_knowledge_chapters() -> list[dict]:
    """Extract deep Q&A from the 20+ compiled knowledge markdown files."""
    pairs = []

    # Map filenames to question templates
    topic_questions = {
        "01_law_and_regulation": [
            "What laws govern medical schemes in South Africa?",
            "What is the Medical Schemes Act 131 of 1998?",
            "What are a medical scheme's legal obligations under SA law?",
            "What does POPIA 2026 require for health data?",
            "What are the HPCSA rules for AI in healthcare?",
            "What does SAHPRA require for AI/ML medical devices?",
            "How does NHI affect medical schemes?",
            "What is Section 59 of the Medical Schemes Act?",
        ],
        "02_claims_adjudication": [
            "How does claims adjudication work in SA medical schemes?",
            "What is the claims adjudication decision flowchart?",
            "What are the top 25 rejection codes for medical scheme claims?",
            "How does benefit routing work in claims processing?",
            "What causes a claim to be rejected?",
            "Walk me through the end-to-end claims process",
            "What is pre-authorization and when is it required?",
            "What are the most common reasons for claims rejection in SA?",
        ],
        "03_coding_standards": [
            "What coding standards are used in SA healthcare claims?",
            "How does ICD-10-ZA differ from ICD-10-CM?",
            "What are CCSA tariff codes?",
            "What are the 27 tariff modifiers used in SA?",
            "How do NAPPI codes work?",
            "What is EDIFACT MEDCLM format?",
            "What is the structure of an ICD-10-ZA code?",
            "How do you validate an ICD-10 code for primary diagnosis use?",
        ],
        "04_pmb_and_cdl": [
            "What are Prescribed Minimum Benefits (PMBs)?",
            "What are the 270 PMB DTP conditions?",
            "What are the 27 CDL chronic conditions?",
            "What treatment is covered under PMBs?",
            "What are the PMB rules for emergency treatment?",
            "What happens when a scheme refuses a PMB claim?",
            "List all 27 CDL conditions with their ICD-10 codes",
            "What is the difference between PMB DTPs and CDL?",
        ],
        "05_scheme_profiles": [
            "What are the major medical schemes in South Africa?",
            "How does Discovery Health scheme work?",
            "What is the GEMS medical scheme?",
            "How does Bonitas medical scheme work?",
            "What are the key differences between SA medical schemes?",
            "How do scheme rates differ for the same procedure?",
            "What are the three switching houses in SA?",
        ],
        "06_pharmaceutical": [
            "How does pharmaceutical dispensing work in SA?",
            "What is the SEP pricing formula?",
            "What are dispensing fees in SA?",
            "How does Drug Utilisation Review (DUR) work?",
            "What is the chronic medication workflow?",
            "How do NAPPI codes map to medicines?",
            "What is a formulary and how do schemes use them?",
        ],
        "07_fraud_detection": [
            "How big is healthcare fraud in South Africa?",
            "What are the 8 types of healthcare fraud in SA?",
            "How do you detect fraudulent claims?",
            "What is the difference between fraud, waste, and abuse?",
            "What algorithms detect healthcare fraud?",
            "What bias safeguards are needed in fraud detection?",
            "What is upcoding and how do you detect it?",
        ],
        "08_compliance": [
            "What compliance requirements apply to health AI in SA?",
            "What is the POPIA compliance checklist for healthcare?",
            "What does SAHPRA require for Software as a Medical Device?",
            "What is ISO 13485 and when does it apply?",
            "What are the cross-border AI rules for SA health data?",
            "What consent is required under POPIA for health data?",
        ],
        "09_industry_landscape": [
            "What is the SA healthcare technology landscape?",
            "Who are the major health tech vendors in SA?",
            "What startups are disrupting SA healthcare?",
            "What academic research is happening in SA health AI?",
        ],
        "10_market_intelligence": [
            "What is the competitive landscape for health AI in SA?",
            "Who are the key investors in SA health tech?",
            "What is the total addressable market for health AI in SA?",
        ],
        "11_business_intelligence": [
            "How does vendor accreditation work in SA healthcare?",
            "What does competitor pricing look like in SA health tech?",
            "What are the distribution channels for health tech in SA?",
            "What is the BEE requirement for health tech procurement?",
        ],
        "12_commercial_intelligence": [
            "What do health tech contracts look like in SA?",
            "What SLAs are standard in SA health tech?",
            "What insurance is needed for health AI products?",
            "How does BEE affect health tech procurement?",
        ],
        "13_clinical_guidelines": [
            "What are SA clinical treatment guidelines?",
            "What clinical protocols must be followed in SA primary care?",
            "What are the treatment guidelines for chronic conditions in SA?",
            "How do clinical guidelines affect claims adjudication?",
        ],
        "14_rejection_patterns": [
            "What are the most common rejection patterns in SA claims?",
            "How do you fix rejected claims?",
            "What rejection patterns are scheme-specific?",
            "What is the rejection rate for ICD-10 coding errors?",
            "How do you reduce claim rejections?",
            "What auto-correction strategies work for common rejections?",
        ],
        "15_fhir_implementation": [
            "How is FHIR R4 implemented for SA healthcare?",
            "What FHIR resources are used in SA health systems?",
            "How do you map SA health data to FHIR resources?",
            "What is CareConnect and how does it relate to FHIR?",
            "How do you implement a FHIR server for SA health?",
        ],
        "16_telehealth_digital": [
            "What is the state of telehealth in South Africa?",
            "What digital health regulations apply in SA?",
            "How do you bill for telehealth consultations in SA?",
            "What platforms support telehealth in SA?",
        ],
        "17_nhi_readiness": [
            "What is National Health Insurance (NHI) in South Africa?",
            "How should health tech prepare for NHI?",
            "What does NHI mean for medical schemes?",
            "What technology requirements does NHI introduce?",
            "How will NHI affect claims processing?",
        ],
        "18_scheme_pricing_comparison": [
            "How do medical scheme prices compare across schemes?",
            "What drives pricing differences between schemes?",
            "How do contracted vs non-contracted rates differ?",
            "What is the NHRPL and why was it discontinued?",
        ],
        "19_practice_workflows": [
            "What are typical practice workflows in SA primary care?",
            "How does patient check-in work in a SA clinic?",
            "What is the billing workflow for a GP practice?",
            "How do clinics handle chronic medication management?",
            "What admin workflows run in a typical SA practice?",
        ],
        "20_ehr_clinical_standards": [
            "What EHR standards apply in SA healthcare?",
            "What clinical documentation standards must SA clinics follow?",
            "How should patient records be structured in an SA EHR?",
            "What interoperability standards apply to SA health records?",
        ],
    }

    for filename, questions in topic_questions.items():
        filepath = os.path.join(KB_DIR, f"{filename}.md")
        if not os.path.exists(filepath):
            print(f"  SKIP: {filepath}")
            continue

        with open(filepath) as f:
            content = f.read()

        print(f"  {filename}: {len(content):,} chars, {len(questions)} base questions")

        # Full-content Q&A for each predefined question
        for q in questions:
            # Use first 3500 chars as answer (fits in context)
            p = make_pair(q, content[:3500], f"knowledge:{filename}")
            if p: pairs.append(p)

        # Section-level Q&A
        sections = re.split(r'^##\s+', content, flags=re.MULTILINE)
        for section in sections[1:]:
            lines = section.strip().split("\n")
            title = lines[0].strip()
            body = "\n".join(lines[1:]).strip()
            if len(body) < 150:
                continue

            body_trunc = body[:2500]

            p = make_pair(f"What does the {filename.replace('_', ' ')} section on {title} cover?", body_trunc, f"knowledge:{filename}:{title[:30]}")
            if p: pairs.append(p)

            p = make_pair(f"Explain {title} in SA healthcare", body_trunc, f"knowledge:{filename}:{title[:30]}")
            if p: pairs.append(p)

            # Sub-sections (### headers)
            subsections = re.split(r'^###\s+', body, flags=re.MULTILINE)
            for subsec in subsections[1:]:
                sub_lines = subsec.strip().split("\n")
                sub_title = sub_lines[0].strip()
                sub_body = "\n".join(sub_lines[1:]).strip()
                if len(sub_body) < 100:
                    continue

                p = make_pair(f"What is {sub_title} in {title}?", sub_body[:2000], f"knowledge:{filename}:sub")
                if p: pairs.append(p)

    return pairs


# ═══════════════════════════════════════════════════════════════════════════════
# 3. DATABASE CSVs — rejection codes, modifiers, CDL, tariff ranges
# ═══════════════════════════════════════════════════════════════════════════════

def extract_database_csvs() -> list[dict]:
    """Extract Q&A from the small structured CSV databases."""
    pairs = []

    # Rejection codes
    rejection_path = os.path.join(DB_DIR, "rejection_codes.csv")
    if os.path.exists(rejection_path):
        with open(rejection_path) as f:
            content = f.read()
        rows = list(csv.DictReader(content.strip().split("\n")))
        print(f"  rejection_codes.csv: {len(rows)} codes")

        # Full list
        all_codes = "\n".join([f"- {r.get('code', r.get('Code', ''))}: {r.get('description', r.get('Description', ''))}" for r in rows])
        p = make_pair("What are all the medical scheme claim rejection codes?", all_codes[:3500], "db:rejection_codes")
        if p: pairs.append(p)

        # Individual codes
        for r in rows:
            code = r.get('code', r.get('Code', ''))
            desc = r.get('description', r.get('Description', ''))
            action = r.get('action', r.get('Action', r.get('resolution', '')))
            if code and desc:
                answer = f"Rejection code {code}: {desc}"
                if action:
                    answer += f"\n\nResolution: {action}"
                p = make_pair(f"What does rejection code {code} mean?", answer, f"db:rejection:{code}")
                if p: pairs.append(p)

    # Modifier codes
    modifier_path = os.path.join(DB_DIR, "modifier_codes.csv")
    if os.path.exists(modifier_path):
        with open(modifier_path) as f:
            content = f.read()
        rows = list(csv.DictReader(content.strip().split("\n")))
        print(f"  modifier_codes.csv: {len(rows)} codes")

        all_mods = "\n".join([f"- {r.get('code', r.get('Code', ''))}: {r.get('description', r.get('Description', ''))}" for r in rows])
        p = make_pair("What are the SA tariff modifier codes?", all_mods[:3500], "db:modifiers")
        if p: pairs.append(p)

        for r in rows:
            code = r.get('code', r.get('Code', ''))
            desc = r.get('description', r.get('Description', ''))
            if code and desc:
                p = make_pair(f"What does tariff modifier {code} mean?", f"Modifier {code}: {desc}", f"db:modifier:{code}")
                if p: pairs.append(p)

    # CDL conditions
    cdl_path = os.path.join(DB_DIR, "cdl_conditions.csv")
    if os.path.exists(cdl_path):
        with open(cdl_path) as f:
            content = f.read()
        rows = list(csv.DictReader(content.strip().split("\n")))
        print(f"  cdl_conditions.csv: {len(rows)} conditions")

        all_cdl = "\n".join([
            f"- {r.get('condition', r.get('Condition', ''))}: ICD-10 {r.get('icd10', r.get('ICD10', r.get('icd_10', '')))}"
            for r in rows
        ])
        p = make_pair("List all 27 CDL (Chronic Disease List) conditions with ICD-10 codes", all_cdl[:3500], "db:cdl")
        if p: pairs.append(p)

        for r in rows:
            condition = r.get('condition', r.get('Condition', ''))
            icd = r.get('icd10', r.get('ICD10', r.get('icd_10', '')))
            treatment = r.get('treatment', r.get('Treatment', ''))
            if condition:
                answer = f"CDL Condition: {condition}"
                if icd: answer += f"\nICD-10 code(s): {icd}"
                if treatment: answer += f"\nTreatment: {treatment}"
                p = make_pair(f"What is the CDL entry for {condition}?", answer, f"db:cdl:{condition[:20]}")
                if p: pairs.append(p)

    # Tariff ranges
    tariff_path = os.path.join(DB_DIR, "tariff_ranges.csv")
    if os.path.exists(tariff_path):
        with open(tariff_path) as f:
            content = f.read()
        rows = list(csv.DictReader(content.strip().split("\n")))
        print(f"  tariff_ranges.csv: {len(rows)} ranges")

        all_ranges = "\n".join([
            f"- {r.get('range', r.get('Range', ''))}: {r.get('description', r.get('Description', ''))}"
            for r in rows
        ])
        p = make_pair("What are the CCSA tariff code ranges?", all_ranges[:3500], "db:tariff_ranges")
        if p: pairs.append(p)

    # Place of service
    pos_path = os.path.join(DB_DIR, "place_of_service.csv")
    if os.path.exists(pos_path):
        with open(pos_path) as f:
            content = f.read()
        rows = list(csv.DictReader(content.strip().split("\n")))
        print(f"  place_of_service.csv: {len(rows)} places")

        all_pos = "\n".join([
            f"- {r.get('code', r.get('Code', ''))}: {r.get('description', r.get('Description', ''))}"
            for r in rows
        ])
        p = make_pair("What are the place of service codes used in SA claims?", all_pos[:3500], "db:place_of_service")
        if p: pairs.append(p)

    return pairs


# ═══════════════════════════════════════════════════════════════════════════════
# 4. EXTRACTED FULL DOCUMENTS — DEEP parsing of legislation & specs
# ═══════════════════════════════════════════════════════════════════════════════

def extract_all_legislation() -> list[dict]:
    """Extract Q&A from all extracted legal/regulatory/spec documents."""
    pairs = []

    docs = {
        "medical-schemes-act-full-text.md": "Medical Schemes Act 131 of 1998",
        "medical-schemes-regulations-full-text.md": "Medical Schemes Regulations",
        "section59-investigation-extracted.md": "Section 59 Investigation into Medical Scheme Costs",
        "hpcsa-booklet-20-ai-extracted.md": "HPCSA Booklet 20 — Ethical Rules for AI in Healthcare",
        "sahpra-ai-ml-devices-extracted.md": "SAHPRA Guidance on AI/ML Medical Devices",
        "phisc-medclm-spec-extracted.md": "PHISC MEDCLM Electronic Claims Specification",
        "discovery-cdl-formulary-2026-data.md": "Discovery Health CDL Formulary 2026",
        "discovery-treatment-baskets-2026-data.md": "Discovery Health Treatment Baskets 2026",
        "gems-drp-feb2026-data.md": "GEMS Dispensing Rate Plan February 2026",
        "gems-formulary-jan2025-data.md": "GEMS Formulary January 2025",
        "bonitas-annexure-c-2025-data.md": "Bonitas Annexure C 2025 Benefits",
        "cms-industry-report-2024-data.md": "CMS Annual Industry Report 2024",
    }

    for filename, doc_title in docs.items():
        filepath = os.path.join(EXTRACTED_DIR, filename)
        if not os.path.exists(filepath):
            print(f"  SKIP: {filename}")
            continue

        file_size = os.path.getsize(filepath)
        print(f"  {filename}: {file_size:,} bytes")

        extracted = extract_law_sections(filepath, f"law:{doc_title[:30]}")
        pairs.extend(extracted)

    return pairs


# ═══════════════════════════════════════════════════════════════════════════════
# 5. PRODUCT ARCHITECTURE — How the product actually works
# ═══════════════════════════════════════════════════════════════════════════════

def extract_product_architecture() -> list[dict]:
    """Generate training data about Netcare Health OS architecture."""
    pairs = []

    # Prisma schema
    schema_path = os.path.join(NETCARE_DIR, "prisma/schema.prisma")
    if os.path.exists(schema_path):
        with open(schema_path) as f:
            schema = f.read()

        # Extract models
        models = re.findall(r'model\s+(\w+)\s*\{([^}]+)\}', schema)
        print(f"  prisma schema: {len(models)} models")

        model_list = "\n".join([f"- {name}" for name, _ in models])
        p = make_pair(
            "What database models does Netcare Health OS use?",
            f"Netcare Health OS has {len(models)} Prisma models:\n\n{model_list}",
            "product:schema"
        )
        if p: pairs.append(p)

        for name, body in models:
            fields = re.findall(r'^\s+(\w+)\s+(\w+)', body, re.MULTILINE)
            field_list = "\n".join([f"  - {fname}: {ftype}" for fname, ftype in fields[:20]])
            p = make_pair(
                f"What fields does the {name} model have?",
                f"The {name} model in Netcare Health OS:\n\n{field_list}",
                f"product:model:{name}"
            )
            if p: pairs.append(p)

    # API routes — scan for route.ts files
    api_dir = os.path.join(NETCARE_DIR, "src/app/api")
    if os.path.exists(api_dir):
        routes = []
        for root, dirs, files in os.walk(api_dir):
            for f in files:
                if f == "route.ts":
                    rel = os.path.relpath(os.path.join(root, f), os.path.join(NETCARE_DIR, "src/app"))
                    route_path = "/" + rel.replace("/route.ts", "").replace("\\", "/")
                    routes.append(route_path)

        print(f"  API routes: {len(routes)} endpoints")

        route_list = "\n".join([f"- {r}" for r in sorted(routes)])
        p = make_pair(
            "What API routes does Netcare Health OS have?",
            f"Netcare Health OS has {len(routes)} API routes:\n\n{route_list[:3500]}",
            "product:routes"
        )
        if p: pairs.append(p)

    # Pages — scan for page.tsx files
    app_dir = os.path.join(NETCARE_DIR, "src/app")
    if os.path.exists(app_dir):
        pages = []
        for root, dirs, files in os.walk(app_dir):
            for f in files:
                if f == "page.tsx":
                    rel = os.path.relpath(os.path.join(root, f), app_dir)
                    page_path = "/" + rel.replace("/page.tsx", "").replace("\\", "/")
                    pages.append(page_path)

        print(f"  Pages: {len(pages)} pages")

    # AI Products
    ai_products = [
        {
            "name": "CareOn Bridge",
            "desc": "HL7v2-to-FHIR real-time translation bridge. Converts legacy hospital ADT/ORM/ORU messages to FHIR R4 resources. Handles 200+ message types. R139M/yr ROI for Netcare by reducing manual data entry and integration costs.",
        },
        {
            "name": "FHIR Hub",
            "desc": "Full FHIR R4 server implementation for SA healthcare. RESTful API for Patient, Encounter, Observation, Condition, MedicationRequest, Procedure resources. CareConnect HIE ready. Versioned resource history, search parameters, and _include support.",
        },
        {
            "name": "Switching Engine",
            "desc": "EDIFACT MEDCLM electronic claims switching integration. Connects to Healthbridge (7,000+ practices), SwitchOn, and MediKredit. Handles claim submission, real-time adjudication responses, reversals, and ERA remittance. Supports 30+ medical schemes.",
        },
        {
            "name": "Healthbridge AI Claims",
            "desc": "13-page claims processing interface with AI autofill. ICD-10-ZA code suggestion, tariff code lookup, modifier selection, PMB checking. Pre-submission validation catches 85% of rejectable errors before they hit the switch.",
        },
        {
            "name": "Claims Rejection Analyzer",
            "desc": "Pre-submission claims validation engine. 1,078 ICD-10-ZA codes mapped to 7 scheme-specific validation profiles. Detects coding errors, unbundling issues, modifier problems, and scheme-specific exclusions. Reduces rejection rate from 30% to <5%.",
        },
        {
            "name": "WhatsApp Router",
            "desc": "WhatsApp Business API integration for patient communication. Appointment reminders, booking confirmations, chronic medication refill prompts, recall campaigns. Template-based messaging with POPIA consent tracking.",
        },
    ]

    for prod in ai_products:
        p = make_pair(
            f"What is {prod['name']} in Netcare Health OS?",
            prod['desc'],
            f"product:ai:{prod['name']}"
        )
        if p: pairs.append(p)

    p = make_pair(
        "What are the 6 AI products in Netcare Health OS?",
        "\n\n".join([f"**{prod['name']}**: {prod['desc']}" for prod in ai_products]),
        "product:ai:all"
    )
    if p: pairs.append(p)

    return pairs


# ═══════════════════════════════════════════════════════════════════════════════
# 6. CROSS-DOMAIN Q&A — Questions that need knowledge from multiple sources
# ═══════════════════════════════════════════════════════════════════════════════

def generate_cross_domain_qa() -> list[dict]:
    """Generate Q&A that tests cross-domain understanding."""
    pairs = []

    cross_qa = [
        (
            "A GP submits a claim with ICD-10 code J06.9 (acute upper respiratory infection) and tariff code 0190 (consultation). Discovery rejects it. Why?",
            "Several possible reasons:\n\n1. **Missing modifier**: Code 0190 requires a modifier indicating time spent (0001=short, 0002=medium, 0003=long). Without it, the claim is auto-rejected.\n\n2. **Benefit limit reached**: The patient may have exhausted their day-to-day benefit for GP visits. J06.9 is not a PMB condition, so there's no override.\n\n3. **Duplicate claim**: If the same provider billed 0190 for this patient on the same date, it triggers duplicate detection.\n\n4. **ICD-10 specificity**: Some schemes want more specific coding — J06.0 (acute laryngopharyngitis) rather than the unspecified .9.\n\n5. **Network restriction**: Patient may be on a KeyCare or similar network plan and visited an out-of-network GP.\n\nResolution: Check the rejection code on the ERA. Most commonly this is a modifier issue — add the appropriate time modifier and resubmit."
        ),
        (
            "Is our claims validation AI classified as a medical device under SAHPRA?",
            "Generally NO — if the AI only performs administrative functions like:\n- Validating ICD-10 codes against scheme rules\n- Checking tariff/modifier combinations\n- Flagging missing fields\n- Estimating reimbursement amounts\n\nThis is administrative/billing software, NOT Software as a Medical Device (SaMD).\n\nHowever, it WOULD be SaMD if the AI:\n- Suggests clinical diagnoses based on symptoms\n- Recommends treatment changes\n- Makes clinical decisions that affect patient care\n- Interprets diagnostic images or lab results\n\nOur Claims Rejection Analyzer validates claims data for billing accuracy — it does not make clinical decisions. So it falls outside SAHPRA SaMD regulation. But we must be careful with the triage agent in HealthOps, which DOES suggest clinical priorities — that could trigger SaMD classification.\n\nRef: SAHPRA AI/ML Medical Device Guidance, IMDRF SaMD Framework (Risk Level I-IV)."
        ),
        (
            "A patient with diabetes (CDL condition) needs insulin. What are the scheme's legal obligations?",
            "Under the Medical Schemes Act and CDL regulations:\n\n1. **Must cover**: Diabetes mellitus (Types 1 and 2) is CDL condition #4. The scheme MUST provide treatment as specified in the CDL treatment algorithms.\n\n2. **No benefit limit**: CDL treatment cannot be subject to annual limits. The scheme cannot refuse based on 'benefit exhausted'.\n\n3. **Formulary**: The scheme must cover at least one medicine per therapeutic class. If their formulary insulin doesn't suit the patient, they must have a clinical motivation process for alternatives.\n\n4. **DSP rules**: At a Designated Service Provider, the scheme must pay in full. Out-of-DSP, they may apply co-payments but must still provide the benefit.\n\n5. **ICD-10 codes**: E10.x (Type 1), E11.x (Type 2), E13.x (Other specified), E14.x (Unspecified). Must be coded correctly on every claim.\n\n6. **NAPPI**: Insulin products have specific NAPPI codes. The dispensing fee is regulated under the SEP dispensing fee schedule.\n\n7. **POPIA**: The diabetes diagnosis is special personal information under POPIA. Processing requires explicit consent."
        ),
        (
            "How would you build a FHIR-based chronic medication management system for SA?",
            "Architecture for SA-specific FHIR chronic medication management:\n\n**FHIR Resources needed:**\n- Patient (demographics, medical aid details)\n- Condition (CDL conditions with ICD-10-ZA codes)\n- MedicationRequest (prescriptions with NAPPI codes)\n- MedicationDispense (dispensing records)\n- Coverage (medical scheme plan details)\n- Claim (for switch submission)\n\n**CDL Integration:**\n- Map all 27 CDL conditions to FHIR Condition resources\n- Link to approved treatment algorithms via PlanDefinition\n- Track chronic authorization numbers per scheme\n\n**NAPPI → FHIR Mapping:**\n- Medication.code uses NAPPI codes (7-digit product + 3-digit pack)\n- MedicationRequest.dispenseRequest for refill quantities\n- MedicationDispense tracks actual dispensing with SEP pricing\n\n**Switching Integration:**\n- FHIR Claim maps to EDIFACT MEDCLM segments\n- real-time adjudication via Task resource (async workflow)\n- ERA response maps back to ClaimResponse\n\n**POPIA Compliance:**\n- Consent resources for data processing\n- AuditEvent for all access logging\n- Provenance for data lineage\n\n**Scheme-specific rules:**\n- Each scheme's formulary as a List/ValueSet\n- Authorization requirements as ServiceRequest\n- Co-payment rules in Coverage.costToBeneficiary"
        ),
        (
            "What POPIA obligations apply when our AI processes a patient's claim data?",
            "Under POPIA 2026 (with health regulations now in force, NO grace period):\n\n**1. Lawful basis (s11):**\n- Claims processing: legitimate interest or contractual necessity\n- AI analysis: may need consent if going beyond the original purpose\n\n**2. Special personal information (s26-33):**\n- Health data IS special personal information\n- Processing requires EXPLICIT consent, or falls under s27 exemptions (medical professional, insurance law compliance)\n\n**3. Specific obligations:**\n- Data minimisation: only process data needed for the claim\n- Purpose limitation: claims validation ≠ marketing ≠ research\n- Storage limitation: retain only as long as legally required (Medical Schemes Act = 5 years)\n- Security safeguards: encryption at rest + in transit, access controls\n\n**4. Cross-border (s72):**\n- If AI processes on overseas servers (e.g., Vercel US region), need s72 compliance\n- Adequate level of protection OR binding corporate rules OR consent\n- SA health data should ideally stay in-country or in adequate jurisdictions\n\n**5. Automated decision-making (s71):**\n- If AI auto-rejects claims, patients have the right to challenge\n- Must have human review mechanism\n\n**6. Data breach (s22):**\n- 72-hour notification to Information Regulator\n- Notify affected patients if risk to rights\n\n**Our implementation:**\n- ConsentRecord model tracks all consent types\n- AuditLog model records all data access\n- All API routes enforce role-based access\n- Patient data processed in Supabase (EU-West-1 region)"
        ),
    ]

    for q, a in cross_qa:
        p = make_pair(q, a, "cross_domain")
        if p: pairs.append(p)

    return pairs


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    all_pairs = []

    print("=" * 70)
    print("DEEP HEALTH SECTOR TRAINING DATA GENERATOR")
    print("=" * 70)

    print("\n[1/6] Extracting compiled knowledge chapters...")
    all_pairs.extend(extract_knowledge_chapters())

    print(f"\n[2/6] Extracting full legislation & specs...")
    all_pairs.extend(extract_all_legislation())

    print(f"\n[3/6] Extracting database CSVs...")
    all_pairs.extend(extract_database_csvs())

    print(f"\n[4/6] Extracting product architecture...")
    all_pairs.extend(extract_product_architecture())

    print(f"\n[5/6] Generating cross-domain Q&A...")
    all_pairs.extend(generate_cross_domain_qa())

    print(f"\n[6/6] Writing output files...")

    # Shuffle
    random.seed(42)
    random.shuffle(all_pairs)

    # Split: 90% train, 5% valid, 5% test
    n = len(all_pairs)
    train_end = int(n * 0.90)
    valid_end = int(n * 0.95)

    splits = {
        "train.jsonl": all_pairs[:train_end],
        "valid.jsonl": all_pairs[train_end:valid_end],
        "test.jsonl": all_pairs[valid_end:],
    }

    for fname, data in splits.items():
        fpath = os.path.join(OUTPUT_DIR, fname)
        with open(fpath, "w") as f:
            for item in data:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")
        print(f"  {fname}: {len(data):,} examples")

    print(f"\n{'=' * 70}")
    print(f"TOTAL: {n:,} deep health training examples generated")
    print(f"Output: {OUTPUT_DIR}")
    print(f"\nBreakdown by source:")
    for src, count in sorted(stats.items(), key=lambda x: -x[1]):
        print(f"  {src}: {count:,}")
    print(f"{'=' * 70}")

    # Also create a combined dataset (merge with existing)
    existing_train = os.path.join(NETCARE_DIR, "ml/training-data/train.jsonl")
    if os.path.exists(existing_train):
        existing_count = sum(1 for _ in open(existing_train))
        print(f"\nExisting training data: {existing_count:,} examples")
        print(f"Deep health additions:  {len(splits['train.jsonl']):,} examples")
        print(f"Combined total would be: {existing_count + len(splits['train.jsonl']):,} examples")
        print(f"\nTo merge, run:")
        print(f"  cat {existing_train} {os.path.join(OUTPUT_DIR, 'train.jsonl')} > {os.path.join(NETCARE_DIR, 'ml/training-data/combined/train.jsonl')}")


if __name__ == "__main__":
    main()
