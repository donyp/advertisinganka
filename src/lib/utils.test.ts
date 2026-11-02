import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });
  it("handles conditional", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });
  it("dedupes tailwind conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});