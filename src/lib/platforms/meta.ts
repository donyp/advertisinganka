import type { PlatformAdapter, PublishPayload, PublishResult, PlatformMetrics, AccountProfile } from "./types";

export class MetaAdapter implements PlatformAdapter {
  platform: any;
  charLimit: number;

  constructor(platform: "INSTAGRAM" | "FACEBOOK") {
    this.platform = platform;
    this.charLimit = platform === "INSTAGRAM" ? 2200 : 63206;
  }

  getAuthUrl(state: string, redirectUri: string): string {
    const scopes =
      this.platform === "INSTAGRAM"
        ? "instagram_basic,instagram_content_publish,instagram_manage_insights,pages_show_list,pages_read_engagement"
        : "pages_manage_posts,pages_read_engagement,pages_show_list";
    const params = new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: "code",
      state,
    });
    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string) {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    // Long-lived token
    const ll = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${data.access_token}`
    );
    const llData = await ll.json();
    const accessToken = llData.access_token || data.access_token;
    const expiresAt = llData.expires_in ? new Date(Date.now() + llData.expires_in * 1000) : undefined;

    // Fetch profile
    const me = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,picture&access_token=${accessToken}`);
    const meData = await me.json();

    return {
      accessToken,
      refreshToken: undefined,
      expiresAt,
      profile: {
        platformUserId: meData.id,
        username: meData.name,
        displayName: meData.name,
        avatarUrl: meData.picture?.data?.url,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    // Meta uses long-lived tokens; refresh via exchange again not typical. Return as-is.
    return { accessToken: refreshToken };
  }

  async publish(payload: PublishPayload): Promise<PublishResult> {
    try {
      if (this.platform === "FACEBOOK") {
        const res = await fetch(`https://graph.facebook.com/v19.0/me/feed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: payload.content,
            access_token: payload.accessToken,
          }),
        });
        const data = await res.json();
        if (data.error) return { success: false, error: data.error.message };
        return { success: true, platformPostId: data.id, publishedUrl: `https://facebook.com/${data.id}` };
      }
      // Instagram requires container flow (simplified here)
      return { success: false, error: "Instagram publishing requires media container flow - implement per use case" };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async fetchMetrics(accessToken: string, platformPostId: string): Promise<PlatformMetrics> {
    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${platformPostId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${accessToken}`);
      const data = await res.json();
      return {
        likes: data.likes?.summary?.total_count,
        comments: data.comments?.summary?.total_count,
        shares: data.shares?.count,
      };
    } catch {
      return {};
    }
  }

  async fetchInbox(accessToken: string, since?: Date) {
    // Simplified: fetch page comments
    return [];
  }
}