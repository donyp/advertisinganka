import type { PlatformAdapter } from "./types";
import { MetaAdapter } from "./meta";
// Stubs - implement per platform following MetaAdapter pattern
import { GenericStubAdapter } from "./stub";

const adapters: Partial<Record<string, PlatformAdapter>> = {};

export function getAdapter(platform: string): PlatformAdapter {
  if (!adapters[platform]) {
    if (platform === "INSTAGRAM" || platform === "FACEBOOK") {
      adapters[platform] = new MetaAdapter(platform as "INSTAGRAM" | "FACEBOOK");
    } else {
      adapters[platform] = new GenericStubAdapter(platform);
    }
  }
  return adapters[platform]!;
}

export const PLATFORM_META: Record<string, { label: string; charLimit: number; color: string }> = {
  INSTAGRAM: { label: "Instagram", charLimit: 2200, color: "#E4405F" },
  FACEBOOK: { label: "Facebook", charLimit: 63206, color: "#1877F2" },
  TIKTOK: { label: "TikTok", charLimit: 2200, color: "#000000" },
  X: { label: "X (Twitter)", charLimit: 280, color: "#000000" },
  LINKEDIN: { label: "LinkedIn", charLimit: 3000, color: "#0A66C2" },
  YOUTUBE: { label: "YouTube", charLimit: 5000, color: "#FF0000" },
  THREADS: { label: "Threads", charLimit: 500, color: "#000000" },
  PINTEREST: { label: "Pinterest", charLimit: 500, color: "#E60023" },
};