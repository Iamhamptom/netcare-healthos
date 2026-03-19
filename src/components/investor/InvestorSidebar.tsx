"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse, LayoutDashboard, Map, ShieldCheck, StickyNote,
  FileText, ChevronDown, LogOut, Heart, GraduationCap, Search,
  Rocket, FileSignature, ScrollText, TrendingUp, Layers,
} from "lucide-react";

const navItems = [
  { href: "/investor", icon: LayoutDashboard, label: "Ecosystem" },
  { href: "/investor/strategy", icon: Layers, label: "Strategy" },
  { href: "/investor/pipeline", icon: TrendingUp, label: "Lead Pipeline" },
  { href: "/investor/sitemap", icon: Map, label: "Product Map" },
  { href: "/investor/compliance", icon: ShieldCheck, label: "Compliance" },
  { href: "/investor/letter", icon: Heart, label: "Founder Letter" },
  { href: "/investor/onboarding", icon: Rocket, label: "Onboarding" },
  { href: "/investor/notes", icon: StickyNote, label: "Notes" },
  { href: "/investor/policies", icon: FileText, label: "Policies & T&Cs" },
  { href: "/investor/nda", icon: FileSignature, label: "NDA" },
  { href: "/investor/contract", icon: ScrollText, label: "Service Agreement" },
  { href: "/investor/courses", icon: GraduationCap, label: "AI Courses" },
  { href: "/investor/research", icon: Search, label: "Research Portal" },
];

export default function InvestorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="shrink-0 border-r border-[var(--border)] flex flex-col bg-[var(--charcoal)]/50 overflow-hidden"
    >
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-[var(--border)]">
        <HeartPulse className="w-5 h-5 text-[#8B5CF6] shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              <span className="font-serif font-semibold text-[13px] whitespace-nowrap tracking-wide text-[var(--ivory)]">
                INVESTOR PORTAL
              </span>
              <span className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap">
                Netcare Health OS Ecosystem
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/investor" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#8B5CF6]/10 text-[#8B5CF6]"
                  : "text-[var(--text-secondary)] hover:text-[#8B5CF6] hover:bg-[var(--obsidian)]/50"
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
      </nav>

      {/* Valuation Badge */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-3 p-3 rounded-lg bg-[#8B5CF6]/5 border border-[#8B5CF6]/20"
          >
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Current Round</p>
            <p className="text-[18px] font-bold text-[#8B5CF6] font-serif">R1,000,000</p>
            <p className="text-[11px] text-[var(--text-secondary)]">for 10% equity</p>
          </motion.div>
        )}
      </AnimatePresence>

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
        className="p-3 text-[var(--text-tertiary)] hover:text-[#8B5CF6] transition-colors border-t border-[var(--border)]"
      >
        <ChevronDown className={`w-4 h-4 mx-auto transition-transform ${collapsed ? "-rotate-90" : "rotate-90"}`} />
      </button>
    </motion.aside>
  );
}
