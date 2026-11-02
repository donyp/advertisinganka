"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

type Msg = {
  id: string; platform: string; type: string; authorName: string | null; content: string;
  isRead: boolean; isReplied: boolean; receivedAt: string; permalink: string | null;
};

export function InboxView({ messages }: { messages: Msg[] }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const sync = async () => {
    setSyncing(true);
    const res = await fetch("/api/inbox/sync", { method: "POST" });
    setSyncing(false);
    if (res.ok) { toast.success("Synced"); router.refresh(); } else toast.error("Gagal sync");
  };

  const markRead = async (id: string) => {
    await fetch(`/api/inbox/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead: true }) });
    router.refresh();
  };

  const list = filter === "unread" ? messages.filter((m) => !m.isRead) : messages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Unified Inbox</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setFilter(filter === "all" ? "unread" : "all")}>
            {filter === "all" ? "Show Unread" : "Show All"}
          </Button>
          <Button variant="outline" onClick={sync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? "animate-spin" : ""}`} /> Sync
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {list.length === 0 && <p className="text-sm text-muted-foreground">Tidak ada pesan.</p>}
        {list.map((m) => (
          <Card key={m.id} className={!m.isRead ? "border-primary" : ""}>
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">{m.platform}</Badge>
                  <Badge variant="outline">{m.type}</Badge>
                  <span className="text-sm font-medium">{m.authorName || "Unknown"}</span>
                  <span className="text-xs text-muted-foreground">{new Date(m.receivedAt).toLocaleString()}</span>
                </div>
                <p className="text-sm">{m.content}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!m.isRead && (
                  <Button variant="ghost" size="icon" onClick={() => markRead(m.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Implementasi fetch inbox penuh tersedia sebagai stub. Hubungkan platform yang support (Meta) untuk data real.</p>
    </div>
  );
}