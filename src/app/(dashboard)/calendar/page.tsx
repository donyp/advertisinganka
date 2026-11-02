import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalendarView } from "@/components/features/calendar-view";

export default async function CalendarPage() {
  const workspace = await getWorkspace();
  if (!workspace) return null;

  const posts = await prisma.post.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { scheduledAt: "asc" },
    include: { platforms: { select: { platform: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Content Calendar</h1>
      <CalendarView posts={posts as any} />
    </div>
  );
}