"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

export default function PracticeMap() {
  const [mapData, setMapData] = useState<{ embedUrl: string; formattedAddress: string } | null>(null);

  useEffect(() => {
    fetch("/api/google/geocode")
      .then(r => r.json())
      .then(d => {
        if (d.embedUrl) setMapData({ embedUrl: d.embedUrl, formattedAddress: d.formattedAddress });
      })
      .catch(() => {});
  }, []);

  if (!mapData || !mapData.embedUrl) return null;

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
        <MapPin className="w-4 h-4 text-[var(--gold)]" />
        <h3 className="text-sm font-semibold text-[var(--ivory)]">Practice Location</h3>
      </div>
      <div className="relative">
        <iframe
          src={mapData.embedUrl}
          width="100%"
          height="250"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Practice location"
        />
      </div>
      <div className="p-3 text-[11px] text-[var(--text-tertiary)]">
        {mapData.formattedAddress}
      </div>
    </div>
  );
}
