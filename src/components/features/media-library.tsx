"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

type Asset = { id: string; name: string; url: string; type: string; tags: string[]; createdAt: string };

export function MediaLibrary({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body: form });
      if (!res.ok) toast.error(`Gagal upload ${file.name}`);
    }
    setUploading(false);
    router.refresh();
    toast.success("Upload selesai");
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const filtered = assets.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Cari media..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((a) => (
          <Card key={a.id} className="overflow-hidden group relative">
            <CardContent className="p-0">
              {a.type === "image" ? (
                <img src={a.url} alt={a.name} className="w-full h-32 object-cover" />
              ) : (
                <video src={a.url} className="w-full h-32 object-cover" />
              )}
              <div className="p-2">
                <div className="text-xs truncate">{a.name}</div>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-sm text-muted-foreground">Belum ada media.</p>}
    </div>
  );
}