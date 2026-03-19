"use client";

import { useState } from "react";
import { Shield, FileText, Lock, Users, Scale, HeartPulse, ChevronDown } from "lucide-react";

const policies = [
  {
    id: "terms",
    title: "Terms & Conditions",
    icon: FileText,
    lastUpdated: "14 March 2026",
    sections: [
      {
        title: "1. Agreement to Terms",
        content: `By accessing or using the Netcare Health OS platform ("Platform"), operated by VisioCorp (Pty) Ltd ("we", "us", "our"), you ("User", "Practice", "you") agree to be bound by these Terms and Conditions. If you do not agree, you must not use the Platform.\n\nThe Platform provides AI-powered practice management, patient communication, billing, and compliance tools for healthcare practitioners registered with the Health Professions Council of South Africa (HPCSA).`,
      },
      {
        title: "2. Eligibility & Registration",
        content: `2.1. The Platform is intended for use by HPCSA-registered healthcare practitioners and their authorised staff.\n\n2.2. By registering, you represent that:\n  (a) You hold valid HPCSA registration for the services you provide;\n  (b) You have authority to bind the practice to these Terms;\n  (c) All information provided during registration is accurate and current;\n  (d) You will maintain valid professional indemnity insurance.\n\n2.3. We reserve the right to verify your HPCSA registration status and to suspend access if registration lapses.`,
      },
      {
        title: "3. Subscription & Payment",
        content: `3.1. The Platform is offered on a subscription basis with the following tiers:\n  - Starter: R2,999.99/month (3-month minimum contract) — includes R500 AI credits, up to 200 patients, 100 WhatsApp/SMS messages/mo, 20 qualified leads at onboarding. Setup fee: R5,000.\n  - Core: R15,000/month (12-month minimum contract) — includes R1,000 AI credits, unlimited patients, 50 qualified leads at onboarding. Setup fee: R15,000.\n  - Professional: R35,000/month (12-month minimum contract) — includes R3,000 AI credits, 100 qualified leads at onboarding. Setup fee: R25,000.\n  - Enterprise: R55,000/month (24-month minimum contract) — includes R8,000 AI credits, 200 qualified leads at onboarding. Setup fee: R40,000.\n\n3.2. AI credits cover usage of AI agents, WhatsApp/SMS notifications, and API calls. Credits exceeding the included monthly allowance are billed at cost plus margin.\n\n3.3. Subscriptions are billed monthly in advance via Yoco or bank transfer (EFT). By subscribing, you authorise recurring charges.\n\n3.4. Minimum contract terms: Starter plans require a 3-month commitment. Core and Professional plans require a 12-month commitment. Enterprise plans require a 24-month commitment. Early termination fees apply as per the contract.\n\n3.5. Prices may be adjusted with 30 days' written notice, effective at the next contract renewal.\n\n3.6. Non-payment for 14 days will result in account suspension. Data will be retained for 90 days after suspension before deletion.\n\n3.7. All fees are exclusive of VAT (15%) unless stated otherwise.`,
      },
      {
        title: "4. Use of AI Features",
        content: `4.1. The Platform includes AI-powered features including but not limited to: triage, patient intake, follow-up suggestions, billing assistance, and scheduling.\n\n4.2. AI features are decision SUPPORT tools only. They do not replace clinical judgment, diagnosis, or treatment decisions by a qualified healthcare practitioner.\n\n4.3. All AI-generated suggestions require practitioner review and approval before being communicated to patients.\n\n4.4. We do not guarantee the accuracy, completeness, or clinical validity of AI outputs. The treating practitioner bears full clinical responsibility.\n\n4.5. AI features comply with HPCSA Booklet 10 (Telehealth Guidelines) and are not intended for autonomous patient interaction without practitioner oversight.`,
      },
      {
        title: "5. Patient Data & Responsibilities",
        content: `5.1. You are the Responsible Party (as defined in POPIA) for all patient data entered into the Platform. We act as the Operator processing data on your behalf.\n\n5.2. You are responsible for:\n  (a) Obtaining valid patient consent for data processing (treatment, data, marketing);\n  (b) Ensuring the accuracy of patient data entered;\n  (c) Using patient data only for lawful purposes within your scope of practice;\n  (d) Maintaining confidentiality as required by the HPCSA Ethical Rules.\n\n5.3. We will process patient data only as necessary to provide the Platform services and in accordance with our Privacy Policy and Data Processing Addendum.`,
      },
      {
        title: "6. ICD-10 Billing Compliance",
        content: `6.1. The Platform supports ICD-10 coding for medical billing in accordance with the SA ICD-10 Master Industry Table (MIT).\n\n6.2. The treating practitioner is solely responsible for assigning correct ICD-10 codes. The Platform may suggest codes but does not guarantee their accuracy.\n\n6.3. Submitting incorrect ICD-10 codes to medical aid schemes may constitute fraud under the Medical Schemes Act. We are not liable for coding errors.\n\n6.4. External Cause Codes (V/W/X/Y) must be paired with injury codes (S/T) as required by SA ICD-10 Coding Standards.`,
      },
      {
        title: "7. Prohibited Uses",
        content: `You may not use the Platform to:\n  (a) Process patient data without valid consent;\n  (b) Submit fraudulent medical aid claims;\n  (c) Advertise medical services in contravention of HPCSA Ethical Rules (no canvassing, touting, false claims);\n  (d) Store or transmit data in violation of POPIA;\n  (e) Reverse-engineer, decompile, or attempt to access source code;\n  (f) Use AI features to make unsupervised clinical decisions;\n  (g) Share login credentials or allow unauthorised access;\n  (h) Transmit malicious code or interfere with Platform operations.`,
      },
      {
        title: "8. Limitation of Liability",
        content: `8.1. The Platform is provided "as is" without warranties of any kind, express or implied.\n\n8.2. We are not liable for:\n  (a) Clinical decisions made using the Platform or AI features;\n  (b) Errors in ICD-10 coding, billing, or medical aid claims;\n  (c) Loss of patient data due to user error;\n  (d) Service interruptions beyond our reasonable control;\n  (e) Any indirect, consequential, or special damages.\n\n8.3. Our total liability for any claim shall not exceed the subscription fees paid by you in the 12 months preceding the claim.\n\n8.4. Nothing in these Terms excludes liability that cannot be excluded by law.`,
      },
      {
        title: "9. Termination",
        content: `9.1. Either party may terminate the subscription with 30 days' written notice.\n\n9.2. We may suspend or terminate your access immediately if:\n  (a) You breach these Terms;\n  (b) Your HPCSA registration is suspended or revoked;\n  (c) You use the Platform for unlawful purposes;\n  (d) You fail to pay subscription fees for 14+ days.\n\n9.3. Upon termination, you may request export of your data within 30 days. After 90 days, all data will be permanently deleted.\n\n9.4. Sections 5, 8, 10, and 11 survive termination.`,
      },
      {
        title: "10. Governing Law & Dispute Resolution",
        content: `10.1. These Terms are governed by the laws of the Republic of South Africa.\n\n10.2. Disputes shall first be referred to mediation. If unresolved within 30 days, disputes shall be referred to arbitration in accordance with the Arbitration Act 42 of 1965.\n\n10.3. The courts of the Republic of South Africa shall have exclusive jurisdiction.`,
      },
      {
        title: "11. Amendments",
        content: `11.1. We may amend these Terms with 30 days' notice via email or in-platform notification.\n\n11.2. Continued use of the Platform after the notice period constitutes acceptance of the amended Terms.\n\n11.3. If you do not agree with amendments, you may terminate your subscription before they take effect.`,
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy Policy (POPIA)",
    icon: Lock,
    lastUpdated: "14 March 2026",
    sections: [
      {
        title: "1. Introduction",
        content: `VisioCorp (Pty) Ltd ("Netcare Health OS", "we", "us") is committed to protecting personal information in compliance with the Protection of Personal Information Act 4 of 2013 (POPIA). This Privacy Policy explains how we collect, use, store, and protect personal information processed through the Netcare Health OS platform.\n\nHealth information is classified as Special Personal Information under Section 26 of POPIA and is subject to the highest level of protection.`,
      },
      {
        title: "2. Information We Collect",
        content: `2.1. Practice Information: Practice name, type, address, phone, HPCSA registration details, billing information, branding preferences.\n\n2.2. Staff Information: Names, email addresses, roles, login credentials (hashed), activity logs.\n\n2.3. Patient Information (processed on behalf of the Practice):\n  - Demographics: Name, phone, email, date of birth, gender, SA ID/passport, address\n  - Medical: Allergies, medications, vitals, medical records, ICD-10 codes, diagnoses, treatments\n  - Financial: Medical aid provider, membership number, invoices, payments\n  - Communication: Conversation history, notification records\n  - Consent: POPIA consent records with timestamps\n\n2.4. Usage Data: IP addresses, browser type, page views, feature usage (anonymised for analytics).`,
      },
      {
        title: "3. How We Use Information",
        content: `We process personal information for the following purposes:\n\n  (a) Providing and maintaining the Platform services;\n  (b) Processing patient bookings, records, and communications;\n  (c) Generating invoices and supporting medical aid claims;\n  (d) Sending notifications (appointments, reminders, follow-ups) as configured by the Practice;\n  (e) AI-powered features (triage, intake, follow-up, billing, scheduling);\n  (f) Platform analytics and improvement;\n  (g) Compliance monitoring (audit logs, consent tracking);\n  (h) Customer support and account management.\n\nWe do NOT sell personal information to third parties. We do NOT use patient data for advertising.`,
      },
      {
        title: "4. Legal Basis for Processing",
        content: `4.1. Practice data: Contractual necessity (providing the Platform service).\n\n4.2. Patient health data (Special Personal Information): Processed under Section 27(1)(a) of POPIA — consent given by the patient to the Practice (Responsible Party), with Netcare Health OS acting as Operator.\n\n4.3. The Practice is responsible for obtaining valid, informed, specific patient consent. We provide consent management tools to facilitate this.\n\n4.4. Marketing communications: Explicit opt-in consent required, separate from treatment consent.`,
      },
      {
        title: "5. Data Retention",
        content: `5.1. Patient records: Retained for a minimum of 6 years from the date they become dormant (HPCSA Booklet 9).\n\n5.2. Minor patient records: Retained until the patient turns 21.\n\n5.3. Consent records: Retained for the duration of the processing relationship plus 3 years.\n\n5.4. Audit logs: Retained for a minimum of 6 years.\n\n5.5. Account data: Retained for 90 days after account termination, then permanently deleted.\n\n5.6. Data is destroyed or de-identified when no longer required for its original purpose.`,
      },
      {
        title: "6. Data Security",
        content: `6.1. All data is encrypted in transit (TLS 1.2+) and at rest.\n\n6.2. Passwords are hashed using bcrypt (10 rounds).\n\n6.3. Sessions use signed JWT tokens with 7-day expiry.\n\n6.4. Role-based access control limits data access by user role.\n\n6.5. All patient data access is logged in the audit trail.\n\n6.6. We conduct regular security assessments and maintain incident response procedures.`,
      },
      {
        title: "7. Data Subject Rights",
        content: `Under POPIA, patients and users have the right to:\n\n  (a) Access: Request a copy of their personal information;\n  (b) Correction: Request correction of inaccurate information;\n  (c) Deletion: Request deletion (subject to legal retention requirements);\n  (d) Objection: Object to processing for direct marketing;\n  (e) Withdrawal: Withdraw consent at any time (does not affect prior lawful processing);\n  (f) Complaint: Lodge a complaint with the Information Regulator.\n\nRequests should be directed to the Practice (Responsible Party) or to our Information Officer.`,
      },
      {
        title: "8. Cross-Border Transfers",
        content: `8.1. Patient data is primarily stored within South Africa.\n\n8.2. Where cloud infrastructure requires data processing outside SA, we ensure the recipient jurisdiction has adequate data protection laws substantially similar to POPIA, or binding contractual safeguards are in place.\n\n8.3. We do not transfer patient health data to jurisdictions without adequate protection unless explicit data subject consent has been obtained.`,
      },
      {
        title: "9. Information Officer",
        content: `Information Officer: Dr. Hampton Ga-Molepo\nEmail: privacy@visiohealth.co.za\nAddress: [Registered address]\n\nDeputy Information Officer: [To be appointed]\n\nThe Information Officer oversees POPIA compliance across all Netcare Health OS operations and can be contacted for any privacy-related queries or data subject requests.`,
      },
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use Policy",
    icon: Users,
    lastUpdated: "14 March 2026",
    sections: [
      {
        title: "1. Purpose",
        content: `This Acceptable Use Policy ("AUP") defines the acceptable use of the Netcare Health OS platform. All users (practice administrators, doctors, nurses, receptionists, and any authorised staff) must comply with this AUP.`,
      },
      {
        title: "2. Acceptable Uses",
        content: `The Platform may be used for:\n  (a) Managing patient records within your scope of practice;\n  (b) Scheduling and managing appointments;\n  (c) Communicating with patients via approved channels;\n  (d) Billing patients and managing medical aid claims with correct ICD-10 codes;\n  (e) Using AI features as decision support under practitioner oversight;\n  (f) Managing practice operations (daily tasks, check-ins, analytics).`,
      },
      {
        title: "3. Prohibited Uses",
        content: `The following uses are strictly prohibited:\n\n  (a) Accessing patient data outside your authorised scope;\n  (b) Sharing patient information with unauthorised parties;\n  (c) Using patient data for marketing without explicit consent;\n  (d) Submitting fraudulent billing codes or medical aid claims;\n  (e) Modifying, deleting, or tampering with audit logs;\n  (f) Sharing login credentials between users;\n  (g) Using the Platform while HPCSA registration is suspended;\n  (h) Storing non-medical data (personal files, non-practice content);\n  (i) Attempting to bypass access controls or security measures;\n  (j) Using AI outputs without clinical review and approval.`,
      },
      {
        title: "4. Reporting Violations",
        content: `Users must report any suspected violations of this AUP, data breaches, or security incidents to the practice administrator and to Netcare Health OS support immediately.\n\nViolations may result in account suspension, termination, and reporting to the HPCSA or Information Regulator as required by law.`,
      },
    ],
  },
  {
    id: "data-processing",
    title: "Data Processing Addendum",
    icon: Scale,
    lastUpdated: "14 March 2026",
    sections: [
      {
        title: "1. Parties & Roles",
        content: `This Data Processing Addendum ("DPA") is entered into between:\n\n  - The Practice ("Responsible Party" / "Controller") — the HPCSA-registered healthcare practice that uses the Netcare Health OS platform.\n  - VisioCorp (Pty) Ltd ("Operator" / "Processor") — the entity that processes personal information on behalf of the Practice via the Platform.\n\nAs defined in POPIA Section 1: the Practice determines the purpose and means of processing; Netcare Health OS processes data on the Practice's instructions.`,
      },
      {
        title: "2. Scope of Processing",
        content: `2.1. Netcare Health OS processes personal information (including Special Personal Information as defined in POPIA Section 26) solely for the purpose of providing the Platform services.\n\n2.2. Categories of data subjects: Patients of the Practice, Practice staff.\n\n2.3. Types of personal information: As detailed in the Privacy Policy Section 2.\n\n2.4. Processing activities: Storage, retrieval, display, communication (notifications), analysis (AI features), backup, and deletion.`,
      },
      {
        title: "3. Operator Obligations",
        content: `Netcare Health OS shall:\n\n  (a) Process personal information only on the documented instructions of the Practice;\n  (b) Ensure staff with access to personal information are bound by confidentiality obligations;\n  (c) Implement appropriate technical and organisational security measures;\n  (d) Assist the Practice in responding to data subject requests;\n  (e) Notify the Practice without undue delay of any personal information breach;\n  (f) Delete or return all personal information upon termination of the agreement;\n  (g) Provide the Practice with information necessary to demonstrate compliance;\n  (h) Not engage sub-processors without prior written consent of the Practice.`,
      },
      {
        title: "4. Security Measures",
        content: `Netcare Health OS implements the following security measures:\n\n  - Encryption in transit (TLS 1.2+) and at rest\n  - Password hashing (bcrypt)\n  - Role-based access control\n  - Comprehensive audit logging\n  - Regular security assessments\n  - Incident response procedures\n  - Secure data deletion procedures\n  - Staff security training`,
      },
    ],
  },
  {
    id: "hpcsa-compliance",
    title: "HPCSA Compliance Statement",
    icon: HeartPulse,
    lastUpdated: "14 March 2026",
    sections: [
      {
        title: "1. Platform Design Philosophy",
        content: `Netcare Health OS is designed from the ground up to support HPCSA compliance. The platform:\n\n  (a) Enforces role-based access to protect patient confidentiality;\n  (b) Maintains comprehensive audit trails for all patient data access;\n  (c) Supports informed consent management (treatment, data processing, marketing, research);\n  (d) Positions AI features as decision SUPPORT, never replacing clinical judgment;\n  (e) Enables transparent billing practices with ICD-10 coding;\n  (f) Does not facilitate canvassing, touting, or unethical marketing;\n  (g) Supports record retention in accordance with HPCSA Booklet 9.`,
      },
      {
        title: "2. Relevant HPCSA Guidelines",
        content: `The Platform is designed with reference to:\n\n  - Booklet 2: Generic Ethical Rules for Practitioners\n  - Booklet 9: Guidelines on Patient Recordkeeping\n  - Booklet 10: Telehealth Guidelines (December 2021)\n  - Booklet 11: Over-servicing, Perverse Incentives (March 2025)\n  - Booklet 16: Social Media Guidelines (August 2019)\n  - Booklet 19: Ethical Billing Practices (2024)\n  - Board Notice 510 of 2023: Ethical Rules Amendments`,
      },
      {
        title: "3. Practitioner Responsibility",
        content: `While Netcare Health OS provides tools to support compliance, the registered healthcare practitioner remains solely responsible for:\n\n  (a) Clinical decisions and patient care;\n  (b) Correct ICD-10 coding and billing;\n  (c) Obtaining valid patient consent;\n  (d) Maintaining professional standards;\n  (e) Accurate record-keeping;\n  (f) Compliance with their professional board's ethical rules.\n\nThe Platform facilitates compliance but does not guarantee it. Each practitioner must exercise independent professional judgment.`,
      },
    ],
  },
];

export default function InvestorPolicies() {
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>("terms");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  function toggleSection(key: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Platform Policies & T&Cs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete legal framework ensuring every doctor knows Netcare Health OS is compliant.
          All policies are aligned with POPIA, HPCSA, CPA, and SA healthcare regulations.
        </p>
      </div>

      {/* Policy Tabs */}
      <div className="flex flex-wrap gap-2">
        {policies.map((policy) => (
          <button
            key={policy.id}
            onClick={() => setExpandedPolicy(expandedPolicy === policy.id ? null : policy.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              expandedPolicy === policy.id
                ? "bg-[#8B5CF6] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <policy.icon className="w-4 h-4" />
            {policy.title}
          </button>
        ))}
      </div>

      {/* Active Policy */}
      {expandedPolicy && (() => {
        const policy = policies.find((p) => p.id === expandedPolicy);
        if (!policy) return null;
        return (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-5 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <policy.icon className="w-6 h-6 text-[#8B5CF6]" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{policy.title}</h2>
                  <p className="text-xs text-gray-500">Last updated: {policy.lastUpdated}</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {policy.sections.map((section) => {
                const key = `${policy.id}-${section.title}`;
                const isOpen = expandedSections.has(key);
                return (
                  <div key={key}>
                    <button
                      onClick={() => toggleSection(key)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-semibold text-gray-800">{section.title}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4">
                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white border border-gray-100 rounded-lg p-4">
                          {section.content}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
