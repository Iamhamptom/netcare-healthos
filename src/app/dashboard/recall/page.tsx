"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Plus, Loader2, Phone, CheckCircle, AlertTriangle, Trash2 } from "lucide-react";
import Modal from "@/components/dashboard/Modal";
import EmptyState from "@/components/dashboard/EmptyState";

interface RecallItem {
  id: string;
  patientName: string;
  reason: string;
  dueDate: string;
  contacted: boolean;
  phone: string;
}

export default function RecallPage() {
  const [items, setItems] = useState<RecallItem[]>([]);
  const [filter, setFilter] = useState("due");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ patientName: "", reason: "", dueDate: "", phone: "" });

  async function fetchItems() {
    const res = await fetch("/api/recall");
    const data = await res.json();
    setItems(data.recallItems || []);
  }

  useEffect(() => { fetchItems(); }, []);

  const filtered = filter === "all" ? items
    : filter === "due" ? items.filter((i) => !i.contacted)
    : items.filter((i) => i.contacted);

  const isOverdue = (dateStr: string) => new Date(dateStr) < new Date();

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/recall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ patientName: "", reason: "", dueDate: "", phone: "" });
    setModalOpen(false);
    await fetchItems();
    setLoading(false);
  }

  async function markContacted(id: string) {
    await fetch(`/api/recall/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contacted: true }),
    });
    await fetchItems();
  }

  async function deleteItem(id: string) {
    await fetch(`/api/recall/${id}`, { method: "DELETE" });
    await fetchItems();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RotateCcw className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold">Patient Recall</h2>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Recall
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["due", "contacted", "all"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab ? "bg-[var(--gold)]/10 text-[var(--gold)]" : "text-[var(--text-secondary)] hover:text-[var(--ivory)] hover:bg-[var(--charcoal)]/20"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "due" && ` (${items.filter((i) => !i.contacted).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={RotateCcw} title="No recall items" description="Add patients that need follow-up reminders" />
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => {
            const overdue = !item.contacted && isOverdue(item.dueDate);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-xl bg-[var(--charcoal)]/30 border ${
                  overdue ? "border-red-500/30" : "border-[var(--border)]"
                } flex items-center justify-between`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.contacted ? "bg-[var(--accent)]/10" : overdue ? "bg-red-500/10" : "bg-purple-500/10"
                  }`}>
                    {item.contacted ? (
                      <CheckCircle className="w-4 h-4 text-[var(--teal)]" />
                    ) : overdue ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : (
                      <Phone className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{item.patientName}</div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {item.reason} — Due: {new Date(item.dueDate).toLocaleDateString()}
                      {overdue && <span className="text-red-400 ml-2">Overdue</span>}
                    </div>
                    {item.phone && <div className="text-xs text-[var(--text-secondary)]/50 mt-0.5">{item.phone}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!item.contacted && (
                    <button
                      onClick={() => markContacted(item.id)}
                      className="text-xs px-3 py-1 bg-[var(--accent)]/10 text-[var(--teal)] rounded-lg hover:bg-[var(--accent)]/20"
                    >
                      Mark Contacted
                    </button>
                  )}
                  <button onClick={() => deleteItem(item.id)} className="p-1 text-[var(--text-secondary)] hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Recall Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Recall Item">
        <form onSubmit={createItem} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Patient Name</label>
            <input
              type="text"
              required
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-sm text-[var(--ivory)] focus:outline-none focus:border-[var(--primary)]/40"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Reason</label>
            <input
              type="text"
              required
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="e.g. 6-month check-up"
              className="w-full px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-sm text-[var(--ivory)] focus:outline-none focus:border-[var(--primary)]/40"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Due Date</label>
            <input
              type="date"
              required
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-sm text-[var(--ivory)] focus:outline-none focus:border-[var(--primary)]/40"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+27 82 000 0000"
              className="w-full px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-sm text-[var(--ivory)] focus:outline-none focus:border-[var(--primary)]/40"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[var(--gold)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Recall Item
          </button>
        </form>
      </Modal>
    </div>
  );
}
