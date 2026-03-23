# Claims Analyzer — Blind Test Learnings

Rules discovered through blind testing with 300+ claims across 6 rounds.
Each rule was missing from the engine and caused false negatives.

## Rules Added After Blind Tests

### Round 4-5 Failures (v93)
- **INVALID_DATE_FORMAT**: Slash dates (YYYY/MM/DD) not caught. SA standard is YYYY-MM-DD.
- **FUTURE_DATE**: Dates in the future not caught.
- **STALE_CLAIM**: Claims > 120 days old not caught. Medical Schemes Act Reg 6.
- **INVALID_AMOUNT_FORMAT**: Comma decimals (450,00) not caught. SA uses comma as decimal.
- **MISSING_PATIENT_NAME**: Blank patient names approved.
- **EXCESSIVE_AMOUNT**: Amounts > R100K not flagged.

### Round 5-6 Failures (v96)
- **EXCESSIVE_QUANTITY**: GP billing 4+ consults per claim not caught.
- **NEONATAL_MODIFIER_AGE**: Modifier 0019 on adults not caught.
- **MEDICATION_DIAGNOSIS_MISMATCH**: Paracetamol (7020901) for asthma (J45.x) not flagged.
- **PMB_MODIFIER_MISSING**: CDL conditions without PMB modifier not warned.

### Round 6 Failures (v97)
- **TARIFF_DISCIPLINE_MISMATCH**: Dental tariffs (81xx-89xx) billed by GP practices.
- **INVALID_TARIFF_FORMAT**: Non-4-digit tariff codes not caught.
- **CLINICAL_RED_FLAG**: X-ray/imaging for back pain (M54.x) without motivation text.
- **AMOUNT_ABOVE_SCHEME_RATE**: Amounts 2x+ above typical scheme rates.
- **MULTIPLE_MODIFIERS**: Claims with multiple comma-separated modifiers.

## False Positive Fixes
- **UNKNOWN_TARIFF**: Downgraded from warning to info. Our DB is GEMS-only (4,660 codes), not full NHRPL.
- **UNBUNDLING**: Now checks same patient + same date only. Was checking across all patients.
- **Insufficient Specificity**: Some 3-char codes are valid as-is. Don't force 4th char when MIT doesn't require it.

## Architecture Lessons
1. Deterministic rules MUST be code, not AI prompts. AI hallucinates when asked to check dates/amounts.
2. Rules must be committed to git — local-only code doesn't deploy.
3. `applyMedium=true` must be default for Fix endpoint — otherwise duplicates aren't removed.
4. RAG must be importable directly, not via HTTP — serverless can't call itself.
5. All 29 blind test rule codes are now implemented in validation-engine.ts.
