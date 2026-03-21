import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[var(--obsidian)]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 shrink-0 border-b border-gray-200 bg-white flex items-center justify-between px-6">
          <span className="text-[13px] text-gray-500 font-medium">Health OS — Platform Admin</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#3DA9D1] animate-pulse" />
            <span className="text-[12px] text-gray-400">Platform Admin</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-white text-gray-900 light-content font-body">{children}</main>
      </div>
    </div>
  );
}
