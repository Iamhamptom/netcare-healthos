import InvestorSidebar from "@/components/investor/InvestorSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investor Portal — Netcare Health OS Ecosystem",
  description: "Netcare Health OS investor portal. 6 healthcare products, one ecosystem. AI-powered practice management for South African medical practices.",
  robots: "noindex, nofollow",
};

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[var(--obsidian)]">
      <InvestorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 shrink-0 border-b border-gray-200 bg-white flex items-center justify-between px-6">
          <span className="text-[13px] text-gray-500 font-medium">Netcare Health OS Ecosystem — Investor Portal</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
            <span className="text-[12px] text-gray-400">Investor Access</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-white text-gray-900 light-content font-body">{children}</main>
      </div>
    </div>
  );
}
