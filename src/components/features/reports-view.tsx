"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Plus } from "lucide-react";

type Report = { id: string; name: string; type: string; periodStart: string; periodEnd: string; fileUrl: string | null; status: string; createdAt: string };

export function ReportsView({ reports }: { reports: Report[] }) {
  const router = useRouter();
  const [name, setName] = useState("Weekly Report");
  const [type, setType] = useState("weekly");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!start || !end) { toast.error("Pilih periode"); return; }
    setLoading(true);
    const res = await fetch("/api/reports/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, periodStart: start, periodEnd: end }),
    });
    setLoading(false);
    if (res.ok) { toast.success("Report dibuat"); router.refresh(); } else toast.error("Gagal");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <Card>
        <CardHeader><CardTitle>Generate Report</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="space-y-2">
            <Label>Nama</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tipe</Label>
            <Select value={type} onValueChange={(v) => setType(v ?? "weekly")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Start</Label>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>End</Label>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <Button onClick={generate} disabled={loading}>
            <Plus className="h-4 w-4 mr-1" /> {loading ? "Generating..." : "Generate"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Reports</CardTitle></CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada report.</p>
          ) : (
            <ul className="divide-y">
              {reports.map((r) => (
                <li key={r.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.type} · {new Date(r.periodStart).toLocaleDateString()} - {new Date(r.periodEnd).toLocaleDateString()} · {r.status}
                    </div>
                  </div>
                  {r.fileUrl && (
                    <a href={r.fileUrl} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> CSV</Button>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}