import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountsManager } from "@/components/features/accounts-manager";

export default async function AccountsPage() {
  const workspace = await getWorkspace();
  if (!workspace) return null;
  const accounts = await prisma.socialAccount.findMany({ where: { workspaceId: workspace.id } });
  return <AccountsManager accounts={accounts as any} />;
}