"use client";

import Link from "next/link";
import { HeartPulse, Send, Search, ArrowUpRight, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GPDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/gp");
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/gp/dashboard" className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-[#3DA9D1]" />
              <span className="text-sm font-semibold text-gray-900 tracking-tight">
                Netcare Health OS
              </span>
              <span className="text-[10px] font-mono text-[#3DA9D1] bg-[#3DA9D1] px-2 py-0.5 rounded-full uppercase tracking-widest">
                GP Portal
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/gp/dashboard"
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                My Referrals
              </Link>
              <Link
                href="/gp/dashboard?tab=specialists"
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                Find Specialists
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/#pricing"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-mono text-[#3DA9D1] hover:text-[#1D3443] transition-colors"
            >
              Upgrade to Full Platform
              <ArrowUpRight className="w-3 h-3" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
