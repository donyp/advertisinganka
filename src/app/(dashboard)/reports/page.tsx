import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportsView } from "@/components/features/reports-view";

export default async function ReportsPage() {
  const workspace = await getWorkspace();
  if (!workspace) return null;
  const reports = await prisma.report.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" } });
  return <ReportsView reports={reports as any} />;
}