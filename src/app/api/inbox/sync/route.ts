import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdapter } from "@/lib/platforms";
import { decrypt } from "@/lib/crypto";

export async function POST() {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await prisma.socialAccount.findMany({ where: { workspaceId: workspace.id, status: "ACTIVE" } });
  let added = 0;
  for (const acc of accounts) {
    try {
      const adapter = getAdapter(acc.platform);
      const token = decrypt(acc.accessToken);
      const items = await adapter.fetchInbox(token);
      for (const it of items) {
        try {
          await prisma.inboxMessage.upsert({
            where: { workspaceId_platform_externalId: { workspaceId: workspace.id, platform: acc.platform, externalId: it.externalId } },
            update: {},
            create: {
              workspaceId: workspace.id,
              accountId: acc.id,
              platform: acc.platform,
              type: it.type,
              externalId: it.externalId,
              authorName: it.authorName,
              authorAvatar: it.authorAvatar,
              content: it.content,
              permalink: it.permalink,
              receivedAt: it.receivedAt,
            },
          });
          added++;
        } catch {}
      }
    } catch {}
  }
  return NextResponse.json({ added });
}