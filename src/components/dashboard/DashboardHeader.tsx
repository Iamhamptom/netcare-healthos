"use client";

import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";

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
    <header className="h-14 flex items-center justify-between px-6 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-[14px] font-semibold text-gray-900">
            {practiceName || "Dashboard"}
          </h1>
          {practice?.tagline && (
            <p className="text-[10px] text-gray-400 -mt-0.5">{practice.tagline}</p>
          )}
        </div>
        {plan && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide text-gray-500 bg-gray-100 border border-gray-200/60">
            {plan}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {user?.name && user.name.trim() !== "" && (
          <span className="text-[12px] text-gray-500 font-medium">
            {user.name.split(" ")[0]}
          </span>
        )}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-4 py-1.5 bg-gray-50 border border-gray-200/60 rounded-xl text-[12px] text-gray-900 placeholder:text-gray-400 w-44 transition-all focus:w-60 focus:border-gray-300 focus:outline-none focus:bg-white focus:shadow-sm"
          />
        </div>
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-50">
          <Bell className="w-[16px] h-[16px]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.4)]" />
        </button>
      </div>
    </header>
  );
}
