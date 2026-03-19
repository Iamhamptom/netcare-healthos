import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto mb-3" />
        <p className="text-white/30 text-xs uppercase tracking-wider">Loading...</p>
      </div>
    </div>
  );
}
