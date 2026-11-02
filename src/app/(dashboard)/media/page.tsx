import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MediaLibrary } from "@/components/features/media-library";

export default async function MediaPage() {
  const workspace = await getWorkspace();
  if (!workspace) return null;
  const assets = await prisma.mediaAsset.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" } });
  return <MediaLibrary assets={assets as any} />;
}