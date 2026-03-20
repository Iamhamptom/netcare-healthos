/**
 * Supabase Data Source — reads from seeded ho_* tables.
 * This is the default data source for both demo and production.
 * When Netcare provides API access, a NetcareApiDataSource will replace this.
 */

import { supabaseAdmin, tables } from "../supabase";
import type {
  NetworkDataSource,
  SavingsDataSource,
  ClaimsDataSource,
  BridgeDataSource,
  WhatsAppDataSource,
  DivisionKPI,
  ClinicPerformance,
  SchemeMetric,
  RejectionCode,
  MonthlySavings,
  ICD10Entry,
  ICD10ValidationResult,
  IntegrationStatus,
  ClinicDirectoryEntry,
  ClinicAvailability,
} from "./types";

function toCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

export class SupabaseDataSource
  implements NetworkDataSource, SavingsDataSource, ClaimsDataSource, BridgeDataSource, WhatsAppDataSource
{
  // ── Network ──

  async getDivisionKPIs(): Promise<DivisionKPI[]> {
    const { data } = await supabaseAdmin
      .from(tables.divisionKpis)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    return (data || []).map((r) => toCamel(r) as unknown as DivisionKPI);
  }

  async getClinicPerformance(filters?: { region?: string; province?: string }): Promise<ClinicPerformance[]> {
    let query = supabaseAdmin
      .from(tables.clinicMetrics)
      .select("*, clinic:ho_clinics(id, name, region, province, type, practitioner_count)")
      .order("revenue", { ascending: false });

    const { data } = await query;
    if (!data) return [];

    // Filter by region in JS — PostgREST doesn't support .eq() on embedded resource fields
    const filtered = filters?.region
      ? data.filter((row) => {
          const clinic = row.clinic as Record<string, unknown> | null;
          return clinic?.region === filters.region;
        })
      : data;

    return filtered.map((row) => {
      const clinic = row.clinic as Record<string, unknown> | null;
      return {
        id: (clinic?.id as string) || row.clinic_id,
        name: (clinic?.name as string) || "Unknown",
        region: (clinic?.region as string) || "",
        province: (clinic?.province as string) || "",
        type: (clinic?.type as string) || "",
        revenue: row.revenue || 0,
        target: row.target || 0,
        claimsSubmitted: row.claims_submitted || 0,
        claimsRejected: row.claims_rejected || 0,
        rejectionRate: Number(row.rejection_rate || 0),
        collectionRatio: Number(row.collection_ratio || 0),
        patientCount: row.patient_count || 0,
        avgWaitTimeMin: row.avg_wait_time_min || 0,
      } as ClinicPerformance;
    });
  }

  async getMedicalSchemeMetrics(): Promise<SchemeMetric[]> {
    const { data } = await supabaseAdmin
      .from(tables.medicalSchemeMetrics)
      .select("*")
      .order("lives_covered", { ascending: false });
    return (data || []).map((r) => toCamel(r) as unknown as SchemeMetric);
  }

  async getTopRejections(limit = 10): Promise<RejectionCode[]> {
    const { data } = await supabaseAdmin
      .from(tables.rejectionCodes)
      .select("*")
      .order("value", { ascending: false })
      .limit(limit);
    return (data || []).map((r) => toCamel(r) as unknown as RejectionCode);
  }

  // ── Savings ──

  async getMonthlySavings(clinicId?: string): Promise<MonthlySavings[]> {
    let query = supabaseAdmin.from(tables.clinicMetrics).select(
      "month, savings_claims, savings_era, savings_debtors, savings_capitation, savings_compliance, savings_pharmacy"
    );

    if (clinicId) {
      query = query.eq("clinic_id", clinicId);
    }

    const { data } = await query.order("month", { ascending: true });
    if (!data) return [];

    // Aggregate by month across all clinics
    const byMonth = new Map<string, MonthlySavings>();
    for (const row of data) {
      const m = row.month as string;
      const existing = byMonth.get(m) || { month: m, claims: 0, era: 0, debtors: 0, capitation: 0, compliance: 0, pharmacy: 0 };
      existing.claims += row.savings_claims || 0;
      existing.era += row.savings_era || 0;
      existing.debtors += row.savings_debtors || 0;
      existing.capitation += row.savings_capitation || 0;
      existing.compliance += row.savings_compliance || 0;
      existing.pharmacy += row.savings_pharmacy || 0;
      byMonth.set(m, existing);
    }

    return Array.from(byMonth.values());
  }

  // ── Claims / ICD-10 ──

  async searchICD10(query: string, limit = 20): Promise<ICD10Entry[]> {
    // Try exact code match first
    const codeUpper = query.toUpperCase().trim();
    const { data: exact } = await supabaseAdmin
      .from(tables.icd10Codes)
      .select("*")
      .ilike("code", `${codeUpper}%`)
      .limit(limit);

    if (exact && exact.length > 0) {
      return exact.map((r) => toCamel(r) as unknown as ICD10Entry);
    }

    // Full-text search on description
    const { data } = await supabaseAdmin
      .from(tables.icd10Codes)
      .select("*")
      .or(`description.ilike.%${query}%,code.ilike.%${query}%`)
      .limit(limit);

    return (data || []).map((r) => toCamel(r) as unknown as ICD10Entry);
  }

  async validateICD10(code: string): Promise<ICD10ValidationResult> {
    const codeUpper = code.toUpperCase().trim();
    const { data } = await supabaseAdmin
      .from(tables.icd10Codes)
      .select("*")
      .eq("code", codeUpper)
      .single();

    if (!data) {
      // Check if it's a valid prefix (too broad)
      const { data: broader } = await supabaseAdmin
        .from(tables.icd10Codes)
        .select("code, description")
        .ilike("code", `${codeUpper}%`)
        .limit(5);

      if (broader && broader.length > 0) {
        return {
          valid: false,
          code: codeUpper,
          description: "",
          specificity: "too_broad",
          pmbCondition: false,
          requiresAuth: false,
          warnings: [`Code ${codeUpper} is not specific enough for billing`],
          suggestions: broader.map((b) => `${b.code} — ${b.description}`),
        };
      }

      return {
        valid: false,
        code: codeUpper,
        description: "",
        specificity: "invalid",
        pmbCondition: false,
        requiresAuth: false,
        warnings: [`Code ${codeUpper} does not exist in ICD-10-ZA`],
        suggestions: [],
      };
    }

    const entry = toCamel(data) as unknown as ICD10Entry;
    const warnings: string[] = [];

    if (!entry.isBillable) warnings.push("This code is not billable — use a more specific subcategory");
    if (entry.requiresAuth) warnings.push("This diagnosis requires pre-authorization from the medical aid");

    return {
      valid: entry.isBillable,
      code: entry.code,
      description: entry.description,
      specificity: entry.isBillable ? "sufficient" : "too_broad",
      pmbCondition: entry.pmbCondition,
      requiresAuth: entry.requiresAuth,
      warnings,
      suggestions: [],
    };
  }

  // ── Bridge ──

  async getIntegrationStatus(): Promise<IntegrationStatus[]> {
    const { data } = await supabaseAdmin
      .from(tables.integrationStatus)
      .select("*")
      .order("system_name");
    return (data || []).map((r) => toCamel(r) as unknown as IntegrationStatus);
  }

  // ── WhatsApp / Clinic Directory ──

  async getClinicDirectory(): Promise<ClinicDirectoryEntry[]> {
    const { data } = await supabaseAdmin
      .from(tables.clinics)
      .select("*, directory:ho_clinic_directory(*)")
      .eq("active", true)
      .order("name");

    if (!data) return [];

    return data.map((row) => {
      const dir = (row.directory as Record<string, unknown>[])?.[0] || {};
      return {
        id: row.id,
        name: row.name,
        region: row.region,
        province: row.province,
        address: row.address || "",
        lat: row.lat || 0,
        lng: row.lng || 0,
        phone: row.phone || "",
        hours: row.hours || "",
        services: (dir.services as { name: string; durationMin: number; priceCents: number }[]) || [],
        whatsappEnabled: (dir.whatsapp_enabled as boolean) ?? true,
        practitionerCount: row.practitioner_count || 0,
      } as ClinicDirectoryEntry;
    });
  }

  async findNearestClinic(lat: number, lng: number, service?: string): Promise<ClinicAvailability[]> {
    const clinics = await this.getClinicDirectory();

    // Simple Haversine distance calculation
    const withDistance = clinics
      .filter((c) => c.lat && c.lng && c.whatsappEnabled)
      .filter((c) => !service || c.services.some((s) => s.name.toLowerCase().includes(service.toLowerCase())))
      .map((c) => {
        const R = 6371;
        const dLat = ((c.lat - lat) * Math.PI) / 180;
        const dLng = ((c.lng - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((lat * Math.PI) / 180) * Math.cos((c.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return { clinic: c, distanceKm: Math.round(dist * 10) / 10 };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 5);

    return withDistance.map((w) => ({
      clinicId: w.clinic.id,
      clinicName: w.clinic.name,
      address: w.clinic.address,
      distanceKm: w.distanceKm,
      nextSlots: [], // Populated by real booking system integration
      service: service || "GP Consultation",
    }));
  }
}
