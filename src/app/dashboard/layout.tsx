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
        <main className="flex-1 overflow-y-auto bg-white text-gray-900 light-content font-body">{children}</main>
      </div>
      <CommandAssistant />
      <VoiceAgentFloat />
    </div>
  );
}
