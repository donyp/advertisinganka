import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccountsManager } from "./accounts-manager";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
}));

describe("AccountsManager", () => {
  it("renders empty state", () => {
    render(<AccountsManager accounts={[]} />);
    expect(screen.getByText(/Belum ada akun terhubung/i)).toBeInTheDocument();
  });

  it("renders connected accounts", () => {
    render(
      <AccountsManager
        accounts={[
          { id: "1", platform: "INSTAGRAM", username: "anka", displayName: "Anka", avatarUrl: null, status: "ACTIVE" },
        ]}
      />
    );
    expect(screen.getByText(/@anka/)).toBeInTheDocument();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });
});