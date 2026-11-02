import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdapter } from "@/lib/platforms";
import { decrypt } from "@/lib/crypto";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      await prisma.postPlatform.update({ where: { id: pp.id }, data: { status: "PUBLISHING" } });
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
      await prisma.postPlatform.update({ where: { id: pp.id }, data: { status: "FAILED", errorMessage: e.message } });
    }
  }

  // Update parent posts
  const parentIds = [...new Set(due.map((d) => d.postId))];
  for (const pid of parentIds) {
    const pps = await prisma.postPlatform.findMany({ where: { postId: pid } });
    const allPub = pps.every((p) => p.status === "PUBLISHED");
    const anyFail = pps.some((p) => p.status === "FAILED");
    await prisma.post.update({
      where: { id: pid },
      data: { status: allPub ? "PUBLISHED" : anyFail ? "FAILED" : "SCHEDULED", publishedAt: allPub ? new Date() : null },
    });
  }

  return NextResponse.json({ processed: due.length, published });
}