import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { getWorkspace } from "@/lib/auth";

async function DashboardShell({ children }: { children: React.ReactNode }) {
  const workspace = await getWorkspace();
  if (!workspace) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="border-b bg-card px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Workspace: <span className="font-medium text-foreground">{workspace.name}</span>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Memuat workspace...</div>}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}