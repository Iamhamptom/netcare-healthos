"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Command } from "lucide-react";

interface UserData {
  name: string;
  practice?: {
    name?: string;
    practiceName?: string;
    tagline?: string;
    plan?: string;
  };
}

export default function DashboardHeader() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  const practice = user?.practice;
  const practiceName = practice?.name || practice?.practiceName || "";
  const plan = practice?.plan || "";

  return (
    <header className="h-[52px] flex items-center justify-between px-5 bg-white/80 backdrop-blur-xl border-b border-black/[0.04] shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3">
        <h1 className="text-[14px] font-semibold text-[#1D3443]">{practiceName || "Dashboard"}</h1>
        {practice?.tagline && (
          <>
            <div className="w-px h-3.5 bg-[#1D3443]/10" />
            <p className="text-[11px] text-[#1D3443]/30">{practice.tagline}</p>
          </>
        )}
        {plan && (
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider text-[#1D3443]/40 bg-[#1D3443]/[0.04]">
            {plan}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        {user?.name && (
          <div className="flex items-center gap-2 mr-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1D3443]/10 to-[#3DA9D1]/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#1D3443]/50">{user.name.charAt(0)}</span>
            </div>
            <span className="text-[12px] text-[#1D3443]/50 font-medium">{user.name.split(" ")[0]}</span>
          </div>
        )}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#1D3443]/20 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-14 py-1.5 bg-[#1D3443]/[0.03] border border-[#1D3443]/[0.06] rounded-lg text-[12px] text-[#1D3443] placeholder:text-[#1D3443]/25 w-44 transition-all focus:w-56 focus:border-[#1D3443]/15 focus:outline-none focus:bg-white focus:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[#1D3443]/15 border border-[#1D3443]/[0.06] rounded px-1 py-0.5">
            <Command className="w-2.5 h-2.5" />
            <span className="text-[9px] font-mono">K</span>
          </div>
        </div>
        <button className="relative p-2 text-[#1D3443]/30 hover:text-[#1D3443]/60 transition-colors rounded-lg hover:bg-[#1D3443]/[0.03]">
          <Bell className="w-[15px] h-[15px]" />
          <span className="absolute top-1.5 right-1.5 w-[5px] h-[5px] rounded-full bg-[#E3964C]" />
        </button>
      </div>
    </header>
  );
}
