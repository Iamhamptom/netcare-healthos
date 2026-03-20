import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FeatureGuide from "@/components/dashboard/FeatureGuide";
import NetcareAssistant from "@/components/dashboard/NetcareAssistant";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#1D3443]">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-[#fafafa] text-gray-900 light-content font-body">
          {children}
          <div className="px-6 py-3 border-t border-gray-100 bg-white/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <span className="text-[11px] text-gray-400 font-medium">
                Powered by <span className="text-gray-600 font-semibold">VisioHealth OS</span>
              </span>
            </div>
            <span className="text-[10px] text-gray-300">
              Visio Research Labs
            </span>
          </div>
        </main>
      </div>
      <FeatureGuide />
      <NetcareAssistant />
    </div>
  );
}
