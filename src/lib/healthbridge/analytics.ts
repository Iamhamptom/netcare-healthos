// Scheme-specific analytics engine — the feature NO SA PMS does well
// Revenue breakdown, rejection rates, payment speed, aging analysis per scheme

import { formatZAR } from "./codes";

export interface SchemeAnalytics {
  scheme: string;
  totalClaims: number;
  accepted: number;
  rejected: number;
  partial: number;
  pending: number;
  /** Acceptance rate as percentage */
  acceptanceRate: number;
  /** Rejection rate as percentage */
  rejectionRate: number;
  /** Total billed amount (cents) */
  totalBilled: number;
  /** Total paid amount (cents) */
  totalPaid: number;
  /** Total outstanding (cents) */
  totalOutstanding: number;
  /** Collection rate as percentage */
  collectionRate: number;
  /** Average days to payment */
  avgDaysToPayment: number;
  /** Top rejection reasons */
  topRejections: { code: string; reason: string; count: number }[];
}

export interface AgingBucket {
  bucket: string; // "0-30", "31-60", "61-90", "91-120", "120+"
  count: number;
  amount: number;
  amountFormatted: string;
  claims: { id: string; patient: string; scheme: string; amount: number; daysOld: number; status: string }[];
}

export interface ClaimRecord {
  id: string;
  patientName: string;
  medicalAidScheme: string;
  totalAmount: number;
  approvedAmount: number;
  paidAmount: number;
  status: string;
  dateOfService: string;
  submittedAt: string | null;
  respondedAt: string | null;
  reconciledAt: string | null;
  rejectionCode: string;
  rejectionReason: string;
}

/** Calculate scheme-specific analytics from claim records */
export function calculateSchemeAnalytics(claims: ClaimRecord[]): SchemeAnalytics[] {
  const byScheme = new Map<string, ClaimRecord[]>();

  for (const claim of claims) {
    const scheme = claim.medicalAidScheme || "Unknown";
    if (!byScheme.has(scheme)) byScheme.set(scheme, []);
    byScheme.get(scheme)!.push(claim);
  }

  const analytics: SchemeAnalytics[] = [];

  for (const [scheme, schemeClaims] of byScheme) {
    const accepted = schemeClaims.filter((c) => ["accepted", "pending_payment", "paid", "short_paid"].includes(c.status));
    const rejected = schemeClaims.filter((c) => c.status === "rejected");
    const partial = schemeClaims.filter((c) => c.status === "partial" || c.status === "short_paid");
    const pending = schemeClaims.filter((c) => ["draft", "submitted"].includes(c.status));

    const totalBilled = schemeClaims.reduce((sum, c) => sum + c.totalAmount, 0);
    const totalPaid = schemeClaims.reduce((sum, c) => sum + c.paidAmount, 0);

    // Average days to payment for paid claims
    const paidClaims = schemeClaims.filter((c) => c.reconciledAt && c.submittedAt);
    const avgDays = paidClaims.length > 0
      ? paidClaims.reduce((sum, c) => {
          const submitted = new Date(c.submittedAt!).getTime();
          const reconciled = new Date(c.reconciledAt!).getTime();
          return sum + (reconciled - submitted) / 86400000;
        }, 0) / paidClaims.length
      : 0;

    // Top rejection reasons
    const rejectionCounts = new Map<string, { reason: string; count: number }>();
    for (const claim of rejected) {
      const key = claim.rejectionCode || "UNKNOWN";
      const existing = rejectionCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        rejectionCounts.set(key, { reason: claim.rejectionReason || "Unknown reason", count: 1 });
      }
    }

    analytics.push({
      scheme,
      totalClaims: schemeClaims.length,
      accepted: accepted.length,
      rejected: rejected.length,
      partial: partial.length,
      pending: pending.length,
      acceptanceRate: schemeClaims.length > 0 ? Math.round((accepted.length / schemeClaims.length) * 100) : 0,
      rejectionRate: schemeClaims.length > 0 ? Math.round((rejected.length / schemeClaims.length) * 100) : 0,
      totalBilled,
      totalPaid,
      totalOutstanding: totalBilled - totalPaid,
      collectionRate: totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0,
      avgDaysToPayment: Math.round(avgDays),
      topRejections: Array.from(rejectionCounts.entries())
        .map(([code, data]) => ({ code, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    });
  }

  return analytics.sort((a, b) => b.totalBilled - a.totalBilled);
}

/** Calculate aging buckets for outstanding claims */
export function calculateAging(claims: ClaimRecord[]): AgingBucket[] {
  const now = Date.now();
  const buckets: AgingBucket[] = [
    { bucket: "0-30 days", count: 0, amount: 0, amountFormatted: "", claims: [] },
    { bucket: "31-60 days", count: 0, amount: 0, amountFormatted: "", claims: [] },
    { bucket: "61-90 days", count: 0, amount: 0, amountFormatted: "", claims: [] },
    { bucket: "91-120 days", count: 0, amount: 0, amountFormatted: "", claims: [] },
    { bucket: "120+ days", count: 0, amount: 0, amountFormatted: "", claims: [] },
  ];

  // Only include outstanding claims (not paid, not reversed)
  const outstanding = claims.filter((c) =>
    ["submitted", "accepted", "partial", "pending_payment", "short_paid", "rejected", "resubmitted"].includes(c.status) &&
    c.paidAmount < c.totalAmount
  );

  for (const claim of outstanding) {
    const dos = new Date(claim.dateOfService).getTime();
    const daysOld = Math.floor((now - dos) / 86400000);
    const outstandingAmount = claim.totalAmount - claim.paidAmount;

    const entry = {
      id: claim.id,
      patient: claim.patientName,
      scheme: claim.medicalAidScheme,
      amount: outstandingAmount,
      daysOld,
      status: claim.status,
    };

    if (daysOld <= 30) { buckets[0].count++; buckets[0].amount += outstandingAmount; buckets[0].claims.push(entry); }
    else if (daysOld <= 60) { buckets[1].count++; buckets[1].amount += outstandingAmount; buckets[1].claims.push(entry); }
    else if (daysOld <= 90) { buckets[2].count++; buckets[2].amount += outstandingAmount; buckets[2].claims.push(entry); }
    else if (daysOld <= 120) { buckets[3].count++; buckets[3].amount += outstandingAmount; buckets[3].claims.push(entry); }
    else { buckets[4].count++; buckets[4].amount += outstandingAmount; buckets[4].claims.push(entry); }
  }

  for (const bucket of buckets) {
    bucket.amountFormatted = formatZAR(bucket.amount);
  }

  return buckets;
}

/** Generate patient cost estimate (pre-consultation transparency) */
export function estimatePatientCost(data: {
  lineItems: { cptCode: string; amount: number; quantity: number }[];
  schemeRate: number; // percentage of tariff the scheme typically pays (e.g., 100 = NHRPL rate, 200 = 200% of rate)
  hasGapCover: boolean;
  gapCoverMultiple?: number; // e.g., 3 = covers up to 3x scheme rate
}): {
  totalCharge: number;
  estimatedSchemePayment: number;
  estimatedPatientLiability: number;
  estimatedGapCoverRecovery: number;
  finalPatientCost: number;
  formatted: {
    totalCharge: string;
    schemePayment: string;
    patientLiability: string;
    gapCover: string;
    finalCost: string;
  };
} {
  const totalCharge = data.lineItems.reduce((sum, li) => sum + li.amount * li.quantity, 0);
  const estimatedSchemePayment = Math.round(totalCharge * (data.schemeRate / 100));
  const shortfall = Math.max(0, totalCharge - estimatedSchemePayment);

  let gapCoverRecovery = 0;
  if (data.hasGapCover && shortfall > 0) {
    const gapMultiple = data.gapCoverMultiple || 3;
    const maxGapCover = estimatedSchemePayment * (gapMultiple - 1);
    gapCoverRecovery = Math.min(shortfall, maxGapCover);
  }

  const finalPatientCost = shortfall - gapCoverRecovery;

  return {
    totalCharge,
    estimatedSchemePayment,
    estimatedPatientLiability: shortfall,
    estimatedGapCoverRecovery: gapCoverRecovery,
    finalPatientCost,
    formatted: {
      totalCharge: formatZAR(totalCharge),
      schemePayment: formatZAR(estimatedSchemePayment),
      patientLiability: formatZAR(shortfall),
      gapCover: formatZAR(gapCoverRecovery),
      finalCost: formatZAR(finalPatientCost),
    },
  };
}
