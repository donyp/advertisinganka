"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Terjadi kesalahan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{error.message || "Unknown error"}</p>
        <Button onClick={reset}>Coba lagi</Button>
      </CardContent>
    </Card>
  );
}