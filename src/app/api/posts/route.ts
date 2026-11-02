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
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const posts = await prisma.post.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      include: { platforms: true, media: { include: { asset: true } } },
    });
    return NextResponse.json(posts);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const d = parsed.data;
    const scheduledAt = d.scheduledAt ? new Date(d.scheduledAt) : null;

    // Only allow accounts & media that belong to this workspace.
    const [accounts, assets, brand] = await Promise.all([
      d.platformAccountIds.length
        ? prisma.socialAccount.findMany({
            where: { id: { in: d.platformAccountIds }, workspaceId: workspace.id },
          })
        : Promise.resolve([]),
      d.mediaIds.length
        ? prisma.mediaAsset.findMany({
            where: { id: { in: d.mediaIds }, workspaceId: workspace.id },
          })
        : Promise.resolve([]),
      d.brandId
        ? prisma.brand.findFirst({ where: { id: d.brandId, workspaceId: workspace.id } })
        : Promise.resolve(null),
    ]);

    const post = await prisma.post.create({
      data: {
        workspaceId: workspace.id,
        brandId: brand?.id ?? null,
        title: d.title,
        caption: d.caption,
        status: d.status,
        scheduledAt,
        notes: d.notes,
        platforms: {
          create: accounts.map((a) => ({
            accountId: a.id,
            platform: a.platform,
            content: d.caption,
            status: d.status,
            scheduledAt,
          })),
        },
        media: {
          create: assets.map((asset, i) => ({ assetId: asset.id, order: i })),
        },
      },
      include: { platforms: true },
    });

    return NextResponse.json(post);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}