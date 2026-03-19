import { AlertTriangle } from "lucide-react";

export function AiDisclaimer({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-yellow-500/10 bg-yellow-500/5 px-3 py-2 ${className ?? ""}`}
    >
      <AlertTriangle className="h-3.5 w-3.5 text-yellow-500/60 shrink-0 mt-0.5" />
      <p className="text-[11px] text-yellow-500/60 leading-relaxed">
        AI suggestions are decision support only. Clinical responsibility remains with the
        treating practitioner. Always verify AI outputs before acting.
      </p>
    </div>
  );
}
