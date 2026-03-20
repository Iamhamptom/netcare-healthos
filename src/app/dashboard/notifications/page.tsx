"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell, CheckCircle2, AlertTriangle, Info, Shield,
  FileText, MessageSquare, Loader2, Check, X,
  ChevronRight,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  recipient: string;
  patientName: string;
  subject: string;
  message: string;
  template: string;
  sentAt?: string;
  status?: string;
  read?: boolean;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-ZA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function getIcon(type: string) {
  switch (type) {
    case "alert": return AlertTriangle;
    case "claim": return Shield;
    case "report": return FileText;
    case "whatsapp": return MessageSquare;
    default: return Info;
  }
}

function getIconColor(type: string) {
  switch (type) {
    case "alert": return "bg-amber-50 text-amber-500";
    case "claim": return "bg-teal-50 text-teal-500";
    case "report": return "bg-blue-50 text-blue-500";
    case "whatsapp": return "bg-emerald-50 text-emerald-500";
    default: return "bg-gray-50 text-gray-500";
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    setLoading(true);
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => {
        const items = (d.notifications || []).map((n: Notification, i: number) => ({
          ...n,
          read: i > 2,
          type: n.template === "reminder" ? "alert" : n.template === "follow_up" ? "claim" : n.type || "info",
        }));
        setNotifications(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    // Persist to server — best-effort, UI stays responsive even if PATCH is not yet supported
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    }).catch(() => {
      // PATCH not yet implemented on the API — local state is sufficient for demo
    });
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === "unread" ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1D3443]">Notifications</h1>
            <p className="text-sm text-[#1D3443]/50 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-3 py-2 text-[12px] font-medium rounded-lg border border-black/[0.06] text-[#1D3443]/50 hover:bg-black/[0.02] transition-colors"
            >
              <Check className="w-3.5 h-3.5" />Mark all read
            </button>
          )}
        </div>
      </motion.div>

      {/* Filter */}
      <div className="flex gap-1 bg-white/60 rounded-xl p-1 border border-black/[0.04] w-fit">
        {(["all", "unread"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
              filter === f ? "bg-white text-[#1D3443] shadow-sm" : "text-[#1D3443]/40 hover:text-[#1D3443]/60"
            }`}
          >
            {f === "all" ? "All" : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#1D3443]/30" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.04] p-12 text-center">
          <Bell className="w-10 h-10 text-[#1D3443]/15 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-[#1D3443]/40">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notification, i) => {
            const Icon = getIcon(notification.type);
            const iconColor = getIconColor(notification.type);
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-white rounded-xl border border-black/[0.04] p-4 flex items-start gap-3 transition-all hover:shadow-md hover:shadow-black/[0.02] ${
                  !notification.read ? "border-l-2 border-l-[#3DA9D1]" : ""
                }`}
              >
                <div className={`w-9 h-9 rounded-lg ${iconColor.split(" ")[0]} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${iconColor.split(" ").slice(1).join(" ")}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {notification.subject && (
                      <p className="text-[13px] font-medium text-[#1D3443]">{notification.subject}</p>
                    )}
                    {!notification.read && <span className="w-1.5 h-1.5 rounded-full bg-[#3DA9D1] shrink-0" />}
                  </div>
                  <p className="text-[12px] text-[#1D3443]/50 mt-0.5 line-clamp-2">{notification.message}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {notification.patientName && (
                      <span className="text-[10px] text-[#1D3443]/30">{notification.patientName}</span>
                    )}
                    {notification.sentAt && (
                      <span className="text-[10px] text-[#1D3443]/20">{formatDateTime(notification.sentAt)}</span>
                    )}
                  </div>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-1.5 rounded-lg text-[#1D3443]/20 hover:text-[#1D3443]/50 hover:bg-black/[0.02] transition-colors shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
