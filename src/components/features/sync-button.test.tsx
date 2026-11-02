import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SyncButton } from "./sync-button";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
}));

describe("SyncButton", () => {
  it("renders label", () => {
    render(<SyncButton />);
    expect(screen.getByText(/Sync Analytics/i)).toBeInTheDocument();
  });
});