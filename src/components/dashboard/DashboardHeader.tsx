"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Shield } from "lucide-react";

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
  const primaryColor = practice?.primaryColor || practice?.primary_color || "";
  const secondaryColor = practice?.secondaryColor || practice?.secondary_color || "";
  const plan = practice?.plan || "";

  return (
    <header
      className="h-14 flex items-center justify-between px-6 border-b shrink-0"
      style={{
        backgroundColor: primaryColor ? `${primaryColor}08` : "white",
        borderBottomColor: primaryColor ? `${primaryColor}20` : "#e5e7eb",
      }}
    >
      <div className="flex items-center gap-3">
        {primaryColor && (
          <div className="w-2 h-8 rounded-full" style={{ backgroundColor: secondaryColor || primaryColor }} />
        )}
        <div>
          <h1 className="text-[15px] font-semibold" style={{ color: primaryColor || "#111827" }}>
            {practiceName || "Dashboard"}
          </h1>
          {practice?.tagline && (
            <p className="text-[10px] text-gray-500 -mt-0.5">{practice.tagline}</p>
          )}
        </div>
        {plan && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{
              color: secondaryColor || "#6b7280",
              backgroundColor: secondaryColor ? `${secondaryColor}15` : "#f3f4f6",
            }}
          >
            {plan}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {user?.name && (
          <span className="text-[12px] text-gray-600 font-medium">
            Welcome, <span style={{ color: primaryColor || "#111827" }} className="font-semibold">{user.name.split(" ")[0]}</span>
          </span>
        )}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-900 placeholder:text-gray-400 w-48 transition-all focus:w-64 focus:border-gray-300 focus:outline-none"
          />
        </div>
        <button className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: secondaryColor || "#10b981" }} />
        </button>
      </div>
    </header>
  );
}
