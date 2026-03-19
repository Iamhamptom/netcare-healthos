"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Boxes,
  Gauge,
  Zap,
  FileBarChart,
  MessageSquare,
  CalendarCheck,
  Star,
  RotateCcw,
  Settings,
  ChevronDown,
  LogOut,
  Users,
  BarChart3,
  Calendar,
  Bot,
  UserCheck,
  ClipboardList,
  Receipt,
  Rocket,
  Phone,
  Bell,
  Globe,
  Upload,
  Stethoscope,
  Target,
  TrendingUp,
  Newspaper,
} from "lucide-react";

// All possible nav items
const allNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "doctor", "receptionist", "nurse"] },
  { href: "/dashboard/network", icon: Building2, label: "Network Finance", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/kpi", icon: Gauge, label: "FD KPIs", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/suite", icon: Boxes, label: "Your Suite", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/savings", icon: Zap, label: "Savings Tracker", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/pilot", icon: Rocket, label: "Start Pilot", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/board-pack", icon: FileBarChart, label: "Board Pack", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/daily", icon: ClipboardList, label: "Daily Tasks", roles: ["admin", "receptionist", "nurse"] },
  { href: "/dashboard/checkin", icon: UserCheck, label: "Check-In", roles: ["admin", "receptionist", "nurse"] },
  { href: "/dashboard/patients", icon: Users, label: "Patients", roles: ["admin", "doctor", "nurse"] },
  { href: "/dashboard/calendar", icon: Calendar, label: "Schedule", roles: ["admin", "doctor", "receptionist"] },
  { href: "/dashboard/approvals", icon: Bell, label: "Approvals", roles: ["admin", "doctor", "receptionist"] },
  { href: "/dashboard/billing", icon: Receipt, label: "Billing", roles: ["admin", "receptionist"] },
  { href: "/dashboard/conversations", icon: MessageSquare, label: "Conversations", roles: ["admin", "receptionist"] },
  { href: "/dashboard/bookings", icon: CalendarCheck, label: "Bookings", roles: ["admin", "receptionist"] },
  { href: "/dashboard/referrals", icon: Stethoscope, label: "Referrals", roles: ["admin", "doctor", "receptionist"] },
  { href: "/dashboard/agents", icon: Bot, label: "AI Agents", roles: ["admin", "doctor"] },
  { href: "/dashboard/reviews", icon: Star, label: "Reviews", roles: ["admin"] },
  { href: "/dashboard/recall", icon: RotateCcw, label: "Recall", roles: ["admin", "receptionist"] },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics", roles: ["admin", "doctor"] },
  { href: "/dashboard/import", icon: Upload, label: "Import Data", roles: ["admin", "receptionist"] },
  { href: "/dashboard/insights", icon: TrendingUp, label: "Practice Insights", roles: ["admin", "doctor"] },
  { href: "/dashboard/ops", icon: Target, label: "Ops Centre", roles: ["platform_admin"] },
  { href: "/dashboard/industry", icon: Newspaper, label: "Industry Intel", roles: ["admin", "doctor"] },
  { href: "/dashboard/intel", icon: Globe, label: "Visio Intel", roles: ["admin"] },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", roles: ["admin"] },
];

interface PracticeBranding {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  tagline: string;
  plan: string;
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState("admin");
  const [pendingReferrals, setPendingReferrals] = useState(0);
  const [branding, setBranding] = useState<PracticeBranding | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (data.user?.role) setUserRole(data.user.role);
      if (data.user?.practice) {
        const p = data.user.practice;
        setBranding({
          name: p.name || p.practiceName || "",
          primaryColor: p.primaryColor || p.primary_color || "#1D3443",
          secondaryColor: p.secondaryColor || p.secondary_color || "#E3964C",
          tagline: p.tagline || "",
          plan: p.plan || "starter",
        });
        // Inject practice CSS variables into document root
        const root = document.documentElement;
        root.style.setProperty("--practice-primary", p.primaryColor || p.primary_color || "#1D3443");
        root.style.setProperty("--practice-secondary", p.secondaryColor || p.secondary_color || "#E3964C");
      }
    }).catch(() => {});
    fetch("/api/referrals").then(r => r.json()).then(data => {
      if (data.pendingCount) setPendingReferrals(data.pendingCount);
    }).catch(() => {});
  }, []);

  // Filter nav items by user role
  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="shrink-0 border-r border-[var(--border)] flex flex-col bg-[var(--charcoal)]/50 overflow-hidden"
    >
      <div className="h-14 flex items-center gap-2 px-4 border-b border-[var(--border)]" style={branding ? { borderBottomColor: `${branding.primaryColor}33` } : {}}>
        {/* Netcare Logo — shown on dark sidebar bg */}
        <img
          src="/images/netcare-logo.png"
          alt="Netcare"
          className="h-5 shrink-0"
          style={{ filter: "brightness(10) saturate(0)" }}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-[12px] whitespace-nowrap tracking-wide text-[var(--ivory)] leading-tight"
             
            >
              NETCARE
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Plan badge */}
      {!collapsed && (
        <div className="px-4 py-2 border-b border-[var(--border)]">
          <span
            className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
            style={branding ? { color: branding.secondaryColor, backgroundColor: `${branding.secondaryColor}15` } : { color: "#E3964C", backgroundColor: "rgba(227,150,76,0.1)" }}
          >
            {branding?.plan || userRole}
          </span>
        </div>
      )}

      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? "text-white"
                  : "text-[var(--text-secondary)] hover:bg-[var(--obsidian)]/50"
              }`}
              style={isActive && branding ? { backgroundColor: `${branding.secondaryColor}20`, color: branding.secondaryColor } : isActive ? { backgroundColor: "rgba(227,150,76,0.12)", color: "#E3964C" } : {}}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap flex-1"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.href === "/dashboard/referrals" && pendingReferrals > 0 && (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 min-w-[18px] text-center">
                  {pendingReferrals}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Emergency line indicator */}
      {!collapsed && (
        <div className="px-4 py-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
            <Phone className="w-3.5 h-3.5 text-[var(--crimson)]" />
            <span>Emergency line active</span>
          </div>
        </div>
      )}

      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-5 py-3 text-[13px] text-[var(--text-secondary)] hover:text-[var(--crimson)] transition-colors border-t border-[var(--border)]"
      >
        <LogOut className="w-4 h-4 shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
              Sign Out
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-3 text-[var(--text-tertiary)] hover:text-[var(--gold)] transition-colors border-t border-[var(--border)]"
      >
        <ChevronDown className={`w-4 h-4 mx-auto transition-transform ${collapsed ? "-rotate-90" : "rotate-90"}`} />
      </button>
    </motion.aside>
  );
}
