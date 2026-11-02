import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const post = await prisma.post.findFirst({
    where: { id, workspaceId: workspace.id },
    include: { platforms: { include: { account: true } }, media: { include: { asset: true } }, comments: true },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const post = await prisma.post.update({
    where: { id },
    data: {
      title: body.title,
      caption: body.caption,
      status: body.status,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : body.scheduledAt === null ? null : undefined,
      notes: body.notes,
    },
  });
  return NextResponse.json(post);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}