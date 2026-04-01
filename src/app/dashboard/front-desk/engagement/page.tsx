"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  HeartPulse, ChevronLeft, Loader2, CheckCircle2, Clock,
  AlertTriangle, Pause, ChevronDown, Activity,
} from "lucide-react";

interface Step {
  id: string;
  name: string;
  timing: string;
  description: string;
}

interface Enrollment {
  id: string;
  patientName: string;
  sequenceName: string;
  currentStep: number;
  totalSteps: number;
  status: string;
  nextStepAt: string | null;
  escalated: boolean;
  lastResponse: string | null;
  startedAt: string;
}

export default function FrontDeskEngagementPage() {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/front-desk/engagement");
      const data = await res.json();
      setEnrollments(data.enrollments || []);
      setSteps(data.steps || []);
    } catch (err) {
      console.error("Failed to load engagement data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const active = enrollments.filter(e => e.status === "active").length;
  const escalated = enrollments.filter(e => e.escalated).length;
  const completed = enrollments.filter(e => e.status === "completed").length;
  const total = enrollments.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 text-neutral-200">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 mb-4">
        <Link href="/dashboard/front-desk" className="hover:text-neutral-300 transition-colors">front-desk</Link>
        <span>/</span>
        <span className="text-neutral-400">engagement</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Patient Care Sequences</h1>
          <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
            Automated post-visit engagement — 7 steps from visit summary to annual screening
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-px bg-neutral-800 rounded-lg overflow-hidden mb-6">
        {[
          { label: "ACTIVE", value: active },
          { label: "ESCALATED", value: escalated },
          { label: "COMPLETED", value: completed },
          { label: "TOTAL", value: total },
        ].map(s => (
          <div key={s.label} className="bg-neutral-900 p-3">
            <div className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 mb-1">{s.label}</div>
            <div className="text-xl font-semibold font-mono text-neutral-100">{s.value}</div>
          </div>
        ))}
      </div>

      {/* 7-Step Timeline Reference */}
      <div className="border border-neutral-800 rounded-lg mb-6">
        <div className="px-3 py-2 border-b border-neutral-800">
          <span className="text-[13px] font-semibold text-neutral-200">Sequence Steps</span>
        </div>
        <div className="divide-y divide-neutral-800">
          {(steps.length > 0 ? steps : [
            { id: "1", name: "Visit Summary", timing: "Immediately", description: "Discharge summary + care plan sent" },
            { id: "2", name: "Pharmacy Reminder", timing: "Day 1", description: "Medication collection reminder" },
            { id: "3", name: "Side Effects Check", timing: "Day 7", description: "How are you feeling? Any issues?" },
            { id: "4", name: "Refill Prompt", timing: "Day 25", description: "Chronic medication refill reminder" },
            { id: "5", name: "Chronic Vitals", timing: "Monthly", description: "Blood pressure, glucose, weight check-in" },
            { id: "6", name: "Lab Test Due", timing: "Quarterly", description: "HbA1c, cholesterol, kidney function" },
            { id: "7", name: "Annual Screening", timing: "Annual", description: "Full wellness check-up reminder" },
          ]).map((step, i) => (
            <div key={step.id} className="flex items-center px-3 py-2">
              <span className="text-[11px] font-mono text-neutral-600 w-6 shrink-0">{i + 1}</span>
              <span className="text-[13px] text-neutral-200 flex-1">{step.name}</span>
              <span className="text-[11px] font-mono text-neutral-500 mx-3">{step.timing}</span>
              <span className="text-[11px] text-neutral-500">{step.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Enrollments */}
      <div className="border border-neutral-800 rounded-lg">
        <div className="px-3 py-2 border-b border-neutral-800">
          <span className="text-[13px] font-semibold text-neutral-200">Active Enrollments</span>
        </div>
        {enrollments.length === 0 ? (
          <p className="text-[11px] font-mono text-neutral-600 text-center py-8">No patients enrolled in care sequences yet</p>
        ) : (
          <div className="divide-y divide-neutral-800">
            {enrollments.map(e => {
              const isExpanded = expandedId === e.id;
              return (
                <div key={e.id}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : e.id)}
                    className="w-full flex items-center px-3 py-2.5 hover:bg-neutral-800/30 transition-colors text-left"
                  >
                    {e.escalated ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mr-2" />
                    ) : e.status === "completed" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mr-2" />
                    ) : e.status === "paused" ? (
                      <Pause className="w-3.5 h-3.5 text-neutral-500 shrink-0 mr-2" />
                    ) : (
                      <Activity className="w-3.5 h-3.5 text-neutral-400 shrink-0 mr-2" />
                    )}
                    <span className="text-[13px] text-neutral-200 flex-1">{e.patientName}</span>
                    {/* Progress dots */}
                    <div className="flex items-center gap-0.5 mx-3">
                      {Array.from({ length: e.totalSteps }).map((_, i) => (
                        <div key={i} className={"w-1.5 h-1.5 rounded-full " + (i < e.currentStep ? "bg-emerald-400" : "bg-neutral-700")} />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 mr-2">
                      {e.currentStep}/{e.totalSteps}
                    </span>
                    <span className={"text-[10px] font-mono px-1.5 py-0.5 rounded " + (
                      e.status === "active" ? "bg-emerald-500/10 text-emerald-400" :
                      e.status === "paused" ? "bg-neutral-500/10 text-neutral-400" :
                      e.status === "escalated" || e.escalated ? "bg-amber-500/10 text-amber-400" :
                      "bg-neutral-500/10 text-neutral-400"
                    )}>{e.status}</span>
                    <ChevronDown className={"w-3 h-3 text-neutral-600 ml-2 transition-transform " + (isExpanded ? "rotate-180" : "")} />
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 bg-neutral-800/20">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="font-mono text-neutral-500">Sequence:</span>
                          <span className="text-neutral-300 ml-1">{e.sequenceName || "Post-Visit Care"}</span>
                        </div>
                        <div>
                          <span className="font-mono text-neutral-500">Started:</span>
                          <span className="text-neutral-300 ml-1">{new Date(e.startedAt).toLocaleDateString("en-ZA")}</span>
                        </div>
                        {e.nextStepAt && (
                          <div>
                            <span className="font-mono text-neutral-500">Next step:</span>
                            <span className="text-neutral-300 ml-1">{new Date(e.nextStepAt).toLocaleDateString("en-ZA")}</span>
                          </div>
                        )}
                        {e.lastResponse && (
                          <div className="col-span-2">
                            <span className="font-mono text-neutral-500">Last response:</span>
                            <span className="text-neutral-300 ml-1">{e.lastResponse}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
