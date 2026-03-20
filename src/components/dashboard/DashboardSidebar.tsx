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

const navSections = [
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
      { href: "/dashboard/claims-network", icon: Building2, label: "Claims Network", roles: ["platform_admin"] },
      { href: "/dashboard/kpi", icon: Gauge, label: "KPI Dashboard", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/gaps", icon: Target, label: "12 Gaps We Fill", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/savings", icon: Zap, label: "Savings Tracker", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics", roles: ["admin", "doctor"] },
      { href: "/dashboard/intel", icon: Globe, label: "Visio Intel", roles: ["admin"] },
      { href: "/dashboard/insights", icon: TrendingUp, label: "Practice Insights", roles: ["admin", "doctor"] },
    ],
  },
  {
    label: "AI PRODUCTS",
    items: [
      { href: "/dashboard/bridge", icon: Zap, label: "CareOn Bridge", roles: ["admin", "platform_admin"], children: [
        { href: "/dashboard/bridge/careon", icon: Gauge, label: "Bridge Console" },
        { href: "/dashboard/bridge/roi", icon: BarChart3, label: "ROI Calculator" },
        { href: "/dashboard/bridge/research", icon: FileBarChart, label: "Research Paper" },
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
      { href: "/dashboard/claims", icon: ShieldCheck, label: "Claims Analyzer", roles: ["admin", "receptionist"] },
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

const healthbridgeItems = [
  { href: "/dashboard/healthbridge", icon: Shield, label: "Claims Dashboard", roles: ["admin", "receptionist"] as string[] },
  { href: "/dashboard/healthbridge/submit", icon: Send, label: "Submit Claim", roles: ["admin", "receptionist"] as string[] },
  { href: "/dashboard/healthbridge/eligibility", icon: Heart, label: "Benefit Check", roles: ["admin", "receptionist"] as string[] },
  { href: "/dashboard/healthbridge/analytics", icon: BarChart3, label: "Scheme Analytics", roles: ["admin", "receptionist"] as string[] },
  { href: "/dashboard/healthbridge/ai-coder", icon: Brain, label: "AI Coder", roles: ["admin", "receptionist"] as string[] },
  { href: "/dashboard/healthbridge/batch", icon: Upload, label: "Batch Upload", roles: ["admin", "receptionist"] as string[] },
  { href: "/dashboard/healthbridge/nappi", icon: Pill, label: "NAPPI Lookup", roles: ["admin", "receptionist"] as string[] },
  { href: "/dashboard/healthbridge/followups", icon: Clock, label: "Follow-ups", roles: ["admin", "receptionist"] as string[] },
  { href: "/dashboard/healthbridge/export", icon: Download, label: "Export Data", roles: ["admin", "receptionist"] as string[] },
];

const fhirHubItems = [
  { href: "/dashboard/fhir-hub", icon: Cable, label: "Overview", roles: ["admin", "platform_admin"] as string[] },
  { href: "/dashboard/fhir-hub/architecture", icon: Workflow, label: "Architecture", roles: ["admin", "platform_admin"] as string[] },
  { href: "/dashboard/fhir-hub/impact", icon: DollarSign, label: "Netcare Impact", roles: ["admin", "platform_admin"] as string[] },
  { href: "/dashboard/fhir-hub/research", icon: Microscope, label: "VRL Research", roles: ["admin", "platform_admin"] as string[] },
  { href: "/dashboard/fhir-hub/explorer", icon: TestTube, label: "API Explorer", roles: ["admin", "platform_admin"] as string[] },
];

const allNavItems = [...navSections.flatMap(s => s.items), ...healthbridgeItems, ...fhirHubItems];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [healthbridgeOpen, setHealthbridgeOpen] = useState(true);
  const [fhirHubOpen, setFhirHubOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [userRole, setUserRole] = useState("admin");
  const [pendingReferrals, setPendingReferrals] = useState(0);
  const [practiceName, setPracticeName] = useState("");

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

          const filteredHbItems = healthbridgeItems.filter(item => item.roles.includes(userRole));
          const showHealthbridge = section.label === "OPERATIONS" && filteredHbItems.length > 0;

          return (
            <div key={section.label || "home"}>
              <div className="mb-0.5">
                {!collapsed && section.label && (
                  <div className="px-3 pt-4 pb-1.5">
                    <span className="text-[9px] uppercase tracking-[0.15em] text-white/20 font-semibold">{section.label}</span>
                  </div>
                )}
                {collapsed && section.label && <div className="h-px mx-2 my-2 bg-white/[0.04]" />}
                {sectionItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const hasChildren = "children" in item && Array.isArray((item as any).children);
                  const isExpanded = expandedItems[item.href] || (hasChildren && pathname.startsWith(item.href));
                  const children = hasChildren ? (item as any).children as Array<{href: string; icon: any; label: string}> : [];

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
                      {/* Expandable children */}
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
              </div>

              {/* FHIR INTEGRATION HUB — rendered after AI PRODUCTS */}
              {section.label === "AI PRODUCTS" && fhirHubItems.filter(i => i.roles.includes(userRole)).length > 0 && (
                <div className="mb-0.5">
                  {!collapsed ? (
                    <button
                      onClick={() => setFhirHubOpen(!fhirHubOpen)}
                      className="w-full flex items-center gap-1.5 px-3 pt-4 pb-1.5 group cursor-pointer"
                    >
                      <ChevronRight
                        className={`w-3 h-3 text-white/20 transition-transform duration-200 ${fhirHubOpen ? "rotate-90" : ""}`}
                      />
                      <span className="text-[9px] uppercase tracking-[0.15em] text-white/20 font-semibold group-hover:text-white/40 transition-colors">
                        FHIR INTEGRATION HUB
                      </span>
                      <span className="ml-1 px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 leading-tight">
                        NEW
                      </span>
                    </button>
                  ) : (
                    <div className="h-px mx-2 my-2 bg-white/[0.04]" />
                  )}
                  <AnimatePresence initial={false}>
                    {(fhirHubOpen || collapsed) && (
                      <motion.div
                        initial={collapsed ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={collapsed ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        {fhirHubItems.filter(i => i.roles.includes(userRole)).map((item) => {
                          const isActive = pathname === item.href;
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
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* HEALTHBRIDGE collapsible submenu — rendered after OPERATIONS */}
              {showHealthbridge && (
                <div className="mb-0.5">
                  {!collapsed ? (
                    <button
                      onClick={() => setHealthbridgeOpen(!healthbridgeOpen)}
                      className="w-full flex items-center gap-1.5 px-3 pt-4 pb-1.5 group cursor-pointer"
                    >
                      <ChevronRight
                        className={`w-3 h-3 text-white/20 transition-transform duration-200 ${healthbridgeOpen ? "rotate-90" : ""}`}
                      />
                      <span className="text-[9px] uppercase tracking-[0.15em] text-white/20 font-semibold group-hover:text-white/40 transition-colors">
                        HEALTHBRIDGE
                      </span>
                      <span className="ml-1 px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-wider rounded-full bg-teal-500/20 text-teal-400 leading-tight">
                        AI
                      </span>
                    </button>
                  ) : (
                    <div className="h-px mx-2 my-2 bg-white/[0.04]" />
                  )}
                  <AnimatePresence initial={false}>
                    {(healthbridgeOpen || collapsed) && (
                      <motion.div
                        initial={collapsed ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={collapsed ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        {filteredHbItems.map((item) => {
                          const isActive = pathname === item.href || (item.href !== "/dashboard/healthbridge" && pathname.startsWith(item.href));
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
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
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
