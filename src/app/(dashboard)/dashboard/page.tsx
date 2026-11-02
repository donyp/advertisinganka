import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, PenSquare, BarChart3, Users } from "lucide-react";

export default async function DashboardPage() {
  const workspace = await getWorkspace();
  if (!workspace) return null;

  const [postCount, scheduledCount, accountCount, recentPosts] = await Promise.all([
    prisma.post.count({ where: { workspaceId: workspace.id } }),
    prisma.post.count({ where: { workspaceId: workspace.id, status: "SCHEDULED" } }),
    prisma.socialAccount.count({ where: { workspaceId: workspace.id } }),
    prisma.post.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { platforms: true },
    }),
  ]);

  const stats = [
    { label: "Total Posts", value: postCount, icon: PenSquare },
    { label: "Scheduled", value: scheduledCount, icon: Calendar },
    { label: "Connected Accounts", value: accountCount, icon: Users },
    { label: "Published", value: recentPosts.filter((p) => p.status === "PUBLISHED").length, icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/composer"><Button>Buat Post Baru</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada post. Mulai dengan membuat post baru.</p>
          ) : (
            <ul className="divide-y">
              {recentPosts.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.title || p.caption.slice(0, 60) || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.status} · {p.platforms.map((pp) => pp.platform).join(", ")}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{p.createdAt.toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}