import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getWorkspace, getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

async function DashboardShellWithChildren({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const workspace = await getWorkspace();
  if (!workspace) {
    // Avoid redirect loop: show error instead of bouncing to /login.
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
          Gagal memuat workspace. Kemungkinan koneksi database bermasalah. Cek log server (Railway) untuk detail.
        </div>
      </div>
    );
  }
  return <AppShell workspaceName={workspace.name}>{children}</AppShell>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Memuat workspace...</div>}>
      <DashboardShellWithChildren>{children}</DashboardShellWithChildren>
    </Suspense>
  );
}