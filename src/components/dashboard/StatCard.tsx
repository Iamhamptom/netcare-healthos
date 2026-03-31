"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export default function StatCard({ label, value, icon: Icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="p-4 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200/80 hover:border-gray-300 hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-300 relative overflow-hidden group glass-card-glow"
    >
      {/* Subtle gradient shine on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-[color-mix(in_srgb,var(--teal)_3%,transparent)] group-hover:to-transparent transition-all duration-500 rounded-xl" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${color}10` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
        </div>
        <div className="text-xl font-bold text-gray-900 font-metric">{value}</div>
        <div className="text-[11px] text-gray-500 mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
}
