import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function findOwnedPost(id: string, workspaceId: string) {
  return prisma.post.findFirst({ where: { id, workspaceId } });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const post = await prisma.post.findFirst({
      where: { id, workspaceId: workspace.id },
      include: { platforms: { include: { account: true } }, media: { include: { asset: true } }, comments: true },
    });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const owned = await findOwnedPost(id, workspace.id);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const post = await prisma.post.update({
      where: { id },
      data: {
        title: body.title,
        caption: body.caption,
        status: body.status,
        scheduledAt:
          body.scheduledAt === null ? null : body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        notes: body.notes,
      },
    });
    return NextResponse.json(post);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const owned = await findOwnedPost(id, workspace.id);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}