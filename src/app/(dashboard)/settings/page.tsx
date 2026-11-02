import { getWorkspace, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const workspace = await getWorkspace();
  const user = await getCurrentUser();
  if (!workspace || !user) return null;
  const brands = await prisma.brand.findMany({ where: { workspaceId: workspace.id } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div><span className="text-muted-foreground">Nama:</span> {user.user_metadata?.name || user.email}</div>
          <div><span className="text-muted-foreground">Email:</span> {user.email}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Workspace</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div><span className="text-muted-foreground">Nama:</span> {workspace.name}</div>
          <div><span className="text-muted-foreground">Slug:</span> {workspace.slug}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Brands</CardTitle></CardHeader>
        <CardContent>
          {brands.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada brand. Tambah via DB/API.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {brands.map((b) => <li key={b.id}>{b.name}</li>)}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Environment</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <div>Pastikan env vars diisi: Supabase URL/keys, DATABASE_URL, DIRECT_URL, ENCRYPTION_KEY, dan OAuth credentials platform.</div>
          <div>Bucket Supabase Storage yang dibutuhkan: <code>media</code>, <code>reports</code> (public).</div>
          <div>Vercel Cron untuk auto-publish: set di vercel.json (sudah disediakan) memanggil /api/cron/publish.</div>
        </CardContent>
      </Card>
    </div>
  );
}