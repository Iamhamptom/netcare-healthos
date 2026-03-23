#!/usr/bin/env python3
"""
HealthOS-Med v2 — Mega Training Data Generator
================================================
Generates 400K+ training examples from existing raw data sources.
No external API calls — 100% local data transformation.

Modules:
  1. ICD-10 exhaustive (41K codes × 4 Q types = ~160K)
  2. Medicine prices (10K × 4 = ~40K)
  3. GEMS tariffs (4.6K × 3 = ~14K)
  4. Multi-turn claim scenarios (~50K)
  5. Cross-scheme comparisons (~15K)
  6. CDL/PMB deep (~8K)
  7. Rejection scenario variations (~5K)
  8. Legal/regulatory expansion (~20K)
  9. Knowledge MD exhaustive (~30K)

Output: ml/training-data/mega/{train,valid,test}.jsonl
"""

from __future__ import annotations

import json
import os
import re
import csv
import io
import hashlib
import random
from typing import Optional, List, Dict, Any
from datetime import datetime

HOME = os.path.expanduser("~")
NETCARE_DIR = os.path.join(HOME, "netcare-healthos")
DB_DIR = os.path.join(NETCARE_DIR, "docs/knowledge/databases")
KB_DIR = os.path.join(NETCARE_DIR, "docs/knowledge")
EXTRACTED_DIR = os.path.join(KB_DIR, "extracted")
OUTPUT_DIR = os.path.join(NETCARE_DIR, "ml/training-data/mega")

os.makedirs(OUTPUT_DIR, exist_ok=True)

SYSTEM_PROMPT = """You are HealthOS-Med, a South African healthcare AI expert. You have authoritative knowledge of:
- ICD-10-ZA (WHO variant, 41,009 codes) — NOT US ICD-10-CM
- CCSA tariff codes (4-digit SA codes) — NOT US CPT codes
- NAPPI pharmaceutical codes (7-digit product + 3-digit pack)
- GEMS = Government Employees Medical Scheme (rates for 2026)
- All 6 major SA medical scheme profiles and their specific rules
- 270 PMB DTP conditions and 27 CDL chronic conditions
- Medical Schemes Act 131 of 1998 (full text)
- POPIA 2026 health data compliance
- SAHPRA SaMD regulations and HPCSA AI ethics rules
- Claims adjudication, rejection patterns, and fraud detection
- FHIR R4 for SA healthcare and HL7v2 message parsing
Always respond with accurate, SA-specific information. Never guess — if unsure, say so."""

# Benchmark holdout — these codes are EXCLUDED from training
random.seed(42)
HOLDOUT_ICD10 = set()
HOLDOUT_MEDICINES = set()
HOLDOUT_TARIFFS = set()

seen_hashes = set()
stats = {}


def make_pair(user_msg: str, assistant_msg: str, source: str = "") -> Optional[dict]:
    """Create a deduplicated training pair."""
    if not user_msg.strip() or not assistant_msg.strip():
        return None
    h = hashlib.md5((user_msg + assistant_msg).encode()).hexdigest()
    if h in seen_hashes:
        return None
    seen_hashes.add(h)
    key = source.split(":")[0]
    stats[key] = stats.get(key, 0) + 1
    return {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg.strip()},
            {"role": "assistant", "content": assistant_msg.strip()},
        ]
    }


# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 1: ICD-10 Exhaustive (~160K)
# ═══════════════════════════════════════════════════════════════════════════════

def generate_icd10_exhaustive() -> List[dict]:
    pairs = []
    path = os.path.join(DB_DIR, "ICD-10_MIT_2021.csv")
    if not os.path.exists(path):
        print("  SKIP: ICD-10 CSV not found")
        return pairs

    with open(path, encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    # Select 500 random codes for benchmark holdout
    all_codes = [r.get("ICD10_Code", "").strip() for r in rows if r.get("ICD10_Code", "").strip()]
    HOLDOUT_ICD10.update(random.sample(all_codes, min(500, len(all_codes))))

    print(f"  ICD-10: {len(rows)} rows, {len(HOLDOUT_ICD10)} held out for benchmark")

    for row in rows:
        code = row.get("ICD10_Code", "").strip()
        if not code or code in HOLDOUT_ICD10:
            continue

        desc = row.get("WHO_Full_Desc", "").strip()
        chapter = row.get("Chapter_Desc", "").strip()
        chapter_no = row.get("Chapter_No", "").strip()
        group = row.get("Group_Desc", "").strip()
        valid_primary = row.get("Valid_ICD10_Primary", "").strip()
        is_asterisk = row.get("Valid_ICD10_Asterisk", "").strip()
        is_dagger = row.get("Valid_ICD10_Dagger", "").strip()
        gender = row.get("Gender", "").strip()
        age_range = row.get("Age_Range", "").strip()
        is_sequela = row.get("Valid_ICD10_Sequelae", "").strip()
        code3 = row.get("ICD10_3_Code", "").strip()
        code3_desc = row.get("ICD10_3_Code_Desc", "").strip()

        if not desc or len(desc) < 3:
            continue

        # Type 1: Lookup
        answer_parts = [f"ICD-10-ZA code {code}: {desc}"]
        if chapter:
            answer_parts.append(f"Chapter: {chapter_no} — {chapter}")
        if group:
            answer_parts.append(f"Group: {group}")
        if valid_primary:
            answer_parts.append(f"Valid as primary diagnosis: {'Yes' if valid_primary.upper() in ('Y', 'YES', '1', 'TRUE') else 'No'}")
        if gender:
            answer_parts.append(f"Gender restriction: {gender}")
        if age_range:
            answer_parts.append(f"Age range: {age_range}")

        p = make_pair(f"What is ICD-10-ZA code {code}?", "\n".join(answer_parts), f"icd10:lookup")
        if p:
            pairs.append(p)

        # Type 2: Validation
        if valid_primary:
            is_valid = valid_primary.upper() in ("Y", "YES", "1", "TRUE")
            reason = ""
            if not is_valid:
                if is_asterisk and is_asterisk.upper() in ("Y", "YES", "1", "TRUE"):
                    reason = " It is an asterisk (manifestation) code and must be paired with a dagger (etiology) code."
                elif code.startswith(("V", "W", "X", "Y")):
                    reason = " It is an external cause code (V/W/X/Y) which cannot be used as a primary diagnosis."
                else:
                    reason = " This code lacks the specificity required for primary diagnosis use."

            p = make_pair(
                f"Can ICD-10 code {code} ({desc}) be used as a primary diagnosis?",
                f"{'Yes' if is_valid else 'No'}, {code} {'can' if is_valid else 'cannot'} be used as a primary diagnosis code in SA.{reason}",
                f"icd10:validation"
            )
            if p:
                pairs.append(p)

        # Type 3: Reverse lookup
        if len(desc) > 10:
            p = make_pair(
                f"What is the ICD-10-ZA code for {desc.lower()}?",
                f"The ICD-10-ZA code for {desc.lower()} is {code}.",
                f"icd10:reverse"
            )
            if p:
                pairs.append(p)

        # Type 4: Clinical context (gender/age)
        if gender and gender.upper() in ("M", "F", "MALE", "FEMALE"):
            opposite = "female" if gender.upper() in ("M", "MALE") else "male"
            correct = "male" if gender.upper() in ("M", "MALE") else "female"
            p = make_pair(
                f"Is ICD-10 code {code} valid for a {opposite} patient?",
                f"No. {code} ({desc}) is restricted to {correct} patients only. Using this code for a {opposite} patient will result in a gender mismatch rejection.",
                f"icd10:gender"
            )
            if p:
                pairs.append(p)

        # Type 5: Asterisk/dagger
        if is_asterisk and is_asterisk.upper() in ("Y", "YES", "1", "TRUE"):
            p = make_pair(
                f"Does ICD-10 code {code} require a paired code?",
                f"Yes. {code} ({desc}) is an asterisk (*) code — it represents a manifestation and must be paired with a dagger (†) code that identifies the underlying etiology. The asterisk code cannot be used as the primary diagnosis alone.",
                f"icd10:asterisk"
            )
            if p:
                pairs.append(p)

        if is_dagger and is_dagger.upper() in ("Y", "YES", "1", "TRUE"):
            p = make_pair(
                f"Is {code} a dagger code?",
                f"Yes. {code} ({desc}) is a dagger (†) code — it identifies the underlying etiology/cause. It should be used as the primary diagnosis and may be paired with an asterisk (*) code showing the manifestation.",
                f"icd10:dagger"
            )
            if p:
                pairs.append(p)

    return pairs


# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 2: Medicine Prices (~40K)
# ═══════════════════════════════════════════════════════════════════════════════

def generate_medicine_prices() -> List[dict]:
    pairs = []
    path = os.path.join(DB_DIR, "medicine_prices.csv")
    if not os.path.exists(path):
        print("  SKIP: medicine_prices.csv not found")
        return pairs

    with open(path, encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    all_nappi = [r.get("nappi_code", "").strip() for r in rows if r.get("nappi_code", "").strip()]
    HOLDOUT_MEDICINES.update(random.sample(all_nappi, min(200, len(all_nappi))))

    print(f"  Medicines: {len(rows)} rows, {len(HOLDOUT_MEDICINES)} held out")

    schedule_explanations = {
        "S0": "Schedule 0 — available without prescription (OTC)",
        "S1": "Schedule 1 — pharmacist-initiated therapy",
        "S2": "Schedule 2 — pharmacy medicine, pharmacist must be present",
        "S3": "Schedule 3 — prescription medicine (doctor/dentist/nurse)",
        "S4": "Schedule 4 — prescription only, dispensed by pharmacist",
        "S5": "Schedule 5 — controlled substance, strict record-keeping",
        "S6": "Schedule 6 — controlled substance, special storage",
        "S7": "Schedule 7 — prohibited substance (research only)",
        "S8": "Schedule 8 — prohibited substance",
    }

    for row in rows:
        nappi = row.get("nappi_code", "").strip()
        name = row.get("name", "").strip()
        schedule = row.get("schedule", "").strip()
        form = row.get("dosage_form", "").strip()
        pack = row.get("pack_size", "").strip()
        sep = row.get("sep", "").strip()
        disp_fee = row.get("dispensing_fee", "").strip()
        is_generic = row.get("is_generic", "").strip()
        regno = row.get("regno", "").strip()

        if not nappi or nappi in HOLDOUT_MEDICINES or not name:
            continue

        # Type 1: NAPPI lookup
        answer = f"NAPPI {nappi}: {name}"
        if schedule:
            answer += f", Schedule {schedule}"
        if form:
            answer += f", {form}"
        if pack:
            answer += f", pack of {pack}"
        if sep:
            answer += f". Single Exit Price (SEP): R{sep}"
        if disp_fee:
            answer += f". Dispensing fee: R{disp_fee}"
        if is_generic and is_generic.upper() in ("Y", "YES", "1", "TRUE"):
            answer += ". This is a generic medicine."
        if regno:
            answer += f" Registration: {regno}."

        p = make_pair(f"What medicine has NAPPI code {nappi}?", answer, "medicine:nappi")
        if p:
            pairs.append(p)

        # Type 2: Price query
        if sep:
            price_answer = f"The Single Exit Price (SEP) for {name} is R{sep}"
            if pack:
                price_answer += f" for a pack of {pack}"
            if disp_fee:
                price_answer += f". The dispensing fee is R{disp_fee}"
            price_answer += "."

            p = make_pair(f"What is the price of {name}?", price_answer, "medicine:price")
            if p:
                pairs.append(p)

        # Type 3: Generic check
        if is_generic:
            gen_flag = is_generic.upper() in ("Y", "YES", "1", "TRUE")
            p = make_pair(
                f"Is {name} a generic medicine?",
                f"{'Yes' if gen_flag else 'No'}, {name} is {'a generic' if gen_flag else 'not a generic (originator/branded)'} medicine. NAPPI code: {nappi}.",
                "medicine:generic"
            )
            if p:
                pairs.append(p)

        # Type 4: Schedule
        if schedule:
            sched_key = f"S{schedule}" if not schedule.startswith("S") else schedule
            explanation = schedule_explanations.get(sched_key, f"Schedule {schedule}")
            p = make_pair(
                f"What schedule is {name}?",
                f"{name} is {explanation}. NAPPI: {nappi}.",
                "medicine:schedule"
            )
            if p:
                pairs.append(p)

    return pairs


# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 3: GEMS Tariffs (~14K)
# ═══════════════════════════════════════════════════════════════════════════════

def generate_gems_tariffs() -> List[dict]:
    pairs = []
    path = os.path.join(DB_DIR, "GEMS_tariffs_2026.csv")
    if not os.path.exists(path):
        print("  SKIP: GEMS tariffs not found")
        return pairs

    with open(path, encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()

    # Parse discipline names from row 1
    disciplines = ["014 - General Medical Practice", "016 - Obstetrics and Gynaecology", "032 - Paediatricians"]

    tariffs = []
    for line in lines[3:]:
        try:
            reader = csv.reader([line.strip()])
            for parts in reader:
                if len(parts) >= 2 and parts[0].strip().isdigit():
                    code = parts[0].strip()
                    desc = parts[1].strip()
                    rates = {}
                    disc_idx = 0
                    for col in range(2, len(parts), 2):
                        if col < len(parts) and parts[col].strip():
                            try:
                                rate = float(parts[col].strip())
                                disc_name = disciplines[disc_idx] if disc_idx < len(disciplines) else f"discipline_{disc_idx}"
                                rates[disc_name] = rate
                            except ValueError:
                                pass
                        disc_idx += 1
                    tariffs.append({"code": code, "description": desc, "rates": rates})
        except Exception:
            continue

    holdout_codes = [t["code"] for t in tariffs]
    HOLDOUT_TARIFFS.update(random.sample(holdout_codes, min(100, len(holdout_codes))))

    print(f"  GEMS tariffs: {len(tariffs)} codes, {len(HOLDOUT_TARIFFS)} held out")

    for t in tariffs:
        if t["code"] in HOLDOUT_TARIFFS:
            continue

        code = t["code"]
        desc = t["description"][:300]
        rates = t["rates"]

        # Type 1: Lookup
        answer = f"CCSA tariff code {code}: {desc}"
        if rates:
            rate_parts = [f"{disc}: R{rate:.2f}" for disc, rate in rates.items()]
            answer += f"\n\nGEMS 2026 rates:\n" + "\n".join(f"- {r}" for r in rate_parts)

        p = make_pair(f"What is SA tariff code {code}?", answer, "tariff:lookup")
        if p:
            pairs.append(p)

        # Type 2: Rate query
        if rates:
            gp_rate = rates.get("014 - General Medical Practice")
            if gp_rate:
                p = make_pair(
                    f"What does GEMS pay for tariff code {code} (GP) in 2026?",
                    f"GEMS pays R{gp_rate:.2f} for tariff code {code} ({desc[:100]}) for General Medical Practice (discipline 014) in 2026.",
                    "tariff:rate"
                )
                if p:
                    pairs.append(p)

        # Type 3: Discipline
        if rates:
            disc_list = ", ".join(rates.keys())
            p = make_pair(
                f"Which disciplines can bill tariff code {code}?",
                f"Tariff code {code} ({desc[:80]}) has GEMS 2026 rates for: {disc_list}.",
                "tariff:discipline"
            )
            if p:
                pairs.append(p)

    return pairs


# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 4: Multi-Turn Claim Scenarios (~50K)
# ═══════════════════════════════════════════════════════════════════════════════

def generate_claim_scenarios() -> List[dict]:
    pairs = []

    # Load ICD-10 codes (common primary care)
    icd_path = os.path.join(DB_DIR, "ICD-10_MIT_2021.csv")
    if not os.path.exists(icd_path):
        return pairs

    common_codes = []
    with open(icd_path, encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        for row in reader:
            code = row.get("ICD10_Code", "").strip()
            desc = row.get("WHO_Full_Desc", "").strip()
            valid = row.get("Valid_ICD10_Primary", "").strip()
            if code and desc and valid and valid.upper() in ("Y", "YES", "1", "TRUE"):
                common_codes.append({"code": code, "description": desc})

    # Load rejection codes
    rejections = []
    rej_path = os.path.join(DB_DIR, "rejection_codes.csv")
    if os.path.exists(rej_path):
        with open(rej_path, encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rejections.append(row)

    # Load CDL conditions
    cdl = []
    cdl_path = os.path.join(DB_DIR, "cdl_conditions.csv")
    if os.path.exists(cdl_path):
        with open(cdl_path, encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cdl.append(row)

    schemes = [
        {"name": "Discovery Health", "code": "DH", "acceptance": "87.2%", "window": "120 days"},
        {"name": "GEMS", "code": "GEMS", "acceptance": "89.5%", "window": "120 days"},
        {"name": "Bonitas", "code": "BON", "acceptance": "85.8%", "window": "90 days"},
        {"name": "Momentum Health", "code": "MOM", "acceptance": "86.1%", "window": "120 days"},
        {"name": "Medshield", "code": "MS", "acceptance": "84.3%", "window": "90 days"},
        {"name": "Bestmed", "code": "BM", "acceptance": "88.7%", "window": "120 days"},
        {"name": "Medihelp", "code": "MH", "acceptance": "87.9%", "window": "120 days"},
    ]

    tariff_codes = [
        {"code": "0190", "desc": "GP consultation (average)"},
        {"code": "0191", "desc": "GP consultation (extended)"},
        {"code": "0192", "desc": "GP consultation (complex)"},
        {"code": "0017", "desc": "Injection/vaccination"},
        {"code": "3614", "desc": "Full blood count"},
        {"code": "3710", "desc": "Glucose blood test"},
        {"code": "3744", "desc": "Lipogram"},
        {"code": "4101", "desc": "Chest X-ray"},
        {"code": "0131", "desc": "Follow-up injection"},
    ]

    genders = ["Male", "Female"]
    ages = list(range(5, 85, 5))

    print(f"  Claim scenarios: {len(common_codes)} valid ICD-10 codes, {len(rejections)} rejection codes")

    # Generate 10K scenarios
    for i in range(10000):
        icd = random.choice(common_codes)
        scheme = random.choice(schemes)
        tariff = random.choice(tariff_codes)
        gender = random.choice(genders)
        age = random.choice(ages)

        # Scenario: Submit claim
        user_q = f"I need to submit a claim to {scheme['name']} for a {gender.lower()} patient aged {age}. Diagnosis: {icd['description']} ({icd['code']}), procedure: {tariff['desc']} (tariff {tariff['code']})."

        assistant_a = f"For {scheme['name']}, submitting claim with ICD-10 {icd['code']} ({icd['description']}) and tariff {tariff['code']} ({tariff['desc']}):\n\n"
        assistant_a += f"1. Submission window: {scheme['window']} from date of service\n"
        assistant_a += f"2. {scheme['name']} acceptance rate: {scheme['acceptance']}\n"
        assistant_a += f"3. Ensure ICD-10 code has maximum specificity (4th character required where applicable)\n"
        assistant_a += f"4. Patient demographics: {gender}, age {age} — verify no gender/age restriction on {icd['code']}\n"

        # Check if it's a CDL condition
        for c in cdl:
            primary_icd = c.get("primary_icd10", c.get("Primary_ICD10", ""))
            if primary_icd and icd["code"].startswith(primary_icd[:3]):
                condition_name = c.get("condition", c.get("Condition", ""))
                assistant_a += f"5. NOTE: This may qualify as CDL condition ({condition_name}). CDL claims have extended benefits and cannot be limited by annual benefit caps.\n"
                break

        p = make_pair(user_q, assistant_a, f"scenario:submit:{i}")
        if p:
            pairs.append(p)

        # Follow-up: rejection scenario (50% of claims)
        if i % 2 == 0 and rejections:
            rej = random.choice(rejections)
            rej_code = rej.get("code", rej.get("Code", ""))
            rej_desc = rej.get("description", rej.get("Description", ""))
            rej_cause = rej.get("common_cause", rej.get("Common_Cause", ""))
            rej_fix = rej.get("fix_suggestion", rej.get("Fix_Suggestion", ""))

            user_q2 = f"The claim was rejected by {scheme['name']} with rejection code {rej_code}. What went wrong?"
            assistant_a2 = f"Rejection code {rej_code}: {rej_desc}\n\n"
            if rej_cause:
                assistant_a2 += f"Most likely cause: {rej_cause}\n\n"
            if rej_fix:
                assistant_a2 += f"How to fix: {rej_fix}\n\n"
            assistant_a2 += f"For {scheme['name']} specifically, ensure you resubmit within {scheme['window']} of the original service date."

            p = make_pair(user_q2, assistant_a2, f"scenario:reject:{i}")
            if p:
                pairs.append(p)

        # Follow-up: correction guidance (25% of claims)
        if i % 4 == 0:
            user_q3 = f"How do I correct and resubmit the claim for {icd['code']} to {scheme['name']}?"
            assistant_a3 = f"To correct and resubmit to {scheme['name']}:\n\n"
            assistant_a3 += f"1. Verify ICD-10 code {icd['code']} has maximum specificity\n"
            assistant_a3 += f"2. Check modifier codes are appropriate for {tariff['desc']}\n"
            assistant_a3 += f"3. Confirm patient demographics match scheme records\n"
            assistant_a3 += f"4. Resubmit via {scheme['name']}'s electronic portal within {scheme['window']}\n"
            assistant_a3 += f"5. If rejected again, initiate dispute process as per Medical Schemes Act Section 47"

            p = make_pair(user_q3, assistant_a3, f"scenario:correct:{i}")
            if p:
                pairs.append(p)

    return pairs


# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 5: Cross-Scheme Comparisons (~15K)
# ═══════════════════════════════════════════════════════════════════════════════

def generate_cross_scheme() -> List[dict]:
    pairs = []

    schemes = {
        "Discovery Health": {"acceptance": "87.2%", "clean_claim": "72.1%", "window": "120 days", "top_rejection": "insufficient ICD-10 specificity (18.2%)", "gp_rate": "scheme tariff", "pmb": "strict DSP enforcement"},
        "GEMS": {"acceptance": "89.5%", "clean_claim": "78.3%", "window": "120 days", "top_rejection": "missing modifier (15.8%)", "gp_rate": "GEMS tariff (gazetted)", "pmb": "100% GEMS tariff at DSP"},
        "Bonitas": {"acceptance": "85.8%", "clean_claim": "69.4%", "window": "90 days", "top_rejection": "benefit exhausted (16.1%)", "gp_rate": "scheme tariff", "pmb": "strict DSP, formulary"},
        "Momentum": {"acceptance": "86.1%", "clean_claim": "71.2%", "window": "120 days", "top_rejection": "no pre-authorization (14.9%)", "gp_rate": "scheme tariff", "pmb": "DSP with co-pay options"},
        "Medshield": {"acceptance": "84.3%", "clean_claim": "67.8%", "window": "90 days", "top_rejection": "claim window expired (17.3%)", "gp_rate": "scheme tariff", "pmb": "strict, limited network"},
        "Bestmed": {"acceptance": "88.7%", "clean_claim": "75.1%", "window": "120 days", "top_rejection": "coding error (13.2%)", "gp_rate": "scheme tariff", "pmb": "flexible DSP"},
        "Medihelp": {"acceptance": "87.9%", "clean_claim": "74.6%", "window": "120 days", "top_rejection": "missing documentation (14.1%)", "gp_rate": "scheme tariff", "pmb": "DSP with motivation"},
    }

    scheme_names = list(schemes.keys())

    topics = [
        ("acceptance rates", lambda s: f"Acceptance rate: {s['acceptance']}, clean claim rate: {s['clean_claim']}"),
        ("claim submission windows", lambda s: f"Submission window: {s['window']}"),
        ("top rejection reasons", lambda s: f"Top rejection: {s['top_rejection']}"),
        ("GP consultation rates", lambda s: f"GP rate basis: {s['gp_rate']}"),
        ("PMB payment policies", lambda s: f"PMB policy: {s['pmb']}"),
    ]

    for i in range(len(scheme_names)):
        for j in range(i + 1, len(scheme_names)):
            s1_name = scheme_names[i]
            s2_name = scheme_names[j]
            s1 = schemes[s1_name]
            s2 = schemes[s2_name]

            for topic_name, formatter in topics:
                user_q = f"Compare {s1_name} and {s2_name} on {topic_name}."
                answer = f"{s1_name}: {formatter(s1)}\n{s2_name}: {formatter(s2)}"

                p = make_pair(user_q, answer, f"cross_scheme:{s1_name[:3]}_{s2_name[:3]}")
                if p:
                    pairs.append(p)

    # Scheme-specific questions
    for name, profile in schemes.items():
        for topic_name, formatter in topics:
            p = make_pair(
                f"What is {name}'s policy on {topic_name}?",
                f"{name}: {formatter(profile)}",
                f"scheme:{name[:3]}"
            )
            if p:
                pairs.append(p)

    return pairs


# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 6: CDL/PMB Deep (~8K)
# ═══════════════════════════════════════════════════════════════════════════════

def generate_cdl_pmb() -> List[dict]:
    pairs = []

    cdl_path = os.path.join(DB_DIR, "cdl_conditions.csv")
    if not os.path.exists(cdl_path):
        return pairs

    with open(cdl_path, encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        cdl_rows = list(reader)

    print(f"  CDL/PMB: {len(cdl_rows)} conditions")

    schemes = ["Discovery Health", "GEMS", "Bonitas", "Momentum", "Medshield", "Bestmed", "Medihelp"]

    for row in cdl_rows:
        condition = row.get("condition", row.get("Condition", "")).strip()
        icd10 = row.get("primary_icd10", row.get("Primary_ICD10", row.get("icd10", ""))).strip()
        extended = row.get("extended_codes", row.get("Extended_Codes", "")).strip()
        meds = row.get("key_medications", row.get("Key_Medications", "")).strip()
        monitoring = row.get("monitoring", row.get("Monitoring", "")).strip()
        number = row.get("number", row.get("Number", "")).strip()

        if not condition:
            continue

        # Basic CDL lookup
        answer = f"CDL Condition {number}: {condition}\n"
        if icd10:
            answer += f"Primary ICD-10 code(s): {icd10}\n"
        if extended:
            answer += f"Extended codes: {extended}\n"
        if meds:
            answer += f"Key medications: {meds}\n"
        if monitoring:
            answer += f"Monitoring: {monitoring}\n"
        answer += "\nAs a CDL condition, medical schemes must provide treatment as per the CDL treatment algorithms. Benefits cannot be subject to annual limits. At a Designated Service Provider (DSP), the scheme must pay in full."

        p = make_pair(f"Is {condition} on the Chronic Disease List (CDL)?", answer, "cdl:lookup")
        if p:
            pairs.append(p)

        p = make_pair(f"What ICD-10 codes cover {condition} under the CDL?", answer, "cdl:codes")
        if p:
            pairs.append(p)

        if meds:
            p = make_pair(f"What medications are covered for {condition} under the CDL?", f"For CDL condition {condition}, the key medications covered are: {meds}\n\nSchemes must cover at least one medicine per therapeutic class as per their formulary. If the formulary medicine is unsuitable, a clinical motivation process exists for alternatives.", "cdl:meds")
            if p:
                pairs.append(p)

        # Per-scheme coverage
        for scheme in schemes:
            p = make_pair(
                f"How does {scheme} handle CDL claims for {condition}?",
                f"{scheme} must cover {condition} as a CDL condition (Medical Schemes Act, Annexure A). Primary ICD-10: {icd10}. Treatment must follow CDL treatment algorithms. Benefits cannot be capped annually. At DSP, {scheme} pays in full. Non-DSP: co-payments may apply but the benefit must still be provided.",
                f"cdl:scheme:{scheme[:3]}"
            )
            if p:
                pairs.append(p)

        # PMB override scenarios
        p = make_pair(
            f"A patient's benefits are exhausted but they have {condition}. Can the scheme refuse treatment?",
            f"No. {condition} is CDL condition {number}. Under the Medical Schemes Act, CDL conditions are Prescribed Minimum Benefits. The scheme MUST provide treatment regardless of whether day-to-day benefits are exhausted. The scheme cannot apply annual limits to CDL treatment. If the scheme refuses, the patient can lodge a complaint with the Council for Medical Schemes (CMS).",
            f"cdl:override"
        )
        if p:
            pairs.append(p)

    # Non-CDL conditions (negative examples)
    non_cdl = ["Migraine", "Lower back pain", "Common cold", "Sprained ankle", "Tonsillitis",
               "Sinusitis", "Conjunctivitis", "Gastroenteritis", "Urinary tract infection",
               "Acne", "Eczema", "Insomnia", "Anxiety disorder", "Hay fever", "Dental caries"]

    for condition in non_cdl:
        p = make_pair(
            f"Is {condition} on the Chronic Disease List (CDL)?",
            f"No, {condition} is NOT on the CDL. There are only 27 conditions on the CDL. However, it may still qualify as a PMB DTP (Prescribed Minimum Benefit Diagnosis Treatment Pair) if it meets the criteria for one of the 270 PMB conditions. Check the PMB regulations for the specific DTP list.",
            "cdl:negative"
        )
        if p:
            pairs.append(p)

    return pairs


# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 7: Rejection Scenario Variations (~5K)
# ═══════════════════════════════════════════════════════════════════════════════

def generate_rejection_scenarios() -> List[dict]:
    pairs = []

    rej_path = os.path.join(DB_DIR, "rejection_codes.csv")
    if not os.path.exists(rej_path):
        return pairs

    with open(rej_path, encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        rejections = list(reader)

    print(f"  Rejection scenarios: {len(rejections)} base codes")

    specialties = ["GP", "paediatrician", "gynaecologist", "orthopaedic surgeon", "dermatologist",
                   "cardiologist", "ENT specialist", "ophthalmologist", "psychiatrist", "urologist"]

    for rej in rejections:
        code = rej.get("code", rej.get("Code", "")).strip()
        desc = rej.get("description", rej.get("Description", "")).strip()
        cause = rej.get("common_cause", rej.get("Common_Cause", "")).strip()
        fix = rej.get("fix_suggestion", rej.get("Fix_Suggestion", "")).strip()
        category = rej.get("category", rej.get("Category", "")).strip()

        if not code or not desc:
            continue

        # Direct lookup
        p = make_pair(f"What does rejection code {code} mean?", f"Rejection code {code}: {desc}\nCategory: {category}\nCommon cause: {cause}\nHow to fix: {fix}", f"rejection:lookup:{code}")
        if p:
            pairs.append(p)

        # Per-specialty scenarios
        for spec in specialties:
            p = make_pair(
                f"A {spec} claim was rejected with code {code}. Why?",
                f"Rejection code {code} ({desc}) on a {spec} claim. Most common cause: {cause}. To resolve: {fix}. For {spec} claims specifically, verify that the tariff code discipline matches {spec} billing rules.",
                f"rejection:specialty:{code}"
            )
            if p:
                pairs.append(p)

        # Prevention questions
        p = make_pair(
            f"How do I prevent rejection code {code} from occurring?",
            f"To prevent rejection code {code} ({desc}):\n\n1. Root cause: {cause}\n2. Prevention: {fix}\n3. Best practice: Implement pre-submission validation to catch this error before the claim reaches the switch.\n4. If it occurs, resubmit with corrections within the scheme's claim window.",
            f"rejection:prevent:{code}"
        )
        if p:
            pairs.append(p)

    return pairs


# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 8: Legal/Regulatory Expansion (~20K)
# ═══════════════════════════════════════════════════════════════════════════════

def generate_legal_expansion() -> List[dict]:
    pairs = []

    docs = {
        "medical-schemes-act-full-text.md": "Medical Schemes Act 131 of 1998",
        "medical-schemes-regulations-full-text.md": "Medical Schemes Regulations",
        "section59-investigation-extracted.md": "Section 59 Investigation",
        "hpcsa-booklet-20-ai-extracted.md": "HPCSA Booklet 20 — AI Ethics",
        "sahpra-ai-ml-devices-extracted.md": "SAHPRA AI/ML Device Guidance",
        "phisc-medclm-spec-extracted.md": "PHISC MEDCLM Specification",
        "cms-industry-report-2024-data.md": "CMS Industry Report 2024",
    }

    for filename, doc_title in docs.items():
        filepath = os.path.join(EXTRACTED_DIR, filename)
        if not os.path.exists(filepath):
            continue

        with open(filepath, encoding="utf-8", errors="ignore") as f:
            content = f.read()

        # Split by ## headers
        sections = re.split(r'^#{1,3}\s+', content, flags=re.MULTILINE)
        section_count = 0

        for section in sections[1:]:
            lines = section.strip().split("\n")
            if not lines:
                continue

            title = lines[0].strip()
            body = "\n".join(lines[1:]).strip()

            if len(body) < 100 or len(title) < 3:
                continue

            body_trunc = body[:2500]
            section_count += 1

            # 5 question types per section
            templates = [
                f"What does {doc_title} say about {title}?",
                f"Explain {title} from {doc_title}",
                f"Summarize the key points of {title} in {doc_title}",
                f"What are the requirements under {title}?",
                f"How does {title} affect healthcare claims in SA?",
            ]

            for template in templates:
                p = make_pair(template, body_trunc, f"legal:{filename[:20]}")
                if p:
                    pairs.append(p)

        print(f"  {filename}: {section_count} sections")

    return pairs


# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 9: Knowledge MD Exhaustive (~30K)
# ═══════════════════════════════════════════════════════════════════════════════

def generate_knowledge_exhaustive() -> List[dict]:
    pairs = []

    for fname in sorted(os.listdir(KB_DIR)):
        if not fname.endswith(".md") or fname.startswith("00_") or fname.startswith("VISIO"):
            continue

        filepath = os.path.join(KB_DIR, fname)
        with open(filepath, encoding="utf-8", errors="ignore") as f:
            content = f.read()

        if len(content) < 200:
            continue

        topic = fname.replace(".md", "").replace("_", " ")
        if topic[0:2].isdigit():
            topic = topic[3:].strip()

        # Section-level extraction
        sections = re.split(r'^##\s+', content, flags=re.MULTILINE)
        section_count = 0

        for section in sections[1:]:
            lines = section.strip().split("\n")
            if not lines:
                continue

            title = lines[0].strip()
            body = "\n".join(lines[1:]).strip()

            if len(body) < 100:
                continue

            body_trunc = body[:2000]
            section_count += 1

            # Multiple question phrasings
            templates = [
                f"What is {title} in the context of SA healthcare?",
                f"Explain {title}",
                f"What are the key points about {title}?",
            ]

            for template in templates:
                p = make_pair(template, body_trunc, f"knowledge:{fname[:20]}")
                if p:
                    pairs.append(p)

            # Sub-sections
            subsections = re.split(r'^###\s+', body, flags=re.MULTILINE)
            for subsec in subsections[1:]:
                sub_lines = subsec.strip().split("\n")
                sub_title = sub_lines[0].strip()
                sub_body = "\n".join(sub_lines[1:]).strip()

                if len(sub_body) < 80:
                    continue

                p = make_pair(f"What is {sub_title}?", sub_body[:1500], f"knowledge:sub:{fname[:15]}")
                if p:
                    pairs.append(p)

        if section_count > 0:
            print(f"  {fname}: {section_count} sections")

    return pairs


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    all_pairs = []

    print("=" * 70)
    print("HealthOS-Med v2 — MEGA TRAINING DATA GENERATOR")
    print("=" * 70)

    print("\n[1/9] ICD-10 exhaustive...")
    all_pairs.extend(generate_icd10_exhaustive())

    print(f"\n[2/9] Medicine prices...")
    all_pairs.extend(generate_medicine_prices())

    print(f"\n[3/9] GEMS tariffs...")
    all_pairs.extend(generate_gems_tariffs())

    print(f"\n[4/9] Multi-turn claim scenarios...")
    all_pairs.extend(generate_claim_scenarios())

    print(f"\n[5/9] Cross-scheme comparisons...")
    all_pairs.extend(generate_cross_scheme())

    print(f"\n[6/9] CDL/PMB deep...")
    all_pairs.extend(generate_cdl_pmb())

    print(f"\n[7/9] Rejection scenarios...")
    all_pairs.extend(generate_rejection_scenarios())

    print(f"\n[8/9] Legal/regulatory expansion...")
    all_pairs.extend(generate_legal_expansion())

    print(f"\n[9/9] Knowledge MD exhaustive...")
    all_pairs.extend(generate_knowledge_exhaustive())

    print(f"\n{'=' * 70}")
    print(f"TOTAL: {len(all_pairs):,} training examples generated")

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

    print(f"\nBreakdown by source:")
    for src, count in sorted(stats.items(), key=lambda x: -x[1]):
        print(f"  {src}: {count:,}")

    # Save holdout sets for benchmark
    holdout_path = os.path.join(OUTPUT_DIR, "benchmark_holdout.json")
    with open(holdout_path, "w") as f:
        json.dump({
            "icd10_codes": sorted(HOLDOUT_ICD10),
            "medicine_nappi": sorted(HOLDOUT_MEDICINES),
            "tariff_codes": sorted(HOLDOUT_TARIFFS),
        }, f, indent=2)
    print(f"\nBenchmark holdout saved: {len(HOLDOUT_ICD10)} ICD-10, {len(HOLDOUT_MEDICINES)} medicines, {len(HOLDOUT_TARIFFS)} tariffs")

    print(f"{'=' * 70}")


if __name__ == "__main__":
    main()
