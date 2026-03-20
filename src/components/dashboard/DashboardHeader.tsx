"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Command } from "lucide-react";

interface UserData {
  name: string;
  practice?: {
    name?: string;
    practiceName?: string;
    primaryColor?: string;
    primary_color?: string;
    secondaryColor?: string;
    secondary_color?: string;
    tagline?: string;
    plan?: string;
  };
}

export default function DashboardHeader() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  const practice = user?.practice;
  const practiceName = practice?.name || practice?.practiceName || "";
  const plan = practice?.plan || "";

  return (
    <header className="h-[52px] flex items-center justify-between px-5 border-b border-gray-100 bg-white shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-[14px] font-semibold text-[#1D3443] tracking-tight">
          {practiceName || "Dashboard"}
        </h1>
        {practice?.tagline && (
          <>
            <div className="w-px h-4 bg-gray-200" />
            <p className="text-[11px] text-gray-400 font-light">{practice.tagline}</p>
          </>
        )}
        {plan && (
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider text-[#1D3443]/50 bg-[#1D3443]/[0.04] border border-[#1D3443]/[0.06]">
            {plan}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {user?.name && user.name.trim() !== "" && (
          <div className="flex items-center gap-2 mr-1">
            <div className="w-6 h-6 rounded-full bg-[#1D3443]/[0.06] flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#1D3443]/60">{user.name.charAt(0)}</span>
            </div>
            <span className="text-[12px] text-gray-600 font-medium">
              {user.name.split(" ")[0]}
            </span>
          </div>
        )}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-300 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-3 py-1.5 bg-[#f8f9fa] border border-gray-200/60 rounded-lg text-[12px] text-gray-900 placeholder:text-gray-400 w-40 transition-all focus:w-56 focus:border-gray-300 focus:outline-none focus:bg-white focus:shadow-sm"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-gray-300">
            <Command className="w-2.5 h-2.5" />
            <span className="text-[9px] font-mono">K</span>
          </div>
        </div>
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50">
          <Bell className="w-[15px] h-[15px]" />
          <span className="absolute top-1 right-1 w-[5px] h-[5px] rounded-full bg-[#E3964C]" />
        </button>
      </div>
    </header>
  );
}
