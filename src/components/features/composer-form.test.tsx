import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComposerForm } from "./composer-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
}));

describe("ComposerForm", () => {
  it("renders composer", () => {
    render(<ComposerForm accounts={[]} media={[]} />);
    expect(screen.getByText(/Composer/i)).toBeInTheDocument();
  });

  it("shows char count", () => {
    render(<ComposerForm accounts={[]} media={[]} />);
    expect(screen.getByText(/karakter/i)).toBeInTheDocument();
  });
});