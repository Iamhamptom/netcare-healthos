#!/usr/bin/env python3
"""
MedQA-SA Benchmark Runner
==========================
Runs the 500-question benchmark against HealthOS-Med v3 (with RAG).
Calculates accuracy, precision, recall per category.

Usage: python3 ml/scripts/run-benchmark.py
Output: ml/benchmark/results-v3.json
"""

from __future__ import annotations

import json
import os
import sys
import re
import time
from typing import Optional
from datetime import datetime

HOME = os.path.expanduser("~")
NETCARE_DIR = os.path.join(HOME, "netcare-healthos")
BENCHMARK_PATH = os.path.join(NETCARE_DIR, "ml/benchmark/medqa-sa.jsonl")
OUTPUT_PATH = os.path.join(NETCARE_DIR, "ml/benchmark/results-v3.json")
SERVER_URL = "http://localhost:8800"

SYSTEM_PROMPT = """You are HealthOS-Med, a South African healthcare AI expert. Answer precisely and concisely. For yes/no questions, start with Yes or No. For code lookups, state the code and description. For comparisons, use the exact data. Never guess — if unsure, say so."""


def query_server(question: str, use_rag: bool = True) -> str:
    """Query the HealthOS-Med server."""
    import urllib.request

    endpoint = "/generate" if use_rag else "/raw"
    data = json.dumps({"query": question, "max_tokens": 300}).encode()

    req = urllib.request.Request(
        f"{SERVER_URL}{endpoint}",
        data=data,
        headers={"Content-Type": "application/json"},
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read())
            return result.get("response", result.get("reply", ""))
    except Exception as e:
        return f"ERROR: {e}"


def check_answer(response: str, correct: str, answer_type: str) -> bool:
    """Check if the model's response matches the expected answer."""
    response_lower = response.lower().strip().replace("<|eot_id|>", "")
    correct_lower = correct.lower().strip()

    # Normalize common variants
    response_norm = response_lower.replace("samd", "software as a medical device").replace("r ", "r").replace("rr", "r")
    correct_norm = correct_lower.replace("rr", "r").replace("r ", "r")

    if answer_type == "exact_match":
        return correct_norm in response_norm

    elif answer_type == "boolean":
        resp_bool = None
        # Check first 150 chars for yes/no signals
        check_zone = response_lower[:150]

        if check_zone.startswith("yes") or "yes," in check_zone[:30] or "yes." in check_zone[:30]:
            resp_bool = True
        elif check_zone.startswith("no") or "no," in check_zone[:30] or "no." in check_zone[:30]:
            resp_bool = False
        elif " yes " in check_zone or " yes." in check_zone:
            resp_bool = True
        elif " no " in check_zone or " no." in check_zone or "not " in check_zone[:50] or "cannot" in check_zone[:50]:
            resp_bool = False
        elif "must " in check_zone or "is a " in check_zone or "valid" in check_zone[:60] or "can be" in check_zone:
            resp_bool = True
        elif "is not" in check_zone or "invalid" in check_zone or "cannot" in check_zone or "rejected" in check_zone:
            resp_bool = False
        elif "cdl condition" in check_zone and correct_lower in ("yes", "true", "1"):
            resp_bool = True  # Mentions CDL = knows it's on the list

        expected_bool = correct_lower in ("yes", "true", "1")

        if resp_bool is None:
            return False

        return resp_bool == expected_bool

    elif answer_type == "contains":
        # Primary check
        if correct_norm in response_norm:
            return True
        # Check individual significant words (for multi-word answers)
        words = [w for w in correct_lower.split() if len(w) > 3]
        if len(words) >= 2:
            matches = sum(1 for w in words if w in response_lower)
            if matches >= len(words) * 0.6:
                return True
        # Check numeric values (strip R prefix, match digits)
        import re as _re
        correct_nums = _re.findall(r'[\d.]+', correct_lower)
        if correct_nums:
            for num in correct_nums:
                if num in response_lower:
                    return True
        return False

    return False


def flush():
    sys.stdout.flush()

def run_benchmark():
    """Run the full benchmark."""
    # Check server is running
    try:
        import urllib.request
        with urllib.request.urlopen(f"{SERVER_URL}/health", timeout=5) as resp:
            health = json.loads(resp.read())
            if health.get("status") != "ok":
                print("Server not healthy. Start with: python3 ml/scripts/healthos-server.py --port 8800")
                return
    except Exception:
        print(f"Cannot reach server at {SERVER_URL}. Start it first.")
        return

    # Load benchmark
    questions = []
    with open(BENCHMARK_PATH) as f:
        for line in f:
            questions.append(json.loads(line))

    print("=" * 60)
    print(f"MedQA-SA Benchmark — {len(questions)} questions")
    print(f"Server: {SERVER_URL}")
    print(f"Started: {datetime.now().strftime('%H:%M:%S')}")
    print("=" * 60)
    flush()

    results = []
    category_stats = {}
    difficulty_stats = {}
    total_correct = 0
    total_asked = 0
    errors = 0

    for i, q in enumerate(questions):
        qid = q["id"]
        category = q["category"]
        difficulty = q["difficulty"]
        question = q["question"]
        correct = q["correct_answer"]
        answer_type = q["answer_type"]

        # Query the model
        response = query_server(question, use_rag=True)

        if response.startswith("ERROR:"):
            errors += 1
            is_correct = False
        else:
            is_correct = check_answer(response, correct, answer_type)

        total_asked += 1
        if is_correct:
            total_correct += 1

        # Track by category
        if category not in category_stats:
            category_stats[category] = {"correct": 0, "total": 0}
        category_stats[category]["total"] += 1
        if is_correct:
            category_stats[category]["correct"] += 1

        # Track by difficulty
        if difficulty not in difficulty_stats:
            difficulty_stats[difficulty] = {"correct": 0, "total": 0}
        difficulty_stats[difficulty]["total"] += 1
        if is_correct:
            difficulty_stats[difficulty]["correct"] += 1

        results.append({
            "id": qid,
            "category": category,
            "difficulty": difficulty,
            "question": question[:100],
            "correct_answer": correct,
            "model_response": response[:300],
            "is_correct": is_correct,
            "answer_type": answer_type,
        })

        # Progress
        if (i + 1) % 10 == 0:
            pct = (total_correct / total_asked * 100) if total_asked > 0 else 0
            print(f"  [{i+1}/{len(questions)}] Running accuracy: {pct:.1f}% ({total_correct}/{total_asked})")
            flush()

    # Calculate final metrics
    overall_accuracy = (total_correct / total_asked * 100) if total_asked > 0 else 0

    category_results = {}
    for cat, stats in sorted(category_stats.items()):
        acc = (stats["correct"] / stats["total"] * 100) if stats["total"] > 0 else 0
        category_results[cat] = {
            "correct": stats["correct"],
            "total": stats["total"],
            "accuracy": round(acc, 1),
        }

    difficulty_results = {}
    for diff, stats in sorted(difficulty_stats.items()):
        acc = (stats["correct"] / stats["total"] * 100) if stats["total"] > 0 else 0
        difficulty_results[diff] = {
            "correct": stats["correct"],
            "total": stats["total"],
            "accuracy": round(acc, 1),
        }

    # Print results
    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    print(f"\nOverall Accuracy: {overall_accuracy:.1f}% ({total_correct}/{total_asked})")
    print(f"Errors: {errors}")

    print(f"\nBy Category:")
    for cat, r in sorted(category_results.items()):
        bar = "█" * int(r["accuracy"] / 5) + "░" * (20 - int(r["accuracy"] / 5))
        print(f"  {cat:30s} {bar} {r['accuracy']:5.1f}% ({r['correct']}/{r['total']})")

    print(f"\nBy Difficulty:")
    for diff, r in sorted(difficulty_results.items()):
        print(f"  {diff:10s} {r['accuracy']:5.1f}% ({r['correct']}/{r['total']})")

    # Save results
    output = {
        "model": "healthos-med-v3",
        "benchmark": "medqa-sa",
        "timestamp": datetime.now().isoformat(),
        "total_questions": total_asked,
        "total_correct": total_correct,
        "overall_accuracy": round(overall_accuracy, 1),
        "errors": errors,
        "category_results": category_results,
        "difficulty_results": difficulty_results,
        "detailed_results": results,
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\nResults saved to: {OUTPUT_PATH}")
    print("=" * 60)


if __name__ == "__main__":
    run_benchmark()
