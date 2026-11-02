"use client";

import { useState, useMemo } from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Post = {
  id: string;
  title: string | null;
  caption: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  platforms: { platform: string }[];
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-gray-200 text-gray-800",
  IN_REVIEW: "bg-yellow-200 text-yellow-800",
  APPROVED: "bg-blue-200 text-blue-800",
  SCHEDULED: "bg-purple-200 text-purple-800",
  PUBLISHED: "bg-green-200 text-green-800",
  FAILED: "bg-red-200 text-red-800",
};

export function CalendarView({ posts }: { posts: Post[] }) {
  const [current, setCurrent] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(current), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(current), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [current]);

  const postsByDay = useMemo(() => {
    const map: Record<string, Post[]> = {};
    for (const p of posts) {
      const d = p.scheduledAt || p.publishedAt;
      if (!d) continue;
      const key = format(new Date(d), "yyyy-MM-dd");
      (map[key] ||= []).push(p);
    }
    return map;
  }, [posts]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrent(subMonths(current, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[160px] text-center">
            {format(current, "MMMM yyyy", { locale: idLocale })}
          </h2>
          <Button variant="outline" size="icon" onClick={() => setCurrent(addMonths(current, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrent(new Date())}>Hari ini</Button>
        </div>
        <Link href="/composer"><Button><Plus className="h-4 w-4 mr-1" /> Post Baru</Button></Link>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
        {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
          <div key={d} className="bg-muted px-2 py-2 text-xs font-medium text-center">{d}</div>
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayPosts = postsByDay[key] || [];
          return (
            <div
              key={key}
              className={cn(
                "bg-card min-h-[100px] p-1.5",
                !isSameMonth(day, current) && "bg-muted/40 text-muted-foreground"
              )}
            >
              <div className={cn("text-xs font-medium mb-1", isSameDay(day, new Date()) && "text-primary font-bold")}>
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayPosts.slice(0, 3).map((p) => (
                  <Link key={p.id} href={`/posts/${p.id}`}>
                    <div className={cn("text-[10px] px-1.5 py-0.5 rounded truncate", STATUS_COLOR[p.status] || "bg-gray-100")}>
                      {p.title || p.caption.slice(0, 20) || "Untitled"}
                    </div>
                  </Link>
                ))}
                {dayPosts.length > 3 && (
                  <div className="text-[10px] text-muted-foreground">+{dayPosts.length - 3} lagi</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(STATUS_COLOR).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1">
            <span className={cn("w-3 h-3 rounded", v)} />
            {k}
          </div>
        ))}
      </div>
    </div>
  );
}