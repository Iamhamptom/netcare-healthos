"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse, LayoutDashboard, Building2, BarChart3, Activity,
  ChevronDown, LogOut, Shield, Briefcase, FileText, PresentationIcon,
  Landmark, TrendingUp, Users, Megaphone, Radio, UserPlus,
} from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/onboard", icon: UserPlus, label: "Onboard" },
  { href: "/admin/clients", icon: Users, label: "Clients" },
  { href: "/admin/campaigns", icon: Megaphone, label: "Campaigns" },
  { href: "/admin/practices", icon: Building2, label: "Practices" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/ops", icon: Briefcase, label: "Operations" },
  { href: "/admin/usage", icon: Activity, label: "Usage" },
  { href: "/admin/health-media", icon: Radio, label: "Health Media SA" },
  { href: "/admin/impact", icon: HeartPulse, label: "Impact Research" },
  { href: "/admin/investor", icon: TrendingUp, label: "Investor Pack" },
  { href: "/admin/tender", icon: Landmark, label: "Gov Tender" },
  { href: "/admin/deck", icon: PresentationIcon, label: "Pitch Deck" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="shrink-0 border-r border-[var(--border)] flex flex-col bg-[var(--charcoal)]/50 overflow-hidden"
    >
      <div className="h-14 flex items-center gap-2 px-4 border-b border-[var(--border)]">
        <Shield className="w-5 h-5 text-[#ef4444] shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-serif font-semibold text-[13px] whitespace-nowrap tracking-wide text-[var(--ivory)]"
            >
              PLATFORM ADMIN
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#ef4444]/10 text-[#ef4444]"
                  : "text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[var(--obsidian)]/50"
              }`}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}

        {/* Divider + link to client dashboard */}
        <div className="my-3 border-t border-[var(--border)]" />
        <Link
          href="/dashboard"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[var(--text-tertiary)] hover:text-[var(--gold)] hover:bg-[var(--obsidian)]/50 transition-all"
        >
          <HeartPulse className="w-[18px] h-[18px] shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                Client View
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </nav>

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
        className="p-3 text-[var(--text-tertiary)] hover:text-[#ef4444] transition-colors border-t border-[var(--border)]"
      >
        <ChevronDown className={`w-4 h-4 mx-auto transition-transform ${collapsed ? "-rotate-90" : "rotate-90"}`} />
      </button>
    </motion.aside>
  );
}
