import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdapter } from "@/lib/platforms";
import { encrypt } from "@/lib/crypto";

export async function GET(req: Request, { params }: { params: Promise<{ platform: string }> }) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.redirect("/login");
  const { platform } = await params;
  const p = platform.toUpperCase();
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect("/accounts?error=no_code");

  const adapter = getAdapter(p);
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/${platform.toLowerCase()}/callback`;
  try {
    const result = await adapter.exchangeCode(code, redirectUri);
    await prisma.socialAccount.upsert({
      where: { workspaceId_platform_platformUserId: { workspaceId: workspace.id, platform: p as any, platformUserId: result.profile.platformUserId } },
      update: {
        accessToken: encrypt(result.accessToken),
        refreshToken: result.refreshToken ? encrypt(result.refreshToken) : null,
        tokenExpiresAt: result.expiresAt,
        username: result.profile.username,
        displayName: result.profile.displayName,
        avatarUrl: result.profile.avatarUrl,
        scopes: result.profile.scopes,
        status: "ACTIVE",
      },
      create: {
        workspaceId: workspace.id,
        platform: p as any,
        platformUserId: result.profile.platformUserId,
        username: result.profile.username,
        displayName: result.profile.displayName,
        avatarUrl: result.profile.avatarUrl,
        accessToken: encrypt(result.accessToken),
        refreshToken: result.refreshToken ? encrypt(result.refreshToken) : null,
        tokenExpiresAt: result.expiresAt,
        scopes: result.profile.scopes,
        status: "ACTIVE",
      },
    });
    return NextResponse.redirect("/accounts?connected=1");
  } catch (e: any) {
    return NextResponse.redirect(`/accounts?error=${encodeURIComponent(e.message)}`);
  }
}