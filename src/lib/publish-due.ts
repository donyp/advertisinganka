import { prisma } from "@/lib/prisma";
import { getAdapter } from "@/lib/platforms";
import { decrypt } from "@/lib/crypto";

/**
 * Publish every PostPlatform that is due. Safe to call repeatedly.
 * Returns counts for observability.
 */
export async function processDuePosts() {
  const now = new Date();
  const due = await prisma.postPlatform.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
      post: { status: { in: ["SCHEDULED", "APPROVED"] } },
    },
    include: { account: true, post: { include: { media: { include: { asset: true } } } } },
  });

  let published = 0;
  for (const pp of due) {
    try {
      // Claim the job atomically-ish so two workers don't publish twice.
      const claimed = await prisma.postPlatform.updateMany({
        where: { id: pp.id, status: "SCHEDULED" },
        data: { status: "PUBLISHING" },
      });
      if (claimed.count === 0) continue;

      const adapter = getAdapter(pp.platform);
      const token = decrypt(pp.account.accessToken);
      const mediaUrls = pp.post.media.map((m) => m.asset.url);
      const res = await adapter.publish({
        accountId: pp.accountId,
        accessToken: token,
        content: pp.content || pp.post.caption,
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
        },
      });
      if (res.success) published++;
    } catch (e: any) {
      await prisma.postPlatform
        .update({ where: { id: pp.id }, data: { status: "FAILED", errorMessage: e.message } })
        .catch(() => {});
    }
  }

  // Update parent post status based on its platform rows.
  const parentIds = [...new Set(due.map((d) => d.postId))];
  for (const pid of parentIds) {
    const pps = await prisma.postPlatform.findMany({ where: { postId: pid } });
    if (pps.length === 0) continue;
    const allPub = pps.every((p) => p.status === "PUBLISHED");
    const anyFail = pps.some((p) => p.status === "FAILED");
    await prisma.post.update({
      where: { id: pid },
      data: {
        status: allPub ? "PUBLISHED" : anyFail ? "FAILED" : "SCHEDULED",
        publishedAt: allPub ? new Date() : null,
      },
    });
  }

  return { processed: due.length, published };
}