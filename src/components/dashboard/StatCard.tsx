"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export default function StatCard({ label, value, change, trend, icon: Icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-5 rounded-xl glass-panel hover:border-[var(--gold)]/20 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {change && trend && (
          <div className={`flex items-center gap-1 text-[11px] font-semibold ${trend === "up" ? "text-[var(--teal)]" : "text-[var(--crimson)]"}`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-[var(--ivory)] mb-1">{value}</div>
      <div className="text-[12px] text-[var(--text-secondary)]">{label}</div>
    </motion.div>
  );
}
