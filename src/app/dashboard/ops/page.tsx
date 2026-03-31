"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, Users, TrendingUp, Search, Target, Megaphone,
  BarChart3, Globe, Stethoscope, ChevronRight, Pin, ExternalLink,
  Loader2, Activity, Star, MapPin,
} from "lucide-react";

/** Safely render inline markdown bold (**text**) as React elements */
function renderInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong className="text-white/80">{part}</strong>
      : <span>{part}</span>
  );
}

interface OpsDocument {
  id: string;
  category: string;
  title: string;
  content: string;
  metadata: string;
  pinned: boolean;
  createdAt: string;
}

interface OpsStats {
  referralCount: number;
  pendingReferrals: number;
  totalBookings: number;
  bookingsBySource: { leadSource: string; _count: number }[];
  opsDocuments: number;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  market_research: { label: "Market Research", icon: Search, color: "#3B82F6" },
  gp_leads: { label: "GP Leads", icon: Users, color: "#10B981" },
  google_ads: { label: "Google Ads", icon: Target, color: "#F59E0B" },
  content_strategy: { label: "Content Strategy", icon: Megaphone, color: "#8B5CF6" },
  insights: { label: "Insights", icon: TrendingUp, color: "#EC4899" },
  campaign: { label: "Campaigns", icon: BarChart3, color: "#06B6D4" },
};

const QUICK_LINKS = [
  { label: "Public Booking", href: "/book/drlamola", icon: Globe },
  { label: "Symptom Checker", href: "/check/drlamola", icon: Activity },
  { label: "GP Referral Portal", href: "/refer/drlamola", icon: Stethoscope },
  { label: "SEO Landing Page", href: "/ent/drlamola", icon: Star },
];

export default function OpsPage() {
  const [documents, setDocuments] = useState<OpsDocument[]>([]);
  const [stats, setStats] = useState<OpsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/ops?category=${selectedCategory}`)
      .then(r => r.json())
      .then(data => {
        setDocuments(data.documents || []);
        setStats(data.stats || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1721] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Operations Centre</h1>
          <p className="text-xs text-white/60 mt-1">Research, strategy, leads, and campaign data — Dr. Lamola / Joburg ENT</p>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-white/70" />
          <span className="text-xs text-white/70">Netcare Park Lane, Parktown</span>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Bookings", value: stats.totalBookings, icon: BarChart3, color: "#D4AF37" },
            { label: "GP Referrals", value: stats.referralCount, icon: Stethoscope, color: "#10B981" },
            { label: "Pending Referrals", value: stats.pendingReferrals, icon: Users, color: "#F59E0B" },
            { label: "Ops Documents", value: stats.opsDocuments, icon: FileText, color: "#8B5CF6" },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                  <span className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
                </div>
                <p className="text-[10px] text-white/60">{stat.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {QUICK_LINKS.map(link => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
            >
              <Icon className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs text-white/60 group-hover:text-white/90">{link.label}</span>
              <ExternalLink className="w-3 h-3 text-white/70 ml-auto" />
            </a>
          );
        })}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            selectedCategory === "all"
              ? "bg-[#D4AF37] text-black"
              : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          All
        </button>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedCategory === key
                  ? "text-black"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
              style={selectedCategory === key ? { backgroundColor: config.color } : undefined}
            >
              <Icon className="w-3 h-3" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-8 h-8 text-white/70 mx-auto mb-2" />
            <p className="text-sm text-white/60">No documents in this category</p>
          </div>
        ) : (
          documents.map(doc => {
            const catConfig = CATEGORY_CONFIG[doc.category] || { label: doc.category, icon: FileText, color: "#6B7280" };
            const CatIcon = catConfig.icon;
            const isExpanded = expandedDoc === doc.id;
            let meta: Record<string, string> = {};
            try { const parsed = JSON.parse(doc.metadata || "{}"); for (const k in parsed) meta[k] = String(parsed[k]); } catch {}

            return (
              <motion.div
                key={doc.id}
                layout
                className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
              >
                <button
                  onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                  className="w-full p-4 text-left flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: catConfig.color + "20" }}>
                    <CatIcon className="w-4 h-4" style={{ color: catConfig.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {doc.pinned && <Pin className="w-3 h-3 text-[#D4AF37]" />}
                      <h3 className="text-sm font-medium text-white truncate">{doc.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: catConfig.color + "20", color: catConfig.color }}>
                        {catConfig.label}
                      </span>
                      {meta.lastUpdated && (
                        <span className="text-[10px] text-white/70">Updated {String(meta.lastUpdated)}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-white/70 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-white/10"
                  >
                    <div className="p-5 prose prose-invert prose-sm max-w-none">
                      <div className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">
                        {doc.content.split("\n").map((line, i) => {
                          // Headings
                          if (line.startsWith("### ")) return <h3 key={i} className="text-xs font-semibold text-white/70">{line.slice(4)}</h3>;
                          if (line.startsWith("## ")) return <h2 key={i} className="text-sm font-semibold text-white/80 mt-4 mb-2">{line.slice(3)}</h2>;
                          if (line.startsWith("# ")) return <h1 key={i} className="text-base font-bold text-white mb-3">{line.slice(2)}</h1>;
                          // Table separator rows
                          if (/^\|[\s-|]+\|$/.test(line)) return null;
                          // Table rows
                          if (line.startsWith("|") && line.endsWith("|")) {
                            const cells = line.slice(1, -1).split("|").map(c => c.trim());
                            return (
                              <div key={i} className="flex text-[11px] border-b border-white/5">
                                {cells.map((cell, j) => (
                                  <span key={j} className="py-1.5 px-2 flex-1">{renderInline(cell)}</span>
                                ))}
                              </div>
                            );
                          }
                          // Empty lines
                          if (line.trim() === "") return <br key={i} />;
                          // Normal paragraph with inline bold
                          return <p key={i}>{renderInline(line)}</p>;
                        })}
                      </div>
                    </div>
                    {/* Metadata */}
                    {Object.keys(meta).length > 1 && (
                      <div className="px-5 pb-4 flex flex-wrap gap-2">
                        {Object.entries(meta).filter(([k]) => k !== "lastUpdated").map(([key, value]) => (
                          <span key={key} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/60">
                            {key}: {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
