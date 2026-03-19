import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CommandAssistant from "@/components/dashboard/CommandAssistant";
import VoiceAgentFloat from "@/components/voice-agent/VoiceAgentFloat";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[var(--obsidian)]">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-white text-gray-900 light-content font-body">
          {children}
          {/* Powered by VisioHealth OS */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3DA9D1]" />
              <span className="text-[11px] text-gray-400 font-medium">
                Powered by <span className="text-[#1D3443] font-semibold">VisioHealth OS</span> — AI Healthcare Operations Platform
              </span>
            </div>
            <span className="text-[10px] text-gray-300">
              Built by Visio Research Labs &middot; Johannesburg, SA
            </span>
          </div>
        </main>
      </div>
      <CommandAssistant />
      <VoiceAgentFloat />
    </div>
  );
}
