"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTenant } from "@/lib/tenant-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  MODULE_DEFINITIONS,
  EXECUTIVE_PAGES,
  moduleRegistry,
} from "@/lib/modules/registry";
import type { ModuleDefinition } from "@/lib/modules/types";
import {
  Activity,
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
  ChevronLeft,
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
  Layers,
  Inbox,
  Mic,
  Brain,
  Pill,
  Download,
  Send,
  Clock,
  Cable,
  Workflow,
  Cloud,
  TestTube,
  DollarSign,
  BookOpen,
  FileText,
  Sunrise,
  Moon,
  Mail,
  Palette,
  ChevronRight,
  Plug,
  Sparkles,
} from "lucide-react";

/* ─── Icon Map ─── */
const ICON_MAP: Record<string, any> = {
  Activity, LayoutDashboard, Building2, Boxes, Gauge, Zap, Heart,
  FileBarChart, MessageSquare, CalendarCheck, Star, RotateCcw, Settings,
  Users, BarChart3, Calendar, Bot, UserCheck, ClipboardList, Receipt,
  Rocket, Phone, Bell, Globe, Upload, Stethoscope, Target, TrendingUp,
  Shield, ShieldCheck, Network, Layers, Inbox, Mic, Brain, Pill,
  Download, Send, Clock, Cable, Workflow, Cloud, TestTube, DollarSign,
  BookOpen, FileText, Sunrise, Moon, Mail, Palette, Plug, Sparkles,
};

function getIcon(name: string) {
  return ICON_MAP[name] || LayoutDashboard;
}

/* ─── Storage ─── */
const MODULE_STORAGE_KEY = "healthos-active-module";

/* ─── Component ─── */

export default function ModuleSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const tenant = useTenant();
  const { brand } = tenant;

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState("admin");
  const [pendingReferrals, setPendingReferrals] = useState(0);

  // Auto-detect which module the current route belongs to
  const detectedModule = useMemo(
    () => moduleRegistry.getModuleForRoute(pathname),
    [pathname]
  );

  // On mount: restore from localStorage or auto-detect
  useEffect(() => {
    const stored = localStorage.getItem(MODULE_STORAGE_KEY);
    if (stored && MODULE_DEFINITIONS.some((m) => m.id === stored)) {
      setActiveModuleId(stored);
    } else if (detectedModule) {
      setActiveModuleId(detectedModule.id);
    }
  }, [detectedModule]);

  // When route changes, update active module if navigating into a different module
  useEffect(() => {
    if (detectedModule && detectedModule.id !== activeModuleId) {
      setActiveModuleId(detectedModule.id);
      localStorage.setItem(MODULE_STORAGE_KEY, detectedModule.id);
    }
  }, [detectedModule, activeModuleId]);

  // Fetch user data
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.role) setUserRole(data.user.role);
      })
      .catch(() => {});
    fetch("/api/referrals")
      .then((r) => r.json())
      .then((data) => {
        if (data.pendingCount) setPendingReferrals(data.pendingCount);
      })
      .catch(() => {});
  }, []);

  const enterModule = useCallback((moduleId: string) => {
    setActiveModuleId(moduleId);
    localStorage.setItem(MODULE_STORAGE_KEY, moduleId);
    // Navigate to the module's first page
    const mod = MODULE_DEFINITIONS.find((m) => m.id === moduleId);
    if (mod && mod.pages.length > 0) {
      router.push(mod.pages[0].href);
    }
  }, [router]);

  const exitModule = useCallback(() => {
    setActiveModuleId(null);
    localStorage.removeItem(MODULE_STORAGE_KEY);
    router.push("/dashboard");
  }, [router]);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  const activeModule = activeModuleId
    ? MODULE_DEFINITIONS.find((m) => m.id === activeModuleId)
    : null;

  const visibleModules = MODULE_DEFINITIONS.filter((m) =>
    m.roles.includes(userRole)
  );

  // Count connected integrations for a module
  function connectionHealth(mod: ModuleDefinition) {
    const total = mod.integrations.length;
    const connected = mod.integrations.filter(
      (i) => i.status === "connected"
    ).length;
    return { connected, total };
  }

  /* ─── Render: Module Interior (drill-in view) ─── */
  if (activeModule && !collapsed) {
    const { connected, total } = connectionHealth(activeModule);
    const ModIcon = getIcon(activeModule.icon);
    const pages = activeModule.pages.filter((p) =>
      p.roles.includes(userRole)
    );

    return (
      <motion.aside
        animate={{ width: 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="shrink-0 border-r border-white/[0.06] flex flex-col bg-gradient-to-b from-[#1D3443] via-[#1D3443] to-[#152736] overflow-hidden relative"
      >
        {/* Back button */}
        <button
          onClick={exitModule}
          className="flex items-center gap-2 px-4 py-3 text-[12px] text-white/50 hover:text-white/80 transition-colors border-b border-white/[0.06] group"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Health OS</span>
        </button>

        {/* Module header */}
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: activeModule.color + "20" }}
            >
              <ModIcon
                className="w-5 h-5"
                style={{ color: activeModule.color }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-white truncate">
                  {activeModule.name}
                </span>
                {activeModule.badge && (
                  <span
                    className="px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-wider rounded-full"
                    style={{
                      backgroundColor: activeModule.color + "30",
                      color: activeModule.color,
                    }}
                  >
                    {activeModule.badge}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/40 mt-0.5 line-clamp-1">
                {activeModule.description}
              </p>
            </div>
          </div>
        </div>

        {/* Module pages */}
        <nav className="flex-1 py-2 px-2 overflow-y-auto">
          <div className="space-y-0.5">
            {pages.map((page) => {
              const PageIcon = getIcon(page.icon);
              const isActive =
                pathname === page.href ||
                (page.href !== "/dashboard" &&
                  pathname.startsWith(page.href + "/"));
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className={`w-full flex items-center gap-3 px-3 py-[8px] rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/[0.08] text-white sidebar-active-glow"
                      : "text-white/60 hover:text-white/80 hover:bg-white/[0.04]"
                  }`}
                >
                  {page.step && (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{
                        backgroundColor: isActive
                          ? activeModule.color + "30"
                          : "rgba(255,255,255,0.06)",
                        color: isActive ? activeModule.color : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {page.step}
                    </span>
                  )}
                  {!page.step && (
                    <PageIcon className="w-[16px] h-[16px] shrink-0" />
                  )}
                  <span className="whitespace-nowrap flex-1">{page.label}</span>
                  {page.href === "/dashboard/referrals" &&
                    pendingReferrals > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-white/10 text-white/60 min-w-[18px] text-center">
                        {pendingReferrals}
                      </span>
                    )}
                </Link>
              );
            })}
          </div>

          {/* Module status section */}
          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <span className="px-3 text-[9px] uppercase tracking-[0.15em] text-white/40 font-semibold">
              Module Status
            </span>

            {/* Connections link */}
            <Link
              href={`/dashboard/modules/${activeModule.id}/connections`}
              className={`w-full flex items-center gap-3 px-3 py-[8px] mt-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                pathname.includes("/connections")
                  ? "bg-white/[0.08] text-white"
                  : "text-white/60 hover:text-white/80 hover:bg-white/[0.04]"
              }`}
            >
              <Plug className="w-[16px] h-[16px] shrink-0" />
              <span className="flex-1">Connections</span>
              <span
                className="px-1.5 py-0.5 text-[10px] font-bold rounded-full min-w-[32px] text-center"
                style={{
                  backgroundColor:
                    connected === total
                      ? "rgba(16,185,129,0.2)"
                      : "rgba(245,158,11,0.2)",
                  color:
                    connected === total
                      ? "rgb(52,211,153)"
                      : "rgb(251,191,36)",
                }}
              >
                {connected}/{total}
              </span>
            </Link>

            {/* Agent chat link */}
            <Link
              href={`/dashboard/modules/${activeModule.id}/agent`}
              className="w-full flex items-center gap-3 px-3 py-[8px] mt-0.5 rounded-lg text-[13px] font-medium text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-200"
            >
              <Sparkles className="w-[16px] h-[16px] shrink-0" />
              <span className="flex-1">Module Agent</span>
            </Link>
          </div>
        </nav>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-5 py-3 text-[13px] text-white/50 hover:text-red-400 transition-colors border-t border-white/[0.04]"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">Sign Out</span>
        </button>
      </motion.aside>
    );
  }

  /* ─── Render: Top-Level Module List ─── */
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="shrink-0 border-r border-white/[0.06] flex flex-col bg-gradient-to-b from-[#1D3443] via-[#1D3443] to-[#152736] overflow-hidden relative"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#3DA9D1]/[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-white/[0.06]">
        {brand.logoUrl ? (
          <Image
            src={brand.logoUrl}
            alt={brand.name}
            width={80}
            height={20}
            className="h-5 w-auto shrink-0 brightness-[10] saturate-0 opacity-80"
          />
        ) : (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: brand.primaryColor }}
          >
            {brand.name.charAt(0)}
          </div>
        )}
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-[11px] whitespace-nowrap tracking-[0.15em] text-white/60"
            >
              HEALTH OS
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-2 px-2 overflow-y-auto">
        {/* Home */}
        <Link
          href="/dashboard"
          className={`w-full flex items-center gap-3 px-3 py-[8px] rounded-lg text-[13px] font-medium transition-all duration-200 ${
            pathname === "/dashboard"
              ? "bg-white/[0.08] text-white sidebar-active-glow"
              : "text-white/60 hover:text-white/80 hover:bg-white/[0.04]"
          }`}
        >
          <LayoutDashboard className="w-[16px] h-[16px] shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Home
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Modules section */}
        {!collapsed && (
          <div className="mt-4 mb-2 px-3">
            <span className="text-[9px] uppercase tracking-[0.15em] text-white/40 font-semibold">
              Modules
            </span>
          </div>
        )}
        {collapsed && <div className="h-px mx-2 my-3 bg-white/[0.04]" />}

        <div className="space-y-1">
          {visibleModules.map((mod) => {
            const ModIcon = getIcon(mod.icon);
            const { connected, total } = connectionHealth(mod);
            const isInModule = detectedModule?.id === mod.id;

            return (
              <button
                key={mod.id}
                onClick={() => enterModule(mod.id)}
                className={`w-full flex items-center gap-3 px-3 py-[9px] rounded-lg text-[13px] font-medium transition-all duration-200 group ${
                  isInModule
                    ? "bg-white/[0.08] text-white"
                    : "text-white/60 hover:text-white/80 hover:bg-white/[0.04]"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    backgroundColor: isInModule
                      ? mod.color + "25"
                      : "rgba(255,255,255,0.04)",
                  }}
                >
                  <ModIcon
                    className="w-4 h-4"
                    style={{ color: isInModule ? mod.color : undefined }}
                  />
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex items-center justify-between min-w-0"
                    >
                      <span className="truncate">{mod.shortName}</span>
                      <div className="flex items-center gap-1.5">
                        {mod.badge && (
                          <span
                            className="px-1.5 py-[1px] text-[7px] font-bold uppercase tracking-wider rounded-full"
                            style={{
                              backgroundColor: mod.color + "20",
                              color: mod.color,
                            }}
                          >
                            {mod.badge}
                          </span>
                        )}
                        {/* Connection health dot */}
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              connected === total ? "#34D399" : "#FBBF24",
                          }}
                        />
                        <ChevronRight className="w-3 h-3 text-white/30 group-hover:text-white/50 transition-colors" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        {/* Executive section */}
        {!collapsed && (
          <div className="mt-6 mb-2 px-3">
            <span className="text-[9px] uppercase tracking-[0.15em] text-white/40 font-semibold">
              Executive
            </span>
          </div>
        )}
        {collapsed && <div className="h-px mx-2 my-3 bg-white/[0.04]" />}

        <div className="space-y-0.5">
          {EXECUTIVE_PAGES.filter((p) => p.roles.includes(userRole)).map(
            (page) => {
              const PageIcon = getIcon(page.icon);
              const isActive =
                pathname === page.href ||
                pathname.startsWith(page.href + "/");
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className={`w-full flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/[0.08] text-white sidebar-active-glow"
                      : "text-white/60 hover:text-white/80 hover:bg-white/[0.04]"
                  }`}
                >
                  <PageIcon className="w-[16px] h-[16px] shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="whitespace-nowrap"
                      >
                        {page.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            }
          )}

          {/* Settings */}
          <Link
            href="/dashboard/settings"
            className={`w-full flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-200 ${
              pathname === "/dashboard/settings"
                ? "bg-white/[0.08] text-white sidebar-active-glow"
                : "text-white/60 hover:text-white/80 hover:bg-white/[0.04]"
            }`}
          >
            <Settings className="w-[16px] h-[16px] shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </nav>

      {/* Emergency line */}
      {!collapsed && (
        <div className="px-4 py-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-2 text-[11px] text-white/50">
            <Phone className="w-3.5 h-3.5" />
            <span>Emergency line active</span>
          </div>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-5 py-3 text-[13px] text-white/50 hover:text-red-400 transition-colors border-t border-white/[0.04]"
      >
        <LogOut className="w-4 h-4 shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="whitespace-nowrap"
            >
              Sign Out
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-3 text-white/50 hover:text-white/70 transition-colors border-t border-white/[0.04]"
      >
        <ChevronDown
          className={`w-4 h-4 mx-auto transition-transform ${
            collapsed ? "-rotate-90" : "rotate-90"
          }`}
        />
      </button>
    </motion.aside>
  );
}
