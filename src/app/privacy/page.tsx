import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Netcare Health OS OS",
};

const COMPANY = {
  legalName: "Netcare Limited",
  tradingAs: "Netcare Health OS",
  address: "Gauteng, South Africa",
  email: "info@netcare.co.za",
  informationOfficer: "privacy@touchlineagency.co.za",
  lastUpdated: "2026-03-16",
};

const sections = [
  {
    title: "1. Introduction",
    content: [
      `${COMPANY.legalName} trading as ${COMPANY.tradingAs} is committed to protecting personal information — especially patient health information — in accordance with POPIA.`,
      `This Privacy Policy applies to all users of the Netcare Health OS OS platform, including practice administrators, healthcare practitioners, staff, and patients whose data is processed through the Platform.`,
    ],
  },
  {
    title: "2. Information Officer (POPIA s55)",
    content: [
      `Name: TBD (to be designated)`,
      `Email: ${COMPANY.informationOfficer}`,
    ],
  },
  {
    title: "3. Special Personal Information — Health Data (POPIA s26-27)",
    content: [
      `Patient health information is classified as special personal information under POPIA s26. We process it only:`,
      `• With explicit patient consent for treatment purposes`,
      `• For medical diagnosis and treatment by a healthcare practitioner`,
      `• To comply with legal obligations (ICD-10 coding, medical aid claims)`,
      `Health data receives the highest level of protection, including encryption at rest and in transit, audit logging of all access, and role-based access controls.`,
    ],
  },
  {
    title: "4. Data We Collect",
    content: [
      `Practice data: Practice name, address, contact details, branding, subscription details`,
      `Staff data: Name, email, role, access permissions`,
      `Patient data: Name, ID number, contact details, medical history, allergies, medications, vitals, consultation notes, billing records`,
      `Consent records: Consent type, method, timestamp, IP address, revocation status`,
      `Technical data: IP address, browser information, access logs, audit trail`,
    ],
  },
  {
    title: "5. AI Data Processing",
    content: [
      `The Platform uses Anthropic Claude AI for clinical decision support (triage, follow-up, intake, billing, scheduling). When AI features are used:`,
      `• Patient information is sent in de-identified or minimally-identified form where possible`,
      `• AI responses are generated in real-time and are not stored by the AI provider for training`,
      `• Clinical responsibility for any action taken based on AI suggestions remains with the treating practitioner`,
    ],
  },
  {
    title: "6. Third-Party Processors",
    content: [
      `• Supabase (AWS): Database and authentication — EU/US`,
      `• Anthropic (Claude): AI clinical decision support — United States`,
      `• ElevenLabs: Voice synthesis for AI agent — United States`,
      `Cross-border transfers comply with POPIA s72.`,
    ],
  },
  {
    title: "7. Data Retention",
    content: [
      `Patient medical records: Retained per HPCSA guidelines (minimum 5 years after last consultation for adults, until age 21 for minors)`,
      `Billing records: 5 years (tax and legal compliance)`,
      `Audit logs: 3 years`,
      `Practice data: Duration of subscription + 1 year`,
      `After retention periods, data is securely deleted or anonymised.`,
    ],
  },
  {
    title: "8. Patient Rights (POPIA s23-25)",
    content: [
      `• Right of access: Request a copy of your personal information`,
      `• Right to correction: Request correction of inaccurate data`,
      `• Right to deletion: Request deletion where legally permitted (note: medical record retention requirements may apply)`,
      `• Right to object: Object to processing for direct marketing`,
      `• Right to withdraw consent: Withdraw marketing or research consent at any time`,
      `Submit a data subject request at /data-request or contact ${COMPANY.informationOfficer}. We respond within 30 days.`,
    ],
  },
  {
    title: "9. Data Breach Notification (POPIA s22)",
    content: [
      `In the event of a breach involving patient health information, we will:`,
      `• Notify the Information Regulator as soon as reasonably possible`,
      `• Notify affected patients and practices`,
      `• Notify HPCSA if clinical data is compromised`,
      `• Take immediate containment and remediation steps`,
    ],
  },
  {
    title: "10. POPIA Consent Management",
    content: [
      `The Platform provides built-in consent tracking for:`,
      `• Treatment consent (required for patient care)`,
      `• Data processing consent (POPIA requirement)`,
      `• Marketing consent (opt-in, per POPIA s69)`,
      `• Research consent (separate, explicit opt-in)`,
      `Consent records include method (digital/paper/verbal), timestamp, and revocation tracking.`,
    ],
  },
  {
    title: "11. Contact",
    content: [
      `Privacy: ${COMPANY.informationOfficer}`,
      `General: ${COMPANY.email}`,
      `Information Regulator: complaints.IR@justice.gov.za`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#1D3443] text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="text-xs text-white/30 font-mono hover:text-white/60 transition-colors mb-8 inline-block"
        >
          &larr; Back to home
        </Link>

        <h1 className="text-2xl font-light text-white tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-white/30 font-mono mb-10">
          Last updated: {COMPANY.lastUpdated}
        </p>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-sm font-medium text-white/60 mb-3">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.content.map((p, i) => (
                  <p
                    key={i}
                    className="text-sm text-white/35 leading-relaxed font-light"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-white/[0.04] pt-6">
          <p className="text-[11px] text-white/20 font-mono">
            {COMPANY.legalName} · {COMPANY.address}
          </p>
        </div>
      </div>
    </div>
  );
}
