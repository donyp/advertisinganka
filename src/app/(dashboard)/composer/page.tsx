import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ComposerForm } from "@/components/features/composer-form";

export default async function ComposerPage() {
  const workspace = await getWorkspace();
  if (!workspace) return null;
  const [accounts, media] = await Promise.all([
    prisma.socialAccount.findMany({ where: { workspaceId: workspace.id } }),
    prisma.mediaAsset.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" } }),
  ]);
  return <ComposerForm accounts={accounts as any} media={media as any} />;
}