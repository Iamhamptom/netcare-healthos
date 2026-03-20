"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Boxes,
  Gauge,
  Zap,
  Heart,
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
  Shield,
  ShieldCheck,
  Network,
  Router,
  Layers,
  Inbox,
  BadgeCheck,
  FileCode,
  Brain,
  Pill,
  Download,
  Send,
  Clock,
  ChevronRight,
  Cable,
  FileJson,
  Microscope,
  DollarSign,
  BookOpen,
  TestTube,
  Workflow,
} from "lucide-react";

/* ─── Types ─── */

interface NavItem {
  href: string;
  icon: any;
  label: string;
  roles: string[];
  children?: Array<{ href: string; icon: any; label: string }>;
}

interface NavSection {
  label: string;
  badge?: string;
  badgeColor?: string;
  items: NavItem[];
}

/* ─── Navigation Data ─── */

const navSections: NavSection[] = [
  {
    label: "",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "doctor", "receptionist", "nurse"] },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { href: "/dashboard/network", icon: Building2, label: "Network Finance", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/kpi", icon: Gauge, label: "KPI Dashboard", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/gaps", icon: Target, label: "12 Gaps We Fill", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/savings", icon: Zap, label: "Savings Tracker", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics", roles: ["admin", "doctor"] },
      { href: "/dashboard/intel", icon: Globe, label: "Visio Intel", roles: ["admin"] },
      { href: "/dashboard/insights", icon: TrendingUp, label: "Practice Insights", roles: ["admin", "doctor"] },
    ],
  },
  {
    label: "CLAIMS INTELLIGENCE",
    badge: "NEW",
    badgeColor: "teal",
    items: [
      { href: "/dashboard/claims", icon: ShieldCheck, label: "Claims Analyzer", roles: ["admin", "receptionist"] },
      { href: "/dashboard/claims-network", icon: Building2, label: "Claims Network", roles: ["platform_admin"] },
    ],
  },
  {
    label: "AI PRODUCTS",
    items: [
      { href: "/dashboard/bridge", icon: Zap, label: "CareOn Bridge", roles: ["admin", "platform_admin"], children: [
        { href: "/dashboard/bridge/careon", icon: Gauge, label: "Bridge Console" },
        { href: "/dashboard/bridge/roi", icon: BarChart3, label: "ROI Calculator" },
        { href: "/dashboard/bridge/research", icon: FileBarChart, label: "Research Paper" },
        { href: "/dashboard/bridge/business-model", icon: DollarSign, label: "Business Model" },
      ] },
      { href: "/dashboard/whatsapp", icon: MessageSquare, label: "WhatsApp Router", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/agents", icon: Bot, label: "AI Agents", roles: ["admin", "doctor"] },
      { href: "/dashboard/practitioners", icon: Users, label: "Practitioners", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/conversations", icon: MessageSquare, label: "Conversations", roles: ["admin", "receptionist"] },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { href: "/dashboard/daily", icon: ClipboardList, label: "Daily Tasks", roles: ["admin", "receptionist", "nurse"] },
      { href: "/dashboard/patients", icon: Users, label: "Patients", roles: ["admin", "doctor", "nurse"] },
      { href: "/dashboard/billing", icon: Receipt, label: "Billing", roles: ["admin", "receptionist"] },
      { href: "/dashboard/switching", icon: Network, label: "Switch Engine", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/bookings", icon: CalendarCheck, label: "Bookings", roles: ["admin", "receptionist"] },
      { href: "/dashboard/checkin", icon: UserCheck, label: "Check-In", roles: ["admin", "receptionist", "nurse"] },
      { href: "/dashboard/calendar", icon: Calendar, label: "Schedule", roles: ["admin", "doctor", "receptionist"] },
      { href: "/dashboard/referrals", icon: Stethoscope, label: "Referrals", roles: ["admin", "doctor", "receptionist"] },
      { href: "/dashboard/recall", icon: RotateCcw, label: "Recall", roles: ["admin", "receptionist"] },
      { href: "/dashboard/reviews", icon: Star, label: "Reviews", roles: ["admin"] },
      { href: "/dashboard/approvals", icon: Bell, label: "Approvals", roles: ["admin", "doctor", "receptionist"] },
      { href: "/dashboard/import", icon: Upload, label: "Import Data", roles: ["admin", "receptionist"] },
    ],
  },
  {
    label: "BUSINESS",
    items: [
      { href: "/dashboard/partnership", icon: Heart, label: "Partnership", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/suite", icon: Boxes, label: "Your Suite", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/board-pack", icon: FileBarChart, label: "Board Pack", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/pilot", icon: Rocket, label: "Start Pilot", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/settings", icon: Settings, label: "Settings", roles: ["admin"] },
    ],
  },
];

const healthbridgeItems: NavItem[] = [
  { href: "/dashboard/healthbridge", icon: Shield, label: "Claims Dashboard", roles: ["admin", "receptionist"] },
  { href: "/dashboard/healthbridge/submit", icon: Send, label: "Submit Claim", roles: ["admin", "receptionist"] },
  { href: "/dashboard/healthbridge/eligibility", icon: Heart, label: "Benefit Check", roles: ["admin", "receptionist"] },
  { href: "/dashboard/healthbridge/analytics", icon: BarChart3, label: "Scheme Analytics", roles: ["admin", "receptionist"] },
  { href: "/dashboard/healthbridge/ai-coder", icon: Brain, label: "AI Coder", roles: ["admin", "receptionist"] },
  { href: "/dashboard/healthbridge/batch", icon: Upload, label: "Batch Upload", roles: ["admin", "receptionist"] },
  { href: "/dashboard/healthbridge/nappi", icon: Pill, label: "NAPPI Lookup", roles: ["admin", "receptionist"] },
  { href: "/dashboard/healthbridge/followups", icon: Clock, label: "Follow-ups", roles: ["admin", "receptionist"] },
  { href: "/dashboard/healthbridge/export", icon: Download, label: "Export Data", roles: ["admin", "receptionist"] },
  { href: "/dashboard/healthbridge/about", icon: FileBarChart, label: "Product Overview", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/healthbridge/research", icon: TrendingUp, label: "Research Paper", roles: ["admin", "platform_admin"] },
];

const fhirHubItems: NavItem[] = [
  { href: "/dashboard/fhir-hub", icon: Cable, label: "Overview", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/fhir-hub/architecture", icon: Workflow, label: "Architecture", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/fhir-hub/impact", icon: DollarSign, label: "Netcare Impact", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/fhir-hub/research", icon: Microscope, label: "VRL Research", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/fhir-hub/explorer", icon: TestTube, label: "API Explorer", roles: ["admin", "platform_admin"] },
];

const allNavItems = [...navSections.flatMap(s => s.items), ...healthbridgeItems, ...fhirHubItems];

/* ─── Section persistence ─── */

const STORAGE_KEY = "netcare-sidebar-sections";

function itemMatchesPath(item: NavItem, pathname: string): boolean {
  return pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
}

function sectionContainsPath(items: NavItem[], pathname: string): boolean {
  return items.some(item => itemMatchesPath(item, pathname));
}

function buildDefaults(pathname: string): Record<string, boolean> {
  const state: Record<string, boolean> = {
    "": true,
    "CLAIMS INTELLIGENCE": true,
    "INTELLIGENCE": false,
    "AI PRODUCTS": false,
    "OPERATIONS": false,
    "BUSINESS": false,
    "HEALTHBRIDGE": false,
    "FHIR INTEGRATION HUB": false,
  };
  // Auto-expand section that contains the active page
  for (const section of navSections) {
    if (section.label && sectionContainsPath(section.items, pathname)) {
      state[section.label] = true;
    }
  }
  if (sectionContainsPath(healthbridgeItems, pathname)) {
    state["HEALTHBRIDGE"] = true;
    state["OPERATIONS"] = true;
  }
  if (sectionContainsPath(fhirHubItems, pathname)) {
    state["FHIR INTEGRATION HUB"] = true;
    state["AI PRODUCTS"] = true;
  }
  return state;
}

function loadSections(pathname: string): Record<string, boolean> {
  if (typeof window === "undefined") return buildDefaults(pathname);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Record<string, boolean>;
      // Force-open section containing active page
      for (const section of navSections) {
        if (section.label && sectionContainsPath(section.items, pathname)) {
          saved[section.label] = true;
        }
      }
      if (sectionContainsPath(healthbridgeItems, pathname)) {
        saved["HEALTHBRIDGE"] = true;
        saved["OPERATIONS"] = true;
      }
      if (sectionContainsPath(fhirHubItems, pathname)) {
        saved["FHIR INTEGRATION HUB"] = true;
        saved["AI PRODUCTS"] = true;
      }
      return saved;
    }
  } catch { /* ignore */ }
  return buildDefaults(pathname);
}

/* ─── Component ─── */

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [userRole, setUserRole] = useState("admin");
  const [pendingReferrals, setPendingReferrals] = useState(0);
  const [practiceName, setPracticeName] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => buildDefaults(pathname));

  // Load persisted state on mount and when pathname changes
  useEffect(() => {
    setOpenSections(loadSections(pathname));
  }, [pathname]);

  const toggleSection = useCallback((label: string) => {
    setOpenSections(prev => {
      const next = { ...prev, [label]: !prev[label] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (data.user?.role) setUserRole(data.user.role);
      if (data.user?.practice) {
        const p = data.user.practice;
        setPracticeName(p.name || p.practiceName || "");
      }
    }).catch(() => {});
    fetch("/api/referrals").then(r => r.json()).then(data => {
      if (data.pendingCount) setPendingReferrals(data.pendingCount);
    }).catch(() => {});
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const isSectionOpen = (label: string): boolean => {
    if (!label) return true;
    return openSections[label] ?? false;
  };

  /* Reusable renderer for sub-sections (Healthbridge, FHIR Hub) */
  function renderSubsection(label: string, badge: string, badgeColor: string, items: NavItem[]) {
    const filtered = items.filter(item => item.roles.includes(userRole));
    if (filtered.length === 0) return null;
    const open = isSectionOpen(label);
    const colorClasses = badgeColor === "emerald"
      ? "bg-emerald-500/20 text-emerald-400"
      : "bg-teal-500/20 text-teal-400";

    return (
      <div className="mb-0.5" key={`sub-${label}`}>
        {!collapsed ? (
          <button
            onClick={() => toggleSection(label)}
            className="w-full flex items-center gap-1.5 px-3 pt-4 pb-1.5 group cursor-pointer"
          >
            <ChevronRight
              className={`w-3 h-3 text-white/20 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
            />
            <span className="text-[9px] uppercase tracking-[0.15em] text-white/20 font-semibold group-hover:text-white/40 transition-colors">
              {label}
            </span>
            <span className={`ml-1 px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-wider rounded-full leading-tight ${colorClasses}`}>
              {badge}
            </span>
          </button>
        ) : (
          <div className="h-px mx-2 my-2 bg-white/[0.04]" />
        )}
        <AnimatePresence initial={false}>
          {(open || collapsed) && (
            <motion.div
              initial={collapsed ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={collapsed ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {filtered.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-white/[0.08] text-white"
                        : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                    }`}
                  >
                    <item.icon className="w-[16px] h-[16px] shrink-0" />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap flex-1">
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="shrink-0 border-r border-white/[0.06] flex flex-col bg-[#1D3443] overflow-hidden"
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-white/[0.06]">
        <img
          src="/images/netcare-logo.png"
          alt="Netcare"
          className="h-5 shrink-0 brightness-[10] saturate-0 opacity-80"
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-[11px] whitespace-nowrap tracking-[0.15em] text-white/40"
            >
              HEALTH OS
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-2 px-2 overflow-y-auto">
        {navSections.map((section) => {
          const sectionItems = section.items.filter(item => item.roles.includes(userRole));
          if (sectionItems.length === 0) return null;

          const isHomeSection = !section.label;
          const sectionOpen = isSectionOpen(section.label);

          return (
            <div key={section.label || "home"}>
              <div className="mb-0.5">
                {/* Section header — collapsible with chevron */}
                {!collapsed && section.label && (
                  <button
                    onClick={() => toggleSection(section.label)}
                    className="w-full flex items-center gap-1.5 px-3 pt-4 pb-1.5 group cursor-pointer"
                  >
                    <ChevronRight
                      className={`w-3 h-3 text-white/20 transition-transform duration-200 ${sectionOpen ? "rotate-90" : ""}`}
                    />
                    <span className="text-[9px] uppercase tracking-[0.15em] text-white/20 font-semibold group-hover:text-white/40 transition-colors">
                      {section.label}
                    </span>
                    {section.badge && (
                      <span className={`ml-1 px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-wider rounded-full leading-tight ${
                        section.badgeColor === "emerald"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-teal-500/20 text-teal-400"
                      }`}>
                        {section.badge}
                      </span>
                    )}
                  </button>
                )}
                {collapsed && section.label && <div className="h-px mx-2 my-2 bg-white/[0.04]" />}

                {/* Section items — animated expand/collapse */}
                <AnimatePresence initial={false}>
                  {(isHomeSection || sectionOpen || collapsed) && (
                    <motion.div
                      initial={isHomeSection || collapsed ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={isHomeSection || collapsed ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {sectionItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        const hasChildren = "children" in item && Array.isArray(item.children);
                        const isExpanded = expandedItems[item.href] || (hasChildren && pathname.startsWith(item.href));
                        const children = hasChildren ? item.children as Array<{href: string; icon: any; label: string}> : [];

                        return (
                          <div key={item.href}>
                            {hasChildren ? (
                              <button
                                onClick={() => setExpandedItems(prev => ({ ...prev, [item.href]: !prev[item.href] }))}
                                className={`w-full flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-200 ${
                                  isActive
                                    ? "bg-white/[0.08] text-white"
                                    : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                                }`}
                              >
                                <item.icon className="w-[16px] h-[16px] shrink-0" />
                                {!collapsed && <span className="whitespace-nowrap flex-1 text-left">{item.label}</span>}
                                {!collapsed && (
                                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
                                )}
                              </button>
                            ) : (
                              <Link
                                href={item.href}
                                className={`w-full flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-200 ${
                                  isActive
                                    ? "bg-white/[0.08] text-white"
                                    : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                                }`}
                              >
                                <item.icon className="w-[16px] h-[16px] shrink-0" />
                                <AnimatePresence>
                                  {!collapsed && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap flex-1">
                                      {item.label}
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                                {!collapsed && item.href === "/dashboard/referrals" && pendingReferrals > 0 && (
                                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-white/10 text-white/60 min-w-[18px] text-center">
                                    {pendingReferrals}
                                  </span>
                                )}
                              </Link>
                            )}
                            {/* Expandable children (e.g. CareOn Bridge sub-items) */}
                            <AnimatePresence>
                              {hasChildren && isExpanded && !collapsed && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="ml-4 pl-3 border-l border-white/[0.06] space-y-0.5 py-1">
                                    {children.map((child: any) => {
                                      const childActive = pathname === child.href;
                                      const ChildIcon = child.icon;
                                      return (
                                        <Link
                                          key={child.href}
                                          href={child.href}
                                          className={`flex items-center gap-2.5 px-2.5 py-[6px] rounded-md text-[12px] font-medium transition-all ${
                                            childActive
                                              ? "bg-white/[0.08] text-white"
                                              : "text-white/30 hover:text-white/50 hover:bg-white/[0.03]"
                                          }`}
                                        >
                                          <ChildIcon className="w-[14px] h-[14px] shrink-0" />
                                          <span className="whitespace-nowrap">{child.label}</span>
                                        </Link>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* FHIR INTEGRATION HUB — rendered after AI PRODUCTS */}
              {section.label === "AI PRODUCTS" && renderSubsection("FHIR INTEGRATION HUB", "NEW", "emerald", fhirHubItems)}

              {/* HEALTHBRIDGE — rendered after OPERATIONS */}
              {section.label === "OPERATIONS" && renderSubsection("HEALTHBRIDGE", "AI", "teal", healthbridgeItems)}
            </div>
          );
        })}
      </nav>

      {/* Emergency line */}
      {!collapsed && (
        <div className="px-4 py-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-2 text-[11px] text-white/20">
            <Phone className="w-3.5 h-3.5" />
            <span>Emergency line active</span>
          </div>
        </div>
      )}

      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-5 py-3 text-[13px] text-white/30 hover:text-red-400 transition-colors border-t border-white/[0.04]"
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
        className="p-3 text-white/20 hover:text-white/40 transition-colors border-t border-white/[0.04]"
      >
        <ChevronDown className={`w-4 h-4 mx-auto transition-transform ${collapsed ? "-rotate-90" : "rotate-90"}`} />
      </button>
    </motion.aside>
  );
}
