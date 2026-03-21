-- Multi-Tenant Platform Layer
-- One deploy, infinite brands. Each tenant gets their own skin, features, business model.

CREATE TABLE IF NOT EXISTS ho_tenants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL, -- subdomain: "healthbridge" → healthbridge.healthos.co
  name TEXT NOT NULL,
  industry_type TEXT NOT NULL DEFAULT 'billing_bureau', -- billing_bureau | hospital | enterprise_funder | software_platform | practice_group
  status TEXT NOT NULL DEFAULT 'trial', -- trial | active | suspended | churned

  -- Branding (skin)
  logo_url TEXT DEFAULT '',
  favicon_url TEXT DEFAULT '',
  primary_color TEXT DEFAULT '#D4AF37',
  secondary_color TEXT DEFAULT '#2DD4BF',
  accent_color TEXT DEFAULT '#6C5CE7',
  tagline TEXT DEFAULT '',
  support_email TEXT DEFAULT '',
  support_phone TEXT DEFAULT '',
  website_url TEXT DEFAULT '',

  -- Feature Flags (products on/off)
  feature_claims_analyzer BOOLEAN DEFAULT true,
  feature_fhir_hub BOOLEAN DEFAULT false,
  feature_switching_engine BOOLEAN DEFAULT false,
  feature_whatsapp BOOLEAN DEFAULT false,
  feature_placeo BOOLEAN DEFAULT false,
  feature_careon_bridge BOOLEAN DEFAULT false,
  feature_patient_portal BOOLEAN DEFAULT true,
  feature_billing BOOLEAN DEFAULT true,
  feature_bookings BOOLEAN DEFAULT true,
  feature_recall BOOLEAN DEFAULT true,
  feature_referrals BOOLEAN DEFAULT false,
  feature_ops_hub BOOLEAN DEFAULT false,
  feature_investor_portal BOOLEAN DEFAULT false,
  feature_outreach BOOLEAN DEFAULT false,
  feature_ml_pipeline BOOLEAN DEFAULT false,

  -- Business / Billing
  pricing_model TEXT DEFAULT 'monthly', -- per_claim | monthly | enterprise | revenue_share
  rate FLOAT DEFAULT 0,
  commission_split FLOAT DEFAULT 0, -- 0-100 for revenue_share
  payment_terms INT DEFAULT 30,
  billing_email TEXT DEFAULT '',
  vat_number TEXT DEFAULT '',
  paystack_sub_id TEXT DEFAULT '',

  -- Legal
  agreement_template TEXT DEFAULT 'bureau', -- bureau | hospital | enterprise
  custom_terms TEXT DEFAULT '',
  signed_at TIMESTAMPTZ,
  signed_by TEXT DEFAULT '',

  -- Metadata
  trial_ends_at TIMESTAMPTZ,
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ho_tenants_status ON ho_tenants(status);
CREATE INDEX IF NOT EXISTS idx_ho_tenants_slug ON ho_tenants(slug);

-- Links tenants to practices
CREATE TABLE IF NOT EXISTS ho_tenant_practices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id TEXT NOT NULL REFERENCES ho_tenants(id) ON DELETE CASCADE,
  practice_id TEXT NOT NULL,
  role TEXT DEFAULT 'managed', -- managed | owned | demo
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, practice_id)
);

CREATE INDEX IF NOT EXISTS idx_ho_tp_tenant ON ho_tenant_practices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ho_tp_practice ON ho_tenant_practices(practice_id);

-- Seed demo tenants for sales
INSERT INTO ho_tenants (slug, name, industry_type, status, primary_color, secondary_color, accent_color, tagline, website_url, feature_claims_analyzer, feature_fhir_hub, feature_switching_engine, feature_whatsapp, feature_placeo, feature_careon_bridge, feature_billing, feature_bookings, feature_patient_portal)
VALUES
  ('healthbridge', 'Healthbridge', 'billing_bureau', 'demo', '#0066CC', '#00A3E0', '#004C99', 'Transforming Private Practice', 'https://healthbridge.co.za', true, true, true, true, false, false, true, true, true),
  ('xpedient', 'Xpedient Medical', 'billing_bureau', 'demo', '#1B4D3E', '#2E8B57', '#006400', 'Medical Business Solutions', 'https://xpedient.co.za', true, true, true, false, false, false, true, true, true),
  ('sims', 'SIMS Medical Bureau', 'billing_bureau', 'demo', '#003366', '#336699', '#0055AA', 'Medical Account Administration', 'https://www.sims.co.za', true, false, false, false, false, false, true, true, true),
  ('pracmed', 'PracMed', 'billing_bureau', 'demo', '#2C3E50', '#3498DB', '#2980B9', 'Claims Submission & Recovery', 'https://www.pracmed.co.za', true, false, false, false, false, false, true, true, true),
  ('discovery', 'Discovery Health', 'enterprise_funder', 'demo', '#003087', '#0050C8', '#FF6600', 'Claims Intelligence Platform', 'https://www.discovery.co.za', true, true, true, true, true, true, true, true, true),
  ('medscheme', 'Medscheme', 'enterprise_funder', 'demo', '#8B0000', '#CC0000', '#FF3333', 'Multi-Scheme Claims Intelligence', 'https://www.medscheme.com', true, true, true, true, true, true, true, true, true),
  ('medikredit', 'MediKredit', 'software_platform', 'demo', '#1A237E', '#3F51B5', '#536DFE', 'HealthNet ST® Intelligence Layer', 'https://www.medikredit.co.za', true, true, true, false, false, false, false, false, false),
  ('goodx', 'GoodX Software', 'software_platform', 'demo', '#FF6B00', '#FF8C3A', '#CC5500', 'AI-Powered Practice Management', 'https://goodx.co.za', true, false, false, false, false, false, true, true, true),
  ('netcare', 'Netcare Primary Healthcare', 'hospital', 'demo', '#006B3F', '#00A86B', '#00CC7A', 'AI Operations — 88 Clinics', 'https://www.netcare.co.za', true, true, true, true, true, true, true, true, true),
  ('ekb', 'EKB Medical Bureau', 'billing_bureau', 'demo', '#4A0E4E', '#7B2D8E', '#9B59B6', '23 Years of Claims Expertise', 'https://ekbmedical.co.za', true, false, false, false, false, false, true, true, true)
ON CONFLICT (slug) DO NOTHING;
