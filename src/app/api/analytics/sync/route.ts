import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdapter } from "@/lib/platforms";
import { decrypt } from "@/lib/crypto";

export async function POST() {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const platforms = await prisma.postPlatform.findMany({
    where: { post: { workspaceId: workspace.id }, status: "PUBLISHED", platformPostId: { not: null } },
    include: { account: true },
  });

  let updated = 0;
  for (const pp of platforms) {
    try {
      const adapter = getAdapter(pp.platform);
      const token = decrypt(pp.account.accessToken);
      const metrics = await adapter.fetchMetrics(token, pp.platformPostId!);
      await prisma.postPlatform.update({
        where: { id: pp.id },
        data: { metrics: metrics as any, metricsUpdatedAt: new Date() },
      });
      updated++;
    } catch {
      // ignore
    }
  }
  return NextResponse.json({ updated });
}