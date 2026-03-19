"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl text-[#FDFCF0] uppercase tracking-wider mb-3">Something Went Wrong</h2>
        <p className="text-[#FDFCF0]/40 text-sm mb-6">An unexpected error occurred. Please try again.</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#D4AF37] text-[#050505] uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#FDFCF0] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
