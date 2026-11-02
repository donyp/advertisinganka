"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handle = async () => {
    setLoading(true);
    const res = await fetch("/api/analytics/sync", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      toast.success(`Synced ${data.updated} posts`);
      router.refresh();
    } else toast.error("Gagal sync");
  };
  return (
    <Button variant="outline" onClick={handle} disabled={loading}>
      <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Sync Analytics
    </Button>
  );
}