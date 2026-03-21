import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Netcare Health OS",
};

const COMPANY = {
  legalName: "Netcare Limited",
  tradingAs: "Netcare Health OS",
  registration: "XXXX/XXXXXX/07",
  address: "Gauteng, South Africa",
  email: "info@netcare.co.za",
  lastUpdated: "2026-03-16",
};

const sections = [
  {
    title: "1. Introduction & Acceptance",
    content: [
      `These Terms of Service govern your use of Netcare Health OS (the "Platform"), a healthcare practice management system operated by ${COMPANY.legalName} trading as ${COMPANY.tradingAs}.`,
      `By accessing the Platform, you agree to these Terms. The Platform is intended for use by licensed healthcare practitioners and their authorised staff.`,
      `These Terms are governed by ECTA, CPA, POPIA, the Health Professions Act, and applicable HPCSA guidelines.`,
    ],
  },
  {
    title: "2. Company Information (ECTA s43)",
    content: [
      `Legal name: ${COMPANY.legalName}`,
      `Trading as: ${COMPANY.tradingAs}`,
      `Registration: ${COMPANY.registration}`,
      `Address: ${COMPANY.address}`,
      `Email: ${COMPANY.email}`,
    ],
  },
  {
    title: "3. Service Description",
    content: [
      `Netcare Health OS is an AI-powered healthcare practice management platform offering patient records management, appointment scheduling, billing (ICD-10 coding), AI clinical decision support, voice interaction, and multi-practice administration.`,
      `The Platform is designed for South African healthcare practices and complies with POPIA, HPCSA, and ICD-10 SA standards.`,
    ],
  },
  {
    title: "4. AI Clinical Decision Support — IMPORTANT DISCLAIMER",
    content: [
      `The Platform provides AI-generated suggestions for triage, follow-up, intake, billing codes, and scheduling. These are decision-support tools only.`,
      `AI suggestions DO NOT constitute medical advice, diagnosis, or treatment recommendations. Clinical responsibility remains solely with the treating healthcare practitioner.`,
      `Healthcare practitioners must independently verify all AI suggestions before acting on them. ${COMPANY.legalName} accepts no liability for clinical decisions made with or without AI assistance.`,
      `AI models (Anthropic Claude) process de-identified patient information. See our Privacy Policy for details.`,
    ],
  },
  {
    title: "5. Practice & Patient Data",
    content: [
      `Each practice is responsible for the accuracy and completeness of patient data entered into the Platform. The Platform supports POPIA-compliant consent management.`,
      `You must ensure that patient consent is obtained before processing personal information through the Platform, in accordance with POPIA and HPCSA ethical guidelines.`,
      `Patient health information is classified as special personal information under POPIA s26 and receives the highest level of protection.`,
    ],
  },
  {
    title: "6. White-Label & Multi-Practice",
    content: [
      `The Platform supports white-label deployment with per-practice branding. Each practice operates in an isolated data environment.`,
      `Practice administrators are responsible for managing user access within their practice.`,
    ],
  },
  {
    title: "7. Billing & Subscription",
    content: [
      `Subscription tiers (Starter, Core, Professional, Enterprise) are billed monthly via Paystack (debit order). Pricing is displayed before purchase and complies with the CPA.`,
      `Setup fees are once-off and non-refundable. Monthly subscription fees are billed in advance on the 1st of each calendar month.`,
      `Minimum contract terms apply per plan: Starter (3 months), Core (12 months), Professional (12 months), Enterprise (24 months). Early termination within the minimum term incurs a fee equal to 50% of the remaining monthly fees.`,
      `AI credits are included per plan tier and reset monthly. Unused credits do not roll over. Additional credits may be purchased at standard rates.`,
    ],
  },
  {
    title: "8. Cancellation & Refund Policy",
    content: [
      `You may cancel your subscription at any time by providing 30 (thirty) calendar days written notice to ${COMPANY.email} or through the Platform dashboard.`,
      `Cancellation takes effect at the end of the current billing period following the 30-day notice period. No pro-rata refunds are issued for partial months.`,
      `Upon cancellation: (a) your access to the Platform will be suspended at the end of the notice period; (b) your data will be available for export for 14 calendar days following suspension; (c) after 14 days, all practice data will be permanently deleted in accordance with POPIA requirements.`,
      `Data export requests must be submitted in writing before the cancellation date. Exports are provided in CSV and JSON format within 14 business days.`,
      `Setup fees, once paid, are non-refundable regardless of cancellation timing.`,
      `Early termination fee: if you cancel before completing your minimum contract term, you will be invoiced for 50% of the remaining monthly fees for the balance of the minimum term.`,
      `${COMPANY.legalName} reserves the right to suspend or terminate your account immediately for: (a) non-payment exceeding 30 days; (b) breach of these Terms; (c) illegal or unethical use of the Platform.`,
      `Upon termination by ${COMPANY.legalName}, you will receive 7 calendar days to export your data before permanent deletion.`,
    ],
  },
  {
    title: "9. HPCSA Compliance",
    content: [
      `The Platform is designed to support — not replace — HPCSA ethical obligations. Practitioners remain responsible for ethical compliance, including patient confidentiality, informed consent, and clinical standards.`,
      `Electronic communications with patients (WhatsApp, SMS, email) must comply with HPCSA advertising and communication guidelines.`,
    ],
  },
  {
    title: "10. Limitation of Liability",
    content: [
      `${COMPANY.legalName} shall not be liable for clinical outcomes, treatment decisions, or patient harm. The Platform is a practice management tool, not a medical device.`,
      `Our total liability shall not exceed the subscription fees paid in the preceding 12 months.`,
      `Nothing in these Terms limits liability that cannot be excluded under South African law.`,
    ],
  },
  {
    title: "11. Governing Law",
    content: [
      `These Terms are governed by the laws of the Republic of South Africa.`,
    ],
  },
  {
    title: "12. Contact",
    content: [`Email: ${COMPANY.email}`],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#1D3443] text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="text-xs text-white/70 font-mono hover:text-white/60 transition-colors mb-8 inline-block"
        >
          &larr; Back to home
        </Link>

        <h1 className="text-2xl font-light text-white tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-xs text-white/70 font-mono mb-10">
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
                    className="text-sm text-white/70 leading-relaxed font-light"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-white/[0.04] pt-6">
          <p className="text-[11px] text-white/70 font-mono">
            {COMPANY.legalName} · {COMPANY.address}
          </p>
        </div>
      </div>
    </div>
  );
}
