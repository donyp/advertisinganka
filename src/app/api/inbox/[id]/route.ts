import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  await prisma.inboxMessage.updateMany({
    where: { id, workspaceId: workspace.id },
    data: { isRead: body.isRead ?? true, isReplied: body.isReplied, replyText: body.replyText },
  });
  return NextResponse.json({ ok: true });
}