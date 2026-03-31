"use client";

import { useState, useEffect } from "react";
import { Mail, AlertTriangle, User, Calendar, Pill, FileText, DollarSign, MessageSquare, Shield, Inbox } from "lucide-react";

interface EmailItem {
  id: string;
  fromEmail: string;
  fromName: string;
  subject: string;
  triageCategory: string;
  triagePriority: string;
  triageSummary: string;
  patientName: string;
  status: string;
  receivedAt: string;
}

export default function EmailInboxPage() {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/engagement/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Get email inbox with status: ${filter}` }),
    })
      .then((r) => r.json())
      .then((data) => {
        try {
          const parsed = JSON.parse(data.response);
          setEmails(parsed.emails || []);
        } catch {
          // Demo fallback
          setEmails([
            { id: "e1", fromEmail: "sarah@gmail.com", fromName: "Sarah Williams", subject: "Need to reschedule my appointment", triageCategory: "appointment", triagePriority: "normal", triageSummary: "Patient wants to reschedule", patientName: "Sarah Williams", status: "triaged", receivedAt: new Date().toISOString() },
            { id: "e2", fromEmail: "john@discovery.co.za", fromName: "John Doe", subject: "Urgent: Prescription refill needed", triageCategory: "prescription", triagePriority: "urgent", triageSummary: "Urgent refill request for chronic medication", patientName: "John Doe", status: "new", receivedAt: new Date(Date.now() - 3600000).toISOString() },
            { id: "e3", fromEmail: "ampath@results.co.za", fromName: "Ampath Labs", subject: "Lab Results Ready — Patient: T Molefe", triageCategory: "results", triagePriority: "high", triageSummary: "Lab results available", patientName: "Thandi Molefe", status: "triaged", receivedAt: new Date(Date.now() - 7200000).toISOString() },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const categoryIcons: Record<string, React.ReactNode> = {
    appointment: <Calendar className="w-4 h-4 text-blue-400" />,
    prescription: <Pill className="w-4 h-4 text-purple-400" />,
    results: <FileText className="w-4 h-4 text-emerald-400" />,
    billing: <DollarSign className="w-4 h-4 text-amber-400" />,
    complaint: <AlertTriangle className="w-4 h-4 text-red-400" />,
    referral: <User className="w-4 h-4 text-blue-400" />,
    spam: <Shield className="w-4 h-4 text-zinc-500" />,
    unprocessed: <Mail className="w-4 h-4 text-zinc-400" />,
  };

  const priorityColors: Record<string, string> = {
    urgent: "bg-red-500/10 text-red-400 border-red-500/20",
    high: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    normal: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    low: "bg-zinc-800 text-zinc-500 border-zinc-700",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Inbox className="w-6 h-6 text-purple-400" /> AI Email Inbox
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Inbound emails automatically triaged by AI — from Gmail, Outlook, and webhooks</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "new", "triaged", "in_progress", "resolved"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
            {f === "all" ? "All" : f.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse h-20" />)}</div>
      ) : emails.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Inbox className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">Inbox is empty. Connect Gmail or Outlook in Settings to start receiving emails.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {emails.map((email) => (
            <div key={email.id} className={`bg-zinc-900 border rounded-xl p-4 flex items-start gap-4 ${email.status === "new" ? "border-purple-500/30" : "border-zinc-800"}`}>
              <div className="mt-1">{categoryIcons[email.triageCategory] || categoryIcons.unprocessed}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">{email.fromName || email.fromEmail}</span>
                  {email.patientName && <span className="text-xs bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">Patient: {email.patientName}</span>}
                </div>
                <p className="text-sm text-zinc-300 truncate">{email.subject}</p>
                <p className="text-xs text-zinc-500 mt-1">{email.triageSummary}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[email.triagePriority]}`}>{email.triagePriority}</span>
                <span className="text-xs text-zinc-600">{new Date(email.receivedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
