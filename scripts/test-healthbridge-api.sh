#!/bin/bash
# Healthbridge API Integration Test — tests every endpoint end-to-end
# Usage: DEMO_MODE=true npx next dev --port 3848 & sleep 10 && bash scripts/test-healthbridge-api.sh

BASE="${HEALTHBRIDGE_TEST_URL:-http://localhost:3900}"
PASS=0
FAIL=0
ERRORS=""

# Login
echo "=== LOGGING IN ==="
LOGIN=$(curl -s -c /tmp/hb-test-cookies.txt -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@netcare.co.za","password":"Netcare2026!"}' --max-time 10)

if echo "$LOGIN" | grep -q '"user"'; then
  echo "  ✓ Login successful"
  PASS=$((PASS+1))
else
  echo "  ✗ Login FAILED: $LOGIN"
  FAIL=$((FAIL+1))
  ERRORS="$ERRORS\nLogin failed"
fi

C="-b /tmp/hb-test-cookies.txt --max-time 10"
echo ""
echo "=== HEALTHBRIDGE API TESTS ==="
echo ""

# Helper
check() {
  local name="$1"
  local response="$2"
  local expected="$3"

  if echo "$response" | grep -q "$expected"; then
    echo "  ✓ $name"
    PASS=$((PASS+1))
  else
    echo "  ✗ $name"
    echo "    Expected to find: $expected"
    echo "    Got: $(echo "$response" | head -c 200)"
    FAIL=$((FAIL+1))
    ERRORS="$ERRORS\n$name"
  fi
}

# 1. Status
echo "--- 1. Status ---"
R=$(curl -s $C "$BASE/api/healthbridge/status")
check "GET /status returns integration info" "$R" '"name":"Healthbridge SA"'
check "GET /status has capabilities" "$R" '"capabilities"'
check "GET /status has switches" "$R" '"switches"'
check "GET /status has aiCoder" "$R" '"aiCoder"'

# 2. Claims GET
echo "--- 2. Claims List ---"
R=$(curl -s $C "$BASE/api/healthbridge/claims")
check "GET /claims returns array" "$R" '"claims"'

# 3. Claims POST
echo "--- 3. Claim Submission ---"
R=$(curl -s $C -X POST "$BASE/api/healthbridge/claims" \
  -H "Content-Type: application/json" \
  -d '{"patientName":"John Mokoena","patientDob":"1985-06-15","patientIdNumber":"8506155012089","medicalAidScheme":"Discovery Health","membershipNumber":"900012345","dependentCode":"00","dateOfService":"2026-03-20","placeOfService":"11","treatingProvider":"Dr Smith","lineItems":[{"icd10Code":"I10","cptCode":"0190","description":"GP consultation","quantity":1,"amount":52000}],"submit":true}')
check "POST /claims creates claim" "$R" '"claim"'
check "POST /claims has switchResponse" "$R" '"switchResponse"'
check "POST /claims returns status" "$R" '"status"'

# 4. Validate
echo "--- 4. Validate ---"
R=$(curl -s $C -X POST "$BASE/api/healthbridge/validate" \
  -H "Content-Type: application/json" \
  -d '{"patientName":"Test Patient","medicalAidScheme":"Discovery Health","membershipNumber":"900012345","dependentCode":"00","dateOfService":"2026-03-20","bhfNumber":"1234567","lineItems":[{"icd10Code":"I10","cptCode":"0190","description":"Test","quantity":1,"amount":52000}]}')
check "POST /validate returns validation" "$R" '"validation"'
check "POST /validate has PMB info" "$R" '"pmb"'
check "POST /validate has summary" "$R" '"summary"'

# 4b. Validate with GEMS invalid membership (should have errors)
R=$(curl -s $C -X POST "$BASE/api/healthbridge/validate" \
  -H "Content-Type: application/json" \
  -d '{"patientName":"Test","medicalAidScheme":"GEMS","membershipNumber":"12345","dependentCode":"00","dateOfService":"2026-03-20","bhfNumber":"1234567","lineItems":[{"icd10Code":"I10","cptCode":"0190","description":"Test","quantity":1,"amount":52000}]}')
check "POST /validate catches GEMS membership error" "$R" 'GEMS_MEMBERSHIP_FORMAT'

# 4c. Validate with missing ICD-10
R=$(curl -s $C -X POST "$BASE/api/healthbridge/validate" \
  -H "Content-Type: application/json" \
  -d '{"patientName":"Test","medicalAidScheme":"Discovery Health","membershipNumber":"900012345","dependentCode":"00","dateOfService":"2026-03-20","bhfNumber":"1234567","lineItems":[{"icd10Code":"","cptCode":"0190","description":"Test","quantity":1,"amount":52000}]}')
check "POST /validate catches missing ICD-10" "$R" 'MISSING_ICD10'

# 5. Eligibility
echo "--- 5. Eligibility ---"
R=$(curl -s $C -X POST "$BASE/api/healthbridge/eligibility" \
  -H "Content-Type: application/json" \
  -d '{"patientName":"John Mokoena","membershipNumber":"900012345","dependentCode":"00","scheme":"Discovery Health","patientDob":"1985-06-15"}')
check "POST /eligibility returns result" "$R" '"result"'
check "POST /eligibility has eligible flag" "$R" '"eligible"'
check "POST /eligibility has benefits" "$R" '"benefits"'

# 6. Analytics
echo "--- 6. Analytics ---"
R=$(curl -s $C "$BASE/api/healthbridge/analytics")
check "GET /analytics returns summary" "$R" '"summary"'
check "GET /analytics has schemeAnalytics" "$R" '"schemeAnalytics"'
check "GET /analytics has aging" "$R" '"aging"'

# 7. NAPPI
echo "--- 7. NAPPI Lookup ---"
R=$(curl -s $C "$BASE/api/healthbridge/nappi?q=metformin")
check "GET /nappi returns medicines" "$R" '"medicines"'
check "GET /nappi has count" "$R" '"count"'

# 7b. NAPPI with no query
R=$(curl -s $C "$BASE/api/healthbridge/nappi")
check "GET /nappi with no query returns 400" "$R" '"error"'

# 8. AI Code
echo "--- 8. AI Coder ---"
R=$(curl -s $C -X POST "$BASE/api/healthbridge/ai-code" \
  -H "Content-Type: application/json" \
  -d '{"clinicalNotes":"52-year-old male with persistent headache and elevated BP 160/100. History of hypertension on amlodipine 5mg. ECG normal sinus rhythm."}')
check "POST /ai-code returns suggestion" "$R" '"suggestion"'
check "POST /ai-code has ICD-10 codes" "$R" '"icd10Codes"'
check "POST /ai-code has meta" "$R" '"meta"'

# 8b. AI Code with short notes
R=$(curl -s $C -X POST "$BASE/api/healthbridge/ai-code" \
  -H "Content-Type: application/json" \
  -d '{"clinicalNotes":"hi"}')
check "POST /ai-code rejects short notes" "$R" '"error"'

# 9. Predict
echo "--- 9. Rejection Predictor ---"
R=$(curl -s $C -X POST "$BASE/api/healthbridge/predict" \
  -H "Content-Type: application/json" \
  -d '{"medicalAidScheme":"GEMS","membershipNumber":"000012345","lineItems":[{"icd10Code":"I10","cptCode":"0190","amount":52000}]}')
check "POST /predict returns prediction" "$R" '"prediction"'
check "POST /predict has probability" "$R" '"probability"'
check "POST /predict has risk level" "$R" '"risk"'

# 10. Autofill
echo "--- 10. Autofill ---"
R=$(curl -s $C -X POST "$BASE/api/healthbridge/autofill" \
  -H "Content-Type: application/json" \
  -d '{"clinicalNotes":"Patient presents with productive cough for 5 days, fever 38.2C. Diagnosis: acute bronchitis. Prescribed amoxicillin 500mg TDS for 7 days."}')
check "POST /autofill returns claim" "$R" '"claim"'
check "POST /autofill has lineItems" "$R" '"lineItems"'

# 11. Follow-ups
echo "--- 11. Follow-ups ---"
R=$(curl -s $C "$BASE/api/healthbridge/followups")
check "GET /followups returns data" "$R" '"followUps"'

# 12. Reconcile
echo "--- 12. Reconcile ---"
R=$(curl -s $C -X POST "$BASE/api/healthbridge/reconcile" \
  -H "Content-Type: application/json" -d '{}')
check "POST /reconcile returns results" "$R" '"reconciled"'

# 13. Remittances
echo "--- 13. Remittances ---"
R=$(curl -s $C "$BASE/api/healthbridge/remittances")
check "GET /remittances returns data" "$R" '"remittances"'

# 14. Batch
echo "--- 14. Batch Upload ---"
R=$(curl -s $C -X POST "$BASE/api/healthbridge/batch" \
  -H "Content-Type: application/json" \
  -d '{"csv":"patient_name,scheme,membership,icd10,cpt,description,amount\nJohn Mokoena,Discovery Health,900012345,I10,0190,GP consult,520\nPriya Naidoo,Bonitas,800067890,J06.9,0190,URTI consult,520","action":"validate"}')
check "POST /batch validates CSV" "$R" '"validation"'
check "POST /batch counts rows" "$R" '"totalRows"'

# 14b. Batch with empty CSV
R=$(curl -s $C -X POST "$BASE/api/healthbridge/batch" \
  -H "Content-Type: application/json" \
  -d '{"csv":"","action":"validate"}')
check "POST /batch rejects empty CSV" "$R" '"error"'

# 15. Export
echo "--- 15. Export ---"
R=$(curl -s $C "$BASE/api/healthbridge/export?format=csv" -w "\nHTTP_CODE:%{http_code}")
HTTP=$(echo "$R" | grep "HTTP_CODE:" | cut -d: -f2)
if [ "$HTTP" = "200" ]; then
  echo "  ✓ GET /export returns CSV (HTTP 200)"
  PASS=$((PASS+1))
else
  echo "  ✗ GET /export returned HTTP $HTTP"
  FAIL=$((FAIL+1))
  ERRORS="$ERRORS\nExport returned HTTP $HTTP"
fi

# Page loads
echo ""
echo "--- 16. Dashboard Pages ---"
for page in "/dashboard/healthbridge" "/dashboard/healthbridge/about" "/dashboard/healthbridge/research"; do
  R=$(curl -s $C "$BASE$page" -o /dev/null -w "%{http_code}")
  if [ "$R" = "200" ]; then
    echo "  ✓ $page loads (HTTP 200)"
    PASS=$((PASS+1))
  else
    echo "  ✗ $page returned HTTP $R"
    FAIL=$((FAIL+1))
    ERRORS="$ERRORS\n$page returned HTTP $R"
  fi
done

echo ""
echo "=========================================="
echo "  RESULTS: $PASS passed, $FAIL failed"
echo "=========================================="
if [ $FAIL -gt 0 ]; then
  echo ""
  echo "FAILURES:"
  echo -e "$ERRORS"
  exit 1
fi
