"use client";

import { FileText } from "lucide-react";
import type { ICD10Suggestion } from "@/lib/scribe/types";

interface Props {
  codes: ICD10Suggestion[];
}

export default function ICD10Panel({ codes }: Props) {
  const sorted = [...codes].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-white/40" />
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">ICD-10 Codes</span>
        {codes.length > 0 && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-teal-500/20 text-teal-400">
            {codes.length}
          </span>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-white/20 italic">
          ICD-10 codes will appear as the consultation progresses
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((code, i) => {
            const barColor =
              code.confidence >= 80 ? "bg-teal-500" :
              code.confidence >= 50 ? "bg-amber-500" :
              "bg-red-500";

            return (
              <div key={code.code + "-" + i} className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded shrink-0 w-16 text-center">
                  {code.code}
                </span>
                <span className="text-xs text-white/60 flex-1 truncate">{code.description}</span>
                <div className="w-16 h-1.5 rounded-full bg-zinc-800 shrink-0">
                  <div
                    className={"h-full rounded-full transition-all " + barColor}
                    style={{ width: code.confidence + "%" }}
                  />
                </div>
                <span className="text-[10px] text-white/30 w-8 text-right shrink-0">{code.confidence}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
