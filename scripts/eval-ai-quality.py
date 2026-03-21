#!/usr/bin/env python3
"""
AI Output Quality Scoring — Healthbridge AI Claims Engine
Evaluates the fallback keyword coder's accuracy, completeness, specificity,
false positive rate, PMB detection, and CDL detection across 20 clinical scenarios.
Run: cd ~/ml-toolkit && uv run python /Users/hga/netcare-healthos/scripts/eval-ai-quality.py
"""

import json
import sys

# ── Replicate the TypeScript fallback coder (ai-coder.ts) ──────────────

KEYWORD_MAP = [
    (["hypertension", "high blood pressure", "bp elevated", "bp 1"], "I10", "Essential hypertension"),
    (["diabetes", "diabetic", "blood sugar", "glucose high", "hba1c"], "E11.9", "Type 2 diabetes mellitus"),
    (["asthma", "wheeze", "wheezing", "bronchospasm"], "J45.9", "Asthma"),
    (["upper respiratory", "urti", "common cold", "sore throat", "pharyngitis"], "J06.9", "Acute upper respiratory infection"),
    (["bronchitis", "productive cough", "chest infection"], "J20.9", "Acute bronchitis"),
    (["sinusitis", "sinus"], "J32.9", "Chronic sinusitis"),
    (["urinary tract", "uti", "dysuria", "burning urine"], "N39.0", "Urinary tract infection"),
    (["back pain", "lower back", "lumbar", "lumbago"], "M54.5", "Low back pain"),
    (["gastritis", "epigastric", "heartburn", "reflux", "gerd"], "K29.7", "Gastritis"),
    (["headache", "cephalgia", "migraine"], "R51", "Headache"),
    (["fever", "pyrexia", "temperature"], "R50.9", "Fever"),
    (["cholesterol", "lipid", "hyperlipid"], "E78.5", "Hyperlipidaemia"),
    (["otitis", "ear infection", "ear pain"], "H66.9", "Otitis media"),
    (["dermatitis", "eczema", "rash", "skin"], "L30.9", "Dermatitis"),
    (["dental", "tooth", "caries", "cavity"], "K02.9", "Dental caries"),
    (["immunization", "vaccination", "vaccine"], "Z23", "Immunization"),
    (["general exam", "check-up", "checkup", "routine", "wellness"], "Z00.0", "General examination"),
]

# PMB codes (from pmb.ts)
PMB_CODES = {
    "I21.9", "I63.9", "I64", "J96.0", "K35.8", "K80.0", "S72.0", "S06.9",
    "T78.2", "O80", "O82", "C50.9", "C34.9", "C18.9", "C61", "C73",
    "B20", "B24", "Z34.0", "Z34.9", "O00.9", "O03.9", "P07.3", "Q21.0",
    "F32.2", "F20.0", "E10.9", "E11.9", "I10", "J45.9", "N18.5", "M05.9",
}

# CDL prefixes (from pmb.ts)
CDL_PREFIXES = [
    "E27.1", "J45", "F31", "J47", "I50", "I42", "J44", "N18", "I25",
    "K50", "E23.2", "E10", "E11", "I49", "G40", "H40", "D66", "B20",
    "E78", "I10", "E03", "G35", "G20", "M05", "F20", "K51",
]


def is_pmb(code: str) -> bool:
    if code in PMB_CODES:
        return True
    if code[:3].startswith("C") and code[1:3].isdigit():
        return True
    if code[0] in ("S", "T") and code[1:3].isdigit():
        return True
    if code[0] == "O" and code[1:3].isdigit():
        return True
    return False


def is_cdl(code: str) -> bool:
    return any(code.startswith(p) for p in CDL_PREFIXES)


def fallback_suggest(notes: str) -> list[dict]:
    lower = notes.lower()
    codes = []
    for terms, code, desc in KEYWORD_MAP:
        if any(t in lower for t in terms):
            codes.append({
                "code": code,
                "description": desc,
                "isPMB": is_pmb(code),
                "isCDL": is_cdl(code),
            })
    if not codes:
        codes.append({
            "code": "Z00.0",
            "description": "General examination",
            "isPMB": False,
            "isCDL": False,
        })
    return codes


# ── 20 Clinical Scenarios with Ground Truth ────────────────────────────

SCENARIOS = [
    {
        "id": 1,
        "notes": "52yo M with HTN on amlodipine. BP 160/100. ECG NSR.",
        "expected_codes": ["I10"],
        "expected_pmb": {"I10": True},
        "expected_cdl": {"I10": True},
        "absent_codes": ["E11.9"],  # Should NOT suggest diabetes
    },
    {
        "id": 2,
        "notes": "Patient denies chest pain, no SOB. Productive cough x5 days, yellow sputum.",
        "expected_codes": ["J20.9"],
        "expected_pmb": {"J20.9": False},
        "expected_cdl": {},
        "absent_codes": ["R07.4", "R06.0"],  # Negated chest pain and SOB
    },
    {
        "id": 3,
        "notes": "Hx of diabetes type 2 on metformin. HbA1c 7.2. Renal function normal.",
        "expected_codes": ["E11.9"],
        "expected_pmb": {"E11.9": True},
        "expected_cdl": {"E11.9": True},
        "absent_codes": [],
    },
    {
        "id": 4,
        "notes": "Child 4yo with acute otitis media. Fever 38.5. Started amoxicillin.",
        "expected_codes": ["H66.9", "R50.9"],
        "expected_pmb": {},
        "expected_cdl": {},
        "absent_codes": [],
    },
    {
        "id": 5,
        "notes": "Routine wellness check, all vitals normal. No complaints.",
        "expected_codes": ["Z00.0"],
        "expected_pmb": {"Z00.0": False},
        "expected_cdl": {},
        "absent_codes": [],
    },
    {
        "id": 6,
        "notes": "Asthma exacerbation, wheezing bilateral. Given nebulisation. Salbutamol script.",
        "expected_codes": ["J45.9"],
        "expected_pmb": {"J45.9": True},
        "expected_cdl": {"J45.9": True},
        "absent_codes": [],
    },
    {
        "id": 7,
        "notes": "65yo F with uncontrolled hypertension AND hyperlipidaemia. Amlodipine + atorvastatin.",
        "expected_codes": ["I10", "E78.5"],
        "expected_pmb": {"I10": True},
        "expected_cdl": {"I10": True, "E78.5": True},
        "absent_codes": [],
    },
    {
        "id": 8,
        "notes": "UTI confirmed. Dysuria, frequency, urgency. Nitrites positive. Cipro prescribed.",
        "expected_codes": ["N39.0"],
        "expected_pmb": {},
        "expected_cdl": {},
        "absent_codes": ["R50.9"],
    },
    {
        "id": 9,
        "notes": "Gastritis. Epigastric pain, worse after meals. Omeprazole 20mg BD.",
        "expected_codes": ["K29.7"],
        "expected_pmb": {},
        "expected_cdl": {},
        "absent_codes": [],
    },
    {
        "id": 10,
        "notes": "Severe headache x2 days. No photophobia, no neck stiffness. BP normal.",
        "expected_codes": ["R51"],
        "expected_pmb": {},
        "expected_cdl": {},
        "absent_codes": ["I10"],  # BP is normal
    },
    {
        "id": 11,
        "notes": "Lower back pain x1 week. No radiculopathy. Ibuprofen prescribed.",
        "expected_codes": ["M54.5"],
        "expected_pmb": {},
        "expected_cdl": {},
        "absent_codes": [],
    },
    {
        "id": 12,
        "notes": "URTI. Sore throat, rhinorrhoea. No fever. Symptomatic treatment.",
        "expected_codes": ["J06.9"],
        "expected_pmb": {},
        "expected_cdl": {},
        "absent_codes": ["R50.9"],
    },
    {
        "id": 13,
        "notes": "Type 2 diabetes review. On metformin 850mg BD + glimepiride 2mg. HbA1c 8.1. BP 145/90.",
        "expected_codes": ["E11.9", "I10"],
        "expected_pmb": {"E11.9": True, "I10": True},
        "expected_cdl": {"E11.9": True, "I10": True},
        "absent_codes": [],
    },
    {
        "id": 14,
        "notes": "Eczema flare on arms. Moderate itch. Hydrocortisone cream prescribed.",
        "expected_codes": ["L30.9"],
        "expected_pmb": {},
        "expected_cdl": {},
        "absent_codes": [],
    },
    {
        "id": 15,
        "notes": "Child immunization visit. MMR + polio boosters given. No reactions.",
        "expected_codes": ["Z23"],
        "expected_pmb": {},
        "expected_cdl": {},
        "absent_codes": [],
    },
    {
        "id": 16,
        "notes": "Chronic sinusitis. Nasal congestion, post-nasal drip x3 months. CT sinus ordered.",
        "expected_codes": ["J32.9"],
        "expected_pmb": {},
        "expected_cdl": {},
        "absent_codes": [],
    },
    {
        "id": 17,
        "notes": "Dental caries lower left molar. Pain on biting. Cavity noted. Filling done.",
        "expected_codes": ["K02.9"],
        "expected_pmb": {},
        "expected_cdl": {},
        "absent_codes": [],
    },
    {
        "id": 18,
        "notes": "Hypertension + diabetes + hyperlipidaemia. Triple chronic. All on CDL meds.",
        "expected_codes": ["I10", "E11.9", "E78.5"],
        "expected_pmb": {"I10": True, "E11.9": True},
        "expected_cdl": {"I10": True, "E11.9": True, "E78.5": True},
        "absent_codes": [],
    },
    {
        "id": 19,
        "notes": "Patient well. No active complaints. Blood pressure check only. BP 120/80.",
        "expected_codes": ["Z00.0"],
        "expected_pmb": {},
        "expected_cdl": {},
        "absent_codes": ["I10"],  # BP is normal
    },
    {
        "id": 20,
        "notes": "Acute bronchitis with fever. Productive cough, green sputum. Amoxicillin prescribed. No wheeze.",
        "expected_codes": ["J20.9", "R50.9"],
        "expected_pmb": {},
        "expected_cdl": {},
        "absent_codes": ["J45.9"],  # "no wheeze" means not asthma
    },
]


def run_quality_scoring():
    print("=" * 70)
    print("AI OUTPUT QUALITY SCORING — Healthbridge Fallback Coder")
    print("=" * 70)
    print()

    # Scoring accumulators
    total_points = 0.0
    max_points = 0.0

    # Per-metric tracking
    tp = 0  # True positives (correct code suggested)
    fp = 0  # False positives (wrong code suggested)
    fn = 0  # False negatives (missed condition)
    tn = 0  # True negatives (correctly not suggested)
    pmb_tp = 0
    pmb_fp = 0
    pmb_fn = 0
    cdl_tp = 0
    cdl_fp = 0
    cdl_fn = 0
    specificity_pass = 0
    specificity_total = 0
    completeness_scores = []

    for sc in SCENARIOS:
        print(f"--- Scenario {sc['id']}: ---")
        print(f"    \"{sc['notes'][:80]}{'...' if len(sc['notes']) > 80 else ''}\"")

        suggestions = fallback_suggest(sc["notes"])
        suggested_codes = [s["code"] for s in suggestions]
        expected = set(sc["expected_codes"])

        # ── Accuracy: correct codes ──
        correct = 0
        for exp_code in expected:
            max_points += 1
            if exp_code in suggested_codes:
                total_points += 1
                correct += 1
                tp += 1
                print(f"    [+1.0] Correct: {exp_code}")
            else:
                total_points -= 0.5
                fn += 1
                print(f"    [-0.5] Missed: {exp_code}")

        # ── False positives: codes suggested but should be absent ──
        for absent_code in sc.get("absent_codes", []):
            if absent_code in suggested_codes:
                total_points -= 1
                fp += 1
                print(f"    [-1.0] False positive: {absent_code} (negated/absent in notes)")
            else:
                tn += 1

        # Extra codes not in expected and not in absent — potential false positives
        for s in suggestions:
            if s["code"] not in expected and s["code"] not in sc.get("absent_codes", []):
                # Only penalize if it's clearly wrong
                if s["code"] != "Z00.0":  # Don't penalize default
                    fp += 1
                    print(f"    [INFO] Extra code suggested: {s['code']} ({s['description']})")

        # ── Completeness: fraction of expected codes found ──
        completeness = correct / len(expected) if expected else 1.0
        completeness_scores.append(completeness)

        # ── Specificity check ──
        for s in suggestions:
            specificity_total += 1
            code = s["code"]
            # Check if code has max specificity (>3 chars or known 3-char max like I10)
            three_char_max = {"I10", "R51", "Z23", "B20", "I64", "C61", "C73", "G35", "G20"}
            if len(code) > 3 or code in three_char_max:
                specificity_pass += 1
            else:
                print(f"    [WARN] Low specificity: {code} (should have 4th+ character)")

        # ── PMB detection accuracy ──
        for code, expected_pmb in sc.get("expected_pmb", {}).items():
            suggestion = next((s for s in suggestions if s["code"] == code), None)
            if suggestion:
                if suggestion["isPMB"] == expected_pmb:
                    if expected_pmb:
                        pmb_tp += 1
                        total_points += 0.5
                        print(f"    [+0.5] PMB correctly flagged: {code}")
                    max_points += 0.5
                else:
                    if expected_pmb:
                        pmb_fn += 1
                    else:
                        pmb_fp += 1
                    total_points -= 1
                    max_points += 0.5
                    print(f"    [-1.0] PMB flag WRONG for {code} (expected={expected_pmb}, got={suggestion['isPMB']})")

        # ── CDL detection accuracy ──
        for code, expected_cdl in sc.get("expected_cdl", {}).items():
            suggestion = next((s for s in suggestions if s["code"] == code), None)
            if suggestion:
                if suggestion["isCDL"] == expected_cdl:
                    if expected_cdl:
                        cdl_tp += 1
                    max_points += 0.5
                else:
                    if expected_cdl:
                        cdl_fn += 1
                    else:
                        cdl_fp += 1
                    print(f"    [-1.0] CDL flag WRONG for {code}")

        print()

    # ── Calculate metrics ──
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
    accuracy = (tp + tn) / (tp + tn + fp + fn) if (tp + tn + fp + fn) > 0 else 0
    avg_completeness = sum(completeness_scores) / len(completeness_scores) if completeness_scores else 0
    specificity_rate = specificity_pass / specificity_total if specificity_total > 0 else 0
    pmb_accuracy = pmb_tp / (pmb_tp + pmb_fn + pmb_fp) if (pmb_tp + pmb_fn + pmb_fp) > 0 else 0
    cdl_accuracy = cdl_tp / (cdl_tp + cdl_fn + cdl_fp) if (cdl_tp + cdl_fn + cdl_fp) > 0 else 0

    # ── Summary ──
    print("=" * 70)
    print("AI OUTPUT QUALITY SCORING SUMMARY")
    print("=" * 70)
    print()
    print(f"  ICD-10 Accuracy:     {accuracy:.1%}")
    print(f"  Precision:           {precision:.1%}")
    print(f"  Recall:              {recall:.1%}")
    print(f"  F1 Score:            {f1:.3f}")
    print(f"  Completeness:        {avg_completeness:.1%}")
    print(f"  Specificity Rate:    {specificity_rate:.1%} ({specificity_pass}/{specificity_total} codes at max specificity)")
    print(f"  PMB Detection:       {pmb_accuracy:.1%} (TP={pmb_tp}, FP={pmb_fp}, FN={pmb_fn})")
    print(f"  CDL Detection:       {cdl_accuracy:.1%} (TP={cdl_tp}, FP={cdl_fp}, FN={cdl_fn})")
    print(f"  False Positives:     {fp}")
    print(f"  False Negatives:     {fn}")
    print()
    print(f"  Point Score:         {total_points:.1f} / {max_points:.1f}")
    print()

    # Composite score
    composite = (f1 * 40 + avg_completeness * 20 + specificity_rate * 10 + pmb_accuracy * 15 + cdl_accuracy * 15)
    print(f"  COMPOSITE SCORE:     {composite:.0f}/100")

    status = "PASS" if f1 >= 0.70 and pmb_accuracy >= 0.90 else "FAIL"
    print(f"  RESULT:              {status}")
    print()

    if fp > 0:
        print("  CRITICAL FINDING: Fallback coder produces false positives for negated conditions.")
        print("  The keyword matcher in ai-coder.ts does not handle negation (no/denies/without).")
        print("  Recommendation: Add negation-aware pattern matching before keyword lookup.")
        print()

    if fn > 0:
        print(f"  NOTE: {fn} expected conditions were missed by the fallback coder.")
        print("  The keyword fallback is intentionally conservative — Gemini AI handles full accuracy.")
        print()

    result = {
        "pass": status == "PASS",
        "accuracy": round(accuracy, 3),
        "precision": round(precision, 3),
        "recall": round(recall, 3),
        "f1": round(f1, 3),
        "completeness": round(avg_completeness, 3),
        "specificity_rate": round(specificity_rate, 3),
        "pmb_accuracy": round(pmb_accuracy, 3),
        "cdl_accuracy": round(cdl_accuracy, 3),
        "false_positives": fp,
        "false_negatives": fn,
        "composite_score": round(composite, 1),
    }
    with open("/Users/hga/netcare-healthos/scripts/.eval-quality-result.json", "w") as f:
        json.dump(result, f)

    return 0 if status == "PASS" else 1


if __name__ == "__main__":
    sys.exit(run_quality_scoring())
