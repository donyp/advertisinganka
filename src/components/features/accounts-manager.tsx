"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { PLATFORM_META } from "@/lib/platforms";

type Account = {
  id: string;
  platform: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  status: string;
};

export function AccountsManager({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  };

  const platforms = Object.keys(PLATFORM_META);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Social Accounts</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada akun terhubung.</p>
          ) : (
            <div className="space-y-3">
              {accounts.map((a) => (
                <div key={a.id} className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center gap-3">
                    {a.avatarUrl && <img src={a.avatarUrl} alt="" className="h-8 w-8 rounded-full" />}
                    <div>
                      <div className="font-medium">{a.displayName || a.username}</div>
                      <div className="text-xs text-muted-foreground">{PLATFORM_META[a.platform]?.label || a.platform} · @{a.username}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={a.status === "ACTIVE" ? "default" : "destructive"}>{a.status}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(a.id)}
                      disabled={deleting === a.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connect New Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platforms.map((p) => (
              <a key={p} href={`/api/oauth/${p.toLowerCase()}/authorize`}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Plus className="h-4 w-4" />
                  {PLATFORM_META[p].label}
                </Button>
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Saat ini implementasi penuh tersedia untuk Instagram & Facebook (Meta). Platform lain ditandai sebagai stub dan akan ditambahkan bertahap.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}