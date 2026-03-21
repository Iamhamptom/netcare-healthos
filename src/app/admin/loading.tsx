import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
        <p className="text-white/70 text-xs uppercase tracking-wider">Loading admin...</p>
      </div>
    </div>
  );
}
