import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarView } from "./calendar-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/calendar",
}));

describe("CalendarView", () => {
  it("renders month header", () => {
    render(<CalendarView posts={[]} />);
    // month name present (any of 12)
    expect(screen.getByText(/Hari ini/i)).toBeInTheDocument();
  });

  it("renders a post on its scheduled day", () => {
    const today = new Date();
    const iso = today.toISOString();
    render(
      <CalendarView
        posts={[
          { id: "1", title: "Test Post", caption: "cap", status: "SCHEDULED", scheduledAt: iso, publishedAt: null, platforms: [{ platform: "INSTAGRAM" }] },
        ]}
      />
    );
    expect(screen.getByText("Test Post")).toBeInTheDocument();
  });
});