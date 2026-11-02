import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { InboxView } from "./inbox-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
}));

describe("InboxView", () => {
  it("renders empty state", () => {
    render(<InboxView messages={[]} />);
    expect(screen.getByText(/Tidak ada pesan/i)).toBeInTheDocument();
  });

  it("renders messages", () => {
    render(
      <InboxView
        messages={[
          {
            id: "1",
            platform: "INSTAGRAM",
            type: "comment",
            authorName: "Alice",
            content: "Nice post!",
            isRead: false,
            isReplied: false,
            receivedAt: new Date().toISOString(),
            permalink: null,
          },
        ]}
      />
    );
    expect(screen.getByText("Nice post!")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});