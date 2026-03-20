/**
 * Shared types for the data source adapter pattern.
 * All modules fetch through these interfaces — swap demo → real Netcare APIs by changing env vars.
 */

// ── Network Command Center ──

export interface DivisionKPI {
  label: string;
  value: string;
  target: string;
  pct: number;
  trend: string;
  status: "on_track" | "attention" | "improving";
  icon: string;
  color: string;
}

export interface ClinicPerformance {
  id: string;
  name: string;
  region: string;
  province: string;
  type: string;
  revenue: number;
  target: number;
  claimsSubmitted: number;
  claimsRejected: number;
  rejectionRate: number;
  collectionRatio: number;
  patientCount: number;
  avgWaitTimeMin: number;
}

export interface RejectionCode {
  code: string;
  description: string;
  count: number;
  value: number;
  aiRecommendation: string;
}

export interface SchemeMetric {
  schemeName: string;
  livesCovered: number;
  claimsVolume: number;
  rejectionRate: number;
  avgPaymentDays: number;
}

// ── Savings ──

export interface MonthlySavings {
  month: string;
  claims: number;
  era: number;
  debtors: number;
  capitation: number;
  compliance: number;
  pharmacy: number;
}

export interface CategorySavings {
  key: string;
  label: string;
  total: number;
  description: string;
}

// ── Claims / ICD-10 ──

export interface ICD10Entry {
  code: string;
  description: string;
  category: string;
  chapter: number;
  isBillable: boolean;
  pmbCondition: boolean;
  requiresAuth: boolean;
}

export interface ICD10ValidationResult {
  valid: boolean;
  code: string;
  description: string;
  specificity: "sufficient" | "too_broad" | "invalid";
  pmbCondition: boolean;
  requiresAuth: boolean;
  warnings: string[];
  suggestions: string[];
}

// ── Bridge / Integrations ──

export interface IntegrationStatus {
  systemName: string;
  status: "connected" | "partial" | "not_connected" | "planned";
  lastSyncAt: string | null;
  recordsSynced: number;
  errorCount: number;
}

// ── WhatsApp / Clinic Directory ──

export interface ClinicDirectoryEntry {
  id: string;
  name: string;
  region: string;
  province: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  services: { name: string; durationMin: number; priceCents: number }[];
  whatsappEnabled: boolean;
  practitionerCount: number;
}

export interface ClinicAvailability {
  clinicId: string;
  clinicName: string;
  address: string;
  distanceKm: number;
  nextSlots: string[];
  service: string;
}

// ── Data Source Interface ──

export interface NetworkDataSource {
  getDivisionKPIs(): Promise<DivisionKPI[]>;
  getClinicPerformance(filters?: { region?: string; province?: string }): Promise<ClinicPerformance[]>;
  getMedicalSchemeMetrics(): Promise<SchemeMetric[]>;
  getTopRejections(limit?: number): Promise<RejectionCode[]>;
}

export interface SavingsDataSource {
  getMonthlySavings(clinicId?: string): Promise<MonthlySavings[]>;
}

export interface ClaimsDataSource {
  searchICD10(query: string, limit?: number): Promise<ICD10Entry[]>;
  validateICD10(code: string): Promise<ICD10ValidationResult>;
}

export interface BridgeDataSource {
  getIntegrationStatus(): Promise<IntegrationStatus[]>;
}

export interface WhatsAppDataSource {
  getClinicDirectory(): Promise<ClinicDirectoryEntry[]>;
  findNearestClinic(lat: number, lng: number, service?: string): Promise<ClinicAvailability[]>;
}
