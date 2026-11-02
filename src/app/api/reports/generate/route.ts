import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, type, periodStart, periodEnd } = body;
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  const posts = await prisma.post.findMany({
    where: { workspaceId: workspace.id, createdAt: { gte: start, lte: end } },
    include: { platforms: true },
  });

  const rows = [
    ["Title", "Status", "Platforms", "Scheduled", "Published", "Likes", "Comments", "Shares"],
    ...posts.map((p) => [
      (p.title || p.caption.slice(0, 40)).replace(/,/g, " "),
      p.status,
      p.platforms.map((pp) => pp.platform).join(";"),
      p.scheduledAt?.toISOString() || "",
      p.publishedAt?.toISOString() || "",
      String(p.platforms.reduce((s, pp) => s + ((pp.metrics as any)?.likes || 0), 0)),
      String(p.platforms.reduce((s, pp) => s + ((pp.metrics as any)?.comments || 0), 0)),
      String(p.platforms.reduce((s, pp) => s + ((pp.metrics as any)?.shares || 0), 0)),
    ]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");

  const admin = createAdminClient();
  const path = `${workspace.id}/${Date.now()}-${name.replace(/\s+/g, "_")}.csv`;
  const { error: upErr } = await admin.storage.from("reports").upload(path, csv, { contentType: "text/csv", upsert: true });
  let fileUrl: string | null = null;
  if (!upErr) {
    const { data } = admin.storage.from("reports").getPublicUrl(path);
    fileUrl = data.publicUrl;
  }

  const report = await prisma.report.create({
    data: {
      workspaceId: workspace.id,
      name,
      type,
      periodStart: start,
      periodEnd: end,
      fileUrl,
      status: fileUrl ? "ready" : "failed",
    },
  });

  return NextResponse.json(report);
}