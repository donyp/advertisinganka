import { getWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default async function PostsPage() {
  const workspace = await getWorkspace();
  if (!workspace) return null;
  const posts = await prisma.post.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    include: { platforms: true, media: { include: { asset: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link href="/composer"><Button><Plus className="h-4 w-4 mr-1" /> Baru</Button></Link>
      </div>
      <div className="space-y-3">
        {posts.length === 0 && <p className="text-sm text-muted-foreground">Belum ada post.</p>}
        {posts.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{p.title || p.caption.slice(0, 60) || "Untitled"}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {p.platforms.map((pp) => pp.platform).join(", ") || "No platforms"} · {p.createdAt.toLocaleDateString()}
                  {p.scheduledAt && ` · Jadwal: ${p.scheduledAt.toLocaleString()}`}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge>{p.status}</Badge>
                <Link href={`/posts/${p.id}`}><Button variant="outline" size="sm">Detail</Button></Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}