#!/usr/bin/env python3
"""
PII Leak Detection — Healthbridge AI Claims Engine
Uses Microsoft Presidio to scan API response samples for leaked PII.
Run: cd ~/ml-toolkit && uv run python /Users/hga/netcare-healthos/scripts/eval-pii-leaks.py
"""

import json
import sys
from presidio_analyzer import AnalyzerEngine, RecognizerRegistry
from presidio_analyzer import Pattern, PatternRecognizer
from presidio_analyzer.nlp_engine import SpacyNlpEngine

# SA ID number: 13 digits (YYMMDD GSSS C A Z)
sa_id_recognizer = PatternRecognizer(
    supported_entity="SA_ID_NUMBER",
    name="SA ID Number Recognizer",
    patterns=[Pattern("SA_ID_13", r"\b\d{13}\b", 0.7)],
    supported_language="en",
)

# SA medical aid membership number patterns (various schemes)
medical_aid_recognizer = PatternRecognizer(
    supported_entity="MEDICAL_AID_NUMBER",
    name="Medical Aid Membership Recognizer",
    patterns=[
        # Discovery: typically 9-12 digits
        Pattern("DISCOVERY_MEM", r"\b\d{9,12}\b", 0.3),
        # GEMS: exactly 9 digits
        Pattern("GEMS_MEM", r"\b\d{9}\b", 0.4),
    ],
    supported_language="en",
    context=["member", "membership", "medical aid", "scheme", "discovery", "gems", "bonitas", "medihelp"],
)

# ── Sample API responses (realistic, matching actual schema) ──────────

# 1. Claims list response (should NOT leak full patient details in list view)
CLAIMS_LIST_RESPONSE = json.dumps({
    "claims": [
        {
            "id": "clm_001",
            "patientName": "Thabo Mokoena",
            "patientIdNumber": "8501015800083",
            "membershipNumber": "900123456",
            "medicalAidScheme": "Discovery Health",
            "dateOfService": "2026-03-15",
            "totalAmount": 52000,
            "status": "accepted"
        },
        {
            "id": "clm_002",
            "patientName": "Naledi Dlamini",
            "patientIdNumber": "9203125100087",
            "membershipNumber": "DH00456789012",
            "medicalAidScheme": "GEMS",
            "dateOfService": "2026-03-14",
            "totalAmount": 78000,
            "status": "pending"
        }
    ],
    "total": 2
})

# 2. Single claim detail response (acceptable to have patient info)
CLAIM_DETAIL_RESPONSE = json.dumps({
    "claim": {
        "id": "clm_001",
        "patientName": "Thabo Mokoena",
        "patientDob": "1985-01-01",
        "patientIdNumber": "8501015800083",
        "membershipNumber": "900123456",
        "patientPhone": "+27823456789",
        "patientEmail": "thabo.mokoena@gmail.com",
        "medicalAidScheme": "Discovery Health",
        "dependentCode": "00",
        "treatingProvider": "Dr. Anika van der Merwe",
        "bhfNumber": "1234567",
        "lineItems": [
            {"icd10Code": "I10", "cptCode": "0190", "description": "Consultation for hypertension", "amount": 52000, "quantity": 1}
        ],
        "status": "accepted",
        "approvedAmount": 52000
    }
})

# 3. Analytics / aggregate response (should NOT contain patient PII)
ANALYTICS_RESPONSE = json.dumps({
    "schemeAnalytics": [
        {
            "scheme": "Discovery Health",
            "totalClaims": 145,
            "accepted": 130,
            "rejected": 10,
            "partial": 5,
            "acceptanceRate": 90,
            "rejectionRate": 7,
            "totalBilled": 7540000,
            "totalPaid": 6800000,
            "avgDaysToPayment": 14,
            "topRejections": [{"code": "05", "reason": "ICD-10 code invalid", "count": 4}]
        }
    ]
})

# 4. Analytics aging response (SHOULD NOT have full names in aggregate)
AGING_RESPONSE = json.dumps({
    "aging": [
        {
            "bucket": "0-30 days",
            "count": 12,
            "amount": 624000,
            "claims": [
                {"id": "clm_001", "patient": "Thabo Mokoena", "scheme": "Discovery Health", "amount": 52000, "daysOld": 6, "status": "submitted"},
                {"id": "clm_003", "patient": "Sipho Nkosi", "scheme": "Bonitas", "amount": 36000, "daysOld": 12, "status": "submitted"}
            ]
        },
        {
            "bucket": "120+ days",
            "count": 3,
            "amount": 156000,
            "claims": [
                {"id": "clm_050", "patient": "Maria Joubert", "scheme": "GEMS", "amount": 78000, "daysOld": 135, "status": "rejected"}
            ]
        }
    ]
})

# 5. Remittance advice response (contains membership numbers)
REMITTANCE_RESPONSE = json.dumps({
    "remittance": {
        "scheme": "Discovery Health",
        "remittanceRef": "ERA-2026-03-001",
        "paymentDate": "2026-03-20",
        "totalAmount": 156000,
        "payments": [
            {
                "claimRef": "clm_001",
                "membershipNumber": "900123456",
                "patientName": "Thabo Mokoena",
                "dateOfService": "2026-03-15",
                "claimedAmount": 52000,
                "paidAmount": 52000
            },
            {
                "claimRef": "clm_004",
                "membershipNumber": "DH00789012345",
                "patientName": "Lerato Mahlangu",
                "dateOfService": "2026-03-10",
                "claimedAmount": 104000,
                "paidAmount": 95000,
                "adjustmentCode": "15",
                "adjustmentReason": "Amount exceeds scheme tariff"
            }
        ]
    }
})

# 6. Eligibility check response (contains patient details)
ELIGIBILITY_RESPONSE = json.dumps({
    "eligibility": {
        "eligible": True,
        "scheme": "Discovery Health",
        "option": "Executive Plan",
        "memberName": "Thabo Mokoena",
        "dependentName": "Lesego Mokoena",
        "benefits": [
            {"category": "GP Consultations", "available": True, "remainingAmount": 350000, "annualLimit": 500000}
        ]
    }
})

# 7. Error response (should NEVER leak internal details)
ERROR_RESPONSE = json.dumps({
    "error": "Failed to process claim for patient 8501015800083",
    "stack": "Error: ECONNREFUSED at ClaimService.submit (/app/src/lib/healthbridge/client.ts:145:11)",
    "details": "Connection to Healthbridge switch at 196.38.114.5:8443 refused. Username: netcare_prod, BHF: 1234567"
})

# 8. AI Coder response (should not leak patient context)
AI_CODER_RESPONSE = json.dumps({
    "suggestion": {
        "icd10Codes": [
            {"code": "I10", "description": "Essential hypertension", "confidence": "high", "isPMB": True, "reasoning": "Patient Thabo Mokoena presents with BP 160/100"}
        ],
        "cptCodes": [
            {"code": "0190", "description": "GP consultation", "estimatedTariff": 520}
        ],
        "clinicalSummary": "52yo male Thabo Mokoena (ID: 8501015800083) with uncontrolled hypertension on amlodipine. Contact: 0823456789."
    }
})

# ── Define test scenarios ──────────────────────────────────────────────

SCENARIOS = [
    {
        "name": "Claims List Response",
        "data": CLAIMS_LIST_RESPONSE,
        "endpoint": "/api/healthbridge/claims (GET)",
        "context": "list",
        "pii_acceptable": {
            "PERSON": False,        # Names should be masked in list views ideally, but acceptable
            "SA_ID_NUMBER": False,   # MUST be masked
            "MEDICAL_AID_NUMBER": False,
            "PHONE_NUMBER": False,
            "EMAIL_ADDRESS": False,
            "DATE_TIME": True,      # Dates of service are fine
        },
        "critical_pii": ["SA_ID_NUMBER"],  # These are NEVER acceptable unmasked
    },
    {
        "name": "Single Claim Detail",
        "data": CLAIM_DETAIL_RESPONSE,
        "endpoint": "/api/healthbridge/claims/[id] (GET)",
        "context": "detail",
        "pii_acceptable": {
            "PERSON": True,         # Name acceptable in claim detail
            "SA_ID_NUMBER": True,   # Acceptable in detail (authorized access)
            "MEDICAL_AID_NUMBER": True,
            "PHONE_NUMBER": True,   # Contact info acceptable in detail
            "EMAIL_ADDRESS": True,
            "URL": True,            # Email domains detected as URLs — acceptable
            "DATE_TIME": True,
        },
        "critical_pii": [],
    },
    {
        "name": "Analytics/Aggregate Response",
        "data": ANALYTICS_RESPONSE,
        "endpoint": "/api/healthbridge/analytics (GET)",
        "context": "analytics",
        "pii_acceptable": {
            "PERSON": False,
            "SA_ID_NUMBER": False,
            "MEDICAL_AID_NUMBER": False,
            "PHONE_NUMBER": False,
            "EMAIL_ADDRESS": False,
            "DATE_TIME": True,
        },
        "critical_pii": ["SA_ID_NUMBER", "PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS"],
    },
    {
        "name": "Aging Buckets Response",
        "data": AGING_RESPONSE,
        "endpoint": "/api/healthbridge/analytics/aging (GET)",
        "context": "analytics",
        "pii_acceptable": {
            "PERSON": False,        # Patient names in aggregate aging — PII leak
            "SA_ID_NUMBER": False,
            "MEDICAL_AID_NUMBER": False,
            "PHONE_NUMBER": False,
            "EMAIL_ADDRESS": False,
            "DATE_TIME": True,
        },
        "critical_pii": ["SA_ID_NUMBER"],
    },
    {
        "name": "Remittance Advice Response",
        "data": REMITTANCE_RESPONSE,
        "endpoint": "/api/healthbridge/remittance (GET)",
        "context": "financial",
        "pii_acceptable": {
            "PERSON": True,         # Patient names acceptable in ERA (authorized)
            "SA_ID_NUMBER": False,   # Should not be in ERA
            "MEDICAL_AID_NUMBER": True,  # Required in ERA
            "PHONE_NUMBER": False,
            "EMAIL_ADDRESS": False,
            "DATE_TIME": True,
        },
        "critical_pii": ["SA_ID_NUMBER", "PHONE_NUMBER"],
    },
    {
        "name": "Eligibility Check Response",
        "data": ELIGIBILITY_RESPONSE,
        "endpoint": "/api/healthbridge/eligibility (POST)",
        "context": "detail",
        "pii_acceptable": {
            "PERSON": True,
            "SA_ID_NUMBER": False,
            "MEDICAL_AID_NUMBER": False,
            "PHONE_NUMBER": False,
            "EMAIL_ADDRESS": False,
            "DATE_TIME": True,
        },
        "critical_pii": ["SA_ID_NUMBER"],
    },
    {
        "name": "Error Response (CRITICAL)",
        "data": ERROR_RESPONSE,
        "endpoint": "Any endpoint (error path)",
        "context": "error",
        "pii_acceptable": {
            "PERSON": False,
            "SA_ID_NUMBER": False,
            "MEDICAL_AID_NUMBER": False,
            "PHONE_NUMBER": False,
            "EMAIL_ADDRESS": False,
            "IP_ADDRESS": False,
            "URL": False,
            "DATE_TIME": True,
        },
        "critical_pii": ["SA_ID_NUMBER", "IP_ADDRESS", "PERSON"],
    },
    {
        "name": "AI Coder Response (CRITICAL)",
        "data": AI_CODER_RESPONSE,
        "endpoint": "/api/healthbridge/ai-code (POST)",
        "context": "ai_output",
        "pii_acceptable": {
            "PERSON": False,        # AI should NOT echo patient name in suggestion
            "SA_ID_NUMBER": False,   # AI should NEVER include ID numbers
            "PHONE_NUMBER": False,   # AI should NOT include phone numbers
            "EMAIL_ADDRESS": False,
            "DATE_TIME": True,
        },
        "critical_pii": ["SA_ID_NUMBER", "PERSON", "PHONE_NUMBER"],
    },
]


def run_pii_scan():
    print("=" * 70)
    print("HEALTHBRIDGE PII LEAK DETECTION — Presidio Analyzer")
    print("=" * 70)
    print()

    # Initialize Presidio with English NLP engine (en_core_web_sm)
    nlp_engine = SpacyNlpEngine(models=[{"lang_code": "en", "model_name": "en_core_web_sm"}])
    nlp_engine.load()
    registry = RecognizerRegistry()
    registry.load_predefined_recognizers(nlp_engine=nlp_engine)
    # Add SA-specific recognizers
    registry.add_recognizer(sa_id_recognizer)
    registry.add_recognizer(medical_aid_recognizer)

    analyzer = AnalyzerEngine(registry=registry, nlp_engine=nlp_engine)

    total_issues = 0
    critical_issues = 0
    warnings = 0
    results_by_scenario = []

    for scenario in SCENARIOS:
        print(f"--- {scenario['name']} ---")
        print(f"    Endpoint: {scenario['endpoint']}")

        # Run Presidio analysis
        findings = analyzer.analyze(
            text=scenario["data"],
            entities=[
                "PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "DATE_TIME",
                "IP_ADDRESS", "URL", "CREDIT_CARD", "IBAN_CODE",
                "SA_ID_NUMBER", "MEDICAL_AID_NUMBER",
            ],
            language="en",
            score_threshold=0.4,
        )

        # Filter and classify findings
        issues = []
        for finding in findings:
            entity_type = finding.entity_type
            score = finding.score
            value = scenario["data"][finding.start:finding.end]

            # Skip DATE_TIME — always acceptable
            if entity_type == "DATE_TIME":
                continue

            acceptable = scenario["pii_acceptable"].get(entity_type, False)
            is_critical = entity_type in scenario.get("critical_pii", [])

            if not acceptable:
                severity = "CRITICAL" if is_critical else "WARNING"
                issues.append({
                    "entity_type": entity_type,
                    "value": value[:30] + ("..." if len(value) > 30 else ""),
                    "score": score,
                    "severity": severity,
                    "position": f"{finding.start}-{finding.end}",
                })

                if is_critical:
                    critical_issues += 1
                else:
                    warnings += 1
                total_issues += 1

        if issues:
            for issue in issues:
                marker = "!!!" if issue["severity"] == "CRITICAL" else " ! "
                print(f"    {marker} [{issue['severity']}] {issue['entity_type']}: "
                      f"\"{issue['value']}\" (confidence: {issue['score']:.2f})")
        else:
            print("    [OK] No PII leaks detected")

        results_by_scenario.append({
            "name": scenario["name"],
            "issues": len(issues),
            "critical": sum(1 for i in issues if i["severity"] == "CRITICAL"),
        })
        print()

    # ── Summary ──
    print("=" * 70)
    print("PII LEAK DETECTION SUMMARY")
    print("=" * 70)
    print()
    for r in results_by_scenario:
        status = "PASS" if r["critical"] == 0 else "FAIL"
        icon = "[PASS]" if status == "PASS" else "[FAIL]"
        print(f"  {icon} {r['name']}: {r['issues']} issues ({r['critical']} critical)")
    print()
    print(f"  Total issues:    {total_issues}")
    print(f"  Critical issues: {critical_issues}")
    print(f"  Warnings:        {warnings}")
    print()

    if critical_issues > 0:
        print("  RESULT: FAIL — Critical PII leaks detected")
        print()
        print("  REMEDIATION REQUIRED:")
        print("  1. Error responses MUST NOT include patient ID numbers or IP addresses")
        print("  2. AI coder responses MUST NOT echo patient names/IDs in suggestions")
        print("  3. Analytics endpoints MUST NOT include patient names in aging claims")
        print("  4. Claims list endpoints SHOULD mask full SA ID numbers (show last 4 digits)")
        print()
        # Write machine-readable result
        with open("/Users/hga/netcare-healthos/scripts/.eval-pii-result.json", "w") as f:
            json.dump({"pass": False, "total_issues": total_issues, "critical": critical_issues, "warnings": warnings}, f)
        return 1
    else:
        print("  RESULT: PASS — No critical PII leaks")
        with open("/Users/hga/netcare-healthos/scripts/.eval-pii-result.json", "w") as f:
            json.dump({"pass": True, "total_issues": total_issues, "critical": critical_issues, "warnings": warnings}, f)
        return 0


if __name__ == "__main__":
    sys.exit(run_pii_scan())
