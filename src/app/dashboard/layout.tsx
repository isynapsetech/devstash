import TopBar from "@/components/dashboard/TopBar";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="flex h-screen">
      <aside className="hidden w-64 shrink-0 border-r p-4 md:block">
        <h2 className="text-lg font-semibold">Sidebar</h2>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
