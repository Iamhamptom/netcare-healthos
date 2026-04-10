#!/usr/bin/env python3
"""
Clinical Templates — Deterministic clinical note generators for benchmark cases.

These are NOT LLM-generated. Each function produces a reproducible clinical note
from structured inputs, suitable for testing coding validation rules.

Every template is intentionally formulaic so the benchmark tests the AI's
coding logic, not its ability to parse ambiguous prose.
"""

import random
from typing import Optional

# ── Age generation helpers ──────────────────────────────────────────

_ADULT_AGES = list(range(18, 85))
_PAEDIATRIC_AGES = list(range(0, 18))
_GERIATRIC_AGES = list(range(65, 95))

SA_SCHEMES = ["Discovery", "GEMS", "Bonitas", "Momentum", "Medihelp", "Bestmed"]


def _pick_age(rng: random.Random, category: str = "adult") -> int:
    """Pick a plausible age for a given category."""
    if category == "paediatric":
        return rng.choice(_PAEDIATRIC_AGES)
    elif category == "geriatric":
        return rng.choice(_GERIATRIC_AGES)
    return rng.choice(_ADULT_AGES)


def _pick_scheme(rng: random.Random) -> str:
    return rng.choice(SA_SCHEMES)


# ── Template functions ──────────────────────────────────────────────


def pair_violation_note(
    code1: str, desc1: str, code2: str, desc2: str,
    age: int = 55, gender: str = "M"
) -> str:
    """Generate a clinical note with two potentially conflicting codes.

    Used for code pair mutual exclusion testing.
    """
    sex = "male" if gender == "M" else "female"
    return (
        f"CLINICAL NOTE\n"
        f"Patient: {age}-year-old {sex}\n"
        f"Presenting complaint: {desc1}\n"
        f"Additional diagnosis: {desc2}\n"
        f"Assessment: Patient diagnosed with {desc1} ({code1}). "
        f"Also diagnosed with {desc2} ({code2}).\n"
        f"Codes assigned: {code1}, {code2}"
    )


def single_code_note(
    code: str, desc: str, age: int = 55, gender: str = "M"
) -> str:
    """Generate a clean clinical note with a single valid code."""
    sex = "male" if gender == "M" else "female"
    return (
        f"CLINICAL NOTE\n"
        f"Patient: {age}-year-old {sex}\n"
        f"Presenting complaint: {desc}\n"
        f"Assessment: {desc}.\n"
        f"Code assigned: {code}"
    )


def gender_note(
    code: str, desc: str, gender: str, correct_gender: str,
    age: int = 45
) -> str:
    """Generate a clinical note testing gender-specific code validity.

    Args:
        code: The ICD-10 code being tested
        desc: Description of the condition
        gender: The gender stated in the note (M or F)
        correct_gender: The gender this code is valid for (M or F)
        age: Patient age
    """
    sex = "male" if gender == "M" else "female"
    return (
        f"CLINICAL NOTE\n"
        f"Patient: {age}-year-old {sex}\n"
        f"Presenting complaint: {desc}\n"
        f"Examination: Findings consistent with {desc}.\n"
        f"Assessment: {desc}.\n"
        f"Code assigned: {code}"
    )


def injury_note(
    code: str, desc: str, has_ecc: bool,
    ecc_code: Optional[str] = None, ecc_desc: Optional[str] = None,
    age: int = 35, gender: str = "M"
) -> str:
    """Generate an injury clinical note, with or without external cause code.

    Args:
        code: The injury ICD-10 code (S/T chapter)
        desc: Description of the injury
        has_ecc: Whether to include an external cause code
        ecc_code: External cause code (V-Y chapter)
        ecc_desc: Description of the external cause
        age: Patient age
        gender: Patient gender
    """
    sex = "male" if gender == "M" else "female"
    if has_ecc and ecc_code and ecc_desc:
        return (
            f"CLINICAL NOTE\n"
            f"Patient: {age}-year-old {sex}\n"
            f"Presenting complaint: {desc}\n"
            f"Mechanism of injury: {ecc_desc}\n"
            f"Assessment: Patient sustained {desc}. "
            f"Cause: {ecc_desc}.\n"
            f"Codes assigned: {code}, {ecc_code}"
        )
    else:
        return (
            f"CLINICAL NOTE\n"
            f"Patient: {age}-year-old {sex}\n"
            f"Presenting complaint: {desc}\n"
            f"Mechanism of injury: Not documented.\n"
            f"Assessment: Patient sustained {desc}.\n"
            f"Code assigned: {code}\n"
            f"WARNING: No external cause code provided."
        )


def chronic_note(
    condition: str, code: str, medications: str,
    monitoring: str = "", age: int = 58, gender: str = "M"
) -> str:
    """Generate a CDL chronic disease management note.

    Args:
        condition: Condition name (e.g. 'Diabetes mellitus Type 2')
        code: Primary ICD-10 code
        medications: Comma-separated list of medications
        monitoring: Monitoring requirements
        age: Patient age
        gender: Patient gender
    """
    sex = "male" if gender == "M" else "female"
    monitoring_line = f"\nMonitoring: {monitoring}" if monitoring else ""
    return (
        f"CLINICAL NOTE — CHRONIC DISEASE MANAGEMENT\n"
        f"Patient: {age}-year-old {sex}\n"
        f"Condition: {condition} (CDL-registered)\n"
        f"Current medications: {medications}\n"
        f"Assessment: Stable on current regimen.{monitoring_line}\n"
        f"Code assigned: {code}"
    )


def asterisk_dagger_note(
    ast_code: str, ast_desc: str,
    dag_code: str, dag_desc: str,
    age: int = 60, gender: str = "M"
) -> str:
    """Generate a note testing asterisk-dagger coding convention.

    In WHO ICD-10:
      - Dagger code = primary/aetiology (goes first)
      - Asterisk code = secondary/manifestation

    Args:
        ast_code: Asterisk (manifestation) code
        ast_desc: Asterisk code description
        dag_code: Dagger (aetiology) code
        dag_desc: Dagger code description
    """
    sex = "male" if gender == "M" else "female"
    return (
        f"CLINICAL NOTE\n"
        f"Patient: {age}-year-old {sex}\n"
        f"Primary condition: {dag_desc}\n"
        f"Manifestation: {ast_desc}\n"
        f"Assessment: Patient with {dag_desc} manifesting as {ast_desc}.\n"
        f"Primary code: {dag_code} (dagger)\n"
        f"Secondary code: {ast_code} (asterisk)"
    )


def primary_validity_note(
    code: str, desc: str, is_valid_primary: bool,
    age: int = 50, gender: str = "M"
) -> str:
    """Generate a note testing whether a code is valid as primary diagnosis.

    Args:
        code: The ICD-10 code
        desc: Code description
        is_valid_primary: Whether this code is allowed as primary diagnosis
    """
    sex = "male" if gender == "M" else "female"
    if is_valid_primary:
        return (
            f"CLINICAL NOTE\n"
            f"Patient: {age}-year-old {sex}\n"
            f"Presenting complaint: {desc}\n"
            f"Assessment: {desc}.\n"
            f"Primary diagnosis code: {code}"
        )
    else:
        return (
            f"CLINICAL NOTE\n"
            f"Patient: {age}-year-old {sex}\n"
            f"Presenting complaint: {desc}\n"
            f"Assessment: {desc}.\n"
            f"Primary diagnosis code: {code}\n"
            f"NOTE: This code may not be valid as a primary diagnosis."
        )


def unbundling_note(
    tariff_codes: list[str], descriptions: list[str],
    rule_type: str, age: int = 45
) -> str:
    """Generate a billing note testing unbundling detection.

    Args:
        tariff_codes: List of SA tariff codes billed
        descriptions: Corresponding descriptions
        rule_type: Type of unbundling (e.g. 'Rule L', 'Rule G', 'duplicate')
    """
    items = "\n".join(
        f"  Item {i+1}: {code} — {desc}"
        for i, (code, desc) in enumerate(zip(tariff_codes, descriptions))
    )
    return (
        f"BILLING CLAIM\n"
        f"Patient: {age}-year-old\n"
        f"Date of service: 2026-04-01\n"
        f"Items billed:\n{items}\n"
        f"Applicable rule: {rule_type}"
    )


def modifier_note(
    tariff_codes: list[dict], modifier: str, modifier_desc: str,
    age: int = 50
) -> str:
    """Generate a billing note testing modifier calculations.

    Args:
        tariff_codes: List of {code, amount} dicts
        modifier: Modifier code (e.g. '0005')
        modifier_desc: Description of the modifier
    """
    items = "\n".join(
        f"  Item: {tc['code']} — R{tc['amount']:.2f}"
        for tc in tariff_codes
    )
    return (
        f"BILLING CLAIM WITH MODIFIER\n"
        f"Patient: {age}-year-old\n"
        f"Items billed:\n{items}\n"
        f"Modifier applied: {modifier} — {modifier_desc}"
    )


def scheme_rejection_note(
    code: str, desc: str, rejection_type: str,
    scheme: str = "Discovery", age: int = 45
) -> str:
    """Generate a note simulating a scheme rejection scenario.

    Args:
        code: ICD-10 code
        desc: Code description
        rejection_type: Type of rejection (e.g. 'missing_icd10', 'stale_claim')
        scheme: Medical scheme name
    """
    return (
        f"CLAIM SUBMISSION — {scheme.upper()}\n"
        f"Patient: {age}-year-old\n"
        f"Diagnosis: {desc}\n"
        f"Code: {code}\n"
        f"Rejection type: {rejection_type}\n"
        f"Scheme: {scheme}"
    )


def multi_code_vignette(
    codes: list[str], descriptions: list[str],
    narrative: str, age: int = 55, gender: str = "M"
) -> str:
    """Generate a complex clinical vignette with multiple codes.

    Args:
        codes: List of ICD-10 codes
        descriptions: Corresponding descriptions
        narrative: Clinical narrative paragraph
        age: Patient age
        gender: Patient gender
    """
    sex = "male" if gender == "M" else "female"
    code_list = ", ".join(f"{c} ({d})" for c, d in zip(codes, descriptions))
    return (
        f"CLINICAL NOTE — COMPLEX CASE\n"
        f"Patient: {age}-year-old {sex}\n"
        f"Clinical narrative: {narrative}\n"
        f"Codes assigned: {code_list}"
    )
