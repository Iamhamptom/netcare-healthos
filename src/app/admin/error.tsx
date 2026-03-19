"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Admin Error</h2>
        <p className="text-white/40 text-sm mb-6">
          {error.message || "An unexpected error occurred in the admin panel."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-500 transition-colors rounded"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    </div>
  );
}
