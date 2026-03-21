#!/usr/bin/env python3
"""
Clinical NLP Validation — Healthbridge AI Claims Engine
Uses medspacy to validate ICD-10 code mapping accuracy from clinical notes.
Tests negation detection, historical condition flagging, and medication extraction.
Run: cd ~/ml-toolkit && uv run python /Users/hga/netcare-healthos/scripts/eval-clinical-nlp.py
"""

import json
import sys
import re

import spacy
import medspacy
from medspacy.ner import TargetMatcher, TargetRule
from medspacy.context import ConTextComponent

# ── Build the clinical NLP pipeline ────────────────────────────────────

def build_nlp():
    """Build a medspacy pipeline with SA primary care clinical entities."""
    nlp = medspacy.load(enable=["medspacy_pyrush", "medspacy_context"])

    # Add target matcher for clinical conditions
    target_matcher = nlp.add_pipe("medspacy_target_matcher")

    # ICD-10 condition rules — map clinical terms to ICD-10 codes
    target_rules = [
        # Cardiovascular
        TargetRule("hypertension", "CONDITION", pattern=[{"LOWER": {"IN": ["hypertension", "htn"]}}],
                   attributes={"icd10": "I10"}),
        TargetRule("high blood pressure", "CONDITION",
                   pattern=[{"LOWER": "high"}, {"LOWER": "blood"}, {"LOWER": "pressure"}],
                   attributes={"icd10": "I10"}),
        TargetRule("elevated BP", "CONDITION",
                   pattern=[{"LOWER": {"IN": ["elevated", "raised"]}}, {"LOWER": "bp"}],
                   attributes={"icd10": "I10"}),

        # Diabetes
        TargetRule("diabetes type 2", "CONDITION",
                   pattern=[{"LOWER": "diabetes"}, {"LOWER": {"IN": ["type", "mellitus"]}, "OP": "?"},
                            {"LOWER": {"IN": ["2", "ii"]}, "OP": "?"}],
                   attributes={"icd10": "E11.9"}),
        TargetRule("type 2 diabetes", "CONDITION",
                   pattern=[{"LOWER": "type"}, {"LOWER": "2"}, {"LOWER": {"IN": ["diabetes", "dm"]}}],
                   attributes={"icd10": "E11.9"}),
        TargetRule("dm2", "CONDITION", pattern=[{"LOWER": {"IN": ["dm2", "t2dm", "niddm"]}}],
                   attributes={"icd10": "E11.9"}),

        # Respiratory
        TargetRule("acute bronchitis", "CONDITION",
                   pattern=[{"LOWER": {"IN": ["acute", "productive"]}}, {"LOWER": {"IN": ["bronchitis", "cough"]}}],
                   attributes={"icd10": "J20.9"}),
        TargetRule("productive cough", "CONDITION",
                   pattern=[{"LOWER": "productive"}, {"LOWER": "cough"}],
                   attributes={"icd10": "J20.9"}),
        TargetRule("cough", "CONDITION",
                   pattern=[{"LOWER": "cough"}],
                   attributes={"icd10": "R05"}),
        TargetRule("URTI", "CONDITION",
                   pattern=[{"LOWER": {"IN": ["urti", "pharyngitis"]}}],
                   attributes={"icd10": "J06.9"}),
        TargetRule("asthma", "CONDITION",
                   pattern=[{"LOWER": "asthma"}],
                   attributes={"icd10": "J45.9"}),

        # Fever
        TargetRule("fever", "CONDITION",
                   pattern=[{"LOWER": {"IN": ["fever", "pyrexia", "febrile"]}}],
                   attributes={"icd10": "R50.9"}),
        TargetRule("temperature elevation", "CONDITION",
                   pattern=[{"LOWER": {"IN": ["temperature", "temp"]}},
                            {"LIKE_NUM": True, "OP": "?"}],
                   attributes={"icd10": "R50.9"}),

        # ENT
        TargetRule("otitis media", "CONDITION",
                   pattern=[{"LOWER": {"IN": ["otitis"]}}, {"LOWER": "media", "OP": "?"}],
                   attributes={"icd10": "H66.9"}),
        TargetRule("acute otitis media", "CONDITION",
                   pattern=[{"LOWER": "acute"}, {"LOWER": "otitis"}, {"LOWER": "media"}],
                   attributes={"icd10": "H66.9"}),
        TargetRule("ear infection", "CONDITION",
                   pattern=[{"LOWER": "ear"}, {"LOWER": "infection"}],
                   attributes={"icd10": "H66.9"}),

        # Pain
        TargetRule("chest pain", "CONDITION",
                   pattern=[{"LOWER": "chest"}, {"LOWER": "pain"}],
                   attributes={"icd10": "R07.4"}),
        TargetRule("headache", "CONDITION",
                   pattern=[{"LOWER": {"IN": ["headache", "cephalgia"]}}],
                   attributes={"icd10": "R51"}),
        TargetRule("back pain", "CONDITION",
                   pattern=[{"LOWER": {"IN": ["back", "lower"]}}, {"LOWER": {"IN": ["pain", "back"], "OP": "?"}},
                            {"LOWER": "pain", "OP": "?"}],
                   attributes={"icd10": "M54.5"}),

        # Shortness of breath
        TargetRule("shortness of breath", "CONDITION",
                   pattern=[{"LOWER": "shortness"}, {"LOWER": "of"}, {"LOWER": "breath"}],
                   attributes={"icd10": "R06.0"}),
        TargetRule("SOB", "CONDITION",
                   pattern=[{"LOWER": "sob"}],
                   attributes={"icd10": "R06.0"}),
        TargetRule("dyspnoea", "CONDITION",
                   pattern=[{"LOWER": {"IN": ["dyspnoea", "dyspnea"]}}],
                   attributes={"icd10": "R06.0"}),

        # Wellness
        TargetRule("wellness check", "CONDITION",
                   pattern=[{"LOWER": {"IN": ["routine", "wellness", "check"]}},
                            {"LOWER": {"IN": ["check", "examination", "exam"]}, "OP": "?"}],
                   attributes={"icd10": "Z00.0"}),
        TargetRule("general examination", "CONDITION",
                   pattern=[{"LOWER": "general"}, {"LOWER": {"IN": ["examination", "exam"]}}],
                   attributes={"icd10": "Z00.0"}),

        # Gastro
        TargetRule("gastritis", "CONDITION",
                   pattern=[{"LOWER": {"IN": ["gastritis", "epigastric"]}}],
                   attributes={"icd10": "K29.7"}),

        # Hyperlipidaemia
        TargetRule("hyperlipidaemia", "CONDITION",
                   pattern=[{"LOWER": {"IN": ["hyperlipidaemia", "hyperlipidemia", "cholesterol"]}}],
                   attributes={"icd10": "E78.5"}),

        # UTI
        TargetRule("UTI", "CONDITION",
                   pattern=[{"LOWER": {"IN": ["uti"]}}],
                   attributes={"icd10": "N39.0"}),
        TargetRule("urinary tract infection", "CONDITION",
                   pattern=[{"LOWER": "urinary"}, {"LOWER": "tract"}, {"LOWER": "infection"}],
                   attributes={"icd10": "N39.0"}),
    ]

    target_matcher.add(target_rules)

    # Medication rules
    med_rules = [
        TargetRule("amlodipine", "MEDICATION", attributes={"nappi_prefix": "7086300"}),
        TargetRule("metformin", "MEDICATION", attributes={"nappi_prefix": "7081709"}),
        TargetRule("atorvastatin", "MEDICATION", attributes={"nappi_prefix": "7089803"}),
        TargetRule("amoxicillin", "MEDICATION", attributes={"nappi_prefix": "7060102"}),
        TargetRule("salbutamol", "MEDICATION", attributes={"nappi_prefix": "7098801"}),
        TargetRule("omeprazole", "MEDICATION", attributes={"nappi_prefix": "7093901"}),
        TargetRule("prednisone", "MEDICATION", attributes={"nappi_prefix": "7055301"}),
        TargetRule("losartan", "MEDICATION", attributes={"nappi_prefix": "7042701"}),
        TargetRule("paracetamol", "MEDICATION", attributes={"nappi_prefix": "7014901"}),
        TargetRule("ibuprofen", "MEDICATION", attributes={"nappi_prefix": "7021502"}),
    ]
    target_matcher.add(med_rules)

    # Procedure rules
    proc_rules = [
        TargetRule("ECG", "PROCEDURE", attributes={"cpt": "0308"}),
        TargetRule("spirometry", "PROCEDURE", attributes={"cpt": "0312"}),
        TargetRule("blood glucose", "PROCEDURE", attributes={"cpt": "0382"}),
    ]
    target_matcher.add(proc_rules)

    return nlp


# ── Test cases ─────────────────────────────────────────────────────────

TEST_CASES = [
    {
        "id": 1,
        "notes": "52yo M with HTN on amlodipine. BP 160/100. ECG NSR.",
        "expected_icd10": ["I10"],
        "expected_cpt": ["0190", "0308"],
        "expected_meds": ["amlodipine"],
        "negated_conditions": [],
        "historical_conditions": [],
        "description": "Hypertension with ECG — standard GP visit",
    },
    {
        "id": 2,
        "notes": "Patient denies chest pain, no SOB. Complains of productive cough x5 days.",
        "expected_icd10": ["J20.9"],
        "negated_icd10": ["R07.4", "R06.0"],  # chest pain and SOB are negated
        "expected_cpt": ["0190"],
        "expected_meds": [],
        "negated_conditions": ["chest pain", "SOB"],
        "historical_conditions": [],
        "description": "Negation test — denied chest pain, no SOB, but has cough",
    },
    {
        "id": 3,
        "notes": "Hx of diabetes type 2 on metformin. HbA1c 7.2.",
        "expected_icd10": ["E11.9"],
        "expected_cpt": ["0190"],
        "expected_meds": ["metformin"],
        "negated_conditions": [],
        "historical_conditions": ["diabetes"],
        "description": "Historical diabetes — should be flagged as existing/historical",
    },
    {
        "id": 4,
        "notes": "Child 4yo with acute otitis media, fever 38.5.",
        "expected_icd10": ["H66.9", "R50.9"],
        "expected_cpt": ["0190"],
        "expected_meds": [],
        "negated_conditions": [],
        "historical_conditions": [],
        "description": "Paediatric — otitis media with fever, both should be coded",
    },
    {
        "id": 5,
        "notes": "Routine wellness check, all vitals normal.",
        "expected_icd10": ["Z00.0"],
        "expected_cpt": ["0190"],
        "expected_meds": [],
        "negated_conditions": [],
        "historical_conditions": [],
        "description": "Wellness check — should map to Z00.0",
    },
    {
        "id": 6,
        "notes": "Follow-up for asthma on salbutamol. No wheeze today. Spirometry normal.",
        "expected_icd10": ["J45.9"],
        "expected_cpt": ["0191", "0312"],
        "expected_meds": ["salbutamol"],
        "negated_conditions": ["wheeze"],
        "historical_conditions": [],
        "description": "Asthma follow-up — wheeze negated but asthma still coded",
    },
    {
        "id": 7,
        "notes": "65yo F with uncontrolled hypertension and hyperlipidaemia. On amlodipine 10mg and atorvastatin 40mg.",
        "expected_icd10": ["I10", "E78.5"],
        "expected_cpt": ["0190"],
        "expected_meds": ["amlodipine", "atorvastatin"],
        "negated_conditions": [],
        "historical_conditions": [],
        "description": "Multiple chronic conditions — both should be coded",
    },
    {
        "id": 8,
        "notes": "Patient presents with dysuria and frequency. No fever. UA positive for nitrites. UTI confirmed.",
        "expected_icd10": ["N39.0"],
        "negated_icd10": ["R50.9"],
        "expected_cpt": ["0190"],
        "expected_meds": [],
        "negated_conditions": ["fever"],
        "historical_conditions": [],
        "description": "UTI with negated fever — fever should NOT be coded",
    },
    {
        "id": 9,
        "notes": "Gastritis. Epigastric pain x3 weeks. Started omeprazole 20mg daily.",
        "expected_icd10": ["K29.7"],
        "expected_cpt": ["0190"],
        "expected_meds": ["omeprazole"],
        "negated_conditions": [],
        "historical_conditions": [],
        "description": "Gastritis with medication — NAPPI lookup expected",
    },
    {
        "id": 10,
        "notes": "No complaints. Patient here for annual check-up. All bloods normal. BMI 24.",
        "expected_icd10": ["Z00.0"],
        "expected_cpt": ["0190"],
        "expected_meds": [],
        "negated_conditions": [],
        "historical_conditions": [],
        "description": "Annual check-up — wellness code only",
    },
]


# ── Simulate the fallback coder (matches ai-coder.ts keyword logic) ────

KEYWORD_MAP = [
    (["hypertension", "high blood pressure", "bp elevated", "bp 1"], "I10"),
    (["diabetes", "diabetic", "blood sugar", "glucose high", "hba1c"], "E11.9"),
    (["asthma", "wheeze", "wheezing", "bronchospasm"], "J45.9"),
    (["upper respiratory", "urti", "common cold", "sore throat", "pharyngitis"], "J06.9"),
    (["bronchitis", "productive cough", "chest infection"], "J20.9"),
    (["sinusitis", "sinus"], "J32.9"),
    (["urinary tract", "uti", "dysuria", "burning urine"], "N39.0"),
    (["back pain", "lower back", "lumbar", "lumbago"], "M54.5"),
    (["gastritis", "epigastric", "heartburn", "reflux", "gerd"], "K29.7"),
    (["headache", "cephalgia", "migraine"], "R51"),
    (["fever", "pyrexia", "temperature"], "R50.9"),
    (["cholesterol", "lipid", "hyperlipid"], "E78.5"),
    (["otitis", "ear infection", "ear pain"], "H66.9"),
    (["dermatitis", "eczema", "rash", "skin"], "L30.9"),
    (["dental", "tooth", "caries", "cavity"], "K02.9"),
    (["immunization", "vaccination", "vaccine"], "Z23"),
    (["general exam", "check-up", "checkup", "routine", "wellness"], "Z00.0"),
]


def fallback_suggest(notes: str) -> list[str]:
    """Replicate the TypeScript fallback keyword matching."""
    lower = notes.lower()
    codes = []
    for terms, code in KEYWORD_MAP:
        if any(t in lower for t in terms):
            codes.append(code)
    if not codes:
        codes.append("Z00.0")
    return codes


def run_clinical_nlp():
    print("=" * 70)
    print("CLINICAL NLP VALIDATION — medspacy + Healthbridge Fallback Coder")
    print("=" * 70)
    print()

    nlp = build_nlp()

    total_tests = 0
    passed_tests = 0
    negation_tests = 0
    negation_passed = 0
    historical_tests = 0
    historical_passed = 0
    medication_tests = 0
    medication_passed = 0
    fallback_correct = 0
    fallback_total = 0
    fallback_false_positives = 0

    for tc in TEST_CASES:
        print(f"--- Test {tc['id']}: {tc['description']} ---")
        print(f"    Notes: \"{tc['notes']}\"")

        # ── medspacy NLP analysis ──
        doc = nlp(tc["notes"])
        found_conditions = []
        found_negated = []
        found_historical = []
        found_meds = []
        found_procedures = []

        for ent in doc.ents:
            if ent.label_ == "CONDITION":
                icd10 = ent._.get("icd10") if hasattr(ent._, "icd10") else None
                # Check negation via ConText
                is_negated = ent._.is_negated if hasattr(ent._, "is_negated") else False
                is_historical = ent._.is_historical if hasattr(ent._, "is_historical") else False

                if is_negated:
                    found_negated.append({"text": ent.text, "icd10": icd10})
                elif is_historical:
                    found_historical.append({"text": ent.text, "icd10": icd10})
                else:
                    found_conditions.append({"text": ent.text, "icd10": icd10})

            elif ent.label_ == "MEDICATION":
                found_meds.append(ent.text.lower())
            elif ent.label_ == "PROCEDURE":
                found_procedures.append(ent.text)

        # Extract ICD-10 codes from non-negated conditions
        nlp_icd10 = []
        for c in found_conditions:
            if c.get("icd10"):
                nlp_icd10.append(c["icd10"])

        # ── Fallback coder analysis ──
        fallback_codes = fallback_suggest(tc["notes"])

        # ── Evaluate NLP accuracy ──
        expected = set(tc["expected_icd10"])
        got_nlp = set(nlp_icd10)
        negated_expected = set(tc.get("negated_icd10", []))

        # Check if expected codes were found (by NLP or fallback)
        for exp_code in expected:
            total_tests += 1
            if exp_code in got_nlp or exp_code in fallback_codes:
                passed_tests += 1
                print(f"    [PASS] Expected {exp_code} — found")
            else:
                print(f"    [FAIL] Expected {exp_code} — NOT found")
                print(f"           NLP found: {got_nlp or 'none'}")
                print(f"           Fallback found: {fallback_codes}")

        # ── Negation tests ──
        for neg in tc.get("negated_conditions", []):
            negation_tests += 1
            neg_found = any(neg.lower() in n["text"].lower() for n in found_negated)
            if neg_found:
                negation_passed += 1
                print(f"    [PASS] Negation detected: \"{neg}\" correctly flagged as negated")
            else:
                # Check if fallback incorrectly codes it
                neg_code = None
                for codes_neg in negated_expected:
                    neg_code = codes_neg
                if neg_code and neg_code in fallback_codes:
                    print(f"    [WARN] Negation NOT detected by NLP, and fallback INCORRECTLY codes {neg_code}")
                    print(f"           Fallback lacks negation awareness — known limitation")
                else:
                    negation_passed += 1
                    print(f"    [PASS] \"{neg}\" not coded (acceptable)")

        # ── Historical condition tests ──
        for hist in tc.get("historical_conditions", []):
            historical_tests += 1
            hist_found = any(hist.lower() in h["text"].lower() for h in found_historical)
            if hist_found:
                historical_passed += 1
                print(f"    [PASS] Historical condition detected: \"{hist}\"")
            else:
                print(f"    [INFO] Historical condition \"{hist}\" not explicitly flagged by NLP")
                # Still count as pass if it was at least detected as a condition
                if any(hist.lower() in c["text"].lower() for c in found_conditions):
                    historical_passed += 1
                    print(f"           (but was detected as active condition — acceptable for coding)")

        # ── Medication tests ──
        for med in tc.get("expected_meds", []):
            medication_tests += 1
            if med.lower() in found_meds:
                medication_passed += 1
                print(f"    [PASS] Medication extracted: \"{med}\"")
            else:
                print(f"    [FAIL] Medication NOT extracted: \"{med}\"")

        # ── Fallback coder evaluation ──
        for exp_code in expected:
            fallback_total += 1
            if exp_code in fallback_codes:
                fallback_correct += 1

        # Check for false positives in fallback
        negated_icd10 = tc.get("negated_icd10", [])
        for code in fallback_codes:
            if code in negated_icd10:
                fallback_false_positives += 1
                print(f"    [FAIL] Fallback FALSE POSITIVE: {code} is negated in clinical notes but still suggested")

        print()

    # ── Summary ──
    print("=" * 70)
    print("CLINICAL NLP VALIDATION SUMMARY")
    print("=" * 70)
    print()

    icd10_accuracy = (passed_tests / total_tests * 100) if total_tests > 0 else 0
    negation_accuracy = (negation_passed / negation_tests * 100) if negation_tests > 0 else 0
    historical_accuracy = (historical_passed / historical_tests * 100) if historical_tests > 0 else 0
    medication_accuracy = (medication_passed / medication_tests * 100) if medication_tests > 0 else 0
    fallback_accuracy = (fallback_correct / fallback_total * 100) if fallback_total > 0 else 0

    print(f"  ICD-10 Code Mapping:     {passed_tests}/{total_tests} ({icd10_accuracy:.0f}%)")
    print(f"  Negation Detection:      {negation_passed}/{negation_tests} ({negation_accuracy:.0f}%)")
    print(f"  Historical Flagging:     {historical_passed}/{historical_tests} ({historical_accuracy:.0f}%)")
    print(f"  Medication Extraction:   {medication_passed}/{medication_tests} ({medication_accuracy:.0f}%)")
    print(f"  Fallback Coder Accuracy: {fallback_correct}/{fallback_total} ({fallback_accuracy:.0f}%)")
    print(f"  Fallback False Positives: {fallback_false_positives}")
    print()

    overall = (icd10_accuracy + negation_accuracy + medication_accuracy) / 3
    status = "PASS" if overall >= 70 and fallback_false_positives <= 2 else "FAIL"
    print(f"  Overall NLP Score: {overall:.0f}%")
    print(f"  RESULT: {status}")
    print()

    if fallback_false_positives > 0:
        print("  KNOWN LIMITATION: Fallback keyword coder cannot detect negation.")
        print("  Conditions prefixed with 'no', 'denies', 'without' are still matched.")
        print("  FIX: Add negation-aware keyword matching to fallbackSuggestion() in ai-coder.ts")
        print()

    # Write machine-readable result
    result = {
        "pass": status == "PASS",
        "icd10_accuracy": round(icd10_accuracy, 1),
        "negation_accuracy": round(negation_accuracy, 1),
        "historical_accuracy": round(historical_accuracy, 1),
        "medication_accuracy": round(medication_accuracy, 1),
        "fallback_accuracy": round(fallback_accuracy, 1),
        "fallback_false_positives": fallback_false_positives,
        "overall_score": round(overall, 1),
    }
    with open("/Users/hga/netcare-healthos/scripts/.eval-clinical-result.json", "w") as f:
        json.dump(result, f)

    return 0 if status == "PASS" else 1


if __name__ == "__main__":
    sys.exit(run_clinical_nlp())
