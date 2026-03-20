import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FeatureGuide from "@/components/dashboard/FeatureGuide";
import NetcareAssistant from "@/components/dashboard/NetcareAssistant";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#1D3443]">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden rounded-tl-2xl">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#f0f2f5] via-[#f5f6f8] to-[#eef0f4] text-[#1D3443] light-content font-body relative">
          <div className="sticky top-0 z-40 flex justify-center py-1.5 bg-amber-50/90 backdrop-blur-sm border-b border-amber-200/50">
            <span className="text-[10px] font-medium text-amber-700 tracking-wide">
              DEMO ENVIRONMENT — Sample data for evaluation purposes only
            </span>
          </div>
          {children}
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-[#1D3443]/15" />
              <span className="text-[10px] text-[#1D3443]/20 font-medium">
                Powered by <span className="font-semibold text-[#1D3443]/30">VisioHealth OS</span>
              </span>
            </div>
            <span className="text-[10px] text-[#1D3443]/15">Visio Research Labs</span>
          </div>
        </main>
      </div>
      <FeatureGuide />
      <NetcareAssistant />
    </div>
  );
}
