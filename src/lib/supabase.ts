import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xquzbgaenmohruluyhgv.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Server-side client with service role (full access — use in API routes only)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// Public client (anon key — use in client components)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Table name mapping (ho_ prefix for HealthOps tables in shared Supabase)
export const tables = {
  practices: "ho_practices",
  users: "ho_users",
  patients: "ho_patients",
  bookings: "ho_bookings",
  invoices: "ho_invoices",
  payments: "ho_payments",
  conversations: "ho_conversations",
  messages: "ho_messages",
  dailyTasks: "ho_daily_tasks",
  consentRecords: "ho_consent_records",
  auditLogs: "ho_audit_logs",
  notifications: "ho_notifications",
  checkIns: "ho_check_ins",
  reviews: "ho_reviews",
  recallItems: "ho_recall_items",
  allergies: "ho_allergies",
  medications: "ho_medications",
  medicalRecords: "ho_medical_records",
  vitals: "ho_vitals",
  investorNotes: "ho_investor_notes",
  creditLedger: "ho_credit_ledger",
  apiKeys: "ho_api_keys",
  opsDocuments: "ho_ops_documents",
  clientPipeline: "ho_client_pipeline",
  clientActivities: "ho_client_activities",
  referrals: "ho_referrals",
  // Network & Analytics
  clinics: "ho_clinics",
  clinicMetrics: "ho_clinic_metrics",
  medicalSchemeMetrics: "ho_medical_scheme_metrics",
  rejectionCodes: "ho_rejection_codes",
  divisionKpis: "ho_division_kpis",
  // Claims
  icd10Codes: "ho_icd10_codes",
  // Integrations
  integrationStatus: "ho_integration_status",
  // WhatsApp
  clinicDirectory: "ho_clinic_directory",
} as const;
