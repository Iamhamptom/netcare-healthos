// Smart Claim Follow-up Generator — prioritized follow-up actions for outstanding claims
// Uses scheme-specific knowledge to generate draft emails, prioritize by urgency,
// and provide contact details for SA medical aid schemes

import type { ClaimRecord } from "./analytics";
import { formatZAR, MEDICAL_AID_SCHEMES } from "./codes";

export interface FollowUpAction {
  claimId: string;
  patientName: string;
  scheme: string;
  daysOld: number;
  urgency: "low" | "medium" | "high" | "critical";
  action: string;
  emailTemplate?: string;
  schemeContact?: string;
}

/** SA medical aid scheme contact details for provider follow-ups */
const SCHEME_CONTACTS: Record<string, { phone: string; email?: string; fax?: string; notes?: string }> = {
  "Discovery Health": {
    phone: "0860 445 566",
    email: "providerqueries@discovery.co.za",
    notes: "Provider line Mon-Fri 08:00-17:00. Have practice number and claim reference ready.",
  },
  "GEMS": {
    phone: "0860 004 367",
    email: "enquiries@gems.gov.za",
    notes: "Government scheme — formal escalation via email preferred. Reference member's persal number.",
  },
  "Bonitas": {
    phone: "0860 002 108",
    email: "provider@bonitas.co.za",
    notes: "Administered by Medscheme. Can also use Medscheme provider portal.",
  },
  "Medihelp": {
    phone: "086 010 0375",
    email: "provider@medihelp.co.za",
    notes: "Direct scheme — not administered by third party. Responsive to email queries.",
  },
  "Momentum Health": {
    phone: "0860 117 859",
    email: "providers@momentumhealth.co.za",
    notes: "Administered by Momentum Health Solutions. Use MediSwitch for claim status.",
  },
  "Bestmed": {
    phone: "012 472 6500",
    email: "service@bestmed.co.za",
    notes: "Direct scheme. Provider portal available at bestmed.co.za.",
  },
  "Fedhealth": {
    phone: "0860 002 153",
    email: "providers@fedhealth.co.za",
    notes: "Administered by Medscheme. Can escalate via Medscheme provider portal.",
  },
  "CompCare": {
    phone: "0861 000 300",
    email: "info@universal.co.za",
    notes: "Administered by Universal Healthcare. Smaller scheme — persistent follow-up may be needed.",
  },
  "Sizwe Hosmed": {
    phone: "0860 100 871",
    email: "enquiries@sizwe.co.za",
    notes: "Afrocentric group scheme. Escalate via Medscheme if needed.",
  },
  "Polmed": {
    phone: "0860 765 633",
    email: "enquiries@polmed.co.za",
    notes: "SAPS medical scheme. Administered by Metropolitan/GEMS infrastructure.",
  },
};

/** Generate prioritized follow-up actions for outstanding claims */
export async function generateFollowUps(claims: ClaimRecord[]): Promise<FollowUpAction[]> {
  const now = Date.now();
  const actions: FollowUpAction[] = [];

  // Filter to outstanding claims only
  const outstanding = claims.filter((c) =>
    ["submitted", "accepted", "partial", "pending_payment", "short_paid", "rejected", "resubmitted"].includes(c.status) &&
    c.paidAmount < c.totalAmount
  );

  for (const claim of outstanding) {
    const dosDate = new Date(claim.dateOfService).getTime();
    const daysOld = Math.floor((now - dosDate) / 86400000);
    const outstandingAmount = claim.totalAmount - claim.paidAmount;
    const amountFormatted = formatZAR(outstandingAmount);
    const contact = SCHEME_CONTACTS[claim.medicalAidScheme];
    const contactPhone = contact?.phone || "Contact scheme directly";
    const contactEmail = contact?.email;

    let urgency: FollowUpAction["urgency"];
    let action: string;
    let emailTemplate: string | undefined;

    if (daysOld >= 120) {
      // 120+ days — write-off warning / formal demand
      urgency = "critical";
      action = `CRITICAL: ${amountFormatted} outstanding for ${daysOld} days. Approaching 4-month submission deadline for corrections. Send formal demand letter and consider write-off if unresolved.`;
      emailTemplate = buildFormalDemandEmail(claim, daysOld, outstandingAmount);
    } else if (daysOld >= 90) {
      // 90-120 days — formal demand
      urgency = "high";
      action = `HIGH PRIORITY: ${amountFormatted} outstanding for ${daysOld} days. Escalate to scheme's dispute resolution. Send formal demand with all supporting documentation.`;
      emailTemplate = buildEscalationEmail(claim, daysOld, outstandingAmount);
    } else if (daysOld >= 60) {
      // 60-90 days — escalation
      urgency = "medium";
      action = `ESCALATE: ${amountFormatted} outstanding for ${daysOld} days. Contact scheme provider line for status update. If rejected, prepare resubmission with corrections.`;
      emailTemplate = buildFollowUpEmail(claim, daysOld, outstandingAmount);
    } else if (daysOld >= 30) {
      // 30-60 days — gentle reminder
      urgency = "low";
      action = `FOLLOW UP: ${amountFormatted} outstanding for ${daysOld} days. Check claim status via switch. Send gentle reminder if no eRA received.`;
      emailTemplate = buildReminderEmail(claim, daysOld, outstandingAmount);
    } else {
      // <30 days — monitor
      urgency = "low";
      action = `MONITOR: ${amountFormatted} submitted ${daysOld} days ago. Within normal processing window. Check switch status.`;
      // No email template for <30 days
    }

    // Add scheme-specific notes
    if (claim.status === "rejected") {
      urgency = urgency === "low" ? "medium" : urgency;
      action = `REJECTED (${claim.rejectionCode || "unknown"}): ${claim.rejectionReason || "No reason provided"}. ${action}`;
    } else if (claim.status === "short_paid") {
      action = `SHORT-PAID by ${formatZAR(claim.approvedAmount - claim.paidAmount)}: Review eRA for adjustment reasons. ${action}`;
    }

    const schemeContactInfo = contact
      ? `${contactPhone}${contactEmail ? ` | ${contactEmail}` : ""}${contact.notes ? ` — ${contact.notes}` : ""}`
      : `${claim.medicalAidScheme} — look up provider contact number`;

    actions.push({
      claimId: claim.id,
      patientName: claim.patientName,
      scheme: claim.medicalAidScheme,
      daysOld,
      urgency,
      action,
      emailTemplate,
      schemeContact: schemeContactInfo,
    });
  }

  // Sort by urgency (critical first) then by amount (highest first)
  const urgencyOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  actions.sort((a, b) => {
    const urgDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    if (urgDiff !== 0) return urgDiff;
    // Within same urgency, sort by days old (oldest first)
    return b.daysOld - a.daysOld;
  });

  return actions;
}

// --- Email template builders ---

function buildReminderEmail(claim: ClaimRecord, daysOld: number, amount: number): string {
  return `Subject: Claim Status Inquiry — ${claim.patientName} (${claim.dateOfService})

Dear ${claim.medicalAidScheme} Provider Services,

We are writing to enquire about the status of the following claim submitted ${daysOld} days ago:

Patient: ${claim.patientName}
Date of Service: ${claim.dateOfService}
Claim Amount: ${formatZAR(amount)}
Practice Reference: ${claim.id}

We would appreciate an update on the processing status of this claim.

Thank you for your assistance.

Kind regards,
[Practice Name]
[BHF Number]
[Contact Number]`;
}

function buildFollowUpEmail(claim: ClaimRecord, daysOld: number, amount: number): string {
  return `Subject: FOLLOW-UP — Outstanding Claim ${claim.id} (${daysOld} days)

Dear ${claim.medicalAidScheme} Provider Services,

We are following up on the below claim which has been outstanding for ${daysOld} days without payment or remittance advice:

Patient: ${claim.patientName}
Date of Service: ${claim.dateOfService}
Outstanding Amount: ${formatZAR(amount)}
Claim Reference: ${claim.id}
${claim.status === "rejected" ? `\nRejection Code: ${claim.rejectionCode}\nRejection Reason: ${claim.rejectionReason}\n` : ""}
Please advise on the current status and expected payment date. If additional information is required for processing, kindly let us know immediately.

This matter requires urgent attention as it is approaching the 90-day mark.

Kind regards,
[Practice Name]
[BHF Number]
[Contact Number]`;
}

function buildEscalationEmail(claim: ClaimRecord, daysOld: number, amount: number): string {
  return `Subject: ESCALATION — Overdue Claim ${claim.id} (${daysOld} days outstanding)

Dear ${claim.medicalAidScheme} Provider Disputes / Escalations,

Despite previous correspondence, the following claim remains unpaid after ${daysOld} days:

Patient: ${claim.patientName}
Date of Service: ${claim.dateOfService}
Outstanding Amount: ${formatZAR(amount)}
Claim Reference: ${claim.id}
Original Submission Date: ${claim.submittedAt || "N/A"}
${claim.status === "rejected" ? `Rejection Code: ${claim.rejectionCode}\nRejection Reason: ${claim.rejectionReason}\n` : ""}
In terms of the Medical Schemes Act (Act 131 of 1998), medical schemes are required to process and pay valid claims within a reasonable timeframe.

We request:
1. Immediate processing and payment of this claim
2. Written confirmation of the payment date
3. If the claim has been rejected, full reasons and opportunity to resubmit

Should this matter not be resolved within 14 days, we will escalate to the Council for Medical Schemes.

Kind regards,
[Practice Name]
[BHF Number]
[Contact Number]`;
}

function buildFormalDemandEmail(claim: ClaimRecord, daysOld: number, amount: number): string {
  return `Subject: FORMAL DEMAND — Claim ${claim.id} (${daysOld} days — Final Notice)

Dear ${claim.medicalAidScheme} Principal Officer / Provider Disputes,

FORMAL DEMAND FOR PAYMENT

This letter serves as formal demand for payment of the following claim which has been outstanding for ${daysOld} days:

Patient: ${claim.patientName}
Date of Service: ${claim.dateOfService}
Outstanding Amount: ${formatZAR(amount)}
Claim Reference: ${claim.id}
Original Submission Date: ${claim.submittedAt || "N/A"}

This claim has been outstanding well beyond the accepted processing period. Multiple follow-up attempts have been made without resolution.

In terms of:
- The Medical Schemes Act (Act 131 of 1998)
- Council for Medical Schemes Regulations

We hereby demand payment of ${formatZAR(amount)} within 14 (fourteen) calendar days of this notice.

Failing satisfactory resolution, we will:
1. Lodge a formal complaint with the Council for Medical Schemes (CMS)
2. Refer the matter to our collections department
3. Report the scheme's non-compliance to the relevant authorities

This is our final correspondence before formal escalation.

Kind regards,
[Practice Name]
[BHF Number]
[Contact Number]
[HPCSA Registration Number]`;
}
