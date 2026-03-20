-- Netcare Health OS — Network & Analytics Tables
-- Run via Supabase SQL Editor or MCP tool

-- 1. Clinics (88 Medicross locations)
CREATE TABLE IF NOT EXISTS ho_clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'medicross_gp',
  region TEXT NOT NULL DEFAULT '',
  province TEXT NOT NULL DEFAULT '',
  address TEXT DEFAULT '',
  lat DOUBLE PRECISION DEFAULT 0,
  lng DOUBLE PRECISION DEFAULT 0,
  phone TEXT DEFAULT '',
  hours TEXT DEFAULT 'Mon-Fri 8:00-17:00, Sat 8:00-13:00',
  practitioner_count INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Clinic Metrics (monthly snapshots)
CREATE TABLE IF NOT EXISTS ho_clinic_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES ho_clinics(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  revenue INT DEFAULT 0,
  target INT DEFAULT 0,
  claims_submitted INT DEFAULT 0,
  claims_rejected INT DEFAULT 0,
  rejection_rate NUMERIC(5,2) DEFAULT 0,
  collection_ratio NUMERIC(5,2) DEFAULT 0,
  patient_count INT DEFAULT 0,
  avg_wait_time_min INT DEFAULT 0,
  savings_claims INT DEFAULT 0,
  savings_era INT DEFAULT 0,
  savings_debtors INT DEFAULT 0,
  savings_capitation INT DEFAULT 0,
  savings_compliance INT DEFAULT 0,
  savings_pharmacy INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clinic_id, month)
);

-- 3. Medical Scheme Metrics
CREATE TABLE IF NOT EXISTS ho_medical_scheme_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_name TEXT NOT NULL,
  month TEXT NOT NULL,
  lives_covered INT DEFAULT 0,
  claims_volume INT DEFAULT 0,
  rejection_rate NUMERIC(5,2) DEFAULT 0,
  avg_payment_days INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(scheme_name, month)
);

-- 4. Rejection Codes
CREATE TABLE IF NOT EXISTS ho_rejection_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  month TEXT NOT NULL DEFAULT '',
  count INT DEFAULT 0,
  value INT DEFAULT 0,
  ai_recommendation TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Division KPIs
CREATE TABLE IF NOT EXISTS ho_division_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  target TEXT NOT NULL,
  pct NUMERIC(6,2) DEFAULT 0,
  trend TEXT DEFAULT '',
  status TEXT DEFAULT 'on_track',
  icon TEXT DEFAULT '',
  color TEXT DEFAULT '',
  month TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ICD-10-ZA Codes (20K+)
CREATE TABLE IF NOT EXISTS ho_icd10_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT DEFAULT '',
  chapter INT DEFAULT 0,
  is_billable BOOLEAN DEFAULT true,
  gender_specific TEXT DEFAULT '',
  age_range TEXT DEFAULT '',
  pmb_condition BOOLEAN DEFAULT false,
  requires_auth BOOLEAN DEFAULT false,
  common_rejections TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_icd10_code ON ho_icd10_codes(code);
CREATE INDEX IF NOT EXISTS idx_icd10_desc ON ho_icd10_codes USING gin(to_tsvector('english', description));

-- 7. Integration Status (CareOn Bridge)
CREATE TABLE IF NOT EXISTS ho_integration_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT NOT NULL,
  status TEXT DEFAULT 'not_connected',
  last_sync_at TIMESTAMPTZ,
  records_synced INT DEFAULT 0,
  error_count INT DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Clinic Directory (WhatsApp routing)
CREATE TABLE IF NOT EXISTS ho_clinic_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES ho_clinics(id) ON DELETE CASCADE,
  services JSONB DEFAULT '[]',
  whatsapp_enabled BOOLEAN DEFAULT true,
  booking_url TEXT DEFAULT '',
  emergency_number TEXT DEFAULT '082 911',
  on_call_doctor TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE ho_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ho_clinic_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ho_medical_scheme_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ho_rejection_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ho_division_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ho_icd10_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ho_integration_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE ho_clinic_directory ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (API routes use service role key)
CREATE POLICY "service_role_all" ON ho_clinics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON ho_clinic_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON ho_medical_scheme_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON ho_rejection_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON ho_division_kpis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON ho_icd10_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON ho_integration_status FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON ho_clinic_directory FOR ALL USING (true) WITH CHECK (true);
