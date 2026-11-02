import { describe, it, expect } from "vitest";
import { getAdapter, PLATFORM_META } from "./index";

describe("platforms", () => {
  it("returns MetaAdapter for INSTAGRAM/FACEBOOK", () => {
    const ig = getAdapter("INSTAGRAM");
    const fb = getAdapter("FACEBOOK");
    expect(ig.platform).toBe("INSTAGRAM");
    expect(fb.platform).toBe("FACEBOOK");
    expect(ig.charLimit).toBe(2200);
    expect(fb.charLimit).toBe(63206);
  });

  it("returns stub for unimplemented platforms", () => {
    const tiktok = getAdapter("TIKTOK");
    expect(tiktok.platform).toBe("TIKTOK");
    expect(tiktok.charLimit).toBe(2200);
  });

  it("caches adapter instances", () => {
    const a = getAdapter("X");
    const b = getAdapter("X");
    expect(a).toBe(b);
  });

  it("PLATFORM_META has all platforms", () => {
    const platforms = ["INSTAGRAM", "FACEBOOK", "TIKTOK", "X", "LINKEDIN", "YOUTUBE", "THREADS", "PINTEREST"];
    for (const p of platforms) {
      expect(PLATFORM_META[p]).toBeDefined();
      expect(PLATFORM_META[p].label).toBeTruthy();
      expect(PLATFORM_META[p].charLimit).toBeGreaterThan(0);
    }
  });

  it("X has 280 char limit", () => {
    expect(PLATFORM_META.X.charLimit).toBe(280);
  });

  it("stub publish returns not implemented", async () => {
    const adapter = getAdapter("TIKTOK");
    const res = await adapter.publish({ accountId: "a", accessToken: "t", content: "hi", mediaUrls: [] });
    expect(res.success).toBe(false);
    expect(res.error).toContain("not implemented");
  });

  it("stub exchangeCode throws", async () => {
    const adapter = getAdapter("TIKTOK");
    await expect(adapter.exchangeCode("code", "uri")).rejects.toThrow(/not implemented/);
  });
});