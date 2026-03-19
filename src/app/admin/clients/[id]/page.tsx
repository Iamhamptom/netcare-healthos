"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Phone, Mail, MapPin, Globe, DollarSign, Clock,
  CheckCircle2, Circle, ChevronDown, Plus, Zap, MessageSquare,
  CalendarCheck, FileText, Users, Settings, Link2,
} from "lucide-react";

interface Client {
  id: string;
  practiceName: string;
  doctorName: string;
  specialty: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  stage: string;
  planTier: string;
  monthlyValue: number;
  source: string;
  practiceId: string | null;
  assignedTo: string;
  nextAction: string;
  nextActionDue: string | null;
  lastContactAt: string | null;
  lastContactMethod: string;
  notes: string;
  leadCreatedAt: string;
  contactedAt: string | null;
  demoAt: string | null;
  proposalSentAt: string | null;
  wonAt: string | null;
  onboardingStartedAt: string | null;
  goLiveAt: string | null;
  churnedAt: string | null;
  churnReason: string;
  createdAt: string;
}

interface Activity {
  id: string;
  clientId: string;
  type: string;
  title: string;
  description: string;
  metadata: string;
  createdBy: string;
  createdAt: string;
}

const STAGES = [
  { value: "lead", label: "Lead", color: "#94a3b8" },
  { value: "contacted", label: "Contacted", color: "#60a5fa" },
  { value: "demo_scheduled", label: "Demo", color: "#a78bfa" },
  { value: "proposal_sent", label: "Proposal", color: "#E8C84A" },
  { value: "won", label: "Won", color: "#10b981" },
  { value: "onboarding", label: "Onboarding", color: "#2DD4BF" },
  { value: "active", label: "Active", color: "#22c55e" },
  { value: "at_risk", label: "At Risk", color: "#ef4444" },
  { value: "churned", label: "Churned", color: "#6b7280" },
];

const stageIndex = Object.fromEntries(STAGES.map((s, i) => [s.value, i]));
const stageMap = Object.fromEntries(STAGES.map(s => [s.value, s]));

const ACTIVITY_TYPES = [
  { value: "call", label: "Phone Call", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { value: "meeting", label: "Meeting", icon: Users },
  { value: "demo", label: "Demo", icon: CalendarCheck },
  { value: "note", label: "Note", icon: FileText },
  { value: "stage_change", label: "Stage Change", icon: Settings },
  { value: "setup", label: "Setup", icon: Zap },
];

const activityTypeMap = Object.fromEntries(ACTIVITY_TYPES.map(t => [t.value, t]));

const ONBOARDING_CHECKLIST = [
  { key: "practice", label: "Practice account created" },
  { key: "accounts", label: "Doctor + receptionist login created" },
  { key: "services", label: "Booking services configured" },
  { key: "tasks", label: "Daily task templates set up" },
  { key: "credits", label: "AI credits allocated" },
  { key: "apikey", label: "API key generated" },
  { key: "training", label: "Training session completed" },
  { key: "golive", label: "Go-live confirmation" },
];

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-ZA", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showStageMenu, setShowStageMenu] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [setupResult, setSetupResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [activityForm, setActivityForm] = useState({ type: "call", title: "", description: "" });

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/clients/${id}`);
    if (!res.ok) { router.push("/admin/clients"); return; }
    const data = await res.json();
    setClient(data.client);
    setActivities(data.activities || []);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  async function moveStage(newStage: string) {
    setSaving(true);
    setShowStageMenu(false);
    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (res.ok) load();
    } finally {
      setSaving(false);
    }
  }

  async function addActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!activityForm.title) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/clients/${id}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityForm),
      });
      if (res.ok) {
        setShowAddActivity(false);
        setActivityForm({ type: "call", title: "", description: "" });
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function runAutoSetup() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/clients/${id}/setup`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSetupResult(data.user);
        load();
      } else {
        alert(data.error || "Setup failed");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading || !client) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-[var(--text-tertiary)] text-sm">Loading...</div>
      </div>
    );
  }

  const currentStageIdx = stageIndex[client.stage] ?? 0;
  const showOnboarding = client.stage === "won" || client.stage === "onboarding";

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin/clients")} className="text-[var(--text-tertiary)] hover:text-[#10b981] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-[var(--ivory)]">{client.doctorName}</h2>
          <div className="text-[12px] text-[var(--text-tertiary)]">{client.practiceName} · {client.specialty}</div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowStageMenu(!showStageMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium border border-[var(--border)] hover:border-[#10b981]/30 transition-colors"
            style={{ color: stageMap[client.stage]?.color || "#94a3b8" }}
          >
            {stageMap[client.stage]?.label || client.stage}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <AnimatePresence>
            {showStageMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 top-full mt-1 z-20 rounded-lg glass-panel border border-[var(--border)] py-1 min-w-[160px]"
              >
                {STAGES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => moveStage(s.value)}
                    disabled={saving}
                    className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[var(--charcoal)]/30 transition-colors flex items-center gap-2 ${
                      s.value === client.stage ? "font-semibold" : ""
                    }`}
                    style={{ color: s.color }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stage Timeline */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl glass-panel p-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {STAGES.filter(s => s.value !== "at_risk" && s.value !== "churned").map((s, i) => {
            const isCompleted = i < currentStageIdx;
            const isCurrent = s.value === client.stage;
            return (
              <div key={s.value} className="flex items-center gap-1 shrink-0">
                {i > 0 && (
                  <div className="w-6 h-0.5 rounded" style={{ backgroundColor: isCompleted ? s.color : "var(--border)" }} />
                )}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCurrent ? "scale-125" : ""
                    }`}
                    style={{
                      borderColor: isCompleted || isCurrent ? s.color : "var(--border)",
                      backgroundColor: isCompleted ? s.color : "transparent",
                    }}
                  >
                    {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-[9px] whitespace-nowrap" style={{ color: isCurrent ? s.color : "var(--text-tertiary)" }}>
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Profile + Onboarding */}
        <div className="lg:col-span-1 space-y-4">
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-4 space-y-3">
            <div className="text-[12px] font-semibold text-[var(--ivory)] mb-2">Contact Info</div>
            {client.phone && (
              <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                <Phone className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> {client.phone}
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                <Mail className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> {client.email}
              </div>
            )}
            {client.location && (
              <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                <MapPin className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> {client.location}
              </div>
            )}
            {client.website && (
              <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                <Globe className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> {client.website}
              </div>
            )}

            <div className="border-t border-[var(--border)] pt-3 mt-3 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-tertiary)]">Plan</span>
                <span className="text-[var(--text-secondary)] capitalize">{client.planTier}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-tertiary)]">Monthly Value</span>
                <span className="text-[#E8C84A] font-semibold">R{client.monthlyValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-tertiary)]">Source</span>
                <span className="text-[var(--text-secondary)]">{client.source || "—"}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-tertiary)]">Assigned</span>
                <span className="text-[var(--text-secondary)]">{client.assignedTo || "—"}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-tertiary)]">Lead Created</span>
                <span className="text-[var(--text-secondary)]">{formatDate(client.leadCreatedAt)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-tertiary)]">Last Contact</span>
                <span className="text-[var(--text-secondary)]">{formatDate(client.lastContactAt)}</span>
              </div>
            </div>

            {client.nextAction && (
              <div className="border-t border-[var(--border)] pt-3 mt-3">
                <div className="text-[11px] text-[var(--text-tertiary)] mb-1">Next Action</div>
                <div className="text-[12px] text-[var(--ivory)]">{client.nextAction}</div>
                {client.nextActionDue && (
                  <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)] mt-1">
                    <Clock className="w-3 h-3" /> Due {formatDate(client.nextActionDue)}
                  </div>
                )}
              </div>
            )}

            {client.notes && (
              <div className="border-t border-[var(--border)] pt-3 mt-3">
                <div className="text-[11px] text-[var(--text-tertiary)] mb-1">Notes</div>
                <div className="text-[12px] text-[var(--text-secondary)]">{client.notes}</div>
              </div>
            )}
          </motion.div>

          {/* Onboarding Checklist */}
          {showOnboarding && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl glass-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[12px] font-semibold text-[var(--ivory)]">Onboarding Checklist</div>
                {client.stage === "won" && !client.practiceId && (
                  <button
                    onClick={runAutoSetup}
                    disabled={saving}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-[#10b981] text-white hover:bg-[#10b981]/90 transition-colors disabled:opacity-50"
                  >
                    <Zap className="w-3 h-3" /> Auto-Setup
                  </button>
                )}
              </div>

              {setupResult && (
                <div className="mb-3 p-3 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 text-[11px] space-y-1">
                  <div className="font-semibold text-[#10b981]">Setup Complete</div>
                  <div className="text-[var(--text-secondary)]">Email: {setupResult.email}</div>
                  <div className="text-[var(--text-secondary)]">Temp password: {setupResult.tempPassword}</div>
                </div>
              )}

              <div className="space-y-2">
                {ONBOARDING_CHECKLIST.map(item => {
                  const done =
                    (item.key === "practice" && !!client.practiceId) ||
                    (item.key === "accounts" && !!client.practiceId) ||
                    (item.key === "services" && !!client.practiceId) ||
                    (item.key === "tasks" && !!client.practiceId) ||
                    (item.key === "credits" && !!client.practiceId) ||
                    (item.key === "golive" && client.stage === "active");

                  return (
                    <div key={item.key} className="flex items-center gap-2">
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                      )}
                      <span className={`text-[12px] ${done ? "text-[var(--text-secondary)] line-through" : "text-[var(--ivory)]"}`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Connected Accounts */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl glass-panel p-4">
            <div className="text-[12px] font-semibold text-[var(--ivory)] mb-3">Connected Accounts</div>
            <div className="space-y-2">
              {[
                { label: "Gmail", icon: Mail },
                { label: "WhatsApp Business", icon: MessageSquare },
                { label: "Yoco Payments", icon: DollarSign },
              ].map(acc => (
                <div key={acc.label} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                    <acc.icon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> {acc.label}
                  </div>
                  <span className="text-[10px] text-[var(--text-tertiary)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                    Coming Soon
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add Activity */}
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold text-[var(--ivory)]">Activity Feed</div>
            <button
              onClick={() => setShowAddActivity(!showAddActivity)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--charcoal)]/30 text-[var(--text-secondary)] border border-[var(--border)] hover:border-[#10b981]/30 hover:text-[#10b981] transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Activity
            </button>
          </div>

          <AnimatePresence>
            {showAddActivity && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={addActivity}
                className="rounded-xl glass-panel p-4 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={activityForm.type}
                    onChange={e => setActivityForm(f => ({ ...f, type: e.target.value }))}
                    className="px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none"
                  >
                    {ACTIVITY_TYPES.filter(t => t.value !== "stage_change" && t.value !== "setup").map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <input
                    required
                    placeholder="Title *"
                    value={activityForm.title}
                    onChange={e => setActivityForm(f => ({ ...f, title: e.target.value }))}
                    className="px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[#10b981]/30"
                  />
                </div>
                <textarea
                  placeholder="Description (optional)"
                  value={activityForm.description}
                  onChange={e => setActivityForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[#10b981]/30 resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddActivity(false)} className="px-3 py-1.5 rounded-lg text-[11px] text-[var(--text-tertiary)] hover:text-[var(--ivory)] transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#10b981] text-white hover:bg-[#10b981]/90 transition-colors disabled:opacity-50">
                    {saving ? "Saving..." : "Add"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Activity List */}
          <div className="space-y-1">
            {activities.map((a, i) => {
              const typeInfo = activityTypeMap[a.type] || { label: a.type, icon: FileText };
              const Icon = typeInfo.icon;
              const isStageChange = a.type === "stage_change";
              const isSetup = a.type === "setup";

              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex gap-3 py-3"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isSetup ? "rgba(16,185,129,0.1)" : isStageChange ? "rgba(167,139,250,0.1)" : "rgba(148,163,184,0.1)",
                      }}
                    >
                      <Icon
                        className="w-3.5 h-3.5"
                        style={{
                          color: isSetup ? "#10b981" : isStageChange ? "#a78bfa" : "#94a3b8",
                        }}
                      />
                    </div>
                    {i < activities.length - 1 && (
                      <div className="w-px flex-1 bg-[var(--border)] mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-[var(--ivory)]">{a.title}</span>
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        {formatDate(a.createdAt)} {formatTime(a.createdAt)}
                      </span>
                    </div>
                    {a.description && (
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{a.description}</div>
                    )}
                    <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">by {a.createdBy}</div>
                  </div>
                </motion.div>
              );
            })}

            {activities.length === 0 && (
              <div className="text-center py-12 text-[var(--text-tertiary)]">
                <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-[12px]">No activity yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
