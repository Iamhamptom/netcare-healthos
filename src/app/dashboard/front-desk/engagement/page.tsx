"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse, ArrowLeft, Loader2, AlertTriangle, CheckCircle2,
  Clock, Pill, RotateCcw, Activity, FlaskConical, CalendarCheck,
  ClipboardList, ChevronDown, ChevronUp, User, Send,
} from "lucide-react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────

interface StepDef {
  order: number;
  label: string;
  timing: string;
  icon: string;
}

interface Enrollment {
  id: string;
  patientName: string;
  patientId: string;
  sequenceName: string;
  currentStep: number;
  totalSteps: number;
  status: string;
  nextStepAt: string | null;
  startedAt: string;
  lastResponse: string | null;
  escalated: boolean;
  steps: StepDef[];
}

// ── Icon mapping ─────────────────────────────────────────────────────────

const stepIcons: Record<string, typeof Clock> = {
  clipboard: ClipboardList,
  pill: Pill,
  "alert-triangle": AlertTriangle,
  repeat: RotateCcw,
  "heart-pulse": Activity,
  flask: FlaskConical,
  "calendar-check": CalendarCheck,
};

const statusStyles: Record<string, { bg: string; border: string; dot: string; label: string }> = {
  active: { bg: "rgba(45,212,191,0.05)", border: "rgba(45,212,191,0.1)", dot: "#2DD4BF", label: "Active" },
  escalated: { bg: "rgba(248,113,113,0.05)", border: "rgba(248,113,113,0.15)", dot: "#F87171", label: "Escalated" },
  paused: { bg: "rgba(232,200,74,0.05)", border: "rgba(232,200,74,0.1)", dot: "#E8C84A", label: "Paused" },
  completed: { bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.06)", dot: "rgba(253,252,240,0.3)", label: "Completed" },
};

function timeUntil(dateStr: string) {
  const mins = Math.floor((new Date(dateStr).getTime() - Date.now()) / 60000);
  if (mins < 0) return "Overdue";
  if (mins < 60) return `in ${mins}m`;
  if (mins < 1440) return `in ${Math.floor(mins / 60)}h`;
  return `in ${Math.floor(mins / 1440)}d`;
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function EngagementPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [steps, setSteps] = useState<StepDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/front-desk/engagement")
      .then(r => r.json())
      .then(d => {
        setEnrollments(d.enrollments || []);
        setSteps(d.steps || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const active = enrollments.filter(e => e.status === "active").length;
  const escalatedCount = enrollments.filter(e => e.escalated).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgba(253,252,240,0.3)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link href="/dashboard/front-desk" className="text-xs flex items-center gap-1 mb-3" style={{ color: "rgba(253,252,240,0.4)" }}>
          <ArrowLeft className="w-3 h-3" /> Back to Front Desk
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: "rgba(253,252,240,0.95)" }}>
          <HeartPulse className="inline w-6 h-6 mr-2 -mt-1" style={{ color: "#818CF8" }} />
          Patient Care Sequences
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(253,252,240,0.4)" }}>
          7-tier automated engagement — from visit summary to annual screening
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active Journeys", value: active, color: "#2DD4BF" },
          { label: "Escalated", value: escalatedCount, color: escalatedCount > 0 ? "#F87171" : "#2DD4BF" },
          { label: "Total Tracked", value: enrollments.length, color: "#818CF8" },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: "rgba(253,252,240,0.4)" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 7-Step Timeline Legend */}
      <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-xs font-medium mb-3" style={{ color: "rgba(253,252,240,0.6)" }}>Post-Visit Care Timeline</p>
        <div className="flex items-center gap-1">
          {steps.map((step, i) => {
            const Icon = stepIcons[step.icon] || Clock;
            return (
              <div key={step.order} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className="p-1.5 rounded-lg mb-1" style={{ background: "rgba(129,140,248,0.1)" }}>
                    <Icon className="w-3 h-3" style={{ color: "#818CF8" }} />
                  </div>
                  <p className="text-[9px] text-center font-medium" style={{ color: "rgba(253,252,240,0.6)" }}>{step.label}</p>
                  <p className="text-[8px]" style={{ color: "rgba(253,252,240,0.3)" }}>{step.timing}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-4 h-px mx-0.5 flex-shrink-0" style={{ background: "rgba(255,255,255,0.1)" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Enrollments */}
      {enrollments.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <HeartPulse className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(253,252,240,0.1)" }} />
          <p className="text-sm" style={{ color: "rgba(253,252,240,0.4)" }}>No active patient care sequences</p>
          <p className="text-xs mt-1" style={{ color: "rgba(253,252,240,0.3)" }}>Patients are automatically enrolled when appointments are completed</p>
        </div>
      ) : (
        <div className="space-y-2">
          {enrollments.map((en, i) => {
            const style = statusStyles[en.status] || statusStyles.active;
            const isExpanded = expanded === en.id;

            return (
              <motion.div
                key={en.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl overflow-hidden"
                style={{ background: style.bg, border: `1px solid ${style.border}` }}
              >
                {/* Main row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : en.id)}
                >
                  <div className="p-2 rounded-lg" style={{ background: `${style.dot}15` }}>
                    <User className="w-4 h-4" style={{ color: style.dot }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: "rgba(253,252,240,0.9)" }}>{en.patientName}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${style.dot}15`, color: style.dot }}>
                        {style.label}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(253,252,240,0.4)" }}>
                      Step {en.currentStep} of {en.totalSteps}: {steps[en.currentStep - 1]?.label || "Unknown"}
                      {en.nextStepAt && ` · Next ${timeUntil(en.nextStepAt)}`}
                    </p>
                  </div>

                  {/* Progress dots */}
                  <div className="flex gap-1 mr-2">
                    {Array.from({ length: en.totalSteps }).map((_, idx) => (
                      <div key={idx} className="w-2 h-2 rounded-full transition-all" style={{
                        background: idx < en.currentStep
                          ? "#2DD4BF"
                          : idx === en.currentStep - 1 && en.escalated
                            ? "#F87171"
                            : "rgba(255,255,255,0.1)",
                      }} />
                    ))}
                  </div>

                  {isExpanded ? <ChevronUp className="w-4 h-4" style={{ color: "rgba(253,252,240,0.3)" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "rgba(253,252,240,0.3)" }} />}
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4"
                    >
                      <div className="pt-3" style={{ borderTop: `1px solid ${style.border}` }}>
                        {/* Step-by-step timeline */}
                        <div className="space-y-2">
                          {steps.map((step) => {
                            const Icon = stepIcons[step.icon] || Clock;
                            const completed = step.order < en.currentStep;
                            const current = step.order === en.currentStep;
                            const isCurrent = current && en.escalated;

                            return (
                              <div key={step.order} className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg" style={{
                                  background: completed ? "rgba(45,212,191,0.15)" : current ? `${style.dot}15` : "rgba(255,255,255,0.03)",
                                }}>
                                  {completed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#2DD4BF" }} />
                                  ) : (
                                    <Icon className="w-3.5 h-3.5" style={{ color: isCurrent ? "#F87171" : current ? style.dot : "rgba(253,252,240,0.2)" }} />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-medium" style={{ color: completed || current ? "rgba(253,252,240,0.7)" : "rgba(253,252,240,0.3)" }}>
                                    {step.label}
                                  </p>
                                </div>
                                <span className="text-[10px]" style={{ color: "rgba(253,252,240,0.3)" }}>{step.timing}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Escalation alert */}
                        {en.escalated && en.lastResponse && (
                          <div className="mt-3 p-3 rounded-lg" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)" }}>
                            <p className="text-xs font-medium" style={{ color: "#F87171" }}>
                              <AlertTriangle className="inline w-3 h-3 mr-1 -mt-0.5" />
                              Patient Response (Escalated)
                            </p>
                            <p className="text-xs mt-1" style={{ color: "rgba(253,252,240,0.6)" }}>&quot;{en.lastResponse}&quot;</p>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="mt-3 flex gap-4 text-[10px]" style={{ color: "rgba(253,252,240,0.3)" }}>
                          <span>Started: {new Date(en.startedAt).toLocaleDateString("en-ZA")}</span>
                          {en.nextStepAt && <span>Next step: {new Date(en.nextStepAt).toLocaleDateString("en-ZA")}</span>}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
