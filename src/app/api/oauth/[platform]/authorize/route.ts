import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/auth";
import { getAdapter } from "@/lib/platforms";

export async function GET(req: Request, { params }: { params: Promise<{ platform: string }> }) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { platform } = await params;
  const p = platform.toUpperCase();
  if (p !== "INSTAGRAM" && p !== "FACEBOOK") {
    return NextResponse.json({ error: `${p} OAuth not implemented yet` }, { status: 501 });
  }
  const adapter = getAdapter(p);
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/${platform.toLowerCase()}/callback`;
  const state = `${workspace.id}:${Math.random().toString(36).slice(2)}`;
  const url = adapter.getAuthUrl(state, redirectUri);
  const res = NextResponse.redirect(url);
  res.cookies.set("oauth_state", state, { httpOnly: true, path: "/", maxAge: 600 });
  res.cookies.set("oauth_platform", p, { httpOnly: true, path: "/", maxAge: 600 });
  return res;
}