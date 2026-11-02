"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLATFORM_META } from "@/lib/platforms";
import { toast } from "sonner";

type Account = { id: string; platform: string; username: string | null; displayName: string | null };
type Media = { id: string; name: string; url: string; type: string };

export function ComposerForm({ accounts, media }: { accounts: Account[]; media: Media[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [status, setStatus] = useState<"DRAFT" | "SCHEDULED">("DRAFT");
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleAccount = (id: string) => {
    setSelectedAccounts((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleMedia = (id: string) => {
    setSelectedMedia((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    if (!caption.trim() && selectedMedia.length === 0) {
      toast.error("Caption atau media harus diisi");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        caption,
        status,
        scheduledAt: status === "SCHEDULED" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
        platformAccountIds: selectedAccounts,
        mediaIds: selectedMedia,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(status === "SCHEDULED" ? "Post dijadwalkan" : "Draft disimpan");
      router.push("/posts");
      router.refresh();
    } else {
      toast.error("Gagal menyimpan post");
    }
  };

  // char counts per selected platform
  const selectedPlatforms = selectedAccounts.map((id) => accounts.find((a) => a.id === id)?.platform).filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Composer</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setStatus("DRAFT"); handleSave(); }} disabled={saving}>Simpan Draft</Button>
          <Button onClick={() => { setStatus("SCHEDULED"); handleSave(); }} disabled={saving || !scheduledAt}>
            {saving ? "Menyimpan..." : "Jadwalkan"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Judul (internal)</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul post" />
              </div>
              <div className="space-y-2">
                <Label>Caption</Label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={8}
                  placeholder="Tulis caption di sini..."
                />
                <div className="text-xs text-muted-foreground">
                  {caption.length} karakter
                  {selectedPlatforms.length > 0 && (
                    <span className="ml-2">
                      · Limit: {selectedPlatforms.map((p) => `${PLATFORM_META[p]?.label}: ${PLATFORM_META[p]?.charLimit}`).join(" | ")}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Media</CardTitle></CardHeader>
            <CardContent>
              {media.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada media. Upload di Media Library.</p>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {media.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMedia(m.id)}
                      className={`relative border rounded-md overflow-hidden ${selectedMedia.includes(m.id) ? "ring-2 ring-primary" : ""}`}
                    >
                      {m.type === "image" ? (
                        <img src={m.url} alt={m.name} className="w-full h-24 object-cover" />
                      ) : (
                        <video src={m.url} className="w-full h-24 object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Platforms</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {accounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Hubungkan akun di Social Accounts.</p>
              ) : (
                accounts.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedAccounts.includes(a.id)}
                      onCheckedChange={() => toggleAccount(a.id)}
                    />
                    <span className="text-sm">{PLATFORM_META[a.platform]?.label} · @{a.username}</span>
                  </label>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Scheduling</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {status === "SCHEDULED" && (
                <div className="space-y-2">
                  <Label>Tanggal & Waktu</Label>
                  <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}