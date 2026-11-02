import { NextResponse } from "next/server";
import { getWorkspace, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const assets = await prisma.mediaAsset.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(assets);
}

export async function POST(req: Request) {
  const workspace = await getWorkspace();
  const user = await getCurrentUser();
  if (!workspace || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const supabase = createAdminClient();
  const ext = file.name.split(".").pop();
  const path = `${workspace.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error: upErr } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: pub } = supabase.storage.from("media").getPublicUrl(path);

  const type = file.type.startsWith("video") ? "video" : "image";
  const asset = await prisma.mediaAsset.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      name: file.name,
      url: pub.publicUrl,
      type,
      mimeType: file.type,
      size: file.size,
      tags: [],
    },
  });
  return NextResponse.json(asset);
}