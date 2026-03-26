"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, CreditCard, MessageSquare, Calendar,
  FileText, Search, MapPin, BarChart3, Bot, ArrowUpRight,
  Phone, Mail, CheckCircle2, Clock, AlertCircle, Zap,
  ChevronRight, DollarSign, Target, Megaphone, RefreshCw
} from "lucide-react";

interface Lead {
  id: string;
  patientName: string;
  patientPhone: string;
  patientLocation?: string;
  source: string;
  qualificationScore: number;
  qualified: boolean;
  condition?: string;
  status: string;
  totalRevenue?: number;
  capturedAt: string;
}

interface LeadsSummary {
  total: number;
  qualified: number;
  booked: number;
  attended: number;
  noShows: number;
  conversionRate: string;
  avgQualificationScore: number;
  revenue: { totalRevenue: number; totalLeadFees: number; totalCommission: number; projected30Day: number };
  bySource: Record<string, number>;
  byStatus: Record<string, number>;
}

export default function ClientHubPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [summary, setSummary] = useState<LeadsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "outreach" | "followups" | "payments">("overview");
  const [campaignGenerating, setCampaignGenerating] = useState(false);
  const [campaign, setCampaign] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leads?practice=rheumcare")
      .then(r => r.json())
      .then(data => {
        setLeads(data.leads || []);
        setSummary(data.summary || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const generateCampaign = async (type: string) => {
    setCampaignGenerating(true);
    try {
      const res = await fetch("/api/outreach/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignType: type,
          target: { condition: "rheumatoid arthritis", location: "Johannesburg" },
          practice: {
            name: "RheumCare Clinic",
            whatsappLink: "https://wa.me/27636661793",
            website: "https://www.rheumcare.co.za",
            locations: ["Parktown", "Boksburg", "Pretoria", "Trichardt", "Eswatini"],
            pricing: { consultation: 2600, followUp: 1400 },
          },
        }),
      });
      const data = await res.json();
      setCampaign(data.campaign);
    } catch { setCampaign("Campaign generation failed. Try again."); }
    setCampaignGenerating(false);
  };

  const statCard = (icon: React.ElementType, label: string, value: string | number, sub?: string, color = "text-[#3DA9D1]") => {
    const Icon = icon;
    return (
      <div className="bg-[#0f1a22] rounded-xl border border-[#1D3443]/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-[#1D3443] flex items-center justify-center">
            <Icon className={`w-4.5 h-4.5 ${color}`} />
          </div>
          {sub && <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{sub}</span>}
        </div>
        <div className="text-xl font-bold text-white">{value}</div>
        <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
      </div>
    );
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      captured: "bg-zinc-700 text-zinc-300",
      qualified: "bg-[#3DA9D1]/20 text-[#3DA9D1]",
      contacted: "bg-amber-500/20 text-amber-400",
      booked: "bg-indigo-500/20 text-indigo-400",
      attended: "bg-emerald-500/20 text-emerald-400",
      paid: "bg-emerald-600/20 text-emerald-300",
      no_show: "bg-red-500/20 text-red-400",
    };
    return <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${colors[status] || colors.captured}`}>{status.replace("_", " ")}</span>;
  };

  if (loading) return <div className="p-6 text-zinc-500">Loading your client hub...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">RheumCare Client Hub</h1>
          <p className="text-sm text-zinc-500 mt-1">Your practice growth command center — leads, outreach, follow-ups, revenue</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/connect/vericlaim" className="px-4 py-2 rounded-lg bg-[#1D3443] text-[#3DA9D1] text-xs font-medium border border-[#1D3443] hover:bg-[#24404f] transition-colors flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Connections
          </a>
          <button className="px-4 py-2 rounded-lg bg-[#3DA9D1] text-[#0a1218] text-xs font-semibold hover:bg-[#4dbde3] transition-colors flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5" /> Order More Leads
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#0f1a22] rounded-xl p-1 border border-[#1D3443]/30 w-fit">
        {[
          { id: "overview" as const, label: "Overview", icon: BarChart3 },
          { id: "leads" as const, label: `Leads (${summary?.total || 0})`, icon: Users },
          { id: "outreach" as const, label: "Outreach", icon: Megaphone },
          { id: "followups" as const, label: "Follow-ups", icon: RefreshCw },
          { id: "payments" as const, label: "Payments", icon: CreditCard },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id ? "bg-[#1D3443] text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {statCard(Users, "Total Leads", summary?.total || 0, "pipeline")}
            {statCard(Target, "Qualified", summary?.qualified || 0, `${summary?.avgQualificationScore || 0} avg score`)}
            {statCard(Calendar, "Booked", summary?.booked || 0, "appointments")}
            {statCard(CheckCircle2, "Attended", summary?.attended || 0, summary?.conversionRate || "0%", "text-emerald-400")}
            {statCard(DollarSign, "Revenue Earned", `R${(summary?.revenue?.totalRevenue || 0).toLocaleString()}`, "lead fees + commission", "text-emerald-400")}
            {statCard(TrendingUp, "30-Day Projection", `R${(summary?.revenue?.projected30Day || 0).toLocaleString()}`, "at current pace", "text-amber-400")}
          </div>

          {/* Pre-loaded leads value proposition */}
          <div className="bg-gradient-to-r from-[#3DA9D1]/5 to-[#3DA9D1]/0 rounded-xl border border-[#3DA9D1]/20 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#3DA9D1]" /> 100 Pre-Loaded Leads Ready
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-lg">
                  We researched 50 GP practices, 20 corporate health providers, 15 patient communities, and 15 allied health professionals near your 5 locations. These are referral sources that can send you patients every week.
                </p>
                <div className="flex gap-4 mt-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#3DA9D1]">50</div>
                    <div className="text-[10px] text-zinc-500">GP Practices</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#3DA9D1]">20</div>
                    <div className="text-[10px] text-zinc-500">Corporate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#3DA9D1]">15</div>
                    <div className="text-[10px] text-zinc-500">Communities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#3DA9D1]">15</div>
                    <div className="text-[10px] text-zinc-500">Allied Health</div>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold text-white">R{((summary?.qualified || 14) * 2600 * 0.35).toLocaleString()}</div>
                <div className="text-[10px] text-zinc-500">Projected value (35% conversion)</div>
                <button className="mt-2 px-3 py-1.5 rounded-lg bg-[#3DA9D1] text-[#0a1218] text-xs font-semibold hover:bg-[#4dbde3] transition-colors">
                  Activate Outreach
                </button>
              </div>
            </div>
          </div>

          {/* Source breakdown + pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#0f1a22] rounded-xl border border-[#1D3443]/50 p-4">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">Lead Sources</h3>
              <div className="space-y-2">
                {Object.entries(summary?.bySource || {}).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#3DA9D1]" />
                      <span className="text-xs text-zinc-400">{source.replace("_", " ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full bg-[#3DA9D1]/20" style={{ width: `${Math.max(20, (count as number) / (summary?.total || 1) * 200)}px` }}>
                        <div className="h-full rounded-full bg-[#3DA9D1]" style={{ width: `${(count as number) / (summary?.total || 1) * 100}%` }} />
                      </div>
                      <span className="text-xs text-zinc-300 font-medium w-6 text-right">{count as number}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0f1a22] rounded-xl border border-[#1D3443]/50 p-4">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">Pipeline Status</h3>
              <div className="space-y-2">
                {Object.entries(summary?.byStatus || {}).filter(([, v]) => (v as number) > 0).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      {statusBadge(status)}
                    </div>
                    <span className="text-sm font-medium text-white">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Generate Google Ads", icon: Search, action: () => { setActiveTab("outreach"); generateCampaign("google_ads"); } },
              { label: "View All Leads", icon: Users, action: () => setActiveTab("leads") },
              { label: "Claims Copilot", icon: FileText, href: "/dashboard/claims-copilot" },
              { label: "Documents", icon: FileText, href: "/dashboard/documents" },
            ].map((btn, i) => {
              const Icon = btn.icon;
              const Wrapper = btn.href ? "a" : "button";
              return (
                <Wrapper key={i} href={btn.href} onClick={btn.action}
                  className="p-3 rounded-xl bg-[#0f1a22] border border-[#1D3443]/50 hover:border-[#3DA9D1]/30 transition-all flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-lg bg-[#1D3443] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#3DA9D1]" />
                  </div>
                  <span className="text-xs font-medium text-zinc-300">{btn.label}</span>
                </Wrapper>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LEADS TAB ── */}
      {activeTab === "leads" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Lead Pipeline</h2>
            <button className="px-3 py-1.5 rounded-lg bg-[#3DA9D1] text-[#0a1218] text-xs font-semibold hover:bg-[#4dbde3] transition-colors flex items-center gap-1.5">
              <DollarSign className="w-3 h-3" /> Order 50 More Leads
            </button>
          </div>

          <div className="bg-[#0f1a22] rounded-xl border border-[#1D3443]/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1D3443]/50">
                    <th className="text-left p-3 text-zinc-500 font-medium">Patient</th>
                    <th className="text-left p-3 text-zinc-500 font-medium">Source</th>
                    <th className="text-left p-3 text-zinc-500 font-medium">Condition</th>
                    <th className="text-left p-3 text-zinc-500 font-medium">Score</th>
                    <th className="text-left p-3 text-zinc-500 font-medium">Status</th>
                    <th className="text-right p-3 text-zinc-500 font-medium">Revenue</th>
                    <th className="text-right p-3 text-zinc-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id} className="border-b border-[#1D3443]/30 hover:bg-[#1D3443]/10 transition-colors">
                      <td className="p-3">
                        <div className="text-zinc-200 font-medium">{lead.patientName}</div>
                        <div className="text-zinc-600">{lead.patientPhone}</div>
                      </td>
                      <td className="p-3 text-zinc-400">{lead.source.replace("_", " ")}</td>
                      <td className="p-3 text-zinc-400">{lead.condition || "—"}</td>
                      <td className="p-3">
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                          lead.qualificationScore >= 70 ? "bg-emerald-500/20 text-emerald-400" :
                          lead.qualificationScore >= 50 ? "bg-amber-500/20 text-amber-400" :
                          "bg-zinc-700 text-zinc-400"
                        }`}>
                          {lead.qualificationScore}/100
                        </div>
                      </td>
                      <td className="p-3">{statusBadge(lead.status)}</td>
                      <td className="p-3 text-right">
                        {lead.totalRevenue ? <span className="text-emerald-400 font-medium">R{lead.totalRevenue.toLocaleString()}</span> : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <button className="w-7 h-7 rounded-lg bg-[#1D3443] flex items-center justify-center hover:bg-[#24404f] transition-colors" title="Call">
                            <Phone className="w-3 h-3 text-zinc-400" />
                          </button>
                          <button className="w-7 h-7 rounded-lg bg-[#1D3443] flex items-center justify-center hover:bg-[#24404f] transition-colors" title="WhatsApp">
                            <MessageSquare className="w-3 h-3 text-[#3DA9D1]" />
                          </button>
                          <button className="w-7 h-7 rounded-lg bg-[#1D3443] flex items-center justify-center hover:bg-[#24404f] transition-colors" title="Email">
                            <Mail className="w-3 h-3 text-zinc-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── OUTREACH TAB ── */}
      {activeTab === "outreach" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Outreach Campaigns</h2>
          <p className="text-sm text-zinc-400">AI generates ready-to-launch campaigns. All CTAs point to WhatsApp booking.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: "google_ads", label: "Google Ads", desc: "5 campaigns, 50 keywords", icon: Search },
              { id: "social_media", label: "Social Media", desc: "14-day content calendar", icon: Megaphone },
              { id: "email_sequence", label: "Email Sequence", desc: "5-email nurture + GP outreach", icon: Mail },
              { id: "whatsapp_blast", label: "WhatsApp Templates", desc: "10 broadcast templates", icon: MessageSquare },
              { id: "seo_content", label: "SEO Strategy", desc: "10 blog articles + keywords", icon: BarChart3 },
              { id: "full_campaign", label: "Full 30-Day Campaign", desc: "Everything combined", icon: Zap },
            ].map(c => {
              const Icon = c.icon;
              return (
                <button key={c.id} onClick={() => generateCampaign(c.id)}
                  disabled={campaignGenerating}
                  className="p-4 rounded-xl bg-[#0f1a22] border border-[#1D3443]/50 hover:border-[#3DA9D1]/30 transition-all text-left disabled:opacity-50">
                  <div className="w-9 h-9 rounded-lg bg-[#1D3443] flex items-center justify-center mb-3">
                    <Icon className="w-4.5 h-4.5 text-[#3DA9D1]" />
                  </div>
                  <div className="text-sm font-medium text-white">{c.label}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{c.desc}</div>
                </button>
              );
            })}
          </div>

          {campaignGenerating && (
            <div className="p-4 rounded-xl bg-[#0f1a22] border border-[#3DA9D1]/20 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-[#3DA9D1] animate-spin" />
              <span className="text-sm text-zinc-300">Generating campaign...</span>
            </div>
          )}

          {campaign && !campaignGenerating && (
            <div className="bg-[#0f1a22] rounded-xl border border-[#1D3443]/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-300">Generated Campaign</h3>
                <button onClick={() => navigator.clipboard.writeText(campaign)} className="text-xs text-[#3DA9D1] hover:text-[#4dbde3]">Copy</button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-zinc-400 text-xs font-mono bg-[#0a1218] rounded-lg p-4 max-h-[400px] overflow-y-auto leading-relaxed">
                {campaign}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FOLLOW-UPS TAB ── */}
      {activeTab === "followups" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Follow-up Pipeline</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Needs Contact */}
            <div className="bg-[#0f1a22] rounded-xl border border-[#1D3443]/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-300">Needs Contact</h3>
                <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md">
                  {leads.filter(l => l.status === "qualified").length}
                </span>
              </div>
              <div className="space-y-2">
                {leads.filter(l => l.status === "qualified").map(lead => (
                  <div key={lead.id} className="p-2.5 rounded-lg bg-[#0a1218] border border-[#1D3443]/30">
                    <div className="text-xs font-medium text-zinc-200">{lead.patientName}</div>
                    <div className="text-[10px] text-zinc-500">{lead.condition} — Score: {lead.qualificationScore}</div>
                    <div className="flex gap-1 mt-2">
                      <button className="flex-1 py-1 rounded bg-[#3DA9D1]/10 text-[#3DA9D1] text-[10px] font-medium hover:bg-[#3DA9D1]/20">WhatsApp</button>
                      <button className="flex-1 py-1 rounded bg-[#1D3443] text-zinc-400 text-[10px] font-medium hover:bg-[#24404f]">Call</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Awaiting Booking */}
            <div className="bg-[#0f1a22] rounded-xl border border-[#1D3443]/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-[#3DA9D1]" />
                <h3 className="text-sm font-semibold text-zinc-300">Awaiting Booking</h3>
                <span className="ml-auto text-xs bg-[#3DA9D1]/20 text-[#3DA9D1] px-2 py-0.5 rounded-md">
                  {leads.filter(l => l.status === "contacted").length}
                </span>
              </div>
              <div className="space-y-2">
                {leads.filter(l => l.status === "contacted").map(lead => (
                  <div key={lead.id} className="p-2.5 rounded-lg bg-[#0a1218] border border-[#1D3443]/30">
                    <div className="text-xs font-medium text-zinc-200">{lead.patientName}</div>
                    <div className="text-[10px] text-zinc-500">Contacted — awaiting response</div>
                    <div className="flex gap-1 mt-2">
                      <button className="flex-1 py-1 rounded bg-[#3DA9D1]/10 text-[#3DA9D1] text-[10px] font-medium hover:bg-[#3DA9D1]/20">Follow Up</button>
                      <button className="flex-1 py-1 rounded bg-[#1D3443] text-zinc-400 text-[10px] font-medium hover:bg-[#24404f]">Book Now</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-[#0f1a22] rounded-xl border border-[#1D3443]/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-zinc-300">Booked</h3>
                <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md">
                  {leads.filter(l => ["booked", "attended", "paid"].includes(l.status)).length}
                </span>
              </div>
              <div className="space-y-2">
                {leads.filter(l => ["booked", "attended", "paid"].includes(l.status)).map(lead => (
                  <div key={lead.id} className="p-2.5 rounded-lg bg-[#0a1218] border border-[#1D3443]/30">
                    <div className="text-xs font-medium text-zinc-200">{lead.patientName}</div>
                    <div className="text-[10px] text-zinc-500">{lead.condition} — {statusBadge(lead.status)}</div>
                    {lead.totalRevenue ? (
                      <div className="text-xs text-emerald-400 font-medium mt-1">R{lead.totalRevenue.toLocaleString()}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PAYMENTS TAB ── */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Payments & Billing</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statCard(DollarSign, "Total Revenue Earned", `R${(summary?.revenue?.totalRevenue || 0).toLocaleString()}`, "all time")}
            {statCard(Target, "Lead Fees Collected", `R${(summary?.revenue?.totalLeadFees || 0).toLocaleString()}`, "per-lead charges")}
            {statCard(TrendingUp, "Commission Earned", `R${(summary?.revenue?.totalCommission || 0).toLocaleString()}`, "7.5% of consultation")}
          </div>

          {/* Yoco activation */}
          <div className="bg-gradient-to-r from-emerald-500/5 to-emerald-500/0 rounded-xl border border-emerald-500/20 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" /> Activate Online Payments
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-md">
                  Collect R2,600 upfront when patients book via WhatsApp. Reduces no-shows to near zero and guarantees revenue.
                </p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-400 transition-colors shrink-0">
                Connect Yoco
              </button>
            </div>
          </div>

          {/* Order leads */}
          <div className="bg-[#0f1a22] rounded-xl border border-[#1D3443]/50 p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Order More Leads</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { qty: 25, price: 4500, perLead: 180, popular: false },
                { qty: 50, price: 7500, perLead: 150, popular: true },
                { qty: 100, price: 12500, perLead: 125, popular: false },
              ].map(pkg => (
                <div key={pkg.qty} className={`p-4 rounded-xl border text-center ${
                  pkg.popular ? "border-[#3DA9D1]/40 bg-[#3DA9D1]/5" : "border-[#1D3443]/50 bg-[#0a1218]"
                }`}>
                  {pkg.popular && <div className="text-[10px] text-[#3DA9D1] font-semibold mb-1">MOST POPULAR</div>}
                  <div className="text-2xl font-bold text-white">{pkg.qty}</div>
                  <div className="text-xs text-zinc-500">qualified leads</div>
                  <div className="text-lg font-semibold text-[#3DA9D1] mt-2">R{pkg.price.toLocaleString()}</div>
                  <div className="text-[10px] text-zinc-600">R{pkg.perLead} per lead</div>
                  <button className={`w-full mt-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pkg.popular ? "bg-[#3DA9D1] text-[#0a1218] hover:bg-[#4dbde3]" : "bg-[#1D3443] text-zinc-300 hover:bg-[#24404f]"
                  }`}>
                    Order Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI SDK Agent floating button */}
      <div className="fixed bottom-6 right-6">
        <a href="/dashboard/assistant" className="w-14 h-14 rounded-full bg-[#3DA9D1] shadow-lg shadow-[#3DA9D1]/20 flex items-center justify-center hover:bg-[#4dbde3] transition-all hover:scale-105">
          <Bot className="w-6 h-6 text-[#0a1218]" />
        </a>
      </div>
    </div>
  );
}
