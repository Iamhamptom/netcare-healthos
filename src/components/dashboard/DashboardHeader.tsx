"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Search, Command, Check, ChevronRight, Shield, AlertTriangle, Info, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import WallpaperPicker from "@/components/dashboard/WallpaperPicker";

interface UserData {
  name: string;
  practice?: {
    name?: string;
    practiceName?: string;
    tagline?: string;
    plan?: string;
  };
}

interface NotificationItem {
  id: string;
  type: string;
  subject: string;
  message: string;
  patientName?: string;
  template?: string;
  sentAt?: string;
  read?: boolean;
}

function getNotifIcon(type: string) {
  switch (type) {
    case "alert": return AlertTriangle;
    case "claim": return Shield;
    case "report": return FileText;
    case "whatsapp": return MessageSquare;
    default: return Info;
  }
}

function getNotifColor(type: string) {
  switch (type) {
    case "alert": return "bg-amber-50 text-amber-500";
    case "claim": return "bg-teal-50 text-teal-500";
    case "report": return "bg-blue-50 text-blue-500";
    case "whatsapp": return "bg-emerald-50 text-emerald-500";
    default: return "bg-gray-50 text-gray-500";
  }
}

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DashboardHeader() {
  const [user, setUser] = useState<UserData | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});

    // Fetch notifications
    fetch("/api/notifications?limit=10")
      .then(r => r.json())
      .then(d => {
        const items = (d.notifications || []).slice(0, 8).map((n: NotificationItem, i: number) => ({
          ...n,
          read: i > 2,
          type: n.template === "reminder" ? "alert" : n.template === "follow_up" ? "claim" : n.type || "info",
        }));
        setNotifications(items);
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const practice = user?.practice;
  const practiceName = practice?.name || practice?.practiceName || "";
  const plan = practice?.plan || "";

  return (
    <header className="h-[52px] flex items-center justify-between px-5 bg-white/85 backdrop-blur-2xl border-b border-black/[0.04] shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_20px_rgba(0,0,0,0.01)]">
      <div className="flex items-center gap-3">
        <h1 className="text-[14px] font-semibold text-[#1D3443]">{practiceName || "Dashboard"}</h1>
        {practice?.tagline && (
          <>
            <div className="w-px h-3.5 bg-[#1D3443]/10" />
            <p className="text-[11px] text-[#1D3443]/30">{practice.tagline}</p>
          </>
        )}
        {plan && (
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider text-[#1D3443]/40 bg-[#1D3443]/[0.04]">
            {plan}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        {user?.name && (
          <div className="flex items-center gap-2 mr-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1D3443]/10 to-[#3DA9D1]/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#1D3443]/50">{user.name.charAt(0)}</span>
            </div>
            <span className="text-[12px] text-[#1D3443]/50 font-medium">{user.name.split(" ")[0]}</span>
          </div>
        )}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#1D3443]/20 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-14 py-1.5 bg-[#1D3443]/[0.03] border border-[#1D3443]/[0.06] rounded-lg text-[12px] text-[#1D3443] placeholder:text-[#1D3443]/25 w-44 transition-all focus:w-56 focus:border-[#1D3443]/15 focus:outline-none focus:bg-white focus:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[#1D3443]/15 border border-[#1D3443]/[0.06] rounded px-1 py-0.5">
            <Command className="w-2.5 h-2.5" />
            <span className="text-[9px] font-mono">K</span>
          </div>
        </div>

        <WallpaperPicker />

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            aria-label="Notifications"
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-[#1D3443]/30 hover:text-[#1D3443]/60 transition-colors rounded-lg hover:bg-[#1D3443]/[0.03]"
          >
            <Bell className="w-[15px] h-[15px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-[#E3964C] text-white text-[8px] font-bold px-0.5 animate-notif-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-xl shadow-black/10 border border-black/[0.06] z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.04]">
                <span className="text-[13px] font-semibold text-[#1D3443]">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    className="text-[11px] text-[#3DA9D1] font-medium hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Items */}
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-6 h-6 text-[#1D3443]/10 mx-auto mb-2" />
                    <p className="text-[12px] text-[#1D3443]/30">No notifications</p>
                  </div>
                ) : (
                  notifications.map(notif => {
                    const Icon = getNotifIcon(notif.type);
                    const color = getNotifColor(notif.type);
                    return (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-2.5 px-4 py-3 hover:bg-black/[0.01] transition-colors border-b border-black/[0.02] cursor-pointer ${
                          !notif.read ? "bg-blue-50/30" : ""
                        }`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className={`w-7 h-7 rounded-lg ${color.split(" ")[0]} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon className={`w-3.5 h-3.5 ${color.split(" ").slice(1).join(" ")}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[12px] font-medium text-[#1D3443] truncate">{notif.subject || notif.message.slice(0, 40)}</p>
                            {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-[#3DA9D1] shrink-0" />}
                          </div>
                          <p className="text-[11px] text-[#1D3443]/40 truncate mt-0.5">{notif.message}</p>
                          {notif.sentAt && (
                            <p className="text-[10px] text-[#1D3443]/20 mt-0.5">{formatTimeAgo(notif.sentAt)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <Link
                href="/dashboard/notifications"
                onClick={() => setShowDropdown(false)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-[12px] font-medium text-[#3DA9D1] hover:bg-black/[0.01] transition-colors border-t border-black/[0.04]"
              >
                View all notifications
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
