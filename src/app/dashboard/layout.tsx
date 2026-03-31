"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import ModuleSidebar from "@/components/dashboard/ModuleSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FeatureGuide from "@/components/dashboard/FeatureGuide";
import NetcareAssistant from "@/components/dashboard/NetcareAssistant";
import ProductCourse from "@/components/dashboard/ProductCourse";
import ParticleField from "@/components/dashboard/ParticleField";
import CursorGlow from "@/components/dashboard/CursorGlow";
import { Menu, X } from "lucide-react";
import { useBrand } from "@/lib/tenant-context";
import { WallpaperProvider, useWallpaper } from "@/lib/wallpaper-context";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCourse, setShowCourse] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const brand = useBrand();
  const { wallpaper } = useWallpaper();

  useEffect(() => {
    if (searchParams.get("course") === "1") {
      setShowCourse(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("course");
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <div className="flex h-screen bg-[#f0f2f5]">
      <AnimatePresence>
        {showCourse && <ProductCourse onComplete={() => setShowCourse(false)} />}
      </AnimatePresence>

      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="relative h-full">
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
          <ModuleSidebar />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
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
        <main 
          id="main-content" 
          className={`flex-1 overflow-y-auto text-[#1D3443] light-content font-body relative ${wallpaper.className}`}
        >
          {/* Ambient particle field — always on for living background */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
            <ParticleField />
          </div>

          {/* Cursor glow — premium ambient light */}
          <CursorGlow />

          {/* Animated wallpaper layers */}
          {wallpaper.key === "aurora" && (
            <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
              <div className="aurora-blob aurora-blob-1" />
              <div className="aurora-blob aurora-blob-2" />
              <div className="aurora-blob aurora-blob-3" />
            </div>
          )}
          {wallpaper.key === "mesh" && (
            <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
              <div className="mesh-blob mesh-blob-1" />
              <div className="mesh-blob mesh-blob-2" />
            </div>
          )}
          {wallpaper.key === "topo" && (
            <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
              <div className="topo-pattern" />
            </div>
          )}

          <div className="relative" style={{ zIndex: 1 }}>
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
                  Powered by <span className="font-semibold text-[#1D3443]/70">{brand.name}</span>
                </span>
              </div>
              <span className="text-[10px] text-[#1D3443]/60">{brand.tagline}</span>
            </div>
          </div>
        </main>
      </div>
      <FeatureGuide />
      <NetcareAssistant />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WallpaperProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </WallpaperProvider>
  );
}
