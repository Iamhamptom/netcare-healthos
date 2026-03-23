# Claims Analyzer — Product Knowledge Base

## What It Is
The Claims Analyzer is an AI-powered pre-submission ICD-10 validation tool for South African medical practices. It catches claim rejections BEFORE they hit the medical scheme switch — saving practices money and admin time.

## Target User
- **Practice managers** at GP practices, specialist clinics, dental surgeries
- **Medical billing clerks** who submit claims daily
- **Practice owners** who lose R20K-R200K/month to claim rejections
- Non-technical users who just want to upload a file and get answers

## The Problem It Solves
SA medical practices lose 15-30% of revenue to claim rejections. The top causes:
1. Invalid/non-specific ICD-10 codes (30% of all rejections)
2. Missing external cause codes for injuries
3. Gender/age mismatches
4. Duplicate submissions
5. Format errors (spaces, wrong decimals, missing dots)
6. Missing dependent codes or practice numbers

Practices discover these rejections 30-90 days AFTER submission — by then the money is lost.

## How It Works

### Chat Interface (`/dashboard/claims-chat`)
1. User drops ANY CSV file into the chat (comma, semicolon, tab-delimited, with BOM, any column names)
2. AI instantly analyzes every claim against:
   - ICD-10-ZA format and validity (41,009 codes in MIT database)
   - Gender/age restrictions per code
   - External cause code requirements (S/T injuries need V/W/X/Y)
   - Dagger/asterisk conventions
   - Scheme-specific rules (Discovery, GEMS, Bonitas, etc.)
   - Duplicate detection (same patient + code + date)
   - Tariff code validation against NHRPL
   - NAPPI medicine code validation
   - Prescribed Minimum Benefits (PMB/CDL) flagging
3. Shows results as a natural language summary with stats
4. User can say "fix the rejections" → system auto-corrects and re-analyzes
5. Download fixed CSV or PDF report

### Auto-Corrections (what the system can fix automatically)
- **Non-specific codes**: J06 → J06.9 (append .9 unspecified)
- **Missing dots**: J069 → J06.9
- **Spaces in codes**: "J 06.9" → "J06.9"
- **Lowercase**: j06.9 → J06.9
- **Letter O / digit 0 confusion**: O19O → attempted fix
- **Missing ECC**: Adds X59 (unspecified external cause) for S/T injury codes
- **ECC as primary**: Swaps primary ↔ secondary
- **Duplicate claims**: Removed from output CSV
- **Missing dependent code**: Defaults to "00" (main member)

### What requires human review
- Gender mismatches (C53.9 cervical cancer on male — data entry error?)
- Unbundling violations (billing GP + specialist consultation together)
- Missing practice numbers (needs real BHF number)
- Clinical appropriateness (does the diagnosis match the procedure?)

## Key Features
- **Smart column detection**: Auto-detects ICD-10 column by scanning actual data values, not just header names
- **Self-diagnosis**: When 80%+ claims fail the same error, automatically re-maps columns and re-runs
- **Batch intelligence**: Detects patterns and explains them in plain English
- **Fix & re-analyze loop**: Fix → re-validate → download → re-upload to verify
- **AI chat**: Powered by Gemini 2.5 Flash + Claude Sonnet fallback with SA medical coding expertise
- **RAG enrichment**: Queries HealthOS-Med knowledge base for context-aware responses
- **Chat history**: Persists across page refreshes, saves to server for analytics
- **Learning**: Every fix operation logs to the ML reinforcement system

## Supported File Formats
- CSV (comma-delimited)
- TSV (tab-delimited)
- Semicolon-delimited (SA Excel default — common in South Africa)
- Files with BOM (Byte Order Mark from Excel exports)
- Healthbridge EDI export format (ICD10_1, ICD10_2, TARIFF_CODE, AMOUNT)

## Required CSV Column (minimum)
Only `icd10_code` is required. The system auto-detects column names from 30+ aliases including: diagnosis, dx, icd, code, diag_code, primary_icd10, etc.

## Optional CSV Columns
patient_name, patient_gender, patient_age, tariff_code, nappi_code, amount, date_of_service, scheme, dependent_code, practice_number, membership_number, secondary_icd10, modifier, quantity

## SA Medical Coding Rules Enforced
1. ICD-10-ZA format: Letter + 2 digits + optional dot + 1-4 subcategory chars
2. Gender restrictions: Male-only codes (N40-N51, prostate/testicular), Female-only (N70-N98, O00-O99, C53-C58)
3. Age restrictions: Neonatal codes (P00-P96) only for patients < 28 days
4. External cause codes: S/T injury codes MUST have V/W/X/Y secondary
5. Asterisk convention: Manifestation codes (*) cannot be primary — must use dagger (†) as primary
6. Specificity: 3-character codes require 4th character where MIT says so
7. Symptom codes: R-chapter codes as primary generate warnings (prefer definitive diagnosis)
8. PMB/CDL: 270 DTPs + 27 CDL conditions automatically flagged
9. Duplicate detection: Same patient + diagnosis + date = likely duplicate
10. Modifier validation: 0019 neonatal modifier only for patients < 28 days

## Scheme-Specific Rules
- **Discovery Health**: Strict ECC enforcement, PMB routing, no self-referral for specialists
- **GEMS**: 9-digit membership format, government employee specific rules
- **Bonitas**: Benefit limit checks, pre-authorization requirements
- **Medshield, Momentum, Bestmed**: Standard CMS rules

## Technical Architecture
- **Frontend**: Next.js 16, React, Tailwind CSS, Framer Motion
- **AI**: Gemini 2.5 Flash (primary) + Claude Sonnet (fallback) + HealthOS-Med RAG
- **Validation Engine**: Deterministic rule engine (no AI needed for rule checks)
- **Auto-Corrector**: Pattern-based corrections with confidence levels (high/medium/low)
- **Database**: ICD-10 MIT (41,009 codes), NAPPI (487K medicines), NHRPL tariffs
- **Knowledge Base**: 300MB compiled SA healthcare intelligence (13 files + 67 source PDFs)

## User Expectations
1. Upload ANY file → system figures it out (don't reject, fix it)
2. Every error should be explained in plain English with a specific fix
3. The system should fix everything it can automatically
4. Show before/after comparison so user can see the improvement
5. Download the cleaned file ready for submission
6. Remember conversation history
7. Learn from every analysis to get better over time
8. Never show third-party vendor names (ElevenLabs, Claude, Gemini) — it's "our AI"
