"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  Shield,
  Loader2,
  X,
  Clock,
  Mail,
  UserCheck,
  UserX,
  ChevronDown,
  Activity,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuditEntry {
  id: string;
  action: string;
  details: string;
  userId: string;
  userName: string;
  ipAddress: string;
  createdAt: string;
}

const ROLES = [
  { value: "platform_admin", label: "Platform Admin", desc: "Full system access", color: "#E3964C" },
  { value: "admin", label: "Admin", desc: "Practice management", color: "#3DA9D1" },
  { value: "doctor", label: "Doctor", desc: "Clinical access", color: "#10b981" },
  { value: "nurse", label: "Nurse", desc: "Patient care", color: "#8b5cf6" },
  { value: "receptionist", label: "Receptionist", desc: "Front desk", color: "#f59e0b" },
];

const INVITE_ROLES = ROLES.filter(r => r.value !== "platform_admin");

function roleColor(role: string): string {
  return ROLES.find(r => r.value === role)?.color || "#999";
}

function roleLabel(role: string): string {
  return ROLES.find(r => r.value === role)?.label || role;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-ZA", { month: "short", day: "numeric", year: "numeric" });
}

export default function TeamManagementPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [activityMember, setActivityMember] = useState<TeamMember | null>(null);
  const [activityLogs, setActivityLogs] = useState<AuditEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Invite form
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("receptionist");

  // Edit form
  const [editRole, setEditRole] = useState("");
  const [editName, setEditName] = useState("");

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      if (data.members) setMembers(data.members);
    } catch {
      setError("Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(`${inviteName} has been invited as ${roleLabel(inviteRole)}`);
      setShowInvite(false);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("receptionist");
      fetchMembers();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite user");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editMember) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/team/${editMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole, name: editName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(`${editName} updated successfully`);
      setEditMember(null);
      fetchMembers();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(member: TeamMember) {
    if (!confirm(`Are you sure you want to deactivate ${member.name}? They will no longer be able to log in.`)) return;
    setError("");

    try {
      const res = await fetch(`/api/team/${member.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(`${member.name} has been deactivated`);
      fetchMembers();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate user");
    }
  }

  async function handleReactivate(member: TeamMember) {
    setError("");
    try {
      const res = await fetch(`/api/team/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(`${member.name} has been reactivated`);
      fetchMembers();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reactivate user");
    }
  }

  async function loadActivity(member: TeamMember) {
    setActivityMember(member);
    setActivityLoading(true);
    try {
      const res = await fetch(`/api/team/${member.id}/activity`);
      const data = await res.json();
      if (data.logs) setActivityLogs(data.logs);
    } catch {
      setActivityLogs([]);
    } finally {
      setActivityLoading(false);
    }
  }

  function openEdit(member: TeamMember) {
    setEditMember(member);
    setEditRole(member.role);
    setEditName(member.name);
  }

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q);
  });

  const activeCount = members.filter(m => m.status === "active").length;
  const inactiveCount = members.filter(m => m.status !== "active").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#3DA9D1]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/settings"
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Users className="w-5 h-5 text-[#3DA9D1]" />
          <div>
            <h2 className="text-lg font-semibold text-white">Team Management</h2>
            <p className="text-xs text-white/40">{activeCount} active, {inactiveCount} inactive</p>
          </div>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3DA9D1] text-[#1D3443] text-sm font-semibold rounded-lg hover:bg-[#3DA9D1]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-sm"
          >
            {message}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or role..."
          className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#3DA9D1]/40"
        />
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`rounded-xl border p-4 transition-colors ${
              member.status === "active"
                ? "bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15]"
                : "bg-white/[0.01] border-white/[0.04] opacity-60"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: roleColor(member.role) + "30", color: roleColor(member.role) }}
                >
                  {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    {member.name}
                    {member.status !== "active" && (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">Inactive</span>
                    )}
                  </div>
                  <div className="text-xs text-white/40 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {member.email}
                  </div>
                </div>
              </div>
              <span
                className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: roleColor(member.role) + "18",
                  color: roleColor(member.role),
                }}
              >
                {roleLabel(member.role)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[11px] text-white/30">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last login: {timeAgo(member.lastLogin)}
                </span>
                <span>Joined: {new Date(member.createdAt).toLocaleDateString("en-ZA", { month: "short", year: "numeric" })}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => loadActivity(member)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
                  title="View activity"
                >
                  <Activity className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => openEdit(member)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {member.status === "active" ? (
                  <button
                    onClick={() => handleDeactivate(member)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors"
                    title="Deactivate"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleReactivate(member)}
                    className="p-1.5 rounded-lg hover:bg-[#10b981]/10 text-white/30 hover:text-[#10b981] transition-colors"
                    title="Reactivate"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12 text-white/30 text-sm">
          {search ? "No team members match your search." : "No team members found."}
        </div>
      )}

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowInvite(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md mx-4 bg-[#1D3443] border border-white/[0.1] rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#3DA9D1]" />
                  <h3 className="text-sm font-semibold text-white">Invite Team Member</h3>
                </div>
                <button onClick={() => setShowInvite(false)} className="p-1 hover:bg-white/[0.06] rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs text-white/50 font-medium uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                    required
                    placeholder="Dr Jane Smith"
                    className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#3DA9D1]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 font-medium uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                    placeholder="jane.smith@netcare.co.za"
                    className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#3DA9D1]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 font-medium uppercase tracking-wider mb-1.5">Role</label>
                  <div className="relative">
                    <select
                      value={inviteRole}
                      onChange={e => setInviteRole(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white appearance-none focus:outline-none focus:border-[#3DA9D1]/40"
                    >
                      {INVITE_ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#3DA9D1]/5 border border-[#3DA9D1]/10">
                  <p className="text-[11px] text-white/40">
                    A welcome email will be sent with temporary login credentials. The user will be prompted to change their password on first login.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInvite(false)}
                    className="flex-1 py-2.5 text-sm font-medium text-white/50 border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 text-sm font-semibold bg-[#3DA9D1] text-[#1D3443] rounded-lg hover:bg-[#3DA9D1]/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Invite
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setEditMember(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md mx-4 bg-[#1D3443] border border-white/[0.1] rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#3DA9D1]" />
                  <h3 className="text-sm font-semibold text-white">Edit Team Member</h3>
                </div>
                <button onClick={() => setEditMember(null)} className="p-1 hover:bg-white/[0.06] rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs text-white/50 font-medium uppercase tracking-wider mb-1.5">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-[#3DA9D1]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 font-medium uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    value={editMember.email}
                    disabled
                    className="w-full px-3 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg text-sm text-white/40 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 font-medium uppercase tracking-wider mb-1.5">Role</label>
                  <div className="relative">
                    <select
                      value={editRole}
                      onChange={e => setEditRole(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white appearance-none focus:outline-none focus:border-[#3DA9D1]/40"
                    >
                      {ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditMember(null)}
                    className="flex-1 py-2.5 text-sm font-medium text-white/50 border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 text-sm font-semibold bg-[#3DA9D1] text-[#1D3443] rounded-lg hover:bg-[#3DA9D1]/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Log Modal */}
      <AnimatePresence>
        {activityMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setActivityMember(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg mx-4 bg-[#1D3443] border border-white/[0.1] rounded-2xl p-6 shadow-2xl max-h-[70vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#3DA9D1]" />
                  <h3 className="text-sm font-semibold text-white">Activity Log — {activityMember.name}</h3>
                </div>
                <button onClick={() => setActivityMember(null)} className="p-1 hover:bg-white/[0.06] rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {activityLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-[#3DA9D1]" />
                  </div>
                ) : activityLogs.length === 0 ? (
                  <div className="text-center py-8 text-white/30 text-sm">No activity recorded yet.</div>
                ) : (
                  activityLogs.map(log => (
                    <div key={log.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-[#3DA9D1] uppercase tracking-wider">
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-white/30">{timeAgo(log.createdAt)}</span>
                      </div>
                      <p className="text-xs text-white/60">{log.details}</p>
                      <p className="text-[10px] text-white/20 mt-1">IP: {log.ipAddress}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security note */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-start gap-3">
        <Shield className="w-4 h-4 text-white/20 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-white/40">
            All team management actions are logged for POPIA compliance. Users are soft-deleted (deactivated) to maintain audit trails.
            Deactivated users cannot log in but their activity history is preserved.
          </p>
        </div>
      </div>
    </div>
  );
}
