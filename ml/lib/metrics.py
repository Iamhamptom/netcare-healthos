#!/usr/bin/env python3
"""
Medical Coding Evaluation Metrics
==================================
Computes F1, precision, recall, and accuracy for multi-label ICD-10 code
prediction. Designed for benchmarking clinical coding AI (e.g., ACI-Note,
MDACE, MedQA-SA) where each case maps to a SET of diagnosis codes.

Supports:
  - Per-case F1 (set overlap between predicted and gold)
  - Micro-F1 (aggregate TP/FP/FN across all cases, then compute)
  - Macro-F1 (F1 per unique code, then average)
  - Per-code breakdown
  - Per-category/difficulty grouping
  - Legacy exact-match accuracy (backward compat with single-answer benchmarks)

No external dependencies — stdlib + dataclasses only.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from collections import defaultdict
from typing import Optional


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class CodingPrediction:
    """A single benchmark case with predicted vs gold ICD-10 code sets."""
    case_id: str
    predicted_codes: set
    gold_codes: set
    category: str = ""
    difficulty: str = ""
    metadata: dict = field(default_factory=dict)


# ---------------------------------------------------------------------------
# ICD-10 code extraction from free text
# ---------------------------------------------------------------------------

_ICD10_PATTERN = re.compile(r'\b([A-Z]\d{2})(?:\.(\d{1,2}))?\b')


def _normalize_code(raw: str) -> str:
    """Normalize an ICD-10 code to dotted form (e.g., E119 -> E11.9, E11.9 -> E11.9)."""
    raw = raw.strip().upper()
    # Already dotted
    if '.' in raw:
        return raw
    # 4+ chars without dot: insert dot after position 3
    if len(raw) > 3:
        return raw[:3] + '.' + raw[3:]
    # 3-char code (category level) — return as-is
    return raw


def extract_code_set(response_text: str) -> set:
    """Extract ICD-10 codes from free-text model output.

    Matches patterns like A00, A00.0, E11.9, Z87.39, E119 (normalized to E11.9).
    Returns a set of normalized dotted-form codes.
    """
    codes = set()
    for match in _ICD10_PATTERN.finditer(response_text):
        prefix = match.group(1)
        suffix = match.group(2)
        if suffix:
            codes.add(f"{prefix}.{suffix}")
        else:
            codes.add(prefix)
    # Also catch codes written without dots like E119, J441
    nodot_pattern = re.compile(r'\b([A-Z]\d{3,4})\b')
    for match in nodot_pattern.finditer(response_text):
        raw = match.group(1)
        normalized = _normalize_code(raw)
        codes.add(normalized)
    return codes


# ---------------------------------------------------------------------------
# Per-case metrics
# ---------------------------------------------------------------------------

def compute_case_f1(predicted: set, gold: set) -> dict:
    """Compute TP, FP, FN, precision, recall, and F1 for a single case.

    Args:
        predicted: Set of codes the model predicted.
        gold: Set of ground-truth codes.

    Returns:
        Dict with keys: tp, fp, fn, precision, recall, f1
    """
    predicted = set(predicted)
    gold = set(gold)

    tp = len(predicted & gold)
    fp = len(predicted - gold)
    fn = len(gold - predicted)

    # Edge cases
    if tp == 0:
        # No true positives — precision/recall/F1 are all 0
        # Special case: both empty sets = perfect match
        if fp == 0 and fn == 0:
            return {"tp": 0, "fp": 0, "fn": 0, "precision": 1.0, "recall": 1.0, "f1": 1.0}
        return {"tp": 0, "fp": fp, "fn": fn, "precision": 0.0, "recall": 0.0, "f1": 0.0}

    precision = tp / (tp + fp)
    recall = tp / (tp + fn)
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0

    return {
        "tp": tp,
        "fp": fp,
        "fn": fn,
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
    }


# ---------------------------------------------------------------------------
# Micro-F1 (aggregate TP/FP/FN first, then compute)
# ---------------------------------------------------------------------------

def compute_micro_f1(predictions: list[CodingPrediction]) -> dict:
    """Compute micro-averaged F1 across all predictions.

    Aggregates TP/FP/FN across ALL cases first, then computes a single
    precision/recall/F1. This weights each code equally regardless of case.

    Args:
        predictions: List of CodingPrediction objects.

    Returns:
        Dict with keys: tp, fp, fn, precision, recall, f1, n_cases
    """
    total_tp = 0
    total_fp = 0
    total_fn = 0

    for pred in predictions:
        case = compute_case_f1(pred.predicted_codes, pred.gold_codes)
        total_tp += case["tp"]
        total_fp += case["fp"]
        total_fn += case["fn"]

    if total_tp == 0:
        if total_fp == 0 and total_fn == 0:
            precision = recall = f1 = 1.0
        else:
            precision = recall = f1 = 0.0
    else:
        precision = total_tp / (total_tp + total_fp)
        recall = total_tp / (total_tp + total_fn)
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0

    return {
        "tp": total_tp,
        "fp": total_fp,
        "fn": total_fn,
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "n_cases": len(predictions),
    }


# ---------------------------------------------------------------------------
# Per-code F1
# ---------------------------------------------------------------------------

def compute_per_code_f1(predictions: list[CodingPrediction]) -> dict[str, dict]:
    """Compute TP/FP/FN/F1 for each unique ICD-10 code across all cases.

    For a given code C:
      - TP: number of cases where C is in both predicted and gold
      - FP: number of cases where C is in predicted but not gold
      - FN: number of cases where C is in gold but not predicted

    Returns:
        Dict mapping code -> {tp, fp, fn, precision, recall, f1}
    """
    code_tp: dict[str, int] = defaultdict(int)
    code_fp: dict[str, int] = defaultdict(int)
    code_fn: dict[str, int] = defaultdict(int)

    for pred in predictions:
        p = set(pred.predicted_codes)
        g = set(pred.gold_codes)
        for code in p & g:
            code_tp[code] += 1
        for code in p - g:
            code_fp[code] += 1
        for code in g - p:
            code_fn[code] += 1

    all_codes = set(code_tp) | set(code_fp) | set(code_fn)
    result = {}
    for code in sorted(all_codes):
        tp = code_tp[code]
        fp = code_fp[code]
        fn = code_fn[code]
        if tp == 0:
            result[code] = {"tp": 0, "fp": fp, "fn": fn, "precision": 0.0, "recall": 0.0, "f1": 0.0}
        else:
            prec = tp / (tp + fp)
            rec = tp / (tp + fn)
            f1 = 2 * prec * rec / (prec + rec) if (prec + rec) > 0 else 0.0
            result[code] = {
                "tp": tp, "fp": fp, "fn": fn,
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1": round(f1, 4),
            }

    return result


# ---------------------------------------------------------------------------
# Macro-F1 (average of per-code F1s)
# ---------------------------------------------------------------------------

def compute_macro_f1(predictions: list[CodingPrediction]) -> dict:
    """Compute macro-averaged F1: F1 per unique code, then unweighted average.

    This treats rare codes equally to common ones.

    Returns:
        Dict with keys: macro_f1, macro_precision, macro_recall, n_codes
    """
    per_code = compute_per_code_f1(predictions)
    if not per_code:
        return {"macro_f1": 0.0, "macro_precision": 0.0, "macro_recall": 0.0, "n_codes": 0}

    f1s = [v["f1"] for v in per_code.values()]
    precs = [v["precision"] for v in per_code.values()]
    recs = [v["recall"] for v in per_code.values()]

    return {
        "macro_f1": round(sum(f1s) / len(f1s), 4),
        "macro_precision": round(sum(precs) / len(precs), 4),
        "macro_recall": round(sum(recs) / len(recs), 4),
        "n_codes": len(per_code),
    }


# ---------------------------------------------------------------------------
# Per-category / per-difficulty F1
# ---------------------------------------------------------------------------

def compute_per_category_f1(
    predictions: list[CodingPrediction],
    key: str = "category",
) -> dict[str, dict]:
    """Group predictions by a key (category or difficulty), compute micro-F1 per group.

    Args:
        predictions: List of CodingPrediction objects.
        key: Attribute name to group by — "category" or "difficulty".

    Returns:
        Dict mapping group_name -> micro-F1 metrics dict
    """
    groups: dict[str, list[CodingPrediction]] = defaultdict(list)
    for pred in predictions:
        group_val = getattr(pred, key, "") or "unknown"
        groups[group_val].append(pred)

    result = {}
    for group_name in sorted(groups):
        result[group_name] = compute_micro_f1(groups[group_name])

    return result


# ---------------------------------------------------------------------------
# Legacy accuracy (backward compat)
# ---------------------------------------------------------------------------

def compute_legacy_accuracy(predictions: list[CodingPrediction]) -> float:
    """Compute exact-match accuracy: % of cases where predicted == gold exactly.

    This is the legacy metric from the 500-question MedQA-SA benchmark where
    each question has one correct answer.

    Args:
        predictions: List of CodingPrediction objects.

    Returns:
        Accuracy as a float between 0.0 and 1.0.
    """
    if not predictions:
        return 0.0

    exact_matches = sum(
        1 for p in predictions
        if set(p.predicted_codes) == set(p.gold_codes)
    )
    return exact_matches / len(predictions)


# ---------------------------------------------------------------------------
# Report formatting
# ---------------------------------------------------------------------------

def format_report(all_metrics: dict) -> str:
    """Format a human-readable benchmark report.

    Args:
        all_metrics: Dict with keys like 'micro_f1', 'macro_f1', 'per_code_f1',
                     'per_category_f1', 'accuracy', etc.

    Returns:
        Formatted multi-line string.
    """
    lines = []
    sep = "=" * 64

    lines.append(sep)
    lines.append("  MEDICAL CODING BENCHMARK — F1 METRICS REPORT")
    lines.append(sep)

    # Overall metrics
    if "micro_f1" in all_metrics:
        m = all_metrics["micro_f1"]
        lines.append("")
        lines.append("  MICRO-F1 (weights each code equally)")
        lines.append(f"    Precision : {m['precision']:.4f}")
        lines.append(f"    Recall    : {m['recall']:.4f}")
        lines.append(f"    F1        : {m['f1']:.4f}")
        lines.append(f"    TP/FP/FN  : {m['tp']}/{m['fp']}/{m['fn']}")
        lines.append(f"    Cases     : {m['n_cases']}")

    if "macro_f1" in all_metrics:
        m = all_metrics["macro_f1"]
        lines.append("")
        lines.append("  MACRO-F1 (average F1 per unique code)")
        lines.append(f"    Precision : {m['macro_precision']:.4f}")
        lines.append(f"    Recall    : {m['macro_recall']:.4f}")
        lines.append(f"    F1        : {m['macro_f1']:.4f}")
        lines.append(f"    Codes     : {m['n_codes']}")

    if "accuracy" in all_metrics:
        lines.append("")
        lines.append(f"  LEGACY ACCURACY: {all_metrics['accuracy']:.1%}")

    # Per-category
    if "per_category_f1" in all_metrics:
        lines.append("")
        lines.append("  PER-CATEGORY MICRO-F1")
        lines.append(f"  {'Category':<32s} {'F1':>6s} {'Prec':>6s} {'Rec':>6s} {'N':>5s}")
        lines.append("  " + "-" * 57)
        for cat, m in sorted(all_metrics["per_category_f1"].items()):
            lines.append(
                f"  {cat:<32s} {m['f1']:>6.4f} {m['precision']:>6.4f} "
                f"{m['recall']:>6.4f} {m['n_cases']:>5d}"
            )

    # Per-code (top 20 worst)
    if "per_code_f1" in all_metrics:
        per_code = all_metrics["per_code_f1"]
        lines.append("")
        lines.append(f"  PER-CODE F1 ({len(per_code)} unique codes)")
        sorted_codes = sorted(per_code.items(), key=lambda x: x[1]["f1"])
        worst = sorted_codes[:20]
        if worst:
            lines.append(f"  {'Code':<10s} {'F1':>6s} {'Prec':>6s} {'Rec':>6s} {'TP':>4s} {'FP':>4s} {'FN':>4s}")
            lines.append("  " + "-" * 44)
            for code, m in worst:
                lines.append(
                    f"  {code:<10s} {m['f1']:>6.4f} {m['precision']:>6.4f} "
                    f"{m['recall']:>6.4f} {m['tp']:>4d} {m['fp']:>4d} {m['fn']:>4d}"
                )

    lines.append("")
    lines.append(sep)
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Convenience: compute everything at once
# ---------------------------------------------------------------------------

def compute_all_metrics(predictions: list[CodingPrediction]) -> dict:
    """Compute all available metrics in one call.

    Returns a dict suitable for JSON serialization and for format_report().
    """
    return {
        "micro_f1": compute_micro_f1(predictions),
        "macro_f1": compute_macro_f1(predictions),
        "per_code_f1": compute_per_code_f1(predictions),
        "per_category_f1": compute_per_category_f1(predictions, key="category"),
        "per_difficulty_f1": compute_per_category_f1(predictions, key="difficulty"),
        "accuracy": compute_legacy_accuracy(predictions),
    }
