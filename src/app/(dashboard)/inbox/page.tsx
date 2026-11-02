import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InboxView } from "@/components/features/inbox-view";

export default async function InboxPage() {
  const workspace = await getWorkspace();
  if (!workspace) return null;
  const messages = await prisma.inboxMessage.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { receivedAt: "desc" },
    take: 200,
  });
  return <InboxView messages={messages as any} />;
}