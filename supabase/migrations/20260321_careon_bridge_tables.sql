-- CareOn Bridge — Persistent Storage Tables
-- Replaces in-memory arrays with Supabase-backed persistence
-- Tables: ho_bridge_advisories, ho_bridge_messages, ho_bridge_audit

-- ── Advisories ──
CREATE TABLE IF NOT EXISTS ho_bridge_advisories (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  patient_mrn TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  encounter_type TEXT NOT NULL,
  facility TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('billing', 'coding', 'compliance', 'clinical', 'eligibility')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'success')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_icd10 JSONB NOT NULL DEFAULT '[]',
  estimated_value INTEGER NOT NULL DEFAULT 0,
  action_required BOOLEAN NOT NULL DEFAULT false,
  auto_resolvable BOOLEAN NOT NULL DEFAULT false,
  source_message_type TEXT NOT NULL,
  source_message_id TEXT NOT NULL,
  -- Resolution
  resolution_action TEXT,
  resolution_by TEXT,
  resolution_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolution_claim_id TEXT,
  resolution_notified BOOLEAN
);

CREATE INDEX IF NOT EXISTS idx_bridge_adv_created ON ho_bridge_advisories (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bridge_adv_severity ON ho_bridge_advisories (severity);
CREATE INDEX IF NOT EXISTS idx_bridge_adv_facility ON ho_bridge_advisories (facility);
CREATE INDEX IF NOT EXISTS idx_bridge_adv_action ON ho_bridge_advisories (action_required) WHERE action_required = true;

-- ── Message Log ──
CREATE TABLE IF NOT EXISTS ho_bridge_messages (
  id TEXT PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  message_type TEXT NOT NULL,
  facility TEXT NOT NULL,
  patient_mrn TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('processed', 'advisory_generated', 'error', 'ignored')),
  advisory_count INTEGER NOT NULL DEFAULT 0,
  processing_time_ms INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_bridge_msg_received ON ho_bridge_messages (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_bridge_msg_facility ON ho_bridge_messages (facility);

-- ── Audit Log (POPIA — 5 year retention) ──
CREATE TABLE IF NOT EXISTS ho_bridge_audit (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  action TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  advisory_id TEXT,
  facility TEXT,
  patient_mrn TEXT,
  detail TEXT NOT NULL,
  ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_bridge_audit_created ON ho_bridge_audit (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bridge_audit_user ON ho_bridge_audit (user_id);
CREATE INDEX IF NOT EXISTS idx_bridge_audit_action ON ho_bridge_audit (action);

-- ── Seed demo data ──
INSERT INTO ho_bridge_advisories (id, created_at, patient_mrn, patient_name, encounter_type, facility, category, severity, title, description, suggested_icd10, estimated_value, action_required, auto_resolvable, source_message_type, source_message_id) VALUES
  ('adv-001', now() - interval '3 hours', 'MRN-4521', 'Johan van der Merwe', 'Admission', 'Netcare Milpark Hospital', 'billing', 'info', 'Knee Replacement Admission — Billing Pack Ready', 'Patient admitted for primary gonarthrosis (M17.1). Discovery Executive Plan detected. Pre-authorization likely required for total knee arthroplasty. Comorbidity E11.9 (T2DM) should be included for accurate DRG grouping.', '[{"code":"M17.1","description":"Primary gonarthrosis, unilateral","confidence":0.98},{"code":"E11.9","description":"Type 2 diabetes mellitus without complications","confidence":0.95}]', 185000, true, false, 'ADT^A01', 'MSG001'),
  ('adv-002', now() - interval '1 hour', 'MRN-7823', 'Thabo Mokoena', 'Discharge', 'Netcare Sunninghill Hospital', 'coding', 'warning', 'Cardiac Discharge — Missing Procedure Code', 'Patient discharged after cardiac catheterization. Final diagnoses I25.1 + I10 + E78.0 are correct, but no procedure code for the catheterization. Bonitas BonComprehensive requires procedure codes for claims above R50,000. Add CPT 93458.', '[{"code":"I25.1","description":"Atherosclerotic heart disease","confidence":0.99},{"code":"I10","description":"Essential hypertension","confidence":0.97},{"code":"E78.0","description":"Pure hypercholesterolaemia","confidence":0.94}]', 72000, true, false, 'ADT^A03', 'MSG002'),
  ('adv-003', now() - interval '45 minutes', 'MRN-3341', 'Nomsa Dlamini', 'Lab Results', 'Netcare Garden City Hospital', 'clinical', 'critical', 'Critical HbA1c — Undiagnosed Diabetes Likely', 'Blood panel shows HbA1c 8.2% (critically high). Pattern strongly suggests undiagnosed Type 2 diabetes with dyslipidaemia. If diagnosed, E11.9 + E78.5 should be added for chronic disease management billing.', '[{"code":"E11.9","description":"Type 2 diabetes mellitus","confidence":0.92},{"code":"E78.5","description":"Dyslipidaemia, unspecified","confidence":0.88}]', 2400, true, false, 'ORU^R01', 'MSG003'),
  ('adv-004', now() - interval '30 minutes', 'MRN-9102', 'Sarah Smith', 'Outpatient Visit', 'Medicross Sandton City', 'eligibility', 'success', 'GEMS Emerald — Eligibility Confirmed', 'Outpatient visit for acute URTI (J06.9). GEMS Emerald plan benefits confirmed. GP consultation covered at 100% of scheme rate. Claim can be auto-submitted.', '[{"code":"J06.9","description":"Acute upper respiratory infection","confidence":0.99}]', 650, false, true, 'ADT^A04', 'MSG004'),
  ('adv-005', now() - interval '15 minutes', 'MRN-6678', 'Peter Williams', 'Radiology Order', 'Christiaan Barnard Memorial Hospital', 'compliance', 'warning', 'CT Brain — Pre-Authorization Check Required', 'Stat CT Brain ordered. Most medical aid schemes require pre-authorization for CT scans. Patient insurance details not in this message.', '[]', 8500, true, false, 'ORM^O01', 'MSG005')
ON CONFLICT (id) DO NOTHING;

-- Seed message log
INSERT INTO ho_bridge_messages (id, received_at, message_type, facility, patient_mrn, status, advisory_count, processing_time_ms) VALUES
  ('log-001', now() - interval '3 hours', 'ADT^A01', 'Netcare Milpark Hospital', 'MRN-4521', 'advisory_generated', 1, 145),
  ('log-002', now() - interval '2.5 hours', 'ADT^A08', 'Netcare Milpark Hospital', 'MRN-4521', 'processed', 0, 32),
  ('log-003', now() - interval '1 hour', 'ADT^A03', 'Netcare Sunninghill Hospital', 'MRN-7823', 'advisory_generated', 1, 189),
  ('log-004', now() - interval '45 minutes', 'ORU^R01', 'Netcare Garden City Hospital', 'MRN-3341', 'advisory_generated', 1, 267),
  ('log-005', now() - interval '40 minutes', 'ADT^A01', 'Netcare Olivedale Hospital', 'MRN-1190', 'processed', 0, 41),
  ('log-006', now() - interval '35 minutes', 'ADT^A04', 'Medicross Sandton City', 'MRN-9102', 'advisory_generated', 1, 98),
  ('log-007', now() - interval '30 minutes', 'ADT^A01', 'Netcare Unitas Hospital', 'MRN-5543', 'processed', 0, 38),
  ('log-008', now() - interval '25 minutes', 'ORU^R01', 'Netcare N1 City Hospital', 'MRN-8821', 'processed', 0, 55),
  ('log-009', now() - interval '15 minutes', 'ORM^O01', 'Christiaan Barnard Memorial Hospital', 'MRN-6678', 'advisory_generated', 1, 134),
  ('log-010', now() - interval '5 minutes', 'ADT^A08', 'Netcare Sunninghill Hospital', 'MRN-7823', 'processed', 0, 29)
ON CONFLICT (id) DO NOTHING;
