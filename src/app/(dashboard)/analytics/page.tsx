import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SyncButton } from "@/components/features/sync-button";

export default async function AnalyticsPage() {
  const workspace = await getWorkspace();
  if (!workspace) return null;

  const platforms = await prisma.postPlatform.findMany({
    where: { post: { workspaceId: workspace.id } },
    include: { account: true },
  });

  const totals = platforms.reduce(
    (acc, p) => {
      const m = (p.metrics as any) || {};
      acc.likes += m.likes || 0;
      acc.comments += m.comments || 0;
      acc.shares += m.shares || 0;
      acc.reach += m.reach || 0;
      acc.impressions += m.impressions || 0;
      if (p.status === "PUBLISHED") acc.published++;
      return acc;
    },
    { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0, published: 0 }
  );

  const topPosts = platforms
    .filter((p) => p.status === "PUBLISHED")
    .sort((a, b) => ((b.metrics as any)?.likes || 0) - ((a.metrics as any)?.likes || 0))
    .slice(0, 5);

  const statCards = [
    { label: "Published Posts", value: totals.published },
    { label: "Total Likes", value: totals.likes },
    { label: "Total Comments", value: totals.comments },
    { label: "Total Shares", value: totals.shares },
    { label: "Total Reach", value: totals.reach },
    { label: "Impressions", value: totals.impressions },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <SyncButton />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{s.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Top Posts by Likes</CardTitle></CardHeader>
        <CardContent>
          {topPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data. Sync analytics dulu.</p>
          ) : (
            <ul className="divide-y">
              {topPosts.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between">
                  <div className="text-sm">{p.platform} · {((p.metrics as any)?.likes || 0)} likes</div>
                  <div className="text-xs text-muted-foreground">{new Date(p.publishedAt || p.createdAt).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}