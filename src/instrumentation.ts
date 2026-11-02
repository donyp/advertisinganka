/**
 * Optional in-process scheduler.
 *
 * Railway runs a persistent Node server (unlike serverless), so we can process
 * due posts every minute without an external cron. Enable with:
 *   ENABLE_INTERNAL_SCHEDULER=true
 *
 * If you scale to more than one replica, leave this disabled and use the
 * /api/cron/publish endpoint from an external scheduler instead.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.ENABLE_INTERNAL_SCHEDULER !== "true") return;

  const g = globalThis as typeof globalThis & { __publishScheduler?: boolean };
  if (g.__publishScheduler) return;
  g.__publishScheduler = true;

  const { processDuePosts } = await import("@/lib/publish-due");

  const run = async () => {
    try {
      const result = await processDuePosts();
      if (result.processed > 0) {
        console.log(`[scheduler] processed=${result.processed} published=${result.published}`);
      }
    } catch (e) {
      console.error("[scheduler] failed", e);
    }
  };

  setInterval(run, 60_000);
  void run();
  console.log("[scheduler] internal publish scheduler started");
}