import { test as base, expect } from "@playwright/test";

// Exercise the existing privacy opt-out rather than changing live analytics.
// An isolated opt-in run can still verify analytics via SMOKE_ANALYTICS_ENABLED=1.
export const test = base.extend<{ privacyPreference: void }>({
  privacyPreference: [async ({ context, page, baseURL }, use) => {
    // Own page setup first so route handlers drain before Playwright closes it.
    void page;
    // Production keeps upgrade-insecure-requests. This loopback server has no
    // TLS listener, so remove only that directive from local navigation headers.
    // APIRequestContext still reads the original policy for the CSP smoke check.
    if (baseURL && baseURL.startsWith("http://") && ["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname)) {
      // Fixture QA must never follow third-party analytics/provider traffic.
      await context.route("**/*", route => {
        const url = new URL(route.request().url());
        return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || ["data:","blob:"].includes(url.protocol)
          ? route.fallback() : route.abort();
      });
      await context.route(`${new URL(baseURL).origin}/**`, async route => {
        if (route.request().resourceType() !== "document" || route.request().method() !== "GET") return route.continue();
        const pathname = new URL(route.request().url()).pathname;
        // The extra loopback proxy can race a closed keep-alive socket. Retry
        // only ECONNRESET once for observed read-only public documents; never
        // retry auth, account, API or payment operations, or HTTP errors.
        const publicRead = pathname === "/" || pathname === "/services" || pathname.startsWith("/services/") || pathname.startsWith("/blog/") || /^\/buy-[a-z0-9-]+$/.test(pathname);
        const response = await route.fetch({ maxRedirects: 0, maxRetries: publicRead ? 1 : 0 });
        // Windows WebKit cannot fulfill an intercepted redirect response.
        // Let the browser follow the real redirect; intercept its final document.
        if (response.status() >= 300 && response.status() < 400) return route.continue();
        const headers = response.headers();
        if (headers["content-security-policy"]) headers["content-security-policy"] = headers["content-security-policy"].split(";").filter(directive => directive.trim() !== "upgrade-insecure-requests").join(";");
        await route.fulfill({ response, headers });
      });
    }
    if (process.env.SMOKE_ANALYTICS_ENABLED !== "1") {
      await context.addInitScript(() => Object.defineProperty(navigator, "doNotTrack", { configurable: true, get: () => "1" }));
    }
    try { await use(); }
    finally {
      // Close the owned page before waiting for network route handlers to
      // drain. Late /us document traffic otherwise keeps the fixture alive.
      // Keep strict "wait" cleanup: never ignore failures to hide races.
      if (!page.isClosed()) await page.close({ runBeforeUnload: false });
      await context.unrouteAll({ behavior: "wait" });
    }
  }, { auto: true }],
});
export { expect };
