"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type WallpaperKey = "clean" | "aurora" | "mesh" | "topo" | "minimal" | "dusk" | "ocean";

export interface WallpaperDef {
  key: WallpaperKey;
  label: string;
  preview: string; // CSS gradient used as preview thumbnail
  className: string; // Applied to the main content area
  animated?: boolean;
}

export const WALLPAPERS: WallpaperDef[] = [
  {
    key: "clean",
    label: "Clean",
    preview: "linear-gradient(135deg, #f0f2f5 0%, #eef0f4 100%)",
    className: "bg-gradient-to-br from-[#f0f2f5] via-[#f5f6f8] to-[#eef0f4]",
  },
  {
    key: "aurora",
    label: "Aurora",
    preview: "linear-gradient(135deg, #e8f4f8 0%, #f0e8f5 50%, #e8f0e8 100%)",
    className: "wallpaper-aurora",
    animated: true,
  },
  {
    key: "mesh",
    label: "Soft Mesh",
    preview: "linear-gradient(135deg, #dbeafe 0%, #ede9fe 50%, #dbeafe 100%)",
    className: "wallpaper-mesh",
    animated: true,
  },
  {
    key: "topo",
    label: "Blueprint",
    preview: "linear-gradient(135deg, #f0f4f8 0%, #e8ecf0 100%)",
    className: "wallpaper-topo",
  },
  {
    key: "minimal",
    label: "White",
    preview: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
    className: "bg-white",
  },
  {
    key: "dusk",
    label: "Warm Sand",
    preview: "linear-gradient(135deg, #fef3e2 0%, #fce8d0 50%, #fef9f0 100%)",
    className: "bg-gradient-to-br from-[#fef3e2] via-[#fef9f0] to-[#fce8d0]",
  },
  {
    key: "ocean",
    label: "Deep Focus",
    preview: "linear-gradient(135deg, #e0f2fe 0%, #e0e7ff 50%, #ede9fe 100%)",
    className: "bg-gradient-to-br from-[#e0f2fe] via-[#e0e7ff] to-[#ede9fe]",
  },
];

interface WallpaperCtx {
  wallpaper: WallpaperDef;
  setWallpaper: (key: WallpaperKey) => void;
}

const WallpaperContext = createContext<WallpaperCtx>({
  wallpaper: WALLPAPERS[0],
  setWallpaper: () => {},
});

export function useWallpaper() {
  return useContext(WallpaperContext);
}

export function WallpaperProvider({ children }: { children: ReactNode }) {
  const [key, setKey] = useState<WallpaperKey>("aurora"); // Default to aurora (alive)

  useEffect(() => {
    const saved = localStorage.getItem("healthos-wallpaper") as WallpaperKey | null;
    if (saved && WALLPAPERS.find(w => w.key === saved)) {
      setKey(saved);
    }
  }, []);

  const setWallpaper = (newKey: WallpaperKey) => {
    setKey(newKey);
    localStorage.setItem("healthos-wallpaper", newKey);
  };

  const wallpaper = WALLPAPERS.find(w => w.key === key) || WALLPAPERS[0];

  return (
    <WallpaperContext.Provider value={{ wallpaper, setWallpaper }}>
      {children}
    </WallpaperContext.Provider>
  );
}
