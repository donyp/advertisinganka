import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getWorkspace } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

async function DashboardShellWithChildren({ children }: { children: React.ReactNode }) {
  const workspace = await getWorkspace();
  if (!workspace) redirect("/login");
  return <AppShell workspaceName={workspace.name}>{children}</AppShell>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Memuat workspace...</div>}>
      <DashboardShellWithChildren>{children}</DashboardShellWithChildren>
    </Suspense>
  );
}