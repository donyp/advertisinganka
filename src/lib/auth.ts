import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Mirror user into Prisma
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email!, name: user.user_metadata?.name ?? user.email },
      create: { id: user.id, email: user.email!, name: user.user_metadata?.name ?? user.email },
    });

    return user;
  } catch (e) {
    console.error("[auth] getCurrentUser failed", e);
    return null;
  }
}

export async function getWorkspace() {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    let membership = await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
      include: { workspace: true },
    });

    if (!membership) {
      const ws = await prisma.workspace.create({
        data: {
          name: "My Workspace",
          slug: `ws-${user.id.slice(0, 8)}`,
          members: { create: { userId: user.id, role: "OWNER" } },
        },
      });
      membership = await prisma.workspaceMember.findFirst({
        where: { userId: user.id, workspaceId: ws.id },
        include: { workspace: true },
      });
    }

    return membership?.workspace ?? null;
  } catch (e) {
    console.error("[auth] getWorkspace failed", e);
    return null;
  }
}