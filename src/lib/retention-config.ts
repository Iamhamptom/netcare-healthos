/**
 * Data Retention Configuration
 *
 * Centralised retention periods for all data types in Netcare Health OS.
 * Each entry includes the retention duration and the regulatory/business reason.
 *
 * References:
 * - POPIA: Protection of Personal Information Act (South Africa)
 * - HPCSA: Health Professions Council of South Africa
 * - SARS: South African Revenue Service
 */

export const RETENTION_PERIODS = {
  claimsAnalysis: {
    months: 12,
    reason: "POPIA minimal retention — analysis data not needed beyond 12 months",
  },
  auditLogs: {
    years: 7,
    reason: "HPCSA record-keeping — audit trails for healthcare data access",
  },
  notifications: {
    months: 6,
    reason: "Operational relevance — message history beyond 6 months has no clinical value",
  },
  resetTokens: {
    hours: 24,
    reason: "Security best practice — expired tokens must be purged promptly",
  },
  medicalRecords: {
    years: 999,
    reason: "HPCSA — never auto-delete clinical records (min 5 years adults, until 21 for minors)",
  },
  invoices: {
    years: 5,
    reason: "SARS tax requirement — financial records must be kept for 5 years",
  },
  bookings: {
    years: 999,
    reason: "HPCSA — booking records are part of the clinical record, never auto-delete",
  },
  patientRecords: {
    years: 999,
    reason: "HPCSA — patient demographic and clinical data, never auto-delete",
  },
  consentRecords: {
    years: 999,
    reason: "POPIA — consent evidence must be retained as long as data is processed, never auto-delete",
  },
} as const;

/**
 * Calculate a cutoff date from a retention period entry.
 * Returns a Date object representing the oldest allowed record.
 */
export function getCutoffDate(period: { months?: number; years?: number; hours?: number }): Date {
  const cutoff = new Date();
  if (period.hours) {
    cutoff.setHours(cutoff.getHours() - period.hours);
  }
  if (period.months) {
    cutoff.setMonth(cutoff.getMonth() - period.months);
  }
  if (period.years) {
    cutoff.setFullYear(cutoff.getFullYear() - period.years);
  }
  return cutoff;
}
