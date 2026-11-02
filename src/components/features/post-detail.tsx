"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Post = any;

export function PostDetail({ post }: { post: Post }) {
  const router = useRouter();
  const [status, setStatus] = useState(post.status);
  const [caption, setCaption] = useState(post.caption);
  const [saving, setSaving] = useState(false);

  const update = async (patch: any) => {
    setSaving(true);
    const res = await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Tersimpan");
      router.refresh();
    } else toast.error("Gagal");
  };

  const publishNow = async () => {
    // mark publishing then call publish endpoint
    await update({ status: "PUBLISHING" });
    const res = await fetch(`/api/posts/${post.id}/publish`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      toast.success("Publish selesai");
    } else {
      toast.error(data.error || "Gagal publish");
    }
    router.refresh();
  };

  const deletePost = async () => {
    if (!confirm("Hapus post ini?")) return;
    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    router.push("/posts");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{post.title || "Post Detail"}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => update({ caption, status })} disabled={saving}>Simpan</Button>
          <Button onClick={publishNow} disabled={saving}>Publish Sekarang</Button>
          <Button variant="destructive" onClick={deletePost}>Hapus</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Caption</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={10} />
            </CardContent>
          </Card>
          {post.media?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Media</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-3 gap-2">
                {post.media.map((m: any) => (
                  <img key={m.id} src={m.asset.url} alt="" className="w-full h-32 object-cover rounded" />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Badge>{status}</Badge>
              <div className="text-sm text-muted-foreground">
                Platforms: {post.platforms.map((p: any) => p.platform).join(", ")}
              </div>
              {post.scheduledAt && <div className="text-sm">Jadwal: {new Date(post.scheduledAt).toLocaleString()}</div>}
              {post.publishedAt && <div className="text-sm">Published: {new Date(post.publishedAt).toLocaleString()}</div>}
              {post.platforms.map((p: any) => p.errorMessage && (
                <div key={p.id} className="text-xs text-destructive">{p.platform}: {p.errorMessage}</div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Per-Platform Status</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {post.platforms.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.platform}</span>
                  <Badge variant={p.status === "PUBLISHED" ? "default" : "secondary"}>{p.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}