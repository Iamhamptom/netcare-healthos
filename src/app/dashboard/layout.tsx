"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FeatureGuide from "@/components/dashboard/FeatureGuide";
import NetcareAssistant from "@/components/dashboard/NetcareAssistant";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#1D3443]">
      {/* Skip navigation link */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — hidden on mobile, shown in overlay when toggled */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="relative h-full">
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
          <DashboardSidebar />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden rounded-tl-2xl">
        {/* Header with mobile hamburger */}
        <div className="relative">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg text-[#1D3443]/40 hover:text-[#1D3443]/70 hover:bg-[#1D3443]/5 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <DashboardHeader />
        </div>
        <main id="main-content" className="flex-1 overflow-y-auto bg-gradient-to-br from-[#f0f2f5] via-[#f5f6f8] to-[#eef0f4] text-[#1D3443] light-content font-body relative">
          <div className="sticky top-0 z-40 flex justify-center py-1.5 bg-amber-50/90 backdrop-blur-sm border-b border-amber-200/50">
            <span className="text-[10px] font-medium text-amber-700 tracking-wide">
              DEMO ENVIRONMENT — Sample data for evaluation purposes only
            </span>
          </div>
          {children}
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-[#1D3443]/15" />
              <span className="text-[10px] text-[#1D3443]/60 font-medium">
                Powered by <span className="font-semibold text-[#1D3443]/70">VisioHealth OS</span>
              </span>
            </div>
            <span className="text-[10px] text-[#1D3443]/60">Visio Research Labs</span>
          </div>
        </main>
      </div>
      <FeatureGuide />
      <NetcareAssistant />
    </div>
  );
}
