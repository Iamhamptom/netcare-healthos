"use client";

import { useState } from "react";
import { Send, Mail, FileText, Users, Clock, CheckCircle, Eye } from "lucide-react";

/* ── GP Outreach Campaign Manager ── */

interface OutreachTemplate {
  id: string;
  name: string;
  subject: string;
  preview: string;
  type: "introduction" | "educational" | "referral_guide" | "newsletter";
}

const TEMPLATES: OutreachTemplate[] = [
  {
    id: "T1",
    name: "GP Introduction",
    subject: "Specialist Rheumatology — Dr Joyce Ziki, FCP(SA), now consulting at [Location]",
    preview: "Dear Dr [Name],\n\nI am writing to introduce myself as the consulting rheumatologist at [Location]. I specialise in the diagnosis and management of inflammatory arthritis, connective tissue diseases, and vasculitis.\n\nMany patients with persistent joint pain, unexplained rashes, or positive ANA results benefit from specialist assessment. I welcome referrals and aim for a turnaround time of 2 weeks from referral to first consultation.\n\nPlease find attached my referral form and a guide on when to refer to a rheumatologist.\n\nKind regards,\nDr Joyce Ziki\nMBChB, FCP(SA), MMed (Wits), Cert Rheum",
    type: "introduction",
  },
  {
    id: "T2",
    name: "When to Refer Guide",
    subject: "When should your patient see a rheumatologist? — A quick reference guide",
    preview: "Dear Dr [Name],\n\nAs a fellow practitioner, I know that autoimmune presentations can be subtle. Here are the key red flags that warrant specialist referral:\n\n- Morning stiffness > 30 minutes\n- Symmetrical small joint swelling (MCP/PIP)\n- Positive RF or anti-CCP with joint symptoms\n- Unexplained multi-system disease (rash + arthritis + serositis)\n- ANA ≥ 1:160 with clinical features of CTD\n- Raynaud's with digital ulcers or sclerodactyly\n- Young male with inflammatory back pain (suspect AS)\n\nEarly referral significantly improves outcomes — the 'window of opportunity' in RA is 3-6 months from symptom onset.\n\nI consult at: [5 locations listed]\n\nReferral form attached. WhatsApp bookings: +27 79 208 9987",
    type: "educational",
  },
  {
    id: "T3",
    name: "Biologic Referral Pathway",
    subject: "Biologic therapy pathway — How to refer patients who may need biologics",
    preview: "Dear Dr [Name],\n\nPatients who have failed conventional DMARDs (Methotrexate, Leflunomide) for 3+ months may qualify for biologic therapy under PMB regulations.\n\nI can assist with:\n- DAS28 scoring and disease activity documentation\n- SARAA motivation letters for biologic pre-authorisation\n- Infusion scheduling at 4 hospital locations\n- Ongoing monitoring and shared care arrangements\n\nKey biologics available in SA: Rituximab, Tocilizumab, Infliximab (Revellex), Adalimumab (Hadlima)\n\nMedical aids must fund PMB-level biologics at DSP. I handle the full pre-auth process.\n\nKind regards,\nDr Joyce Ziki",
    type: "referral_guide",
  },
  {
    id: "T4",
    name: "Quarterly Newsletter",
    subject: "RheumCare Q1 2026 — New treatments, clinical insights, and practice updates",
    preview: "Dear Dr [Name],\n\nWelcome to the RheumCare quarterly newsletter for referring practitioners.\n\nIn this edition:\n- New biosimilar availability in SA (Hadlima for PsA/AS)\n- Updated SARAA guidelines for biologic pre-authorisation\n- Case study: Early RA diagnosis — 6-month window of opportunity\n- Practice update: Now consulting at Mediclinic Highveld, Mpumalanga\n\nCPD points available for our upcoming webinar: 'Autoimmune Disease in Primary Care' — register at [link]",
    type: "newsletter",
  },
];

interface CampaignStats {
  sent: number;
  opened: number;
  replied: number;
  referralsReceived: number;
}

const MOCK_STATS: CampaignStats = { sent: 10, opened: 7, replied: 3, referralsReceived: 2 };

export default function ReferralOutreachPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1D3443] flex items-center gap-2">
          <Send className="w-6 h-6 text-teal-600" />
          GP Outreach Campaigns
        </h1>
        <p className="text-sm text-[#1D3443]/60 mt-1">
          Build relationships with referring GPs through targeted outreach
        </p>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Emails Sent", value: MOCK_STATS.sent, icon: Mail },
          { label: "Opened", value: MOCK_STATS.opened, icon: Eye },
          { label: "Replied", value: MOCK_STATS.replied, icon: CheckCircle },
          { label: "Referrals Received", value: MOCK_STATS.referralsReceived, icon: Users },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#1D3443]/10 p-4">
            <div className="flex items-center gap-2 text-[#1D3443]/50 mb-1">
              <stat.icon className="w-4 h-4" />
              <span className="text-xs">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-[#1D3443]">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Templates */}
      <div>
        <h2 className="text-lg font-semibold text-[#1D3443] mb-3">Outreach Templates</h2>
        <div className="space-y-3">
          {TEMPLATES.map(t => (
            <div
              key={t.id}
              className={`bg-white rounded-xl border p-5 cursor-pointer transition-all ${selectedTemplate === t.id ? "border-teal-500 ring-2 ring-teal-500/20" : "border-[#1D3443]/10 hover:border-teal-300"}`}
              onClick={() => setSelectedTemplate(selectedTemplate === t.id ? null : t.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${t.type === "introduction" ? "bg-blue-100" : t.type === "educational" ? "bg-emerald-100" : t.type === "referral_guide" ? "bg-purple-100" : "bg-amber-100"}`}>
                    <FileText className={`w-4 h-4 ${t.type === "introduction" ? "text-blue-600" : t.type === "educational" ? "text-emerald-600" : t.type === "referral_guide" ? "text-purple-600" : "text-amber-600"}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#1D3443] text-sm">{t.name}</h3>
                    <p className="text-xs text-[#1D3443]/50">{t.subject}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-[#1D3443]/5 text-[#1D3443]/50 text-[10px] rounded-full uppercase">{t.type.replace("_", " ")}</span>
              </div>

              {selectedTemplate === t.id && (
                <div className="mt-4 pt-4 border-t border-[#1D3443]/10">
                  <pre className="text-xs text-[#1D3443]/60 whitespace-pre-wrap font-sans leading-relaxed bg-[#1D3443]/[0.02] rounded-lg p-4">
                    {t.preview}
                  </pre>
                  <div className="mt-3 flex gap-2">
                    <button className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2">
                      <Send className="w-4 h-4" /> Send to Selected GPs
                    </button>
                    <button className="px-4 py-2 bg-white border border-[#1D3443]/10 text-[#1D3443] text-sm rounded-lg hover:bg-[#1D3443]/5 transition-colors">
                      Customise
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
