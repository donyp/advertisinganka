import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdapter } from "@/lib/platforms";
import { decrypt } from "@/lib/crypto";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const post = await prisma.post.findFirst({
    where: { id, workspaceId: workspace.id },
    include: { platforms: { include: { account: true } }, media: { include: { asset: true } } },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mediaUrls = post.media.map((m) => m.asset.url);

  const results = await Promise.all(
    post.platforms.map(async (pp) => {
      const adapter = getAdapter(pp.platform);
      const token = decrypt(pp.account.accessToken);
      const res = await adapter.publish({
        accountId: pp.accountId,
        accessToken: token,
        content: pp.content || post.caption,
        mediaUrls,
      });
      await prisma.postPlatform.update({
        where: { id: pp.id },
        data: {
          status: res.success ? "PUBLISHED" : "FAILED",
          publishedAt: res.success ? new Date() : null,
          publishedUrl: res.publishedUrl,
          platformPostId: res.platformPostId,
          errorMessage: res.error,
          metrics: res.success ? {} : undefined,
        },
      });
      return { platform: pp.platform, ...res };
    })
  );

  const allSuccess = results.every((r) => r.success);
  await prisma.post.update({
    where: { id },
    data: {
      status: allSuccess ? "PUBLISHED" : "FAILED",
      publishedAt: allSuccess ? new Date() : null,
    },
  });

  return NextResponse.json({ results });
}