import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().optional(),
  caption: z.string().default(""),
  brandId: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "IN_REVIEW", "APPROVED", "SCHEDULED"]).default("DRAFT"),
  scheduledAt: z.string().optional().nullable(),
  platformAccountIds: z.array(z.string()).default([]),
  mediaIds: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export async function GET() {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.post.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    include: { platforms: true, media: { include: { asset: true } } },
  });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const post = await prisma.post.create({
    data: {
      workspaceId: workspace.id,
      brandId: d.brandId || null,
      title: d.title,
      caption: d.caption,
      status: d.status,
      scheduledAt: d.scheduledAt ? new Date(d.scheduledAt) : null,
      notes: d.notes,
      platforms: {
        create: d.platformAccountIds.map((aid) => ({
          accountId: aid,
          platform: "INSTAGRAM", // placeholder; resolved below
          content: d.caption,
          status: d.status,
          scheduledAt: d.scheduledAt ? new Date(d.scheduledAt) : null,
        })),
      },
      media: {
        create: d.mediaIds.map((mid, i) => ({ assetId: mid, order: i })),
      },
    },
    include: { platforms: true },
  });

  // Fix platform field per account
  if (d.platformAccountIds.length) {
    const accounts = await prisma.socialAccount.findMany({ where: { id: { in: d.platformAccountIds } } });
    await Promise.all(
      post.platforms.map((pp) => {
        const acc = accounts.find((a) => a.id === pp.accountId);
        if (acc) return prisma.postPlatform.update({ where: { id: pp.id }, data: { platform: acc.platform } });
        return null;
      })
    );
  }

  return NextResponse.json(post);
}