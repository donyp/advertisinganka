"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AppShell({ workspaceName, children }: { workspaceName: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile topbar */}
        <header className="md:hidden border-b bg-card px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold">K</div>
            <div className="font-semibold text-sm">KPI Advertising Anka</div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <SheetContent side="left" className="p-0 w-64">
                <Sidebar onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Desktop topbar */}
        <div className="hidden md:flex border-b bg-card px-6 py-3 items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Workspace: <span className="font-medium text-foreground">{workspaceName}</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Mobile workspace label */}
        <div className="md:hidden px-4 py-2 border-b bg-muted/40 text-xs text-muted-foreground">
          Workspace: <span className="font-medium text-foreground">{workspaceName}</span>
        </div>

        <main className="flex-1 min-w-0 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}