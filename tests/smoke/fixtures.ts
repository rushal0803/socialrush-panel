import { test as base, expect } from "@playwright/test";

// Exercise the existing privacy opt-out rather than changing live analytics.
// An isolated opt-in run can still verify analytics via SMOKE_ANALYTICS_ENABLED=1.
export const test = base.extend<{ privacyPreference: void }>({
  privacyPreference: [async ({ context, baseURL }, use) => {
    // Production keeps upgrade-insecure-requests. This loopback server has no
    // TLS listener, so remove only that directive from local navigation headers.
    // RSC prefetch redirects also carry CSP: Chromium otherwise upgrades their
    // HTTP login redirect to HTTPS and fails against this HTTP-only server.
    // APIRequestContext still reads the original policy for the CSP smoke check.
    if (baseURL && baseURL.startsWith("http://") && ["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname)) {
      await context.route(`${new URL(baseURL).origin}/**`, async route => {
        const request = route.request();
        const isNavigation = request.resourceType() === "document" || request.headers()["rsc"] === "1";
        if (!isNavigation || request.method() !== "GET") return route.continue();
        const response = await route.fetch({ maxRedirects: 0 });
        const headers = response.headers();
        if (headers["content-security-policy"]) headers["content-security-policy"] = headers["content-security-policy"].split(";").filter(directive => directive.trim() !== "upgrade-insecure-requests").join(";");
        await route.fulfill({ response, headers });
      });
    }
    if (process.env.SMOKE_ANALYTICS_ENABLED !== "1") {
      await context.addInitScript(() => Object.defineProperty(navigator, "doNotTrack", { configurable: true, get: () => "1" }));
    }
    await use();
  }, { auto: true }],
});
export { expect };
