import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostDetail } from "@/components/features/post-detail";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const workspace = await getWorkspace();
  if (!workspace) return null;
  const { id } = await params;
  const post = await prisma.post.findFirst({
    where: { id, workspaceId: workspace.id },
    include: { platforms: { include: { account: true } }, media: { include: { asset: true } } },
  });
  if (!post) return <div>Not found</div>;
  return <PostDetail post={post} />;
}