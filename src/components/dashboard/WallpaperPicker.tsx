"use client";

import { useState, useRef, useEffect } from "react";
import { Paintbrush, Check, X, Sparkles } from "lucide-react";
import { useWallpaper, WALLPAPERS, WallpaperKey } from "@/lib/wallpaper-context";

export default function WallpaperPicker() {
  const { wallpaper, setWallpaper } = useWallpaper();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change wallpaper"
        className="p-2 text-[#1D3443]/30 hover:text-[#1D3443]/60 transition-colors rounded-lg hover:bg-[#1D3443]/[0.03]"
        title="Change wallpaper"
      >
        <Paintbrush className="w-[15px] h-[15px]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl shadow-black/10 border border-black/[0.06] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.04]">
            <span className="text-[13px] font-semibold text-[#1D3443]">Theme</span>
            <button onClick={() => setOpen(false)} className="text-[#1D3443]/30 hover:text-[#1D3443]/60 transition">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-3 grid grid-cols-4 gap-2">
            {WALLPAPERS.map((w) => (
              <button
                key={w.key}
                onClick={() => { setWallpaper(w.key); setOpen(false); }}
                className={`group relative flex flex-col items-center gap-1.5`}
                title={w.label}
              >
                <div
                  className={`w-full aspect-square rounded-lg border-2 transition-all duration-200 overflow-hidden ${
                    wallpaper.key === w.key 
                      ? "border-[#3DA9D1] shadow-[0_0_0_1px_#3DA9D1] scale-105" 
                      : "border-transparent hover:border-[#1D3443]/15"
                  }`}
                  style={{ background: w.preview }}
                >
                  {wallpaper.key === w.key && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#3DA9D1]/10 rounded-md">
                      <Check className="w-3.5 h-3.5 text-[#3DA9D1]" />
                    </div>
                  )}
                  {w.animated && (
                    <div className="absolute top-0.5 right-0.5">
                      <Sparkles className="w-2.5 h-2.5 text-[#1D3443]/30" />
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-medium text-[#1D3443]/50 group-hover:text-[#1D3443]/80 transition">
                  {w.label}
                </span>
              </button>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-black/[0.04]">
            <p className="text-[10px] text-[#1D3443]/30 leading-snug">
              <Sparkles className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />
              Animated themes use gentle motion
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
