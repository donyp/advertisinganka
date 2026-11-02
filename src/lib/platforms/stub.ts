import type { PlatformAdapter, PublishPayload, PublishResult, PlatformMetrics, AccountProfile } from "./types";
import type { Platform } from "@prisma/client";

export class GenericStubAdapter implements PlatformAdapter {
  platform: Platform;
  charLimit: number;

  constructor(platform: string) {
    this.platform = platform as Platform;
    const limits: Record<string, number> = {
      TIKTOK: 2200, X: 280, LINKEDIN: 3000, YOUTUBE: 5000, THREADS: 500, PINTEREST: 500,
    };
    this.charLimit = limits[platform] ?? 2000;
  }

  getAuthUrl(state: string, redirectUri: string): string {
    return `/api/oauth/${this.platform.toLowerCase()}/authorize?state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date; profile: AccountProfile }> {
    throw new Error(`${this.platform} OAuth not implemented yet. See src/lib/platforms/stub.ts`);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt?: Date }> {
    throw new Error(`${this.platform} refresh not implemented`);
  }

  async publish(payload: PublishPayload): Promise<PublishResult> {
    return { success: false, error: `${this.platform} publishing not implemented yet` };
  }

  async fetchMetrics(): Promise<PlatformMetrics> {
    return {};
  }

  async fetchInbox() {
    return [];
  }
}