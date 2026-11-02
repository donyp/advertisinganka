import type { Platform } from "@prisma/client";

export type PublishPayload = {
  accountId: string;
  accessToken: string;
  content: string;
  mediaUrls: string[];
  scheduledAt?: Date;
};

export type PublishResult = {
  success: boolean;
  platformPostId?: string;
  publishedUrl?: string;
  error?: string;
};

export type PlatformMetrics = {
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  reach?: number;
  impressions?: number;
  clicks?: number;
};

export type AccountProfile = {
  platformUserId: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  scopes?: string;
};

export interface PlatformAdapter {
  platform: Platform;
  /** Character limit for a single post on this platform */
  charLimit: number;
  /** OAuth authorization URL */
  getAuthUrl(state: string, redirectUri: string): string;
  /** Exchange code for tokens */
  exchangeCode(code: string, redirectUri: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    profile: AccountProfile;
  }>;
  /** Refresh access token */
  refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt?: Date }>;
  /** Publish a post now */
  publish(payload: PublishPayload): Promise<PublishResult>;
  /** Fetch metrics for a published post */
  fetchMetrics(accessToken: string, platformPostId: string): Promise<PlatformMetrics>;
  /** Fetch recent inbox items (comments/DMs) */
  fetchInbox(accessToken: string, since?: Date): Promise<Array<{
    externalId: string;
    type: "comment" | "dm" | "mention";
    authorName?: string;
    authorAvatar?: string;
    content: string;
    permalink?: string;
    receivedAt: Date;
  }>>;
}