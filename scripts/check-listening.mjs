import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

// Build with NODE_OPTIONS='--import=./scripts/fixtures/listening-feed.mjs' pnpm run build.
// Run with Playwright available (or PLAYWRIGHT_MODULE set to its entry point).
const require = createRequire(import.meta.url);
const { preview } = await import(require.resolve("vite", { paths: [require.resolve("vitest")] }));
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const outDir = [".vercel/output/static", "dist/client"].find((dir) =>
  existsSync(`${dir}/now/index.html`),
);
assert.ok(outDir, "Build the site before checking listening updates.");

const server = await preview({
  configFile: false,
  build: { outDir },
  preview: { host: "127.0.0.1", port: 0, open: false },
});
let browser;
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  console.log("Browser started; checking the built /now page.");
  const baseURL = server.resolvedUrls.local[0];
  const current = {
    trackName: "Played after the site was built",
    artists: [{ artistName: "Live feed artist" }],
    playedTime: new Date().toISOString(),
  };
  const record = { uri: "at://did:plc:test/fm.teal.feed.play/new-play", value: current };
  const failures = [];

  for (const feedFails of [false, true]) {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let releaseFeed;
    const feedReady = new Promise((resolve) => { releaseFeed = resolve; });
    await context.route("https://**/*", async (route) => {
      const url = new URL(route.request().url());
      const isPlayFeed = url.searchParams.get("collection") === "fm.teal.feed.play";
      if (isPlayFeed) await feedReady;
      await route.fulfill({
        status: isPlayFeed && feedFails && url.searchParams.get("limit") !== "100" ? 503 : 200,
        json: { records: isPlayFeed ? [record] : [] },
      });
    });
    await context.route("**/api/track-artwork?**", (route) => route.fulfill({ json: { cover: null } }));
    await page.goto(`${baseURL}now/`, { waitUntil: "domcontentloaded" });
    console.log(`Checking ${feedFails ? "failed" : "successful"} feed refresh.`);
    const listening = page.locator(".rn-item").filter({ hasText: "Listening" }).locator(".rn-title");
    const recent = page.locator(".recent-list .name").first();
    const initialTrack = await listening.textContent();
    const initialRecent = await recent.textContent();
    assert.ok(initialTrack && initialRecent, "The build must seed listening data to reproduce staleness.");
    assert.notEqual(initialTrack, current.trackName);
    releaseFeed();

    if (feedFails) {
      await page.waitForLoadState("networkidle");
      assert.equal(await listening.textContent(), initialTrack, "Keep the listening seed on feed failure.");
      assert.equal(await recent.textContent(), initialRecent, "Keep recent plays on feed failure.");
    } else {
      await page.locator(".np-track").filter({ hasText: current.trackName }).waitFor();
      for (const [label, locator] of [["Listening", listening], ["Recently Played", recent]]) {
        try {
          await locator.filter({ hasText: current.trackName }).waitFor({ timeout: 3000 });
        } catch {
          failures.push(`${label} kept its build-time value: ${await locator.textContent()}`);
        }
      }
    }
    assert.deepEqual(errors, [], "Listening updates must not raise browser errors.");
    await context.close();
  }
  assert.deepEqual(failures, [], "The /now widgets must refresh just as the banner does.");
  console.log("Listening and recent plays refresh from the live feed; failed refreshes keep the build-time content.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  server.httpServer.closeAllConnections();
  await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
}
