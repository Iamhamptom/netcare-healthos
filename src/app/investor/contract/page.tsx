"use client";

import { useState } from "react";
import { ChevronDown, FileCheck } from "lucide-react";

const contractSections = [
  {
    title: "1. Parties",
    content: `This Service Agreement ("Agreement") is entered into between:

1.1. VisioCorp (Pty) Ltd, a private company incorporated in the Republic of South Africa, operating the Netcare Health OS OS platform ("VisioCorp", "Service Provider", "we", "us");

AND

1.2. The Client Practice, being the HPCSA-registered healthcare practice subscribing to the Netcare Health OS OS platform ("Client", "Practice", "you").

1.3. Together referred to as the "Parties" and individually as a "Party".`,
  },
  {
    title: "2. Service Description",
    content: `2.1. VisioCorp provides the Netcare Health OS OS platform ("Platform"), an AI-powered healthcare practice management system that includes:
  (a) Patient management (records, allergies, medications, vitals, medical history);
  (b) Appointment scheduling and calendar management;
  (c) AI-powered agents (triage, intake, follow-up, billing, scheduling);
  (d) Billing and invoicing with ICD-10 coding and medical aid claim support;
  (e) Patient communication (WhatsApp, SMS, email notifications);
  (f) POPIA compliance tools (consent management, audit logging);
  (g) Practice analytics and reporting dashboards;
  (h) White-label branding (logo, colours, subdomain, tagline);
  (i) Lead generation and patient acquisition tools;
  (j) ElevenLabs voice integration for AI interactions;
  (k) Daily workflow automation (task checklists, check-in/out queues).

2.2. The Platform is provided as a Software-as-a-Service (SaaS) solution, accessible via web browser. VisioCorp is responsible for hosting, maintenance, updates, and security.

2.3. VisioCorp reserves the right to modify, update, or improve Platform features, provided that core functionality is maintained.`,
  },
  {
    title: "3. Subscription Plans & Pricing",
    content: `3.1. The Platform is offered under four subscription tiers:

  STARTER PLAN — R2,999.99 per month (Promotional Entry Tier)
    - 3-month minimum contract
    - R500 included AI credits per month
    - 20 qualified leads at onboarding
    - Patient management limited to 200 patients
    - Basic booking engine
    - WhatsApp/SMS reminders (100 messages/mo included)
    - Email notifications
    - Basic analytics
    - Setup fee: R5,000

  CORE PLAN — R15,000 per month
    - 12-month minimum contract
    - R1,000 included AI credits per month
    - 50 qualified leads at onboarding
    - Up to 5 staff users
    - Everything in Starter, unlimited patients
    - ICD-10 billing & invoicing
    - POPIA compliance & audit logs
    - Daily workflow automation
    - Basic white-labeled website
    - Standard support (email, 48-hour response)
    - Setup fee: R15,000

  PROFESSIONAL PLAN — R35,000 per month
    - 12-month minimum contract
    - R3,000 included AI credits per month
    - 100 qualified leads at onboarding
    - Up to 15 staff users
    - Everything in Core
    - 5 AI Agents (triage, intake, follow-up, billing, scheduler)
    - Advanced analytics and reporting
    - Medical aid claim management
    - Full white-labeled website (SEO + booking + referral portal + AI symptom checker)
    - GP referral portal
    - Custom branding
    - Google Business Profile optimization
    - Medical directory listings
    - Staff AI training (5 courses)
    - Priority support (email + phone, 12-hour response)
    - Setup fee: R25,000

  ENTERPRISE PLAN — R55,000 per month
    - 24-month minimum contract
    - R8,000 included AI credits per month
    - 200 qualified leads at onboarding
    - Unlimited staff users
    - Everything in Professional
    - Multi-location support
    - Custom integrations & API access
    - Dedicated account manager
    - Advanced recall & campaigns
    - Staff AI training included
    - Dedicated support (email + phone + WhatsApp, 4-hour response)
    - Full analytics suite with custom reports
    - Full white-label branding with custom domain
    - Custom feature development (subject to scoping)
    - Setup fee: R40,000

3.2. All prices are exclusive of VAT (15%) unless otherwise stated.

3.3. Prices may be adjusted with 30 days' written notice, effective at the next contract renewal period.`,
  },
  {
    title: "4. AI Credit System",
    content: `4.1. Each subscription plan includes a monthly allocation of AI credits as specified in Section 3.

4.2. AI credits are consumed by the following activities:
  (a) AI agent interactions (triage, intake, follow-up, billing, scheduling);
  (b) WhatsApp and SMS notifications sent to patients;
  (c) AI-generated reports and analytics;
  (d) Voice synthesis (ElevenLabs TTS) for AI interactions;
  (e) API calls to third-party services on behalf of the Practice.

4.3. Unused credits do not roll over to the following month.

4.4. Overage: Usage exceeding the included monthly credit allocation will be billed at cost plus a 20% margin. Overage charges are invoiced monthly in arrears.

4.5. The Practice may monitor credit usage in real-time via the Platform dashboard.

4.6. VisioCorp will provide reasonable notice when the Practice approaches 80% of their monthly credit allocation.`,
  },
  {
    title: "5. Lead Generation Package",
    content: `5.1. Each subscription plan includes a lead allocation at onboarding:
  - Starter: 20 qualified leads at onboarding
  - Core: 50 qualified leads at onboarding
  - Professional: 100 qualified leads at onboarding
  - Enterprise: 200 qualified leads at onboarding

5.2. "Qualified leads" are potential patients sourced through targeted digital marketing, local SEO, and referral networks relevant to the Practice's location and speciality.

5.3. Lead delivery is subject to market availability and geographic factors. VisioCorp shall use commercially reasonable efforts to deliver the specified number of leads.

5.4. Unused leads do not roll over to the following month.

5.5. Additional leads beyond the monthly allocation may be purchased at a rate agreed upon between the Parties.`,
  },
  {
    title: "6. Payment Terms",
    content: `6.1. Subscription fees are payable monthly in advance.

6.2. Payment may be made via:
  (a) Yoco (credit/debit card — recurring billing authorised upon subscription);
  (b) Bank EFT (electronic funds transfer to VisioCorp's designated bank account).

6.3. Invoices are issued on the 1st of each month and are due within 7 days.

6.4. Overdue payments will incur interest at the rate of 2% per month on the outstanding balance, calculated from the due date.

6.5. If payment is not received within 14 days of the due date, VisioCorp reserves the right to suspend the Practice's access to the Platform.

6.6. The Practice is responsible for all banking charges associated with payments.

6.7. Overage charges (AI credits and additional services) are invoiced monthly in arrears and are due within 14 days.`,
  },
  {
    title: "7. Contract Term & Early Termination",
    content: `7.1. The initial contract term is:
  - Starter plan: 3 months from the commencement date.
  - Core and Professional plans: 12 months from the commencement date.
  - Enterprise plan: 24 months from the commencement date.

7.2. After the initial term, the Agreement automatically renews for successive 12-month periods unless either Party provides 30 days' written notice of non-renewal before the end of the current term.

7.3. Early Termination: If the Client terminates this Agreement before the end of the minimum contract term, the Client shall pay an early termination fee calculated as:

  Remaining months x 50% of the monthly subscription fee

  Example: A Professional plan client terminating 6 months early would pay 6 x R17,500 = R105,000 early termination fee.

7.4. VisioCorp may terminate this Agreement immediately if:
  (a) The Client materially breaches any term and fails to cure within 14 days of written notice;
  (b) The Client's HPCSA registration is suspended or revoked;
  (c) The Client engages in fraudulent or unlawful activity using the Platform;
  (d) The Client fails to pay fees for 30 or more days.

7.5. Upon termination, the Client may request export of all Practice data within 30 days. After 90 days, all data will be permanently deleted in accordance with POPIA.`,
  },
  {
    title: "8. Data Ownership & POPIA",
    content: `8.1. Data Ownership:
  (a) The Practice owns all patient data, practice data, and clinical records entered into the Platform.
  (b) VisioCorp owns the Platform, its source code, AI models, algorithms, and all intellectual property.
  (c) Aggregated, anonymised, and de-identified data may be used by VisioCorp for Platform improvement, analytics, and research purposes.

8.2. POPIA Roles:
  (a) The Practice is the Responsible Party as defined in the Protection of Personal Information Act 4 of 2013 (POPIA) for all patient data.
  (b) VisioCorp is the Operator, processing personal information solely on the Practice's instructions and for the purpose of providing the Platform services.

8.3. Both Parties shall comply with POPIA and agree to the following:
  (a) The Practice shall obtain valid, informed consent from patients for data processing;
  (b) VisioCorp shall implement appropriate technical and organisational security measures;
  (c) VisioCorp shall notify the Practice without undue delay of any data breach;
  (d) VisioCorp shall not transfer patient data to third parties without written consent;
  (e) Upon termination, VisioCorp shall return or securely destroy all patient data;
  (f) Both Parties shall cooperate with the Information Regulator in the event of an investigation.

8.4. Data Processing Addendum: The full Data Processing Addendum (DPA) forms part of this Agreement and is available at the Investor Portal under Policies & T&Cs.`,
  },
  {
    title: "9. Service Level Agreement (SLA)",
    content: `9.1. Uptime Target: VisioCorp targets 99.5% Platform availability per calendar month, measured as:

  Uptime % = (Total minutes in month - Downtime minutes) / Total minutes in month x 100

9.2. Scheduled Maintenance: Planned maintenance windows will be communicated at least 48 hours in advance and, where possible, scheduled outside of business hours (SAST 18:00-06:00).

9.3. Support Response Times:
  - Critical Issues (Platform down, data loss risk): 4-hour response (Enterprise), 12-hour response (Professional), 24-hour response (Core)
  - Major Issues (feature unavailable, performance degradation): 8-hour response (Enterprise), 24-hour response (Professional/Core)
  - Minor Issues (cosmetic, non-urgent): 48-hour response (all plans)

9.4. Service Credits: If uptime falls below 99.5% in any calendar month:
  - Below 99.5%: 5% credit on next month's invoice
  - Below 99.0%: 10% credit on next month's invoice
  - Below 95.0%: 25% credit on next month's invoice

9.5. Exclusions: Downtime caused by the following is excluded from SLA calculations:
  (a) Force majeure events;
  (b) Client's internet connectivity or hardware issues;
  (c) Third-party service outages (payment gateways, SMS providers);
  (d) Scheduled maintenance within the communicated window;
  (e) Client-initiated actions causing service disruption.`,
  },
  {
    title: "10. POPIA Compliance Obligations",
    content: `10.1. Practice Obligations (as Responsible Party):
  (a) Obtain valid consent from patients before entering their data into the Platform;
  (b) Ensure consent is informed, specific, and freely given (treatment, data processing, marketing — separately);
  (c) Provide patients with access to their data upon request;
  (d) Notify VisioCorp immediately of any data subject requests that require Platform-level action;
  (e) Ensure staff are trained on POPIA obligations and data handling procedures;
  (f) Report any suspected data breaches to VisioCorp immediately.

10.2. VisioCorp Obligations (as Operator):
  (a) Process patient data only on the documented instructions of the Practice;
  (b) Implement and maintain encryption (TLS 1.2+ in transit, AES-256 at rest);
  (c) Maintain comprehensive audit logs of all data access;
  (d) Conduct regular security assessments;
  (e) Ensure all staff with data access are bound by confidentiality agreements;
  (f) Notify the Practice within 72 hours of discovering a data breach;
  (g) Assist the Practice in responding to data subject requests;
  (h) Not engage sub-processors without prior written consent;
  (i) Delete or return all personal information upon contract termination.

10.3. Information Officer: Dr. Hampton Ga-Molepo (privacy@visiohealth.co.za).`,
  },
  {
    title: "11. Limitation of Liability",
    content: `11.1. The Platform is provided "as is" and VisioCorp makes no warranties, express or implied, regarding the suitability of the Platform for any particular purpose.

11.2. VisioCorp is not liable for:
  (a) Clinical decisions made using the Platform or AI features;
  (b) Errors in ICD-10 coding, billing, or medical aid claims;
  (c) Loss arising from the Practice's failure to comply with POPIA or HPCSA guidelines;
  (d) Loss of data caused by the Practice's actions or negligence;
  (e) Any indirect, consequential, incidental, or special damages.

11.3. VisioCorp's total aggregate liability under this Agreement shall not exceed the total subscription fees paid by the Practice in the 12 months immediately preceding the claim.

11.4. Nothing in this Agreement excludes liability that cannot be excluded under the laws of the Republic of South Africa.`,
  },
  {
    title: "12. Governing Law & Dispute Resolution",
    content: `12.1. This Agreement shall be governed by and construed in accordance with the laws of the Republic of South Africa.

12.2. Any dispute arising out of or in connection with this Agreement shall be resolved as follows:
  (a) Negotiation: The Parties shall first attempt to resolve the dispute through good-faith negotiation within 14 days of written notice.
  (b) Mediation: If negotiation fails, the dispute shall be referred to mediation in accordance with the rules of the Arbitration Foundation of Southern Africa (AFSA).
  (c) Arbitration: If mediation fails within 30 days, the dispute shall be finally resolved by arbitration in accordance with the Arbitration Act 42 of 1965. The arbitrator's decision shall be final and binding.

12.3. Notwithstanding the above, either Party may seek urgent interim relief from a court of competent jurisdiction.

12.4. The courts of the Republic of South Africa shall have exclusive jurisdiction.`,
  },
  {
    title: "13. General Provisions",
    content: `13.1. Entire Agreement: This Agreement, together with the Data Processing Addendum and Platform Policies, constitutes the entire agreement between the Parties.

13.2. Amendments: No amendment shall be effective unless made in writing and signed by both Parties.

13.3. Assignment: The Client may not assign this Agreement without VisioCorp's prior written consent. VisioCorp may assign this Agreement to an affiliate or successor.

13.4. Force Majeure: Neither Party shall be liable for failure to perform obligations due to events beyond reasonable control (natural disasters, war, pandemic, government action, infrastructure failure).

13.5. Severability: If any provision is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.

13.6. Waiver: Failure to exercise any right under this Agreement shall not constitute a waiver of that right.

13.7. Notices: All notices shall be in writing and delivered via email to the addresses provided during onboarding.

13.8. Independent Contractor: VisioCorp is an independent contractor. Nothing in this Agreement creates an employment, partnership, or agency relationship.`,
  },
];

export default function InvestorContract() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["1. Parties"])
  );

  function toggleSection(title: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">
          Service Agreement
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Netcare Health OS OS client subscription agreement template. This document
          outlines the terms under which healthcare practices subscribe to and
          use the Platform.
        </p>
      </div>

      {/* Plan Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            name: "Starter",
            price: "R2,999.99",
            term: "3-month min",
            credits: "R500",
            leads: "20",
            users: "2",
            badge: "PROMO",
          },
          {
            name: "Core",
            price: "R15,000",
            term: "12-month min",
            credits: "R1,000",
            leads: "50",
            users: "5",
          },
          {
            name: "Professional",
            price: "R35,000",
            term: "12-month min",
            credits: "R3,000",
            leads: "100",
            users: "15",
            featured: true,
          },
          {
            name: "Enterprise",
            price: "R55,000",
            term: "24-month min",
            credits: "R8,000",
            leads: "200",
            users: "Unlimited",
          },
        ].map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-4 ${
              plan.featured
                ? "border-[#8B5CF6] bg-[#8B5CF6]/5"
                : "border-gray-200 bg-white"
            }`}
          >
            <h3
              className={`text-sm font-bold ${
                plan.featured ? "text-[#8B5CF6]" : "text-gray-900"
              }`}
            >
              {plan.name}
            </h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {plan.price}
              <span className="text-xs text-gray-500 font-normal">/month</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{plan.term}</p>
            <div className="mt-3 space-y-1.5 text-xs text-gray-600">
              <p>
                <span className="font-medium">{plan.credits}</span> AI credits
              </p>
              <p>
                <span className="font-medium">{plan.leads}</span> leads/month
              </p>
              <p>
                <span className="font-medium">{plan.users}</span> staff users
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Agreement Document */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-5 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileCheck className="w-6 h-6 text-[#8B5CF6]" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Netcare Health OS OS Service Agreement
              </h2>
              <p className="text-xs text-gray-500">
                Template version 1.0 | Last updated: 14 March 2026 | Governed
                by SA law
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="divide-y divide-gray-100">
          {contractSections.map((section) => {
            const isOpen = expandedSections.has(section.title);
            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-gray-800">
                    {section.title}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isOpen ? "" : "-rotate-90"
                    }`}
                  />
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

      {/* Footer Note */}
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
        <p className="text-xs text-gray-500 leading-relaxed">
          This is a template agreement for informational purposes within the
          Investor Portal. Actual client contracts will be executed individually
          with each subscribing practice. All terms are subject to final
          negotiation and legal review. For questions, contact{" "}
          <span className="text-[#8B5CF6] font-medium">
            legal@visiohealth.co.za
          </span>
          .
        </p>
      </div>
    </div>
  );
}
