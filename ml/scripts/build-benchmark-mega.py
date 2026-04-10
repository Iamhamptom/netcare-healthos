#!/usr/bin/env python3
"""
Mega-Benchmark Generator — 50K+ deterministic test cases for VRL clinical coding AI.

Expands the 500-question medqa-sa.jsonl to 50,000+ cases by systematically
generating test cases from every validation rule in the system:
  - ICD-10 mutual exclusion rules (code-pairs.ts)
  - Gender/age restrictions (ICD-10_MIT_2021.csv)
  - Asterisk/dagger conventions
  - External cause requirements
  - Primary validity constraints
  - CDL chronic disease rules
  - PMB coding scenarios
  - Scheme rejection patterns
  - Unbundling detection
  - Modifier calculations
  - Random negative (valid) examples
  - Complex clinical vignettes

All generation is DETERMINISTIC (seed=42). No LLM calls.
No external dependencies beyond Python stdlib.

Output:
  - ml/benchmark/mega-benchmark.jsonl
  - ml/benchmark/mega-metadata.json
"""

import csv
import json
import random
import re
import sys
import os
from datetime import datetime
from pathlib import Path

# ── Path setup ──────────────────────────────────────────────────────

PROJECT_ROOT = Path("/Users/hga/netcare-healthos")
ML_LIB = PROJECT_ROOT / "ml" / "lib"
BENCHMARK_DIR = PROJECT_ROOT / "ml" / "benchmark"
DATABASES_DIR = PROJECT_ROOT / "docs" / "knowledge" / "databases"

# Add ml/lib to path for imports
sys.path.insert(0, str(ML_LIB))

from rule_extractor import extract_code_pairs, extract_chapter_mapping, get_chapter_for_code
from clinical_templates import (
    pair_violation_note, single_code_note, gender_note, injury_note,
    chronic_note, asterisk_dagger_note, primary_validity_note,
    unbundling_note, modifier_note, scheme_rejection_note,
    multi_code_vignette, SA_SCHEMES,
)

# ── Deterministic RNG ───────────────────────────────────────────────

RNG = random.Random(42)

# ── Data loaders ────────────────────────────────────────────────────


def load_icd10_csv() -> list[dict]:
    """Load ICD-10_MIT_2021.csv into list of dicts."""
    path = DATABASES_DIR / "ICD-10_MIT_2021.csv"
    if not path.exists():
        print(f"  WARNING: {path} not found, ICD-10 generators will be limited")
        return []

    rows = []
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows


def load_tariff_csv() -> list[dict]:
    """Load GEMS_tariffs_2026.csv. Handles the non-standard header format."""
    path = DATABASES_DIR / "GEMS_tariffs_2026.csv"
    if not path.exists():
        print(f"  WARNING: {path} not found, tariff generators will be limited")
        return []

    rows = []
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f)
        for row in reader:
            if row and row[0].strip().isdigit() and len(row[0].strip()) == 4:
                tariff_code = row[0].strip()
                desc = row[1].strip() if len(row) > 1 else ""
                value = ""
                if len(row) > 2:
                    val_str = row[2].strip().replace(" ", "").replace(",", "")
                    try:
                        value = float(val_str)
                    except ValueError:
                        value = 0.0
                rows.append({
                    "code": tariff_code,
                    "description": desc,
                    "value": value,
                })
    return rows


def load_cdl_csv() -> list[dict]:
    """Load cdl_conditions.csv."""
    path = DATABASES_DIR / "cdl_conditions.csv"
    if not path.exists():
        print(f"  WARNING: {path} not found, CDL generator will be limited")
        return []

    rows = []
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows


def load_original_benchmark() -> list[dict]:
    """Load existing medqa-sa.jsonl."""
    path = BENCHMARK_DIR / "medqa-sa.jsonl"
    if not path.exists():
        print(f"  WARNING: {path} not found, original questions won't be included")
        return []

    rows = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    rows.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return rows


# ── Helper: build ICD-10 lookup ─────────────────────────────────────


def build_icd10_lookup(icd10_rows: list[dict]) -> dict[str, dict]:
    """Build a lookup dict from ICD-10 code -> row data."""
    lookup = {}
    for row in icd10_rows:
        code = (row.get("ICD10_Code") or "").strip()
        if code:
            lookup[code] = row
    return lookup


def get_desc(lookup: dict, code: str) -> str:
    """Get description for an ICD-10 code, with fallback."""
    row = lookup.get(code, {})
    return (
        row.get("WHO_Full_Desc")
        or row.get("ICD10_3_Code_Desc")
        or f"Condition {code}"
    ).strip()


# ── Generator 1: Code Pair Violations ───────────────────────────────


def gen_code_pair_violations(icd10_lookup: dict) -> list[dict]:
    """Generate cases from every mutual exclusion rule in code-pairs.ts.

    For EACH rule: one invalid pair case + one valid single-code case.
    """
    print("  [1/13] Code pair violations...", end=" ", flush=True)
    rules = extract_code_pairs()
    cases = []

    for i, rule in enumerate(rules):
        c1, c2 = rule["code1"], rule["code2"]
        desc1 = get_desc(icd10_lookup, c1)
        desc2 = get_desc(icd10_lookup, c2)
        age = RNG.randint(25, 75)
        gender = RNG.choice(["M", "F"])

        # Determine subcategory from rule category
        subcat = rule.get("category", "icd10_exclusion")

        # Case A: Invalid pair (both codes together)
        cases.append({
            "category": "code_pair_violation",
            "subcategory": subcat,
            "difficulty": "medium",
            "test_type": "multi_code",
            "clinical_note": pair_violation_note(c1, desc1, c2, desc2, age, gender),
            "expected_codes": [c1, c2],
            "expected_valid": False,
            "question": f"Are codes {c1} and {c2} valid together on the same claim?",
            "correct_answer": f"No. {rule['reason'][:200]}",
            "answer_type": "boolean_with_reason",
            "source_rule": f"code-pairs:{c1}-{c2}",
            "metadata": {
                "patient_age": age,
                "patient_gender": gender,
                "scheme": RNG.choice(SA_SCHEMES),
                "violation_type": rule["type"],
            },
        })

        # Case B: Valid single code (just code1)
        cases.append({
            "category": "code_pair_violation",
            "subcategory": f"{subcat}_negative",
            "difficulty": "easy",
            "test_type": "single_code",
            "clinical_note": single_code_note(c1, desc1, age, gender),
            "expected_codes": [c1],
            "expected_valid": True,
            "question": f"Is code {c1} valid as a standalone diagnosis?",
            "correct_answer": f"Yes. {desc1} is a valid standalone ICD-10 code.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"code-pairs:{c1}-{c2}:negative",
            "metadata": {
                "patient_age": age,
                "patient_gender": gender,
                "scheme": RNG.choice(SA_SCHEMES),
            },
        })

    print(f"{len(cases)} cases")
    return cases


# ── Generator 2: Gender Restrictions ────────────────────────────────


def gen_gender_restrictions(icd10_rows: list[dict], icd10_lookup: dict) -> list[dict]:
    """Find codes with gender restrictions, test with correct and wrong gender."""
    print("  [2/13] Gender restrictions...", end=" ", flush=True)
    cases = []

    gender_codes = []
    for row in icd10_rows:
        code = (row.get("ICD10_Code") or "").strip()
        gender = (row.get("Gender") or "").strip().upper()
        valid_clinical = (row.get("Valid_ICD10_ClinicalUse") or "").strip().upper()
        if code and gender in ("M", "F") and valid_clinical == "Y":
            gender_codes.append((code, gender))

    for code, correct_gender in gender_codes:
        desc = get_desc(icd10_lookup, code)
        wrong_gender = "F" if correct_gender == "M" else "M"
        age = RNG.randint(20, 70)

        # Case A: Correct gender (valid)
        cases.append({
            "category": "gender_restriction",
            "subcategory": f"{'male' if correct_gender == 'M' else 'female'}_code_valid",
            "difficulty": "easy",
            "test_type": "validation",
            "clinical_note": gender_note(code, desc, correct_gender, correct_gender, age),
            "expected_codes": [code],
            "expected_valid": True,
            "question": f"Is {code} valid for a {'male' if correct_gender == 'M' else 'female'} patient?",
            "correct_answer": f"Yes. {desc} is a {'male' if correct_gender == 'M' else 'female'}-specific condition.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"gender:{code}:{correct_gender}",
            "metadata": {
                "patient_age": age,
                "patient_gender": correct_gender,
                "scheme": RNG.choice(SA_SCHEMES),
                "required_gender": correct_gender,
            },
        })

        # Case B: Wrong gender (invalid)
        cases.append({
            "category": "gender_restriction",
            "subcategory": f"{'male' if wrong_gender == 'M' else 'female'}_code_invalid",
            "difficulty": "medium",
            "test_type": "validation",
            "clinical_note": gender_note(code, desc, wrong_gender, correct_gender, age),
            "expected_codes": [code],
            "expected_valid": False,
            "question": f"Is {code} valid for a {'male' if wrong_gender == 'M' else 'female'} patient?",
            "correct_answer": f"No. {desc} is a {'male' if correct_gender == 'M' else 'female'}-only condition coded on a {'male' if wrong_gender == 'M' else 'female'} patient.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"gender:{code}:{wrong_gender}",
            "metadata": {
                "patient_age": age,
                "patient_gender": wrong_gender,
                "scheme": RNG.choice(SA_SCHEMES),
                "required_gender": correct_gender,
            },
        })

    print(f"{len(cases)} cases")
    return cases


# ── Generator 3: Age Restrictions ───────────────────────────────────


def gen_age_restrictions(icd10_rows: list[dict], icd10_lookup: dict) -> list[dict]:
    """Find codes with age_range restrictions, test valid/invalid ages."""
    print("  [3/13] Age restrictions...", end=" ", flush=True)
    cases = []

    # Parse age_range column. Formats: "≤ 19 years", "> 19 years", "≤1 year", "≤19 years"
    leq_pattern = re.compile(r'[≤<=]\s*(\d+)\s*year', re.IGNORECASE)
    gt_pattern = re.compile(r'>\s*(\d+)\s*year', re.IGNORECASE)

    age_codes = []
    for row in icd10_rows:
        code = (row.get("ICD10_Code") or "").strip()
        age_range = (row.get("Age_Range") or "").strip()
        valid_clinical = (row.get("Valid_ICD10_ClinicalUse") or "").strip().upper()
        if code and age_range and valid_clinical == "Y":
            m_leq = leq_pattern.search(age_range)
            m_gt = gt_pattern.search(age_range)
            if m_leq:
                hi = int(m_leq.group(1))
                age_codes.append((code, 0, hi))
            elif m_gt:
                lo = int(m_gt.group(1)) + 1
                age_codes.append((code, lo, 99))

    for code, lo, hi in age_codes:
        desc = get_desc(icd10_lookup, code)
        gender = RNG.choice(["M", "F"])

        # Valid age
        valid_age = RNG.randint(lo, min(hi, 99))
        cases.append({
            "category": "age_restriction",
            "subcategory": "valid_age",
            "difficulty": "easy",
            "test_type": "validation",
            "clinical_note": single_code_note(code, desc, valid_age, gender),
            "expected_codes": [code],
            "expected_valid": True,
            "question": f"Is {code} valid for a {valid_age}-year-old patient?",
            "correct_answer": f"Yes. {desc} is valid for ages {lo}-{hi}.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"age:{code}:{lo}-{hi}",
            "metadata": {
                "patient_age": valid_age,
                "patient_gender": gender,
                "scheme": RNG.choice(SA_SCHEMES),
                "valid_age_range": f"{lo}-{hi}",
            },
        })

        # Invalid age (outside range)
        if lo > 5:
            invalid_age = RNG.randint(0, lo - 1)
        elif hi < 90:
            invalid_age = RNG.randint(hi + 1, 99)
        else:
            continue  # Can't generate invalid age easily

        cases.append({
            "category": "age_restriction",
            "subcategory": "invalid_age",
            "difficulty": "medium",
            "test_type": "validation",
            "clinical_note": single_code_note(code, desc, invalid_age, gender),
            "expected_codes": [code],
            "expected_valid": False,
            "question": f"Is {code} valid for a {invalid_age}-year-old patient?",
            "correct_answer": f"No. {desc} is restricted to ages {lo}-{hi}. Patient is {invalid_age}.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"age:{code}:{lo}-{hi}:invalid",
            "metadata": {
                "patient_age": invalid_age,
                "patient_gender": gender,
                "scheme": RNG.choice(SA_SCHEMES),
                "valid_age_range": f"{lo}-{hi}",
            },
        })

    print(f"{len(cases)} cases")
    return cases


# ── Generator 4: Asterisk/Dagger ────────────────────────────────────


def gen_asterisk_dagger(icd10_rows: list[dict], icd10_lookup: dict) -> list[dict]:
    """Test asterisk/dagger coding conventions.

    - Asterisk codes should NOT be used as primary
    - Dagger codes CAN be used as primary
    - Correct pairing tests
    """
    print("  [4/13] Asterisk/dagger rules...", end=" ", flush=True)
    cases = []

    asterisk_codes = []
    dagger_codes = []

    for row in icd10_rows:
        code = (row.get("ICD10_Code") or "").strip()
        valid_clinical = (row.get("Valid_ICD10_ClinicalUse") or "").strip().upper()
        is_ast = (row.get("Valid_ICD10_Asterisk") or "").strip().upper() == "Y"
        is_dag = (row.get("Valid_ICD10_Dagger") or "").strip().upper() == "Y"

        if code and valid_clinical == "Y":
            if is_ast:
                asterisk_codes.append(code)
            if is_dag:
                dagger_codes.append(code)

    # Use all asterisk/dagger codes for maximum coverage
    ast_sample = RNG.sample(asterisk_codes, min(800, len(asterisk_codes)))
    dag_sample = RNG.sample(dagger_codes, min(104, len(dagger_codes)))

    # Test 1: Asterisk as primary (invalid)
    for code in ast_sample:
        desc = get_desc(icd10_lookup, code)
        age = RNG.randint(30, 75)
        gender = RNG.choice(["M", "F"])
        cases.append({
            "category": "asterisk_dagger",
            "subcategory": "asterisk_as_primary",
            "difficulty": "hard",
            "test_type": "validation",
            "clinical_note": primary_validity_note(code, desc, False, age, gender),
            "expected_codes": [code],
            "expected_valid": False,
            "question": f"Can asterisk code {code} be used as the primary diagnosis?",
            "correct_answer": f"No. {code} is an asterisk (manifestation) code and cannot be the primary diagnosis. A dagger (aetiology) code must be the primary.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"asterisk-primary:{code}",
            "metadata": {
                "patient_age": age,
                "patient_gender": gender,
                "scheme": RNG.choice(SA_SCHEMES),
                "code_type": "asterisk",
            },
        })

    # Test 2: Dagger as primary (valid)
    for code in dag_sample:
        desc = get_desc(icd10_lookup, code)
        age = RNG.randint(30, 75)
        gender = RNG.choice(["M", "F"])
        cases.append({
            "category": "asterisk_dagger",
            "subcategory": "dagger_as_primary",
            "difficulty": "easy",
            "test_type": "validation",
            "clinical_note": primary_validity_note(code, desc, True, age, gender),
            "expected_codes": [code],
            "expected_valid": True,
            "question": f"Can dagger code {code} be used as the primary diagnosis?",
            "correct_answer": f"Yes. {code} is a dagger (aetiology) code and is valid as primary diagnosis.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"dagger-primary:{code}",
            "metadata": {
                "patient_age": age,
                "patient_gender": gender,
                "scheme": RNG.choice(SA_SCHEMES),
                "code_type": "dagger",
            },
        })

    # Test 3: Correct pairing (sample paired combos)
    n_pairs = min(len(ast_sample), len(dag_sample), 500)
    for i in range(n_pairs):
        ast_c = ast_sample[i % len(ast_sample)]
        dag_c = dag_sample[i % len(dag_sample)]
        ast_d = get_desc(icd10_lookup, ast_c)
        dag_d = get_desc(icd10_lookup, dag_c)
        age = RNG.randint(30, 75)
        gender = RNG.choice(["M", "F"])
        cases.append({
            "category": "asterisk_dagger",
            "subcategory": "correct_pairing",
            "difficulty": "medium",
            "test_type": "multi_code",
            "clinical_note": asterisk_dagger_note(ast_c, ast_d, dag_c, dag_d, age, gender),
            "expected_codes": [dag_c, ast_c],
            "expected_valid": True,
            "question": f"Is dagger {dag_c} + asterisk {ast_c} a valid coding pair?",
            "correct_answer": f"Yes. Dagger code {dag_c} as primary with asterisk code {ast_c} as secondary follows WHO ICD-10 convention.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"ast-dag-pair:{dag_c}+{ast_c}",
            "metadata": {
                "patient_age": age,
                "patient_gender": gender,
                "scheme": RNG.choice(SA_SCHEMES),
            },
        })

    print(f"{len(cases)} cases")
    return cases


# ── Generator 5: External Cause Codes ───────────────────────────────

# Common external cause codes for pairing with injuries
_ECC_CODES = [
    ("V03.1", "Pedestrian injured in collision with car in traffic accident"),
    ("W01.0", "Fall on same level from slipping, tripping and stumbling, at home"),
    ("W10.9", "Fall on and from stairs and steps, unspecified place"),
    ("W19.0", "Unspecified fall, at home"),
    ("W20.0", "Struck by thrown, projected or falling objects, at home"),
    ("X00.0", "Exposure to uncontrolled fire in building, at home"),
    ("X58.9", "Exposure to other specified factors, unspecified place"),
    ("Y04.0", "Assault by bodily force, at home"),
    ("Y09.9", "Assault by unspecified means, unspecified place"),
    ("V49.9", "Car occupant injured in unspecified traffic accident"),
    ("W22.0", "Striking against or struck by other objects, at home"),
    ("X99.0", "Assault by sharp object, at home"),
]


def gen_external_cause(icd10_rows: list[dict], icd10_lookup: dict) -> list[dict]:
    """Test S00-T98 injury codes for required external cause codes (V-Y)."""
    print("  [5/13] External cause codes...", end=" ", flush=True)
    cases = []

    # Find all injury codes (S00-T98) that are valid for clinical use
    injury_codes = []
    for row in icd10_rows:
        code = (row.get("ICD10_Code") or "").strip()
        valid_clinical = (row.get("Valid_ICD10_ClinicalUse") or "").strip().upper()
        if code and valid_clinical == "Y" and re.match(r'^[ST]\d', code):
            injury_codes.append(code)

    # Use all available injury codes for maximum coverage
    sample_size = len(injury_codes)  # use all
    sampled = RNG.sample(injury_codes, sample_size)

    for code in sampled:
        desc = get_desc(icd10_lookup, code)
        age = RNG.randint(5, 80)
        gender = RNG.choice(["M", "F"])

        # Case A: WITH external cause (valid)
        ecc = RNG.choice(_ECC_CODES)
        cases.append({
            "category": "external_cause",
            "subcategory": "with_ecc",
            "difficulty": "easy",
            "test_type": "multi_code",
            "clinical_note": injury_note(code, desc, True, ecc[0], ecc[1], age, gender),
            "expected_codes": [code, ecc[0]],
            "expected_valid": True,
            "question": f"Is injury code {code} with external cause {ecc[0]} correctly coded?",
            "correct_answer": f"Yes. Injury code {code} has the required external cause code {ecc[0]}.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"ecc:{code}+{ecc[0]}",
            "metadata": {
                "patient_age": age,
                "patient_gender": gender,
                "scheme": RNG.choice(SA_SCHEMES),
                "injury_code": code,
                "ecc_code": ecc[0],
            },
        })

        # Case B: WITHOUT external cause (invalid)
        cases.append({
            "category": "external_cause",
            "subcategory": "missing_ecc",
            "difficulty": "medium",
            "test_type": "validation",
            "clinical_note": injury_note(code, desc, False, age=age, gender=gender),
            "expected_codes": [code],
            "expected_valid": False,
            "question": f"Is injury code {code} valid without an external cause code?",
            "correct_answer": f"No. Injury code {code} requires an external cause code (V01-Y98) per WHO ICD-10 rules.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"ecc-missing:{code}",
            "metadata": {
                "patient_age": age,
                "patient_gender": gender,
                "scheme": RNG.choice(SA_SCHEMES),
                "injury_code": code,
            },
        })

    print(f"{len(cases)} cases")
    return cases


# ── Generator 6: Primary Validity ───────────────────────────────────


def gen_primary_validity(icd10_rows: list[dict], icd10_lookup: dict) -> list[dict]:
    """Find codes where Valid_ICD10_Primary='N', test using as primary."""
    print("  [6/13] Primary validity...", end=" ", flush=True)
    cases = []

    invalid_primary_codes = []
    for row in icd10_rows:
        code = (row.get("ICD10_Code") or "").strip()
        valid_clinical = (row.get("Valid_ICD10_ClinicalUse") or "").strip().upper()
        valid_primary = (row.get("Valid_ICD10_Primary") or "").strip().upper()
        if code and valid_clinical == "Y" and valid_primary == "N":
            invalid_primary_codes.append(code)

    # Sample 4000
    sample_size = min(4000, len(invalid_primary_codes))
    sampled = RNG.sample(invalid_primary_codes, sample_size)

    for code in sampled:
        desc = get_desc(icd10_lookup, code)
        age = RNG.randint(20, 80)
        gender = RNG.choice(["M", "F"])

        cases.append({
            "category": "primary_validity",
            "subcategory": "invalid_primary",
            "difficulty": "hard",
            "test_type": "validation",
            "clinical_note": primary_validity_note(code, desc, False, age, gender),
            "expected_codes": [code],
            "expected_valid": False,
            "question": f"Can {code} be used as the primary diagnosis code?",
            "correct_answer": f"No. {code} ({desc}) is not valid as a primary diagnosis per SA ICD-10 rules.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"primary-invalid:{code}",
            "metadata": {
                "patient_age": age,
                "patient_gender": gender,
                "scheme": RNG.choice(SA_SCHEMES),
            },
        })

    print(f"{len(cases)} cases")
    return cases


# ── Generator 7: PMB Coding ─────────────────────────────────────────

# Core PMB DTPs with ICD-10 codes (subset of 270, representative)
_PMB_DTPS = [
    ("Acute appendicitis", "K35", "K35.0", "K35.9"),
    ("Acute myocardial infarction", "I21", "I21.0", "I21.9"),
    ("Asthma — acute severe", "J46", "J45", "J46"),
    ("Caesarean section", "O82", "O82.0", "O82.9"),
    ("Cholecystitis", "K81", "K81.0", "K80.0"),
    ("Community-acquired pneumonia", "J18", "J13", "J18.9"),
    ("Deep vein thrombosis", "I80", "I80.1", "I80.2"),
    ("Diabetic ketoacidosis", "E10.1", "E11.1", "E10.1"),
    ("Ectopic pregnancy", "O00", "O00.0", "O00.9"),
    ("Epilepsy — status epilepticus", "G41", "G41.0", "G41.9"),
    ("Fracture of femur", "S72", "S72.0", "S72.1"),
    ("Gastroenteritis — severe", "A09", "A09.0", "A09.9"),
    ("HIV — initial diagnosis", "B20", "B20", "Z21"),
    ("Hypertensive crisis", "I10", "I10", "I11"),
    ("Meningitis — bacterial", "G00", "G00.0", "G00.9"),
    ("Normal delivery", "O80", "O80", "O82"),
    ("Pneumothorax", "J93", "J93.0", "J93.1"),
    ("Pre-eclampsia", "O14", "O14.0", "O14.1"),
    ("Pulmonary embolism", "I26", "I26.0", "I26.9"),
    ("Stroke — ischaemic", "I63", "I63.0", "I63.9"),
    ("Thyroid storm", "E05.5", "E05.0", "E05.5"),
    ("Upper GI bleed", "K92.0", "K25.0", "K92.0"),
    ("Urinary tract infection — complicated", "N10", "N10", "N39.0"),
    ("Burns — major", "T30", "T20", "T31"),
    ("Sepsis", "A41", "A41.0", "A41.9"),
    ("Acute pancreatitis", "K85", "K85.0", "K85.9"),
    ("Intestinal obstruction", "K56", "K56.0", "K56.6"),
    ("Acute renal failure", "N17", "N17.0", "N17.9"),
    ("Spontaneous abortion", "O03", "O03.0", "O03.9"),
    ("Malaria", "B50", "B50.0", "B50.9"),
]


def gen_pmb_coding(icd10_lookup: dict) -> list[dict]:
    """Generate PMB coding test cases."""
    print("  [7/13] PMB coding...", end=" ", flush=True)
    cases = []

    for condition, primary, correct_code, alt_code in _PMB_DTPS:
        age = RNG.randint(18, 75)
        gender = RNG.choice(["M", "F"])
        desc_primary = get_desc(icd10_lookup, primary)
        desc_correct = get_desc(icd10_lookup, correct_code)
        desc_alt = get_desc(icd10_lookup, alt_code)

        # Case A: Correct PMB code
        cases.append({
            "category": "pmb_coding",
            "subcategory": "correct_pmb_code",
            "difficulty": "medium",
            "test_type": "single_code",
            "clinical_note": single_code_note(correct_code, f"{condition} — {desc_correct}", age, gender),
            "expected_codes": [correct_code],
            "expected_valid": True,
            "question": f"Is {correct_code} the correct PMB code for {condition}?",
            "correct_answer": f"Yes. {correct_code} ({desc_correct}) is the correct code for PMB condition: {condition}.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"pmb:{condition}:{correct_code}",
            "metadata": {
                "patient_age": age,
                "patient_gender": gender,
                "scheme": RNG.choice(SA_SCHEMES),
                "pmb_condition": condition,
            },
        })

        # Case B: Alternative/boundary code
        if correct_code != alt_code:
            cases.append({
                "category": "pmb_coding",
                "subcategory": "pmb_boundary_code",
                "difficulty": "hard",
                "test_type": "single_code",
                "clinical_note": single_code_note(alt_code, f"{condition} — {desc_alt}", age, gender),
                "expected_codes": [alt_code],
                "expected_valid": True,
                "question": f"Is {alt_code} also acceptable for {condition} under PMB?",
                "correct_answer": f"{alt_code} ({desc_alt}) may be acceptable depending on clinical presentation for {condition}.",
                "answer_type": "contains",
                "source_rule": f"pmb:{condition}:{alt_code}",
                "metadata": {
                    "patient_age": age,
                    "patient_gender": gender,
                    "scheme": RNG.choice(SA_SCHEMES),
                    "pmb_condition": condition,
                },
            })

        # Case C: Incorrect code for this PMB condition
        # Use a random unrelated code
        wrong_codes = ["Z76.9", "R69", "Z02.9", "Z00.0", "R10.4"]
        wrong = RNG.choice(wrong_codes)
        wrong_desc = get_desc(icd10_lookup, wrong)
        cases.append({
            "category": "pmb_coding",
            "subcategory": "incorrect_pmb_code",
            "difficulty": "medium",
            "test_type": "single_code",
            "clinical_note": single_code_note(wrong, f"{condition} — incorrectly coded as {wrong_desc}", age, gender),
            "expected_codes": [wrong],
            "expected_valid": False,
            "question": f"Is {wrong} the correct code for {condition}?",
            "correct_answer": f"No. {wrong} ({wrong_desc}) is not the correct code for {condition}. Expected: {correct_code}.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"pmb:{condition}:wrong:{wrong}",
            "metadata": {
                "patient_age": age,
                "patient_gender": gender,
                "scheme": RNG.choice(SA_SCHEMES),
                "pmb_condition": condition,
                "expected_code": correct_code,
            },
        })

    print(f"{len(cases)} cases")
    return cases


# ── Generator 8: CDL Medication ─────────────────────────────────────


def gen_cdl_medication(cdl_rows: list[dict], icd10_lookup: dict) -> list[dict]:
    """Test CDL conditions with correct/wrong/no medications."""
    print("  [8/13] CDL medication...", end=" ", flush=True)
    cases = []

    wrong_meds = [
        "Amoxicillin", "Paracetamol", "Ibuprofen",
        "Tramadol", "Omeprazole", "Cetirizine",
    ]

    for row in cdl_rows:
        condition = row.get("condition", "").strip()
        primary_code = row.get("primary_icd10", "").strip()
        meds = row.get("key_medications", "").strip()
        monitoring = row.get("monitoring", "").strip()

        if not condition or not primary_code:
            continue

        desc = get_desc(icd10_lookup, primary_code)
        age = RNG.randint(25, 75)
        gender = RNG.choice(["M", "F"])

        # Case A: Correct meds
        cases.append({
            "category": "cdl_medication",
            "subcategory": "correct_meds",
            "difficulty": "medium",
            "test_type": "clinical_review",
            "clinical_note": chronic_note(condition, primary_code, meds, monitoring, age, gender),
            "expected_codes": [primary_code],
            "expected_valid": True,
            "question": f"Is the medication regimen ({meds}) appropriate for {condition} ({primary_code})?",
            "correct_answer": f"Yes. {meds} is the standard treatment for CDL condition: {condition}.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"cdl:{condition}:correct_meds",
            "metadata": {
                "patient_age": age,
                "patient_gender": gender,
                "scheme": RNG.choice(SA_SCHEMES),
                "cdl_condition": condition,
                "medications": meds,
            },
        })

        # Case B: Wrong meds
        wrong_med = RNG.choice(wrong_meds)
        cases.append({
            "category": "cdl_medication",
            "subcategory": "wrong_meds",
            "difficulty": "hard",
            "test_type": "clinical_review",
            "clinical_note": chronic_note(condition, primary_code, wrong_med, monitoring, age, gender),
            "expected_codes": [primary_code],
            "expected_valid": False,
            "question": f"Is {wrong_med} the appropriate medication for {condition} ({primary_code})?",
            "correct_answer": f"No. {wrong_med} is not standard treatment for {condition}. Expected: {meds}.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"cdl:{condition}:wrong_meds",
            "metadata": {
                "patient_age": age,
                "patient_gender": gender,
                "scheme": RNG.choice(SA_SCHEMES),
                "cdl_condition": condition,
                "medications": wrong_med,
                "expected_medications": meds,
            },
        })

        # Case C: No meds documented
        cases.append({
            "category": "cdl_medication",
            "subcategory": "no_meds",
            "difficulty": "medium",
            "test_type": "clinical_review",
            "clinical_note": chronic_note(condition, primary_code, "None documented", "", age, gender),
            "expected_codes": [primary_code],
            "expected_valid": False,
            "question": f"Is it appropriate for a CDL-registered {condition} patient to have no medications?",
            "correct_answer": f"No. CDL condition {condition} requires ongoing treatment. Expected: {meds}.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"cdl:{condition}:no_meds",
            "metadata": {
                "patient_age": age,
                "patient_gender": gender,
                "scheme": RNG.choice(SA_SCHEMES),
                "cdl_condition": condition,
                "expected_medications": meds,
            },
        })

    print(f"{len(cases)} cases")
    return cases


# ── Generator 9: Scheme Rejections ──────────────────────────────────

_REJECTION_TYPES = [
    ("missing_icd10", "Claim submitted without ICD-10 diagnosis code"),
    ("invalid_icd10", "ICD-10 code does not exist in the MIT code list"),
    ("future_date", "Date of service is in the future"),
    ("stale_claim", "Claim submitted more than 120 days after date of service"),
    ("duplicate_claim", "Duplicate claim — same patient, date, provider, codes"),
    ("not_clinical_use", "Code is not valid for clinical use (header/category code)"),
    ("gender_mismatch", "Code is gender-restricted and patient gender does not match"),
    ("no_pre_auth", "Procedure requires pre-authorisation that was not obtained"),
    ("benefit_exhausted", "Annual benefit limit for this category has been reached"),
    ("non_dsp", "Treatment obtained from non-designated service provider for PMB"),
    ("unspecified_code", "Unspecified code used when specific code is available"),
    ("missing_modifier", "Required modifier not applied to procedure code"),
]

_COMMON_CODES = [
    ("I10", "Essential hypertension"),
    ("E11.9", "Type 2 diabetes without complications"),
    ("J06.9", "Acute upper respiratory infection, unspecified"),
    ("M54.5", "Low back pain"),
    ("K29.9", "Gastroduodenitis, unspecified"),
    ("N39.0", "Urinary tract infection"),
    ("J45.9", "Asthma, unspecified"),
    ("R10.4", "Other and unspecified abdominal pain"),
    ("K21.0", "Gastro-oesophageal reflux with oesophagitis"),
    ("J20.9", "Acute bronchitis, unspecified"),
]


def gen_scheme_rejections(icd10_lookup: dict) -> list[dict]:
    """Generate scheme rejection scenario cases."""
    print("  [9/13] Scheme rejections...", end=" ", flush=True)
    cases = []

    for scheme in SA_SCHEMES:
        for rej_type, rej_desc in _REJECTION_TYPES:
          for _rep in range(5):
            code, desc = RNG.choice(_COMMON_CODES)
            age = RNG.randint(20, 75)

            # All rejection cases are expected_valid=False
            cases.append({
                "category": "scheme_rejection",
                "subcategory": rej_type,
                "difficulty": "medium",
                "test_type": "claim_validation",
                "clinical_note": scheme_rejection_note(code, desc, rej_type, scheme, age),
                "expected_codes": [code],
                "expected_valid": False,
                "question": f"Will {scheme} accept a claim with rejection type '{rej_type}'?",
                "correct_answer": f"No. {rej_desc}. The claim will be rejected by {scheme}.",
                "answer_type": "boolean_with_reason",
                "source_rule": f"rejection:{scheme}:{rej_type}",
                "metadata": {
                    "patient_age": age,
                    "patient_gender": RNG.choice(["M", "F"]),
                    "scheme": scheme,
                    "rejection_type": rej_type,
                    "rejection_description": rej_desc,
                },
            })

    # Add valid claim cases (no rejection) for each scheme — more variety
    for scheme in SA_SCHEMES:
        for _ in range(50):
            code, desc = RNG.choice(_COMMON_CODES)
            age = RNG.randint(20, 75)
            gender = RNG.choice(["M", "F"])
            cases.append({
                "category": "scheme_rejection",
                "subcategory": "valid_claim",
                "difficulty": "easy",
                "test_type": "claim_validation",
                "clinical_note": single_code_note(code, desc, age, gender),
                "expected_codes": [code],
                "expected_valid": True,
                "question": f"Will {scheme} accept this correctly formatted claim for {code}?",
                "correct_answer": f"Yes. The claim is properly formatted with valid ICD-10 code {code}.",
                "answer_type": "boolean_with_reason",
                "source_rule": f"rejection:{scheme}:valid",
                "metadata": {
                    "patient_age": age,
                    "patient_gender": gender,
                    "scheme": scheme,
                },
            })

    print(f"{len(cases)} cases")
    return cases


# ── Generator 10: Unbundling ────────────────────────────────────────

_UNBUNDLING_SCENARIOS = [
    # (tariff_codes, descriptions, rule, expected_valid, explanation)
    (
        ["0190", "0131"],
        ["Consultation", "Injection"],
        "Rule L",
        False,
        "First injection is included in consultation fee. Item 0131 is for subsequent injections only.",
    ),
    (
        ["0190"],
        ["Consultation"],
        "Rule L — single consultation",
        True,
        "Single consultation code is valid.",
    ),
    (
        ["0190", "0191"],
        ["Consultation level 1", "Consultation level 2"],
        "Multiple consultations same day",
        False,
        "Multiple consultation codes on the same claim. Only one consultation per visit.",
    ),
    (
        ["0192"],
        ["Consultation level 3"],
        "Single consultation",
        True,
        "Single consultation at appropriate level is valid.",
    ),
    (
        ["3000", "0173"],
        ["Surgical procedure", "Hospital visit"],
        "Rule G",
        False,
        "Hospital visits during post-op period are included in the surgical fee (Rule G — one month after-care).",
    ),
    (
        ["3000"],
        ["Surgical procedure"],
        "Surgery only",
        True,
        "Surgical procedure without post-op visit unbundling is valid.",
    ),
    (
        ["0190", "0131", "0131"],
        ["Consultation", "First injection", "Second injection"],
        "Multiple injections",
        False,
        "First injection included in consultation. Only subsequent injections may be billed separately.",
    ),
    (
        ["0173", "0174"],
        ["Hospital visit follow-up 1", "Hospital visit follow-up 2"],
        "Duplicate hospital visits",
        False,
        "Multiple hospital visit codes on same day. Only one visit per day.",
    ),
    (
        ["4500", "0175"],
        ["Major surgical procedure", "Ward visit"],
        "Rule G — major surgery",
        False,
        "Ward visits during post-op period included in surgical fee per Rule G.",
    ),
    (
        ["0191", "0401"],
        ["Consultation level 2", "Minor procedure"],
        "Consultation + minor procedure",
        True,
        "Consultation with minor procedure — may be separately billable depending on complexity.",
    ),
]


def gen_unbundling() -> list[dict]:
    """Generate unbundling detection test cases."""
    print("  [10/13] Unbundling scenarios...", end=" ", flush=True)
    cases = []

    # Repeat scenarios with variations
    for rep in range(50):
        for tariffs, descs, rule, valid, explanation in _UNBUNDLING_SCENARIOS:
            age = RNG.randint(25, 75)
            cases.append({
                "category": "unbundling",
                "subcategory": rule.lower().replace(" ", "_").replace("—", "").strip("_"),
                "difficulty": "hard" if not valid else "medium",
                "test_type": "billing_validation",
                "clinical_note": unbundling_note(tariffs, descs, rule, age),
                "expected_codes": tariffs,
                "expected_valid": valid,
                "question": f"Are these tariff codes ({', '.join(tariffs)}) correctly billed together?",
                "correct_answer": f"{'Yes' if valid else 'No'}. {explanation}",
                "answer_type": "boolean_with_reason",
                "source_rule": f"unbundling:{rule}:rep{rep}",
                "metadata": {
                    "patient_age": age,
                    "patient_gender": RNG.choice(["M", "F"]),
                    "scheme": RNG.choice(SA_SCHEMES),
                    "tariff_codes": tariffs,
                    "rule": rule,
                },
            })

    print(f"{len(cases)} cases")
    return cases


# ── Generator 11: Modifier Scenarios ────────────────────────────────


def gen_modifier_scenarios() -> list[dict]:
    """Test modifier 0005 (multiple procedures) and 0004 (own rooms)."""
    print("  [11/13] Modifier scenarios...", end=" ", flush=True)
    cases = []

    # Modifier 0005: Multiple procedures under same anaesthetic
    procedure_sets = [
        [{"code": "3001", "amount": 2500.00}, {"code": "3002", "amount": 1800.00}],
        [{"code": "3010", "amount": 5000.00}, {"code": "3020", "amount": 3500.00}, {"code": "3030", "amount": 2000.00}],
        [{"code": "4001", "amount": 8000.00}, {"code": "4002", "amount": 4000.00}],
    ]

    for rep in range(50):
        for proc_set in procedure_sets:
            age = RNG.randint(20, 75)
            # With modifier (valid)
            cases.append({
                "category": "modifier",
                "subcategory": "modifier_0005_applied",
                "difficulty": "medium",
                "test_type": "billing_validation",
                "clinical_note": modifier_note(proc_set, "0005", "Multiple procedures under same anaesthetic", age),
                "expected_codes": [p["code"] for p in proc_set],
                "expected_valid": True,
                "question": "Is modifier 0005 correctly applied to these multiple procedures?",
                "correct_answer": "Yes. Modifier 0005 applies to multiple procedures under the same anaesthetic: 100%, 75%, 50%, 25% scale.",
                "answer_type": "boolean_with_reason",
                "source_rule": f"modifier:0005:rep{rep}",
                "metadata": {
                    "patient_age": age,
                    "patient_gender": RNG.choice(["M", "F"]),
                    "scheme": RNG.choice(SA_SCHEMES),
                    "modifier": "0005",
                    "procedure_count": len(proc_set),
                },
            })

    # Modifier 0004: Own procedure room
    for rep in range(50):
        amount = RNG.choice([600.0, 1200.0, 2500.0, 4000.0])
        proc = [{"code": "3050", "amount": amount}]
        age = RNG.randint(25, 70)
        cases.append({
            "category": "modifier",
            "subcategory": "modifier_0004_own_rooms",
            "difficulty": "medium",
            "test_type": "billing_validation",
            "clinical_note": modifier_note(proc, "0004", "Procedure in own rooms (+100%)", age),
            "expected_codes": ["3050"],
            "expected_valid": True,
            "question": "Is modifier 0004 (own procedure room) correctly applied?",
            "correct_answer": "Yes. Modifier 0004 allows fee + 100% for procedures performed in own rooms (>30 units).",
            "answer_type": "boolean_with_reason",
            "source_rule": f"modifier:0004:rep{rep}",
            "metadata": {
                "patient_age": age,
                "patient_gender": RNG.choice(["M", "F"]),
                "scheme": RNG.choice(SA_SCHEMES),
                "modifier": "0004",
                "base_amount": amount,
            },
        })

    print(f"{len(cases)} cases")
    return cases


# ── Generator 12: Random Negatives ──────────────────────────────────


def gen_random_negatives(icd10_rows: list[dict], icd10_lookup: dict) -> list[dict]:
    """Sample 5,000 valid clinical-use codes as no-error negative examples."""
    print("  [12/13] Random negatives...", end=" ", flush=True)
    cases = []

    valid_codes = []
    for row in icd10_rows:
        code = (row.get("ICD10_Code") or "").strip()
        valid_clinical = (row.get("Valid_ICD10_ClinicalUse") or "").strip().upper()
        if code and valid_clinical == "Y":
            valid_codes.append(code)

    sample_size = min(35000, len(valid_codes))
    sampled = RNG.sample(valid_codes, sample_size)

    chapter_map = extract_chapter_mapping()

    for code in sampled:
        desc = get_desc(icd10_lookup, code)
        age = RNG.randint(1, 95)
        gender = RNG.choice(["M", "F"])
        chapter_no, chapter_name = get_chapter_for_code(code, chapter_map)

        cases.append({
            "category": "random_negative",
            "subcategory": f"chapter_{chapter_no}",
            "difficulty": "easy",
            "test_type": "single_code",
            "clinical_note": single_code_note(code, desc, age, gender),
            "expected_codes": [code],
            "expected_valid": True,
            "question": f"Is {code} a valid ICD-10 code for clinical use?",
            "correct_answer": f"Yes. {code} ({desc}) is a valid ICD-10 clinical use code from {chapter_name}.",
            "answer_type": "boolean_with_reason",
            "source_rule": f"negative:{code}",
            "metadata": {
                "patient_age": age,
                "patient_gender": gender,
                "scheme": RNG.choice(SA_SCHEMES),
                "chapter": chapter_no,
                "chapter_name": chapter_name,
            },
        })

    print(f"{len(cases)} cases")
    return cases


# ── Generator 13: Clinical Vignettes ────────────────────────────────

_VIGNETTE_TEMPLATES = [
    {
        "codes": ["E11.9", "I10", "E78.0"],
        "descriptions": ["Type 2 diabetes without complications", "Essential hypertension", "Pure hypercholesterolaemia"],
        "narrative": "Patient presents for chronic disease review. Well-controlled Type 2 diabetes on metformin, hypertension on enalapril, and hyperlipidaemia on atorvastatin.",
        "valid": True,
        "difficulty": "medium",
    },
    {
        "codes": ["E10.9", "E11.9"],
        "descriptions": ["Type 1 diabetes without complications", "Type 2 diabetes without complications"],
        "narrative": "Patient has been diagnosed with both Type 1 and Type 2 diabetes.",
        "valid": False,
        "difficulty": "medium",
    },
    {
        "codes": ["S72.0", "W01.0", "I10"],
        "descriptions": ["Fracture of neck of femur", "Fall from slipping", "Essential hypertension"],
        "narrative": "Elderly patient fell at home, sustaining a hip fracture. Known hypertensive on treatment.",
        "valid": True,
        "difficulty": "medium",
    },
    {
        "codes": ["S72.0"],
        "descriptions": ["Fracture of neck of femur"],
        "narrative": "Patient sustained hip fracture. No external cause documented.",
        "valid": False,
        "difficulty": "medium",
    },
    {
        "codes": ["J45.0", "J45.1"],
        "descriptions": ["Predominantly allergic asthma", "Nonallergic asthma"],
        "narrative": "Patient coded with both allergic and nonallergic asthma subtypes.",
        "valid": False,
        "difficulty": "medium",
    },
    {
        "codes": ["I50.0", "I10", "E11.4"],
        "descriptions": ["Congestive heart failure", "Essential hypertension", "Type 2 DM with neuropathy"],
        "narrative": "Elderly diabetic with hypertensive heart failure and peripheral neuropathy.",
        "valid": True,
        "difficulty": "hard",
    },
    {
        "codes": ["B20", "Z21"],
        "descriptions": ["HIV with infectious disease", "Asymptomatic HIV status"],
        "narrative": "HIV-positive patient with Pneumocystis pneumonia coded as both symptomatic and asymptomatic.",
        "valid": False,
        "difficulty": "medium",
    },
    {
        "codes": ["O14.0", "O24.4"],
        "descriptions": ["Moderate pre-eclampsia", "Gestational diabetes"],
        "narrative": "Pregnant woman at 34 weeks with gestational diabetes and pre-eclampsia. Both conditions developing during this pregnancy.",
        "valid": True,
        "difficulty": "hard",
    },
    {
        "codes": ["F20.0", "F25.0"],
        "descriptions": ["Paranoid schizophrenia", "Schizoaffective disorder, manic type"],
        "narrative": "Patient diagnosed with both paranoid schizophrenia and schizoaffective disorder.",
        "valid": False,
        "difficulty": "hard",
    },
    {
        "codes": ["K50.0", "K51.0"],
        "descriptions": ["Crohn disease of small intestine", "Ulcerative colitis, rectum"],
        "narrative": "Patient coded with both Crohn disease and ulcerative colitis.",
        "valid": False,
        "difficulty": "medium",
    },
    {
        "codes": ["G40.0", "E11.9", "I10"],
        "descriptions": ["Localisation-related epilepsy", "Type 2 DM", "Essential hypertension"],
        "narrative": "Patient with epilepsy well-controlled on valproate, concurrent Type 2 diabetes and hypertension on treatment.",
        "valid": True,
        "difficulty": "easy",
    },
    {
        "codes": ["C50.9", "D05.1"],
        "descriptions": ["Malignant neoplasm of breast, unspecified", "Carcinoma in situ of breast"],
        "narrative": "Patient with invasive breast cancer also coded with carcinoma in situ of breast.",
        "valid": False,
        "difficulty": "hard",
    },
    {
        "codes": ["N17.0", "N18.5"],
        "descriptions": ["Acute renal failure with tubular necrosis", "Chronic kidney disease stage 5"],
        "narrative": "Patient coded with both acute renal failure and CKD stage 5.",
        "valid": False,
        "difficulty": "hard",
    },
    {
        "codes": ["J13", "J18.9"],
        "descriptions": ["Pneumococcal pneumonia", "Pneumonia, unspecified"],
        "narrative": "Patient diagnosed with pneumococcal pneumonia but also coded as unspecified pneumonia.",
        "valid": False,
        "difficulty": "medium",
    },
    {
        "codes": ["M05.0", "E03.9", "I10"],
        "descriptions": ["Felty syndrome", "Hypothyroidism, unspecified", "Essential hypertension"],
        "narrative": "Patient with rheumatoid arthritis (Felty syndrome), hypothyroidism, and hypertension. All CDL conditions on treatment.",
        "valid": True,
        "difficulty": "medium",
    },
]


def gen_clinical_vignettes() -> list[dict]:
    """Synthesize multi-code clinical scenarios combining several rules."""
    print("  [13/13] Clinical vignettes...", end=" ", flush=True)
    cases = []

    # Repeat with age/gender variations
    for rep in range(200):
        for template in _VIGNETTE_TEMPLATES:
            age = RNG.randint(18, 85)
            gender = RNG.choice(["M", "F"])

            cases.append({
                "category": "clinical_vignette",
                "subcategory": "valid_multi" if template["valid"] else "invalid_multi",
                "difficulty": template["difficulty"],
                "test_type": "multi_code",
                "clinical_note": multi_code_vignette(
                    template["codes"], template["descriptions"],
                    template["narrative"], age, gender
                ),
                "expected_codes": template["codes"],
                "expected_valid": template["valid"],
                "question": f"Are these codes ({', '.join(template['codes'])}) valid together?",
                "correct_answer": (
                    f"{'Yes' if template['valid'] else 'No'}. "
                    f"{'Valid combination for this clinical scenario.' if template['valid'] else 'Invalid combination — contains conflicting codes.'}"
                ),
                "answer_type": "boolean_with_reason",
                "source_rule": f"vignette:{'-'.join(template['codes'])}:rep{rep}",
                "metadata": {
                    "patient_age": age,
                    "patient_gender": gender,
                    "scheme": RNG.choice(SA_SCHEMES),
                    "code_count": len(template["codes"]),
                },
            })

    print(f"{len(cases)} cases")
    return cases


# ── Main: Assemble everything ───────────────────────────────────────


def main():
    print("=" * 64)
    print("  MEGA-BENCHMARK GENERATOR")
    print("  Expanding 500 -> 50K+ deterministic test cases")
    print("=" * 64)
    print()

    # Load data
    print("Loading data...")
    icd10_rows = load_icd10_csv()
    print(f"  ICD-10 codes: {len(icd10_rows)}")
    tariff_rows = load_tariff_csv()
    print(f"  Tariff codes: {len(tariff_rows)}")
    cdl_rows = load_cdl_csv()
    print(f"  CDL conditions: {len(cdl_rows)}")
    original = load_original_benchmark()
    print(f"  Original benchmark: {len(original)}")

    icd10_lookup = build_icd10_lookup(icd10_rows)
    print(f"  ICD-10 lookup: {len(icd10_lookup)} unique codes")
    print()

    # Run all generators
    print("Generating cases...")
    all_cases = []

    all_cases.extend(gen_code_pair_violations(icd10_lookup))
    all_cases.extend(gen_gender_restrictions(icd10_rows, icd10_lookup))
    all_cases.extend(gen_age_restrictions(icd10_rows, icd10_lookup))
    all_cases.extend(gen_asterisk_dagger(icd10_rows, icd10_lookup))
    all_cases.extend(gen_external_cause(icd10_rows, icd10_lookup))
    all_cases.extend(gen_primary_validity(icd10_rows, icd10_lookup))
    all_cases.extend(gen_pmb_coding(icd10_lookup))
    all_cases.extend(gen_cdl_medication(cdl_rows, icd10_lookup))
    all_cases.extend(gen_scheme_rejections(icd10_lookup))
    all_cases.extend(gen_unbundling())
    all_cases.extend(gen_modifier_scenarios())
    all_cases.extend(gen_random_negatives(icd10_rows, icd10_lookup))
    all_cases.extend(gen_clinical_vignettes())

    # Include original 500 verbatim
    print(f"\n  Including {len(original)} original medqa-sa questions...")
    for item in original:
        item["test_type"] = item.get("test_type", "single_answer")
        item["expected_valid"] = True
        item["expected_codes"] = []
        item["subcategory"] = item.get("subcategory", "original_medqa")
        item["source_rule"] = item.get("source_reference", "medqa-sa")
        item["metadata"] = item.get("metadata", {})
        all_cases.append(item)

    # Assign sequential IDs
    print(f"\n  Assigning IDs to {len(all_cases)} cases...")
    for i, case in enumerate(all_cases):
        case["id"] = f"mega-{i + 1:05d}"

    # Category summary
    category_counts = {}
    difficulty_counts = {}
    valid_counts = {"valid": 0, "invalid": 0}

    for case in all_cases:
        cat = case.get("category", "unknown")
        category_counts[cat] = category_counts.get(cat, 0) + 1

        diff = case.get("difficulty", "unknown")
        difficulty_counts[diff] = difficulty_counts.get(diff, 0) + 1

        if case.get("expected_valid"):
            valid_counts["valid"] += 1
        else:
            valid_counts["invalid"] += 1

    # Write JSONL
    output_path = BENCHMARK_DIR / "mega-benchmark.jsonl"
    BENCHMARK_DIR.mkdir(parents=True, exist_ok=True)

    print(f"\n  Writing {output_path}...")
    with open(output_path, "w", encoding="utf-8") as f:
        for case in all_cases:
            f.write(json.dumps(case, ensure_ascii=False) + "\n")

    # Write metadata
    metadata_path = BENCHMARK_DIR / "mega-metadata.json"
    metadata = {
        "total_cases": len(all_cases),
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "seed": 42,
        "original_benchmark_included": len(original),
        "categories": dict(sorted(category_counts.items())),
        "difficulty_distribution": dict(sorted(difficulty_counts.items())),
        "validity_distribution": valid_counts,
        "generators": [
            "gen_code_pair_violations",
            "gen_gender_restrictions",
            "gen_age_restrictions",
            "gen_asterisk_dagger",
            "gen_external_cause",
            "gen_primary_validity",
            "gen_pmb_coding",
            "gen_cdl_medication",
            "gen_scheme_rejections",
            "gen_unbundling",
            "gen_modifier_scenarios",
            "gen_random_negatives",
            "gen_clinical_vignettes",
        ],
        "data_sources": {
            "code_pairs_ts": str(Path("/Users/hga/visiocode/lib/engine/code-pairs.ts")),
            "icd10_csv": str(DATABASES_DIR / "ICD-10_MIT_2021.csv"),
            "gems_tariff_csv": str(DATABASES_DIR / "GEMS_tariffs_2026.csv"),
            "cdl_csv": str(DATABASES_DIR / "cdl_conditions.csv"),
            "original_benchmark": str(BENCHMARK_DIR / "medqa-sa.jsonl"),
        },
    }

    print(f"  Writing {metadata_path}...")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    # Print summary table
    print()
    print("=" * 64)
    print("  GENERATION COMPLETE")
    print("=" * 64)
    print()
    print(f"  {'Category':<30s} {'Count':>8s}")
    print("  " + "-" * 40)
    for cat in sorted(category_counts.keys()):
        print(f"  {cat:<30s} {category_counts[cat]:>8,d}")
    print("  " + "-" * 40)
    print(f"  {'TOTAL':<30s} {len(all_cases):>8,d}")
    print()
    print(f"  {'Difficulty':<30s} {'Count':>8s}")
    print("  " + "-" * 40)
    for diff in sorted(difficulty_counts.keys()):
        print(f"  {diff:<30s} {difficulty_counts[diff]:>8,d}")
    print()
    print(f"  Valid cases:   {valid_counts['valid']:>8,d}")
    print(f"  Invalid cases: {valid_counts['invalid']:>8,d}")
    print()
    print(f"  Output: {output_path}")
    print(f"  Metadata: {metadata_path}")
    print("=" * 64)


if __name__ == "__main__":
    main()
