import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaLibrary } from "./media-library";

// mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
}));

describe("MediaLibrary", () => {
  it("renders empty state when no assets", () => {
    render(<MediaLibrary assets={[]} />);
    expect(screen.getByText(/Belum ada media/i)).toBeInTheDocument();
  });

  it("renders assets grid", () => {
    render(
      <MediaLibrary
        assets={[
          { id: "1", name: "photo.jpg", url: "http://x/photo.jpg", type: "image", tags: [], createdAt: new Date().toISOString() },
        ]}
      />
    );
    expect(screen.getByAltText("photo.jpg")).toBeInTheDocument();
  });
});