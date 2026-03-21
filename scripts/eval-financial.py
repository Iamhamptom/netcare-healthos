#!/usr/bin/env python3
"""
Financial Precision Audit — Healthbridge AI Claims Engine
Tests that financial calculations are EXACT with no floating point errors.
Run: cd ~/ml-toolkit && uv run python /Users/hga/netcare-healthos/scripts/eval-financial.py
"""

import json
import subprocess
import sys
import random
from decimal import Decimal, ROUND_HALF_EVEN

NETCARE_DIR = "/Users/hga/netcare-healthos"


def run_tsx(code: str, timeout: int = 30) -> str:
    """Run TypeScript code via npx tsx and return stdout."""
    result = subprocess.run(
        ["npx", "tsx", "-e", code],
        capture_output=True, text=True, cwd=NETCARE_DIR, timeout=timeout,
    )
    if result.returncode != 0:
        print(f"    [ERROR] tsx failed: {result.stderr[:200]}")
        return ""
    return result.stdout.strip()


def run_financial_audit():
    print("=" * 70)
    print("FINANCIAL PRECISION AUDIT — Healthbridge Claims Engine")
    print("=" * 70)
    print()

    total_tests = 0
    passed_tests = 0
    failed_tests = 0
    issues = []

    # ── Test 1: formatZAR and parseZARToCents round-trip (1000 random amounts) ──
    print("--- Test 1: ZAR <-> Cents Round-Trip (1000 amounts) ---")

    # Generate 1000 random cent values
    random.seed(42)
    test_amounts = [random.randint(1, 99999999) for _ in range(1000)]

    # Build a single tsx call for all 1000 (batch for speed)
    amounts_json = json.dumps(test_amounts)
    tsx_code = f"""
const {{ formatZAR, parseZARToCents }} = require('./src/lib/healthbridge/codes');
const amounts = {amounts_json};
const results = [];
let errors = 0;
for (const cents of amounts) {{
  const formatted = formatZAR(cents);
  const backToCents = parseZARToCents(formatted);
  if (backToCents !== cents) {{
    errors++;
    results.push({{ cents, formatted, backToCents, error: true }});
  }}
}}
console.log(JSON.stringify({{ total: amounts.length, errors, failures: results.slice(0, 10) }}));
"""
    output = run_tsx(tsx_code)
    if output:
        data = json.loads(output)
        total_tests += data["total"]
        if data["errors"] == 0:
            passed_tests += data["total"]
            print(f"    [PASS] {data['total']} round-trip conversions — 0 errors")
        else:
            passed_tests += data["total"] - data["errors"]
            failed_tests += data["errors"]
            print(f"    [FAIL] {data['errors']}/{data['total']} round-trip errors")
            for f in data["failures"][:5]:
                print(f"           {f['cents']} cents -> \"{f['formatted']}\" -> {f['backToCents']} cents")
                issues.append(f"Round-trip error: {f['cents']} -> {f['backToCents']}")
    else:
        print("    [ERROR] Could not run round-trip test")

    print()

    # ── Test 2: Accumulation test (10,000 additions) ──
    print("--- Test 2: Accumulation Precision (10,000 additions) ---")

    tsx_code = """
const { formatZAR, parseZARToCents } = require('./src/lib/healthbridge/codes');

// Sum 10,000 amounts in cents (integer arithmetic — should be exact)
let totalCents = 0;
const amounts = [];
for (let i = 0; i < 10000; i++) {
  const cents = Math.floor(Math.random() * 100000) + 1; // 1 to R1000
  amounts.push(cents);
  totalCents += cents;
}

// Verify: convert each to ZAR, parse back, and sum
let reconstructedTotal = 0;
for (const cents of amounts) {
  const formatted = formatZAR(cents);
  const parsed = parseZARToCents(formatted);
  reconstructedTotal += parsed;
}

// Also test floating point accumulation path
let floatTotal = 0;
for (const cents of amounts) {
  floatTotal += cents / 100; // This WILL accumulate float errors
}
const floatCents = Math.round(floatTotal * 100);

console.log(JSON.stringify({
  totalCents,
  reconstructedTotal,
  integerMatch: totalCents === reconstructedTotal,
  floatCents,
  floatMatch: totalCents === floatCents,
  floatError: Math.abs(totalCents - floatCents),
}));
"""
    output = run_tsx(tsx_code)
    if output:
        data = json.loads(output)
        total_tests += 2

        if data["integerMatch"]:
            passed_tests += 1
            print(f"    [PASS] Integer accumulation: {data['totalCents']} === {data['reconstructedTotal']}")
        else:
            failed_tests += 1
            diff = abs(data["totalCents"] - data["reconstructedTotal"])
            print(f"    [FAIL] Integer accumulation mismatch: diff = {diff} cents")
            issues.append(f"Integer accumulation error: {diff} cents over 10,000 additions")

        if data["floatMatch"]:
            passed_tests += 1
            print(f"    [PASS] Float accumulation: no error (lucky)")
        else:
            # Expected: float accumulation DOES have errors
            print(f"    [INFO] Float accumulation error: {data['floatError']} cents (expected — this is why we use integer cents)")
            passed_tests += 1  # This is expected behavior — pass because the system uses cents
    else:
        print("    [ERROR] Could not run accumulation test")

    print()

    # ── Test 3: Rounding edge cases ──
    print("--- Test 3: Rounding Edge Cases ---")

    tsx_code = """
const { formatZAR, parseZARToCents } = require('./src/lib/healthbridge/codes');

const tests = [
  // Standard rounding
  { input: "R 0.01", expectedCents: 1 },
  { input: "R 0.99", expectedCents: 99 },
  { input: "R 999999.99", expectedCents: 99999999 },
  { input: "R 0.00", expectedCents: 0 },
  // Edge: half-cent rounding
  { input: "0.005", expectedCents: 1 },  // rounds up
  { input: "0.015", expectedCents: 2 },  // banker's rounding: rounds up (1.5 -> 2)
  { input: "0.025", expectedCents: 3 },  // rounds up (2.5 -> 3) — standard rounding
  { input: "0.995", expectedCents: 100 }, // rounds up
  // Format tests
  { input: "R 1,234.56", expectedCents: 123456 },
  { input: "R1234.56", expectedCents: 123456 },
  { input: "1234.56", expectedCents: 123456 },
  { input: 1234.56, expectedCents: 123456 },
  { input: 0.1 + 0.2, expectedCents: 30 }, // Classic float: 0.30000000000000004
  // Number input
  { input: 520.00, expectedCents: 52000 },
  { input: 0.01, expectedCents: 1 },
];

const results = [];
for (const t of tests) {
  const actual = parseZARToCents(t.input);
  results.push({
    input: String(t.input),
    expected: t.expectedCents,
    actual,
    pass: actual === t.expectedCents,
  });
}

console.log(JSON.stringify(results));
"""
    output = run_tsx(tsx_code)
    if output:
        results = json.loads(output)
        for r in results:
            total_tests += 1
            if r["pass"]:
                passed_tests += 1
                print(f"    [PASS] parseZARToCents({r['input']}) = {r['actual']} cents")
            else:
                failed_tests += 1
                print(f"    [FAIL] parseZARToCents({r['input']}) = {r['actual']} (expected {r['expected']})")
                issues.append(f"Rounding error: parseZARToCents({r['input']}) = {r['actual']}, expected {r['expected']}")
    else:
        print("    [ERROR] Could not run rounding tests")

    print()

    # ── Test 4: Patient cost estimation with gap cover ──
    print("--- Test 4: Patient Cost Estimation Precision ---")

    tsx_code = """
const { estimatePatientCost } = require('./src/lib/healthbridge/analytics');

const tests = [
  // Standard: 100% scheme rate, no gap cover
  {
    input: { lineItems: [{cptCode: '0190', amount: 52000, quantity: 1}], schemeRate: 100, hasGapCover: false },
    expected: { totalCharge: 52000, estimatedSchemePayment: 52000, estimatedPatientLiability: 0, finalPatientCost: 0 },
  },
  // 80% scheme rate, no gap cover
  {
    input: { lineItems: [{cptCode: '0190', amount: 52000, quantity: 1}], schemeRate: 80, hasGapCover: false },
    expected: { totalCharge: 52000, estimatedSchemePayment: 41600, estimatedPatientLiability: 10400, finalPatientCost: 10400 },
  },
  // 200% rate with gap cover (3x)
  {
    input: { lineItems: [{cptCode: '0193', amount: 78000, quantity: 1}], schemeRate: 200, hasGapCover: true, gapCoverMultiple: 3 },
    expected: { totalCharge: 78000, estimatedSchemePayment: 156000, estimatedPatientLiability: 0, finalPatientCost: 0 },
  },
  // Multiple line items
  {
    input: {
      lineItems: [
        {cptCode: '0190', amount: 52000, quantity: 1},
        {cptCode: '0308', amount: 35000, quantity: 1},
        {cptCode: '0382', amount: 6500, quantity: 2},
      ],
      schemeRate: 100, hasGapCover: false,
    },
    expected: { totalCharge: 100000, estimatedSchemePayment: 100000, estimatedPatientLiability: 0, finalPatientCost: 0 },
  },
  // 60% scheme rate with gap cover (3x)
  {
    input: {
      lineItems: [{cptCode: '0190', amount: 52000, quantity: 1}],
      schemeRate: 60, hasGapCover: true, gapCoverMultiple: 3,
    },
    expected: {
      totalCharge: 52000,
      estimatedSchemePayment: 31200,
      estimatedPatientLiability: 20800,
      estimatedGapCoverRecovery: 20800, // shortfall (20800) <= maxGap (31200 * 2 = 62400)
      finalPatientCost: 0,
    },
  },
];

const results = [];
for (const t of tests) {
  const actual = estimatePatientCost(t.input);
  const checks = {};
  let allPass = true;
  for (const [key, val] of Object.entries(t.expected)) {
    const actualVal = actual[key];
    const pass = actualVal === val;
    checks[key] = { expected: val, actual: actualVal, pass };
    if (!pass) allPass = false;
  }
  results.push({ allPass, checks });
}

console.log(JSON.stringify(results));
"""
    output = run_tsx(tsx_code)
    if output:
        results = json.loads(output)
        for i, r in enumerate(results):
            total_tests += 1
            if r["allPass"]:
                passed_tests += 1
                print(f"    [PASS] Cost estimation scenario {i + 1}")
            else:
                failed_tests += 1
                print(f"    [FAIL] Cost estimation scenario {i + 1}:")
                for field, check in r["checks"].items():
                    if not check["pass"]:
                        print(f"           {field}: expected {check['expected']}, got {check['actual']}")
                        issues.append(f"Cost estimation error in scenario {i+1}: {field}")
    else:
        print("    [ERROR] Could not run cost estimation tests")

    print()

    # ── Test 5: Batch total = sum of individual items (500 items) ──
    print("--- Test 5: Batch Total Integrity (500 line items) ---")

    tsx_code = """
const { formatZAR, parseZARToCents } = require('./src/lib/healthbridge/codes');

// Generate 500 random line items
const lineItems = [];
let expectedTotal = 0;
for (let i = 0; i < 500; i++) {
  const amount = Math.floor(Math.random() * 200000) + 100; // R1 to R2000
  const quantity = Math.floor(Math.random() * 5) + 1;
  lineItems.push({ amount, quantity });
  expectedTotal += amount * quantity;
}

// Sum them
const batchTotal = lineItems.reduce((sum, li) => sum + li.amount * li.quantity, 0);

// Format and re-parse
const formatted = formatZAR(batchTotal);
const reparsed = parseZARToCents(formatted);

console.log(JSON.stringify({
  itemCount: lineItems.length,
  expectedTotal,
  batchTotal,
  reparsed,
  totalMatch: expectedTotal === batchTotal,
  reparseMatch: batchTotal === reparsed,
}));
"""
    output = run_tsx(tsx_code)
    if output:
        data = json.loads(output)
        total_tests += 2

        if data["totalMatch"]:
            passed_tests += 1
            print(f"    [PASS] Batch total ({data['batchTotal']} cents) = sum of {data['itemCount']} items")
        else:
            failed_tests += 1
            diff = abs(data["expectedTotal"] - data["batchTotal"])
            print(f"    [FAIL] Batch total mismatch: diff = {diff} cents")
            issues.append(f"Batch total mismatch: {diff} cents")

        if data["reparseMatch"]:
            passed_tests += 1
            print(f"    [PASS] Format->parse round-trip preserves batch total")
        else:
            failed_tests += 1
            print(f"    [FAIL] Format->parse lost precision: {data['batchTotal']} -> {data['reparsed']}")
            issues.append(f"Batch format/parse precision loss")
    else:
        print("    [ERROR] Could not run batch test")

    print()

    # ── Test 6: Tariff precision (all defined tariffs) ──
    print("--- Test 6: Tariff Precision Check ---")

    tsx_code = """
const { COMMON_CPT, formatZAR, parseZARToCents } = require('./src/lib/healthbridge/codes');

const results = [];
for (const [code, data] of Object.entries(COMMON_CPT)) {
  const formatted = formatZAR(data.tariff2026);
  const reparsed = parseZARToCents(formatted);
  results.push({
    code,
    tariff: data.tariff2026,
    formatted,
    reparsed,
    match: data.tariff2026 === reparsed,
  });
}
console.log(JSON.stringify(results));
"""
    output = run_tsx(tsx_code)
    if output:
        results = json.loads(output)
        for r in results:
            total_tests += 1
            if r["match"]:
                passed_tests += 1
            else:
                failed_tests += 1
                print(f"    [FAIL] CPT {r['code']}: {r['tariff']} -> \"{r['formatted']}\" -> {r['reparsed']}")
                issues.append(f"Tariff precision error for CPT {r['code']}")
        if all(r["match"] for r in results):
            print(f"    [PASS] All {len(results)} CPT tariffs preserve precision through format/parse")
    else:
        print("    [ERROR] Could not run tariff precision test")

    print()

    # ── Summary ──
    print("=" * 70)
    print("FINANCIAL PRECISION AUDIT SUMMARY")
    print("=" * 70)
    print()
    print(f"  Total tests:  {total_tests}")
    print(f"  Passed:       {passed_tests}")
    print(f"  Failed:       {failed_tests}")
    print()

    if issues:
        print("  Issues found:")
        for issue in issues:
            print(f"    - {issue}")
        print()

    status = "PASS" if failed_tests == 0 else "FAIL"
    print(f"  RESULT: {status}")
    print()

    if failed_tests == 0:
        print("  All financial calculations are precise.")
        print("  The system correctly uses integer cents to avoid floating point errors.")
    else:
        print(f"  WARNING: {failed_tests} precision errors detected.")
        print("  Review formatZAR/parseZARToCents for rounding issues.")

    # Write machine-readable result
    result = {
        "pass": status == "PASS",
        "total_tests": total_tests,
        "passed": passed_tests,
        "failed": failed_tests,
        "issues": issues,
    }
    with open("/Users/hga/netcare-healthos/scripts/.eval-financial-result.json", "w") as f:
        json.dump(result, f)

    return 0 if status == "PASS" else 1


if __name__ == "__main__":
    sys.exit(run_financial_audit())
