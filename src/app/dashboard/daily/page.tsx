"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sunrise, Sun, Sunset, CheckCircle2, Circle, Plus,
  TrendingUp, Users, DollarSign, Calendar,
  ClipboardList, Trash2,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  completedBy: string;
  completedAt: string | null;
}

interface Progress {
  completed: number;
  total: number;
  percent: number;
}

const categoryConfig = {
  morning: { label: "Morning Opening", icon: Sunrise, color: "#E8C84A" },
  during_day: { label: "During the Day", icon: Sun, color: "#2DD4BF" },
  end_of_day: { label: "End of Day Closing", icon: Sunset, color: "#8B5CF6" },
};

export default function DailyTasksPage() {
  const [tasks, setTasks] = useState<{ morning: Task[]; duringDay: Task[]; endOfDay: Task[] }>({ morning: [], duringDay: [], endOfDay: [] });
  const [progress, setProgress] = useState<Progress>({ completed: 0, total: 0, percent: 0 });
  const [briefing, setBriefing] = useState<Record<string, unknown> | null>(null);
  const [newTask, setNewTask] = useState("");
  const [newCategory, setNewCategory] = useState("during_day");

  useEffect(() => {
    fetch("/api/daily-tasks").then(r => r.json()).then(d => {
      setTasks(d.tasks || { morning: [], duringDay: [], endOfDay: [] });
      setProgress(d.progress || { completed: 0, total: 0, percent: 0 });
    });
    // Morning briefing data
    Promise.all([
      fetch("/api/analytics").then(r => r.json()).catch(() => null),
      fetch("/api/checkin").then(r => r.json()).catch(() => ({ checkIns: [] })),
    ]).then(([analytics, checkin]) => {
      setBriefing({
        patientsToday: analytics?.bookings?.today ?? 0,
        recallDue: analytics?.recall?.due ?? 0,
        outstanding: analytics?.billing?.outstanding ?? 0,
        revenue: analytics?.billing?.paidToday ?? 0,
        waiting: (checkin.checkIns || []).filter((c: { status: string }) => c.status === "waiting").length,
      });
    });
  }, []);

  async function toggleTask(id: string) {
    const res = await fetch("/api/daily-tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      // Refresh
      const d = await fetch("/api/daily-tasks").then(r => r.json());
      setTasks(d.tasks);
      setProgress(d.progress);
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    await fetch("/api/daily-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask.trim(), category: newCategory }),
    });
    setNewTask("");
    const d = await fetch("/api/daily-tasks").then(r => r.json());
    setTasks(d.tasks);
    setProgress(d.progress);
  }

  async function deleteTask(id: string) {
    await fetch(`/api/daily-tasks?id=${id}`, { method: "DELETE" });
    const d = await fetch("/api/daily-tasks").then(r => r.json());
    setTasks(d.tasks);
    setProgress(d.progress);
  }

  const today = new Date();
  const dayName = today.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="p-6 space-y-5">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-[var(--gold)]" />
            <h2 className="text-lg font-semibold">Daily Tasks</h2>
          </div>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">{dayName}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--gold)]">{progress.percent}%</div>
            <div className="text-[11px] text-[var(--text-tertiary)]">{progress.completed}/{progress.total} done</div>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--gold)" strokeWidth="2.5"
                strokeDasharray={`${progress.percent} 100`} strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Morning Briefing */}
      {briefing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl glass-panel p-5 roman-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sunrise className="w-4 h-4 text-[#E8C84A]" />
            <span className="text-[13px] font-semibold text-[var(--ivory)]">Morning Briefing</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <BriefingCard icon={Calendar} label="Appointments Today" value={String(briefing.patientsToday)} color="#2DD4BF" />
            <BriefingCard icon={Users} label="Waiting Now" value={String(briefing.waiting)} color="#E8C84A" />
            <BriefingCard icon={TrendingUp} label="Recall Due" value={String(briefing.recallDue)} color="#D4AF37" />
            <BriefingCard icon={DollarSign} label="Revenue Today" value={`R${Number(briefing.revenue).toLocaleString()}`} color="#10b981" />
            <BriefingCard icon={DollarSign} label="Outstanding" value={`R${Number(briefing.outstanding).toLocaleString()}`} color="#ef4444" />
          </div>
        </motion.div>
      )}

      {/* Task lists by category */}
      {(Object.entries(categoryConfig) as [string, typeof categoryConfig.morning][]).map(([key, cfg]) => {
        const categoryKey = key === "during_day" ? "duringDay" : key === "end_of_day" ? "endOfDay" : "morning";
        const categoryTasks = tasks[categoryKey as keyof typeof tasks] || [];
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl glass-panel overflow-hidden"
          >
            <div className="flex items-center gap-2 p-4 border-b border-[var(--border)]">
              <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
              <span className="text-[13px] font-semibold text-[var(--ivory)]">{cfg.label}</span>
              <span className="text-[11px] text-[var(--text-tertiary)] ml-auto">
                {categoryTasks.filter(t => t.completed).length}/{categoryTasks.length}
              </span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {categoryTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-white/[0.02]">
                  <button onClick={() => toggleTask(task.id)} className="shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-[var(--teal)]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[var(--text-tertiary)] hover:text-[var(--gold)]" />
                    )}
                  </button>
                  <span className={`text-[13px] flex-1 ${task.completed ? "line-through text-[var(--text-tertiary)]" : "text-[var(--ivory)]"}`}>
                    {task.title}
                  </span>
                  {task.completed && task.completedBy && (
                    <span className="text-[10px] text-[var(--text-tertiary)]">{task.completedBy}</span>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-[var(--text-tertiary)] hover:text-[var(--crimson)] transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {categoryTasks.length === 0 && (
                <div className="px-4 py-6 text-center text-[12px] text-[var(--text-tertiary)]">
                  No tasks in this category
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Add custom task */}
      <form onSubmit={addTask} className="rounded-xl glass-panel p-4 flex gap-3">
        <Plus className="w-5 h-5 text-[var(--text-tertiary)] shrink-0 mt-1.5" />
        <input
          type="text"
          placeholder="Add a custom task..."
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          className="flex-1 px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[var(--gold)]/30"
        />
        <select
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          className="px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none"
        >
          <option value="morning">Morning</option>
          <option value="during_day">During Day</option>
          <option value="end_of_day">End of Day</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-[var(--gold)] rounded-lg text-[13px] font-medium text-[var(--obsidian)]">
          Add
        </button>
      </form>
    </div>
  );
}

function BriefingCard({ icon: Icon, label, value, color }: { icon: typeof Calendar; label: string; value: string; color: string }) {
  return (
    <div className="p-3 rounded-lg glass-panel">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-bold text-[var(--ivory)]">{value}</div>
    </div>
  );
}
