"use client";

import {
  Shield, CheckCircle2, FileText, Lock, Users,
  CreditCard, Globe, Smartphone, HeartPulse,
  Building2, Plug, Clock, Brain,
} from "lucide-react";

const regulations = [
  {
    name: "POPIA",
    fullName: "Protection of Personal Information Act (Act 4 of 2013)",
    description: "Health data is \"Special Personal Information\" — highest protection level. Processing prohibited by default unless specific conditions met.",
    icon: Lock,
    color: "#10b981",
    requirements: [
      { item: "Explicit consent for health data processing", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Separate marketing consent (not bundled)", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "POPIA consent records with audit trail", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Right to withdraw consent", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Information Officer designation (POPIA s55)", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Cross-border data transfer compliance", status: "compliant", products: ["Netcare Health OS OS", "Visio Health Integrator"] },
      { item: "Data retention policy enforcement", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Breach notification procedures (POPIA s22)", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Privacy Policy page (POPIA-compliant, public)", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Data subject request form (s23-25)", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Cookie Policy page", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "PAIA s51 Manual", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Data Processing Agreement template", status: "compliant", products: ["Netcare Health OS OS"] },
    ],
  },
  {
    name: "HPCSA",
    fullName: "Health Professions Council of South Africa",
    description: "Regulates all registered healthcare practitioners. Ethical Rules cover advertising, patient records, social media, billing, and professional conduct.",
    icon: Shield,
    color: "#8B5CF6",
    requirements: [
      { item: "Practitioner verification before onboarding", status: "planned", products: ["Netcare Health OS OS", "Placeo Health"] },
      { item: "No canvassing/touting in platform marketing", status: "compliant", products: ["Placeo Health"] },
      { item: "Patient record retention (6yr+ from dormancy)", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Audit logging for all patient data access", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Role-based access control", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "No testimonials/reviews as marketing", status: "compliant", products: ["Placeo Health"] },
      { item: "AI as decision SUPPORT only (Booklet 10)", status: "compliant", products: ["VisioMed AI"] },
      { item: "AI clinical disclaimer component", status: "compliant", products: ["Netcare Health OS OS", "VisioMed AI"] },
      { item: "Scope of practice enforcement", status: "planned", products: ["Netcare Health OS OS", "VisioMed AI"] },
    ],
  },
  {
    name: "ICD-10 SA",
    fullName: "SA ICD-10 Master Industry Table & Coding Standards",
    description: "SA uses WHO ICD-10 with local MIT additions. All billing must use correct codes at highest specificity. External Cause Codes mandatory with injury claims.",
    icon: FileText,
    color: "#3B82F6",
    requirements: [
      { item: "ICD-10 codes in invoice line items", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "SA Master Industry Table codes only", status: "planned", products: ["Netcare Health OS OS", "Netcare Health OS Payer Connect"] },
      { item: "Highest specificity enforcement", status: "planned", products: ["Netcare Health OS OS"] },
      { item: "External Cause Code pairing for T-codes", status: "planned", products: ["Netcare Health OS OS", "Netcare Health OS Payer Connect"] },
      { item: "AI-assisted ICD-10 code suggestion", status: "planned", products: ["VisioMed AI"] },
      { item: "PMB condition auto-detection", status: "planned", products: ["Netcare Health OS Payer Connect"] },
    ],
  },
  {
    name: "CPA",
    fullName: "Consumer Protection Act (Act 68 of 2008)",
    description: "Applies to all medical service providers. Covers fair marketing, transparent pricing, consumer rights, and direct marketing restrictions.",
    icon: Users,
    color: "#f59e0b",
    requirements: [
      { item: "Transparent fee disclosure (Booklet 19)", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Direct marketing time restrictions", status: "planned", products: ["Netcare Health OS OS"] },
      { item: "Opt-out mechanism in all communications", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Plain language in patient communications", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Non-misleading service descriptions", status: "compliant", products: ["Placeo Health"] },
    ],
  },
  {
    name: "Medical Schemes Act",
    fullName: "Medical Schemes Act (Act 131 of 1998)",
    description: "Regulates medical aid claims, prescribed minimum benefits, and healthcare funding. Practices must not make false claims or guarantee coverage.",
    icon: CreditCard,
    color: "#ec4899",
    requirements: [
      { item: "Compliant claim submission format", status: "planned", products: ["Netcare Health OS Payer Connect"] },
      { item: "PMB (Prescribed Minimum Benefits) tracking", status: "planned", products: ["Netcare Health OS Payer Connect"] },
      { item: "No false coverage guarantees in marketing", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Medical aid claim status transparency", status: "compliant", products: ["Netcare Health OS OS"] },
    ],
  },
  {
    name: "Medicines Act",
    fullName: "Medicines and Related Substances Act (Act 101 of 1965)",
    description: "SAHPRA regulates medicines and medical devices. Prescription medicines cannot be advertised to the public. Hearing aids are medical devices.",
    icon: HeartPulse,
    color: "#6366F1",
    requirements: [
      { item: "No prescription medicine advertising to public", status: "compliant", products: ["Placeo Health", "VisioMed AI"] },
      { item: "Drug info from SAHPRA-registered sources", status: "planned", products: ["VisioMed AI"] },
      { item: "ePrescription compliance", status: "planned", products: ["Visio Health Integrator"] },
      { item: "Medical device marketing rules (hearing aids etc.)", status: "planned", products: ["Placeo Health"] },
    ],
  },
  {
    name: "ECTA",
    fullName: "Electronic Communications and Transactions Act (Act 25 of 2002)",
    description: "Governs electronic transactions, digital consent, website requirements, and electronic health records validity.",
    icon: Globe,
    color: "#0ea5e9",
    requirements: [
      { item: "Business details on website (name, address, registration)", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Electronic consent legally valid", status: "compliant", products: ["Netcare Health OS OS", "Visio Waiting Room"] },
      { item: "SSL/TLS encryption on all data transmission", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "Terms & conditions accessible (/terms)", status: "compliant", products: ["Netcare Health OS OS"] },
      { item: "ECTA s43 company info in footer", status: "compliant", products: ["Netcare Health OS OS"] },
    ],
  },
];

const productIcons: Record<string, React.ElementType> = {
  "Netcare Health OS OS": HeartPulse,
  "Placeo Health": Building2,
  "Visio Health Integrator": Plug,
  "Visio Waiting Room": Clock,
  "Netcare Health OS Payer Connect": CreditCard,
  "VisioMed AI": Brain,
};

export default function InvestorCompliance() {
  const totalItems = regulations.reduce((sum, r) => sum + r.requirements.length, 0);
  const compliantItems = regulations.reduce(
    (sum, r) => sum + r.requirements.filter((req) => req.status === "compliant").length, 0
  );
  const complianceRate = Math.round((compliantItems / totalItems) * 100);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Compliance Mapping</h1>
        <p className="text-sm text-gray-500 mt-1">
          How Netcare Health OS meets South African healthcare regulations across every product.
        </p>
      </div>

      {/* Score Card */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#3DA9D1] border border-[#3DA9D1] rounded-xl p-5 text-center">
          <p className="text-4xl font-bold text-[#1D3443] font-serif">{complianceRate}%</p>
          <p className="text-sm text-[#3DA9D1] mt-1">Compliance Score</p>
          <p className="text-xs text-[#3DA9D1] mt-0.5">{compliantItems} of {totalItems} items compliant</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
          <p className="text-4xl font-bold text-blue-700 font-serif">7</p>
          <p className="text-sm text-blue-600 mt-1">Regulations Covered</p>
          <p className="text-xs text-blue-500 mt-0.5">POPIA, HPCSA, ICD-10, CPA, MSA, Medicines, ECTA</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 text-center">
          <p className="text-4xl font-bold text-purple-700 font-serif">6</p>
          <p className="text-sm text-purple-600 mt-1">Products Mapped</p>
          <p className="text-xs text-purple-500 mt-0.5">Every product compliance-checked</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#3DA9D1]" />
          <span className="text-gray-600">Compliant (built & active)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-gray-600">Planned (in roadmap)</span>
        </div>
      </div>

      {/* Regulation Sections */}
      <div className="space-y-4">
        {regulations.map((reg) => {
          const regCompliant = reg.requirements.filter((r) => r.status === "compliant").length;
          return (
            <div key={reg.name} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${reg.color}15` }}
                  >
                    <reg.icon className="w-5 h-5" style={{ color: reg.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{reg.name}</h3>
                    <p className="text-xs text-gray-500">{reg.fullName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: reg.color }}>
                    {regCompliant}/{reg.requirements.length}
                  </p>
                  <p className="text-[10px] text-gray-400">compliant</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3">{reg.description}</p>
                <div className="space-y-2">
                  {reg.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      {req.status === "compliant" ? (
                        <CheckCircle2 className="w-4 h-4 text-[#3DA9D1] mt-0.5 shrink-0" />
                      ) : (
                        <Smartphone className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{req.item}</p>
                        <div className="flex gap-1 mt-1">
                          {req.products.map((p) => {
                            const PIcon = productIcons[p] || HeartPulse;
                            return (
                              <span
                                key={p}
                                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                              >
                                <PIcon className="w-3 h-3" />
                                {p}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
