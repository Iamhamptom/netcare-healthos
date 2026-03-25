"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Check, Loader2 } from "lucide-react";
import type { SOAPNote, ICD10Suggestion } from "@/lib/scribe/types";
import ICD10Panel from "./ICD10Panel";

interface Props {
  soap: SOAPNote;
  icd10Codes: ICD10Suggestion[];
  redFlags: string[];
  isAnalyzing: boolean;
  onSOAPEdit: (section: keyof SOAPNote, value: string) => void;
}

const SECTIONS: Array<{
  key: keyof SOAPNote;
  letter: string;
  title: string;
  color: string;
  borderColor: string;
  bgColor: string;
}> = [
  { key: "subjective", letter: "S", title: "Subjective", color: "text-amber-400", borderColor: "border-l-amber-500/50", bgColor: "bg-amber-500/10" },
  { key: "objective", letter: "O", title: "Objective", color: "text-blue-400", borderColor: "border-l-blue-500/50", bgColor: "bg-blue-500/10" },
  { key: "assessment", letter: "A", title: "Assessment", color: "text-purple-400", borderColor: "border-l-purple-500/50", bgColor: "bg-purple-500/10" },
  { key: "plan", letter: "P", title: "Plan", color: "text-green-400", borderColor: "border-l-green-500/50", bgColor: "bg-green-500/10" },
];

export default function SOAPNotePanel({ soap, icd10Codes, redFlags, isAnalyzing, onSOAPEdit }: Props) {
  const [editingSection, setEditingSection] = useState<keyof SOAPNote | null>(null);

  return (
    <div className="space-y-3 h-full overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
      {SECTIONS.map(section => {
        const value = soap[section.key];
        const isEditing = editingSection === section.key;

        return (
          <motion.div
            key={section.key}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={"bg-zinc-900 border border-zinc-800 " + section.borderColor + " border-l-2 rounded-xl overflow-hidden" + (isAnalyzing ? " animate-pulse" : "")}
          >
            <div className="flex items-center gap-3 px-4 py-2.5">
              <div className={"w-7 h-7 rounded-lg " + section.bgColor + " flex items-center justify-center"}>
                <span className={"text-sm font-bold " + section.color}>{section.letter}</span>
              </div>
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wider flex-1">
                {section.title}
              </span>
              {isAnalyzing && <Loader2 className="w-3 h-3 text-teal-400/50 animate-spin" />}
              <button
                onClick={() => setEditingSection(isEditing ? null : section.key)}
                className="p-1 rounded hover:bg-zinc-900/50 text-white/20 hover:text-white/50 transition-colors"
              >
                {isEditing ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Pencil className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="px-4 pb-3">
              {isEditing ? (
                <textarea
                  value={value}
                  onChange={(e) => onSOAPEdit(section.key, e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-white/70 leading-relaxed resize-y min-h-[80px] focus:outline-none focus:border-teal-500/40"
                  autoFocus
                />
              ) : (
                <p className="text-sm text-white/50 leading-relaxed min-h-[40px]">
                  {value || <span className="text-white/20 italic">Waiting for consultation data...</span>}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}

      <ICD10Panel codes={icd10Codes} />

      {redFlags.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Red Flags</span>
          <ul className="mt-2 space-y-1">
            {redFlags.map((flag, i) => (
              <li key={i} className="text-xs text-red-400/80">- {flag}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
