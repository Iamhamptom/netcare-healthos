#!/usr/bin/env bash
#
# Master Evaluation Summary — Healthbridge AI Claims Engine
# Runs all evaluations and produces a clinical-grade quality report.
# Run: bash /Users/hga/netcare-healthos/scripts/eval-summary.sh
#

set -uo pipefail

SCRIPTS_DIR="/Users/hga/netcare-healthos/scripts"
ML_TOOLKIT="/Users/hga/ml-toolkit"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   HEALTHBRIDGE AI CLAIMS ENGINE — CLINICAL EVALUATION REPORT       ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Date:    $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Version: v61 (Netcare Health OS)"
echo "  Runner:  Clinical-Grade ML Toolkit"
echo ""
echo "======================================================================"
echo ""

COMPOSITE=0
MAX_COMPOSITE=100
SECTION_SCORES=()

# ── 1. PII Leak Detection ──────────────────────────────────────────────

echo -e "${CYAN}[1/5] PII Leak Detection (Presidio)${NC}"
echo "----------------------------------------------------------------------"
cd "$ML_TOOLKIT" && uv run python "${SCRIPTS_DIR}/eval-pii-leaks.py" 2>&1
PII_EXIT=$?
echo ""

PII_RESULT="FAIL"
PII_DETAIL="Could not read results"
if [ -f "${SCRIPTS_DIR}/.eval-pii-result.json" ]; then
    PII_PASS=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-pii-result.json')); print('true' if d.get('pass') else 'false')")
    PII_CRITICAL=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-pii-result.json')); print(d.get('critical', -1))")
    PII_TOTAL=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-pii-result.json')); print(d.get('total_issues', -1))")
    if [ "$PII_PASS" = "true" ]; then
        PII_RESULT="PASS"
        PII_DETAIL="${PII_TOTAL} issues, 0 critical"
        COMPOSITE=$((COMPOSITE + 20))
    else
        PII_DETAIL="${PII_TOTAL} issues, ${PII_CRITICAL} critical"
        COMPOSITE=$((COMPOSITE + 5))
    fi
fi
SECTION_SCORES+=("PII|${PII_RESULT}|${PII_DETAIL}|20")

# ── 2. Clinical NLP Validation ─────────────────────────────────────────

echo -e "${CYAN}[2/5] Clinical NLP Validation (medspacy)${NC}"
echo "----------------------------------------------------------------------"
cd "$ML_TOOLKIT" && uv run python "${SCRIPTS_DIR}/eval-clinical-nlp.py" 2>&1
NLP_EXIT=$?
echo ""

NLP_RESULT="FAIL"
NLP_DETAIL="Could not read results"
if [ -f "${SCRIPTS_DIR}/.eval-clinical-result.json" ]; then
    NLP_PASS=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-clinical-result.json')); print('true' if d.get('pass') else 'false')")
    NLP_SCORE=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-clinical-result.json')); print(d.get('overall_score', 0))")
    NLP_ICD=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-clinical-result.json')); print(d.get('icd10_accuracy', 0))")
    NLP_FP=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-clinical-result.json')); print(d.get('fallback_false_positives', -1))")
    if [ "$NLP_PASS" = "true" ]; then
        NLP_RESULT="PASS"
        NLP_DETAIL="ICD-10 ${NLP_ICD}%, overall ${NLP_SCORE}%"
        COMPOSITE=$((COMPOSITE + 20))
    else
        NLP_DETAIL="ICD-10 ${NLP_ICD}%, overall ${NLP_SCORE}%, ${NLP_FP} false positives"
        COMPOSITE=$((COMPOSITE + 10))
    fi
fi
SECTION_SCORES+=("NLP|${NLP_RESULT}|${NLP_DETAIL}|20")

# ── 3. AI Output Quality Scoring ──────────────────────────────────────

echo -e "${CYAN}[3/5] AI Output Quality Scoring${NC}"
echo "----------------------------------------------------------------------"
cd "$ML_TOOLKIT" && uv run python "${SCRIPTS_DIR}/eval-ai-quality.py" 2>&1
QUALITY_EXIT=$?
echo ""

QUALITY_RESULT="FAIL"
QUALITY_DETAIL="Could not read results"
if [ -f "${SCRIPTS_DIR}/.eval-quality-result.json" ]; then
    Q_PASS=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-quality-result.json')); print('true' if d.get('pass') else 'false')")
    Q_F1=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-quality-result.json')); print(d.get('f1', 0))")
    Q_COMP=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-quality-result.json')); print(d.get('composite_score', 0))")
    if [ "$Q_PASS" = "true" ]; then
        QUALITY_RESULT="PASS"
        QUALITY_DETAIL="F1: ${Q_F1}, composite: ${Q_COMP}/100"
        COMPOSITE=$((COMPOSITE + 20))
    else
        QUALITY_DETAIL="F1: ${Q_F1}, composite: ${Q_COMP}/100"
        COMPOSITE=$((COMPOSITE + 10))
    fi
fi
SECTION_SCORES+=("Quality|${QUALITY_RESULT}|${QUALITY_DETAIL}|20")

# ── 4. Red-Team Adversarial Testing ───────────────────────────────────

echo -e "${CYAN}[4/5] Red-Team Adversarial Testing${NC}"
echo "----------------------------------------------------------------------"
bash "${SCRIPTS_DIR}/eval-red-team.sh" 2>&1
REDTEAM_EXIT=$?
echo ""

REDTEAM_RESULT="FAIL"
REDTEAM_DETAIL="Could not read results"
if [ -f "${SCRIPTS_DIR}/.eval-redteam-result.json" ]; then
    RT_PASS=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-redteam-result.json')); print('true' if d.get('pass') else 'false')")
    RT_PASSED=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-redteam-result.json')); print(d.get('passed', 0))")
    RT_TOTAL=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-redteam-result.json')); print(d.get('total', 0))")
    if [ "$RT_PASS" = "true" ]; then
        REDTEAM_RESULT="PASS"
        REDTEAM_DETAIL="${RT_PASSED}/${RT_TOTAL} attacks handled"
        COMPOSITE=$((COMPOSITE + 20))
    else
        RT_FAILED=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-redteam-result.json')); print(d.get('failed', 0))")
        REDTEAM_DETAIL="${RT_PASSED}/${RT_TOTAL} attacks handled, ${RT_FAILED} failed"
        COMPOSITE=$((COMPOSITE + 10))
    fi
fi
SECTION_SCORES+=("RedTeam|${REDTEAM_RESULT}|${REDTEAM_DETAIL}|20")

# ── 5. Financial Precision Audit ──────────────────────────────────────

echo -e "${CYAN}[5/5] Financial Precision Audit${NC}"
echo "----------------------------------------------------------------------"
cd "$ML_TOOLKIT" && uv run python "${SCRIPTS_DIR}/eval-financial.py" 2>&1
FINANCIAL_EXIT=$?
echo ""

FINANCIAL_RESULT="FAIL"
FINANCIAL_DETAIL="Could not read results"
if [ -f "${SCRIPTS_DIR}/.eval-financial-result.json" ]; then
    FIN_PASS=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-financial-result.json')); print('true' if d.get('pass') else 'false')")
    FIN_PASSED=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-financial-result.json')); print(d.get('passed', 0))")
    FIN_TOTAL=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-financial-result.json')); print(d.get('total_tests', 0))")
    if [ "$FIN_PASS" = "true" ]; then
        FINANCIAL_RESULT="PASS"
        FINANCIAL_DETAIL="${FIN_PASSED}/${FIN_TOTAL} calculations verified"
        COMPOSITE=$((COMPOSITE + 20))
    else
        FIN_FAILED=$(python3 -c "import json; d=json.load(open('${SCRIPTS_DIR}/.eval-financial-result.json')); print(d.get('failed', 0))")
        FINANCIAL_DETAIL="${FIN_PASSED}/${FIN_TOTAL} verified, ${FIN_FAILED} failed"
        COMPOSITE=$((COMPOSITE + 10))
    fi
fi
SECTION_SCORES+=("Financial|${FINANCIAL_RESULT}|${FINANCIAL_DETAIL}|20")

# ── Final Report ──────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║               CLINICAL EVALUATION RESULTS SUMMARY                  ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  === HEALTHBRIDGE AI CLAIMS ENGINE — CLINICAL EVALUATION ==="
echo "  Date:    $(date '+%Y-%m-%d')"
echo "  Version: v61"
echo ""

for entry in "${SECTION_SCORES[@]}"; do
    NAME=$(echo "$entry" | cut -d'|' -f1)
    STATUS=$(echo "$entry" | cut -d'|' -f2)
    DETAIL=$(echo "$entry" | cut -d'|' -f3)
    WEIGHT=$(echo "$entry" | cut -d'|' -f4)

    case "$NAME" in
        PII)       LABEL="1. PII Leak Detection (Presidio)    " ;;
        NLP)       LABEL="2. Clinical NLP Validation (medspacy)" ;;
        Quality)   LABEL="3. AI Output Quality Scoring         " ;;
        RedTeam)   LABEL="4. Red-Team Adversarial Testing      " ;;
        Financial) LABEL="5. Financial Precision Audit          " ;;
        *)         LABEL="$NAME" ;;
    esac

    if [ "$STATUS" = "PASS" ]; then
        echo -e "  ${GREEN}[PASS]${NC} ${LABEL} — ${DETAIL}"
    else
        echo -e "  ${RED}[FAIL]${NC} ${LABEL} — ${DETAIL}"
    fi
done

echo ""
echo "  ────────────────────────────────────────────────────"
echo -e "  ${BOLD}COMPOSITE SCORE: ${COMPOSITE}/100${NC}"
echo ""

if [ "$COMPOSITE" -ge 90 ]; then
    echo -e "  ${GREEN}${BOLD}CLINICAL READINESS: READY${NC}"
    echo "  The Healthbridge AI Claims Engine meets clinical-grade standards."
elif [ "$COMPOSITE" -ge 70 ]; then
    echo -e "  ${YELLOW}${BOLD}CLINICAL READINESS: CONDITIONAL${NC}"
    echo "  The engine is mostly ready but has issues that should be addressed"
    echo "  before production deployment."
else
    echo -e "  ${RED}${BOLD}CLINICAL READINESS: NOT READY${NC}"
    echo "  Critical issues must be resolved before production deployment."
fi

echo ""
echo "======================================================================"

# Write final summary JSON
cat > "${SCRIPTS_DIR}/.eval-final-result.json" << ENDJSON
{
  "date": "$(date '+%Y-%m-%d')",
  "version": "v61",
  "composite_score": ${COMPOSITE},
  "max_score": 100,
  "clinical_readiness": "$([ "$COMPOSITE" -ge 90 ] && echo "READY" || ([ "$COMPOSITE" -ge 70 ] && echo "CONDITIONAL" || echo "NOT_READY"))",
  "sections": {
    "pii": "${PII_RESULT}",
    "clinical_nlp": "${NLP_RESULT}",
    "ai_quality": "${QUALITY_RESULT}",
    "red_team": "${REDTEAM_RESULT}",
    "financial": "${FINANCIAL_RESULT}"
  }
}
ENDJSON

# Cleanup intermediate result files
rm -f "${SCRIPTS_DIR}/.eval-pii-result.json" \
      "${SCRIPTS_DIR}/.eval-clinical-result.json" \
      "${SCRIPTS_DIR}/.eval-quality-result.json" \
      "${SCRIPTS_DIR}/.eval-redteam-result.json" \
      "${SCRIPTS_DIR}/.eval-financial-result.json"

exit 0
