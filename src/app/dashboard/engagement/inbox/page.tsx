"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, AlertTriangle, Calendar, Pill, FileText, DollarSign, User, Shield, Inbox } from "lucide-react";

interface EmailItem {
  id: string; fromEmail: string; fromName: string; subject: string;
  triageCategory: string; triagePriority: string; triageSummary: string;
  patientName: string; status: string; receivedAt: string;
}

const fade = (i: number) => ({ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } });

export default function EmailInboxPage() {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Demo fallback
    setEmails([
      { id: "e1", fromEmail: "sarah@gmail.com", fromName: "Sarah Williams", subject: "Need to reschedule my appointment", triageCategory: "appointment", triagePriority: "normal", triageSummary: "Patient wants to reschedule", patientName: "Sarah Williams", status: "triaged", receivedAt: new Date().toISOString() },
      { id: "e2", fromEmail: "john@discovery.co.za", fromName: "John Doe", subject: "Urgent: Prescription refill needed", triageCategory: "prescription", triagePriority: "urgent", triageSummary: "Urgent refill for chronic medication", patientName: "John Doe", status: "new", receivedAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "e3", fromEmail: "ampath@results.co.za", fromName: "Ampath Labs", subject: "Lab Results — Patient: T Molefe", triageCategory: "results", triagePriority: "high", triageSummary: "Lab results available", patientName: "Thandi Molefe", status: "triaged", receivedAt: new Date(Date.now() - 7200000).toISOString() },
    ]);
    setLoading(false);
  }, [filter]);

  const categoryIcon: Record<string, { icon: any; color: string }> = {
    appointment: { icon: Calendar, color: "#3DA9D1" },
    prescription: { icon: Pill, color: "#8B5CF6" },
    results: { icon: FileText, color: "#10B981" },
    billing: { icon: DollarSign, color: "#E3964C" },
    complaint: { icon: AlertTriangle, color: "#EF4444" },
    referral: { icon: User, color: "#3DA9D1" },
    spam: { icon: Shield, color: "#9CA3AF" },
    unprocessed: { icon: Mail, color: "#6B7280" },
  };

  const priorityStyle: Record<string, string> = {
    urgent: "bg-red-50 text-red-600 border-red-200",
    high: "bg-amber-50 text-amber-600 border-amber-200",
    normal: "bg-gray-50 text-gray-600 border-gray-200",
    low: "bg-gray-50 text-gray-400 border-gray-100",
  };

  return (
    <div className="p-6 lg:p-8 space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold text-gray-900">AI Email Inbox</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Inbound emails triaged by AI — Gmail, Outlook, webhooks</p>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5">
        {["all", "new", "triaged", "in_progress", "resolved"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${filter === f ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
            {f === "all" ? "All" : f.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="bg-white/60 border border-gray-100 rounded-xl p-4 animate-pulse h-16" />)}</div>
      ) : emails.length === 0 ? (
        <div className="bg-white/90 border border-gray-200/80 rounded-xl p-12 text-center">
          <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-[13px] text-gray-500">Inbox empty. Connect Gmail or Outlook in Settings.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {emails.map((email, i) => {
            const cat = categoryIcon[email.triageCategory] || categoryIcon.unprocessed;
            const CatIcon = cat.icon;
            return (
              <motion.div key={email.id} {...fade(i)} className={`bg-white/90 backdrop-blur-sm border rounded-xl p-4 flex items-start gap-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${email.status === "new" ? "border-gray-300" : "border-gray-200/80"}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${cat.color}10` }}>
                  <CatIcon className="w-4 h-4" style={{ color: cat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-gray-900 truncate">{email.fromName || email.fromEmail}</span>
                    {email.patientName && <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{email.patientName}</span>}
                  </div>
                  <p className="text-[13px] text-gray-700 truncate">{email.subject}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{email.triageSummary}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${priorityStyle[email.triagePriority]}`}>{email.triagePriority}</span>
                  <span className="text-[10px] text-gray-400">{new Date(email.receivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
