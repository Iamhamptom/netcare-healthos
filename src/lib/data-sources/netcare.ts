/**
 * NetcareApiDataSource — Master integration switcher
 *
 * Delegates to individual integration adapters (CareOn, HEAL, SwitchOn, etc.)
 * and falls back to SupabaseDataSource on failure.
 *
 * Activated when NETCARE_API_MODE=live
 *
 * The other agents are building the individual adapters at:
 *   src/lib/integrations/careon/      — CareOn EMR (HL7/FHIR)
 *   src/lib/integrations/heal/        — HEAL Medicross EMR
 *   src/lib/integrations/switchon/    — SwitchOn claims switch
 *   src/lib/integrations/healthbridge/ — Healthbridge PMS
 *   src/lib/integrations/sap/         — SAP Finance
 *   src/lib/integrations/micromedex/  — Drug interactions
 *   src/lib/integrations/medikredit/  — NAPPI pharmacy switching
 */

import { SupabaseDataSource } from "./supabase-source";
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

// Circuit breaker state per adapter
interface CircuitState {
  failures: number;
  lastFailure: number;
  open: boolean;
}

const CIRCUIT_THRESHOLD = 3; // failures before opening circuit
const CIRCUIT_RESET_MS = 60_000; // 1 minute cooldown

export class NetcareApiDataSource
  implements NetworkDataSource, SavingsDataSource, ClaimsDataSource, BridgeDataSource, WhatsAppDataSource
{
  private fallback: SupabaseDataSource;
  private circuits: Map<string, CircuitState> = new Map();

  constructor() {
    this.fallback = new SupabaseDataSource();
  }

  // ── Circuit Breaker ──

  private isCircuitOpen(adapter: string): boolean {
    const state = this.circuits.get(adapter);
    if (!state) return false;
    if (state.open && Date.now() - state.lastFailure > CIRCUIT_RESET_MS) {
      // Half-open: allow one retry
      state.open = false;
      state.failures = 0;
      return false;
    }
    return state.open;
  }

  private recordFailure(adapter: string, error: unknown): void {
    const state = this.circuits.get(adapter) || { failures: 0, lastFailure: 0, open: false };
    state.failures++;
    state.lastFailure = Date.now();
    if (state.failures >= CIRCUIT_THRESHOLD) {
      state.open = true;
      console.warn(`[netcare] Circuit OPEN for ${adapter} after ${state.failures} failures`);
    }
    this.circuits.set(adapter, state);
    console.error(`[netcare] ${adapter} failed:`, error instanceof Error ? error.message : error);
  }

  private recordSuccess(adapter: string): void {
    this.circuits.delete(adapter);
  }

  /**
   * Wrap an adapter call with circuit breaker + fallback.
   * If the adapter is down or circuit is open, falls back to Supabase cached data.
   */
  private async withFallback<T>(
    adapter: string,
    adapterFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
  ): Promise<T> {
    if (this.isCircuitOpen(adapter)) {
      console.log(`[netcare] Circuit open for ${adapter}, using Supabase fallback`);
      return fallbackFn();
    }

    try {
      const result = await adapterFn();
      this.recordSuccess(adapter);
      return result;
    } catch (error) {
      this.recordFailure(adapter, error);
      return fallbackFn();
    }
  }

  // ── Network Data (CareOn + HEAL → clinic KPIs, scheme metrics) ──

  async getDivisionKPIs(): Promise<DivisionKPI[]> {
    return this.withFallback(
      "careon",
      async () => {
        // TODO: Import CareOn adapter and fetch live division KPIs
        // const { CareOnAdapter } = await import("@/lib/integrations/careon");
        // return new CareOnAdapter().getDivisionKPIs();
        throw new Error("CareOn adapter not yet implemented");
      },
      () => this.fallback.getDivisionKPIs(),
    );
  }

  async getClinicPerformance(filters?: { region?: string; province?: string }): Promise<ClinicPerformance[]> {
    return this.withFallback(
      "heal",
      async () => {
        // TODO: Import HEAL adapter for Medicross clinic performance
        // const { HealAdapter } = await import("@/lib/integrations/heal");
        // return new HealAdapter().getClinicPerformance(filters);
        throw new Error("HEAL adapter not yet implemented");
      },
      () => this.fallback.getClinicPerformance(filters),
    );
  }

  async getMedicalSchemeMetrics(): Promise<SchemeMetric[]> {
    return this.withFallback(
      "switchon",
      async () => {
        // TODO: Import SwitchOn adapter for scheme-level claims analytics
        // const { SwitchOnAdapter } = await import("@/lib/integrations/switchon");
        // return new SwitchOnAdapter().getMedicalSchemeMetrics();
        throw new Error("SwitchOn adapter not yet implemented");
      },
      () => this.fallback.getMedicalSchemeMetrics(),
    );
  }

  async getTopRejections(limit = 10): Promise<RejectionCode[]> {
    return this.withFallback(
      "switchon",
      async () => {
        // TODO: Import SwitchOn adapter for rejection code analytics
        // const { SwitchOnAdapter } = await import("@/lib/integrations/switchon");
        // return new SwitchOnAdapter().getTopRejections(limit);
        throw new Error("SwitchOn adapter not yet implemented");
      },
      () => this.fallback.getTopRejections(limit),
    );
  }

  // ── Savings (SAP → financial data, eRA reconciliation) ──

  async getMonthlySavings(clinicId?: string): Promise<MonthlySavings[]> {
    return this.withFallback(
      "sap",
      async () => {
        // TODO: Import SAP adapter for financial savings data
        // const { SapAdapter } = await import("@/lib/integrations/sap");
        // return new SapAdapter().getMonthlySavings(clinicId);
        throw new Error("SAP adapter not yet implemented");
      },
      () => this.fallback.getMonthlySavings(clinicId),
    );
  }

  // ── Claims / ICD-10 (MediKredit → NAPPI, Healthbridge → claim validation) ──

  async searchICD10(query: string, limit = 20): Promise<ICD10Entry[]> {
    return this.withFallback(
      "medikredit",
      async () => {
        // TODO: Import MediKredit adapter for NAPPI/ICD-10 search
        // const { MediKreditAdapter } = await import("@/lib/integrations/medikredit");
        // return new MediKreditAdapter().searchICD10(query, limit);
        throw new Error("MediKredit adapter not yet implemented");
      },
      () => this.fallback.searchICD10(query, limit),
    );
  }

  async validateICD10(code: string): Promise<ICD10ValidationResult> {
    return this.withFallback(
      "healthbridge",
      async () => {
        // TODO: Import Healthbridge adapter for claim validation with scheme rules
        // const { HealthbridgeAdapter } = await import("@/lib/integrations/healthbridge");
        // return new HealthbridgeAdapter().validateICD10(code);
        throw new Error("Healthbridge adapter not yet implemented");
      },
      () => this.fallback.validateICD10(code),
    );
  }

  // ── Bridge (all adapters → aggregated integration status) ──

  async getIntegrationStatus(): Promise<IntegrationStatus[]> {
    // This aggregates status from all adapters + Supabase cache
    // Each adapter reports its own connection status
    return this.withFallback(
      "bridge",
      async () => {
        // TODO: Query each adapter for live connection status
        // For now, merge live circuit breaker state with Supabase cached statuses
        const cached = await this.fallback.getIntegrationStatus();

        // Overlay circuit breaker state onto cached statuses
        return cached.map((status) => {
          const adapterName = this.mapSystemToAdapter(status.systemName);
          if (adapterName && this.isCircuitOpen(adapterName)) {
            return { ...status, status: "not_connected" as const, errorCount: status.errorCount + 1 };
          }
          return status;
        });
      },
      () => this.fallback.getIntegrationStatus(),
    );
  }

  // ── WhatsApp / Clinic Directory (HEAL → live clinic data) ──

  async getClinicDirectory(): Promise<ClinicDirectoryEntry[]> {
    return this.withFallback(
      "heal",
      async () => {
        // TODO: Import HEAL adapter for live Medicross directory
        // const { HealAdapter } = await import("@/lib/integrations/heal");
        // return new HealAdapter().getClinicDirectory();
        throw new Error("HEAL adapter not yet implemented");
      },
      () => this.fallback.getClinicDirectory(),
    );
  }

  async findNearestClinic(lat: number, lng: number, service?: string): Promise<ClinicAvailability[]> {
    return this.withFallback(
      "heal",
      async () => {
        // TODO: Import HEAL adapter for live slot availability
        // const { HealAdapter } = await import("@/lib/integrations/heal");
        // return new HealAdapter().findNearestClinic(lat, lng, service);
        throw new Error("HEAL adapter not yet implemented");
      },
      () => this.fallback.findNearestClinic(lat, lng, service),
    );
  }

  // ── Helpers ──

  private mapSystemToAdapter(systemName: string): string | null {
    const map: Record<string, string> = {
      "CareOn EMR": "careon",
      "HEAL": "heal",
      "SwitchOn": "switchon",
      "Healthbridge": "healthbridge",
      "SAP": "sap",
      "Micromedex": "micromedex",
      "MediKredit": "medikredit",
    };
    return map[systemName] || null;
  }
}
