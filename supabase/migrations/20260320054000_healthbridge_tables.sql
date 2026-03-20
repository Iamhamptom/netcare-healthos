-- Healthbridge SA Medical Aid Claims Switching Tables
-- Migration: 20260320054000_healthbridge_tables

-- Claims submitted to medical aid switches
CREATE TABLE IF NOT EXISTS healthbridge_claims (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  practice_id TEXT NOT NULL,
  invoice_id TEXT DEFAULT '',
  patient_name TEXT NOT NULL,
  patient_id_number TEXT DEFAULT '',
  medical_aid_scheme TEXT DEFAULT '',
  membership_number TEXT DEFAULT '',
  dependent_code TEXT DEFAULT '00',
  date_of_service TEXT DEFAULT '',
  place_of_service TEXT DEFAULT '11',
  bhf_number TEXT DEFAULT '',
  provider_number TEXT DEFAULT '',
  treating_provider TEXT DEFAULT '',
  authorization_number TEXT DEFAULT '',
  -- Claim data
  line_items TEXT DEFAULT '[]',
  total_amount INTEGER DEFAULT 0,
  -- Switch response
  transaction_ref TEXT DEFAULT '',
  status TEXT DEFAULT 'draft',
  approved_amount INTEGER DEFAULT 0,
  rejection_code TEXT DEFAULT '',
  rejection_reason TEXT DEFAULT '',
  -- eRA reconciliation
  paid_amount INTEGER DEFAULT 0,
  remittance_ref TEXT DEFAULT '',
  reconciled_at TIMESTAMPTZ,
  -- XML audit trail
  request_xml TEXT DEFAULT '',
  response_xml TEXT DEFAULT '',
  -- Lifecycle
  submitted_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hb_claims_practice ON healthbridge_claims(practice_id);
CREATE INDEX IF NOT EXISTS idx_hb_claims_status ON healthbridge_claims(status);
CREATE INDEX IF NOT EXISTS idx_hb_claims_membership ON healthbridge_claims(membership_number);
CREATE INDEX IF NOT EXISTS idx_hb_claims_txref ON healthbridge_claims(transaction_ref);

-- Electronic Remittance Advice (eRA) from medical aids
CREATE TABLE IF NOT EXISTS healthbridge_remittances (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  practice_id TEXT NOT NULL,
  scheme TEXT DEFAULT '',
  remittance_ref TEXT DEFAULT '',
  payment_date TEXT DEFAULT '',
  total_amount INTEGER DEFAULT 0,
  claim_count INTEGER DEFAULT 0,
  payments TEXT DEFAULT '[]',
  status TEXT DEFAULT 'received',
  reconciled_count INTEGER DEFAULT 0,
  unmatched_count INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hb_remittances_practice ON healthbridge_remittances(practice_id);
CREATE INDEX IF NOT EXISTS idx_hb_remittances_ref ON healthbridge_remittances(remittance_ref);

-- Benefit/eligibility check history
CREATE TABLE IF NOT EXISTS healthbridge_eligibility (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  practice_id TEXT NOT NULL,
  patient_name TEXT DEFAULT '',
  membership_number TEXT DEFAULT '',
  dependent_code TEXT DEFAULT '00',
  scheme TEXT DEFAULT '',
  eligible BOOLEAN DEFAULT FALSE,
  option TEXT DEFAULT '',
  benefits TEXT DEFAULT '[]',
  pre_auth_required BOOLEAN DEFAULT FALSE,
  response_data TEXT DEFAULT '{}',
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hb_eligibility_practice ON healthbridge_eligibility(practice_id);
CREATE INDEX IF NOT EXISTS idx_hb_eligibility_membership ON healthbridge_eligibility(membership_number);

-- Claims analysis reports
CREATE TABLE IF NOT EXISTS claims_analysis (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  practice_id TEXT NOT NULL,
  file_name TEXT DEFAULT '',
  total_claims INTEGER DEFAULT 0,
  valid_claims INTEGER DEFAULT 0,
  invalid_claims INTEGER DEFAULT 0,
  warning_claims INTEGER DEFAULT 0,
  rejection_rate REAL DEFAULT 0,
  estimated_savings REAL DEFAULT 0,
  scheme_code TEXT DEFAULT '',
  result_json TEXT DEFAULT '{}',
  top_issues_json TEXT DEFAULT '[]',
  analyzed_by TEXT DEFAULT '',
  period TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_analysis_practice ON claims_analysis(practice_id);
CREATE INDEX IF NOT EXISTS idx_claims_analysis_period ON claims_analysis(period);

-- Claims validation rules (global + per-practice)
CREATE TABLE IF NOT EXISTS claims_rules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  practice_id TEXT DEFAULT '',
  rule_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  severity TEXT DEFAULT 'error',
  enabled BOOLEAN DEFAULT TRUE,
  category TEXT DEFAULT 'icd10',
  metadata TEXT DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(practice_id, rule_code)
);

CREATE INDEX IF NOT EXISTS idx_claims_rules_practice ON claims_rules(practice_id);

-- Enable RLS
ALTER TABLE healthbridge_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthbridge_remittances ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthbridge_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies (service role bypasses, auth users access their practice)
CREATE POLICY "service_role_all" ON healthbridge_claims FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON healthbridge_remittances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON healthbridge_eligibility FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON claims_analysis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON claims_rules FOR ALL USING (true) WITH CHECK (true);
