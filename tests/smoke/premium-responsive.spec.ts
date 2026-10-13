import { test, expect } from "./fixtures";
import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";

test.use({ contextOptions: { reducedMotion: "reduce" } });
test.setTimeout(600000);
test.skip(process.env.RESPONSIVE_AUDIT !== "1" && process.env.RESPONSIVE_PAYMENT_FIXTURE !== "1", "Full responsive audit is opt-in; see docs/premium-responsive-ui-optimization.md");
loadEnvConfig(process.cwd());

const widths = [320, 360, 375, 390, 412, 430, 480, 600, 768, 820, 1024, 1280, 1366, 1440, 1920];
const routes = ["/", "/services", "/pricing", "/packages", "/buy-instagram-followers-india", "/youtube-subscribers", "/linkedin-followers", "/buy-facebook-followers-india", "/tiktok-followers", "/twitter-followers", "/telegram-members", "/us", "/us/buy-instagram-followers", "/social-media-growth-india", "/login", "/register", "/contact", "/support", "/faq", "/about", "/uk", "/ca", "/au", "/ae", "/sg", "/blog", "/trust", "/refund-policy", "/terms-and-conditions", "/privacy-policy", "/tools", "/case-studies", "/reviews"];
const stage = process.env.RESPONSIVE_STAGE || "after";
const outputRoot = path.resolve("artifacts/premium-responsive", stage);
const evidencePath = (project: string) => process.env.RESPONSIVE_CROSS_BROWSER === "1" ? path.join(outputRoot, project) : outputRoot;

async function captureFullPage(page: import("@playwright/test").Page, file: string) {
  const { height, scale } = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, scale: window.devicePixelRatio }));
  // Windows WebKit caps screenshot dimensions. Preserve viewport evidence and
  // capture the footer separately for pages exceeding that engine limit.
  if (height * scale <= 30000) await page.screenshot({ path: file, fullPage: true });
  else {
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.screenshot({ path: file.replace('.png', '-bottom.png') });
    fs.writeFileSync(file.replace('.png', '-capture.json'), JSON.stringify({ height, note: 'Viewport and footer captures; full-page image exceeds engine dimension limit.' }));
    await page.evaluate(() => window.scrollTo(0, 0));
  }
}

async function expectRevealedContent(page: import("@playwright/test").Page) {
  const heading = page.locator("main h1").first();
  await expect(heading).toBeVisible({ timeout: 30000 });
  // Visibility alone permits opacity:0. Wait for hydration-driven reveal
  // wrappers as well, otherwise a screenshot can capture an empty hero.
  await expect.poll(() => heading.evaluate(element => {
    let opacity = 1;
    for (let current: Element | null = element; current; current = current.parentElement) opacity *= Number(getComputedStyle(current).opacity);
    return opacity;
  }), { timeout: 30000, message: `Hydrated heading on ${page.url()}` }).toBeGreaterThanOrEqual(0.99);
}

test('public legal aliases preserve permanent redirects', async ({ request, baseURL }) => {
  for (const [alias, canonical] of [['/terms', '/terms-and-conditions'], ['/privacy', '/privacy-policy']]) {
    const response = await request.get(alias, { maxRedirects: 0 });
    expect([301, 308]).toContain(response.status());
    expect(new URL(response.headers().location, baseURL).pathname).toBe(canonical);
  }
});

for (const width of widths) {
  test(`public layouts at ${width}px`, async ({ context }, testInfo) => {
    const output = evidencePath(testInfo.project.name);
    const errors: string[] = [];
    test.setTimeout(600000);
    fs.mkdirSync(output, { recursive: true });
    const results = [];
    for (const route of routes) {
      // Isolate documents so forced navigation cannot turn abandoned prefetches
      // into WebKit network errors attributed to the next route.
      const page = await context.newPage();
      const onError = (error: Error) => errors.push(`${page.url()}: ${error.message}`);
      page.on("pageerror", onError);
      await page.setViewportSize({ width, height: width <= 480 ? 740 : 900 });
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), route).toBeLessThan(400);
      await expect(page.locator("h1").first()).toBeVisible();
      await expectRevealedContent(page);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForLoadState('load', { timeout: 30000 });
      if (route === "/" && width < 1024) {
        const help = page.getByRole("link", { name: "Open SocialRUSH WhatsApp support" });
        if (await help.count()) expect(await help.evaluate(element => getComputedStyle(element).position)).toBe("relative");
      }
      const layout = await page.evaluate(() => {
        // Existing root clipping must not conceal layout failures in this audit.
        document.documentElement.style.overflowX = "visible";
        document.body.style.overflowX = "visible";
        const viewport = document.documentElement.clientWidth;
        const outside = Array.from(document.querySelectorAll("main h1, main h2, main input, main select, main textarea, main button")).filter(element => {
          const box = element.getBoundingClientRect();
          if (!box.width || !box.height) return false;
          for (let parent = element.parentElement; parent; parent = parent.parentElement) {
            if (["auto", "scroll", "hidden", "clip"].includes(getComputedStyle(parent).overflowX)) return false;
          }
          return box.left < -1 || box.right > viewport + 1;
        }).map(element => ({ tag: element.tagName, text: element.textContent?.slice(0, 80) }));
        return { viewport, scroll: document.documentElement.scrollWidth, outside,
          overflowDetails: Array.from(document.querySelectorAll('*')).filter(element => element.getBoundingClientRect().right > viewport + 1).slice(0, 15).map(element => ({ tag: element.tagName, class: element.className, text: element.textContent?.slice(0, 50), boxRight: element.getBoundingClientRect().right })),
          bodyMargin: getComputedStyle(document.body).margin };
      });
      results.push({ route, ...layout });
      if ([320, 390, 768, 1440].includes(width)) {
        await page.screenshot({ path: path.join(output, `${route === "/" ? "home" : route.slice(1).replaceAll("/", "-")}-${width}-hero.png`) });
        if (['/', '/services', '/packages', '/login', '/terms-and-conditions', '/privacy-policy'].includes(route)) await captureFullPage(page, path.join(output, `${route === "/" ? "home" : route.slice(1).replaceAll("/", "-")}-${width}.png`));
      }
      if (stage !== "before") {
        expect.soft(layout.scroll, `${route} document width at ${width}px`).toBeLessThanOrEqual(layout.viewport + 1);
        expect.soft(layout.outside, `${route} controls/headings outside viewport`).toEqual([]);
      }
      await page.waitForLoadState('load', { timeout: 30000 });
      page.off('pageerror', onError);
      await page.close();
    }
    fs.writeFileSync(path.join(output, `public-${width}.json`), JSON.stringify(results, null, 2));
    expect(errors, "Public runtime errors").toEqual([]);
  });
}

test("mobile navigation contains search focus and restores navigation after resize", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Mobile navigation" });
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole("button", { name: "Close menu", exact: true });
  await expect(close).toBeFocused();
  const firstLink = dialog.locator('a[href]').first();
  await firstLink.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("link", { name: "Sign Up", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(firstLink).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await dialog.getByPlaceholder("Search services...").focus();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("link", { name: "Start Order", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByPlaceholder("Search services...")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(dialog).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.position)).not.toBe("fixed");
  await page.setViewportSize({ width: 390, height: 740 });
  await trigger.click();
  await dialog.getByRole("link", { name: "Pricing", exact: true }).click();
  await expect(page).toHaveURL(/\/pricing$/);
  await expect(dialog).toHaveCount(0);
});

test('mobile navigation keeps repeated Tab navigation inside the dialog', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const dialog = page.getByRole('dialog', { name: 'Mobile navigation' });
  await dialog.getByPlaceholder('Search services...').focus();
  for (const key of ['Tab', 'Shift+Tab']) {
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press(key);
      await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
    }
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test("dashboard drawer remains keyboard accessible on a short phone", async ({ page, context, baseURL }) => {
  await authenticate(context, baseURL!);
  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto("/dashboard");
  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Mobile navigation" });
  const close = dialog.getByRole("button", { name: "Close menu", exact: true });
  await expect(close).toBeFocused();
  await dialog.locator('a[href]').first().focus();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: /log ?out/i })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(dialog).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.position)).not.toBe("fixed");
});

test("public lab rendering metrics", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.addInitScript(() => {
    const state = window as unknown as { responsiveMetrics: { cls: number; lcp: number } };
    state.responsiveMetrics = { cls: 0, lcp: 0 };
    if (PerformanceObserver.supportedEntryTypes.includes("layout-shift")) new PerformanceObserver(list => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) if (!entry.hadRecentInput) state.responsiveMetrics.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
    if (PerformanceObserver.supportedEntryTypes.includes("largest-contentful-paint")) new PerformanceObserver(list => {
      for (const entry of list.getEntries()) state.responsiveMetrics.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  const results = [];
  for (const route of ["/", "/services", "/packages"]) {
    await page.goto(route, { waitUntil: "networkidle" });
    const metrics = await page.evaluate(() => {
      const state = window as unknown as { responsiveMetrics: { cls: number; lcp: number } };
      return { ...state.responsiveMetrics, transferBytes: performance.getEntriesByType("resource").reduce((sum, entry) => sum + (entry as PerformanceResourceTiming).transferSize, 0) };
    });
    results.push({ route, ...metrics });
  }
  const output = evidencePath(testInfo.project.name);
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, "lab-metrics.json"), JSON.stringify({ note: "Local unthrottled page navigations with fixture routing (HTTP cache disabled) and reduced motion; not field p75 or an INP measurement. Unsupported metrics are zero.", results }, null, 2));
});

const dashboardRoutes = ["/dashboard", "/dashboard/new-order", "/dashboard/packages", "/dashboard/orders", "/dashboard/order-history", "/dashboard/wallet", "/dashboard/add-funds", "/dashboard/billing", "/dashboard/referrals", "/dashboard/account", "/dashboard/support", "/dashboard/settings", "/dashboard/order-summary?service=instagram-followers&quantity=1000&link=https%3A%2F%2Fwww.instagram.com%2Fresponsive_qa%2F"];
if (process.env.DASHBOARD_UPGRADE_AUDIT === "1") dashboardRoutes.push(
  "/dashboard/campaign-stacks", "/dashboard/retainers", "/dashboard/reseller",
  "/dashboard/campaigns", "/dashboard/clients", "/dashboard/saved-profiles",
  "/dashboard/notifications", "/dashboard/new-order?tab=favourites",
  "/dashboard/repeat-campaigns", "/dashboard/rewards", "/dashboard/reviews", "/dashboard/api-docs",
  "/dashboard/orders/55555555-5555-4555-8555-555555555555",
  "/dashboard/billing/transactions/88888888-8888-4888-8888-888888888888",
  "/dashboard/clients/99999999-9999-4999-8999-999999999999",
  "/dashboard/campaigns/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  "/dashboard/reseller/portfolio", "/dashboard/reseller/monthly-plans",
  "/dashboard/reseller/monthly-planner", "/dashboard/reseller/bulk-planner", "/dashboard/reviews/new?order=66666666-6666-4666-8666-666666666666",
);

async function authenticate(context: import("@playwright/test").BrowserContext, baseURL: string) {
  // Layout-only QR fixture encodes "responsive-qa", never a payable UPI link.
  await context.route("https://api.qrserver.com/**", route => route.fulfill({ path: "tests/fixtures/responsive-qa-qr.png", contentType: "image/png" }));
  const origin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin;
  const storageKey = `sb-${new URL(origin).hostname.split(".")[0]}-auth-token`;
  const user = { id: "11111111-1111-4111-8111-111111111111", email: "responsive-qa@example.invalid", role: "authenticated", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "2026-01-01T00:00:00Z" };
  const expires_at = Math.floor(Date.now() / 1000) + 3600;
  const token = `${Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: user.id, role: "authenticated", aud: "authenticated", exp: expires_at })).toString("base64url")}.${Buffer.from("test-signature").toString("base64url")}`;
  const session = { access_token: token, refresh_token: "fixture", expires_at, expires_in: 3600, token_type: "bearer", user };
  await context.addCookies([{ name: storageKey, value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`, url: baseURL }]);
  await context.addInitScript(({ storageKey, session, baseURL }) => {
    if (location.origin === new URL(baseURL).origin) localStorage.setItem(storageKey, JSON.stringify(session));
  }, { storageKey, session, baseURL });
  const fixtureHeaders = { 'Access-Control-Allow-Origin': baseURL, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'GET, OPTIONS' };
  await context.route(`${origin}/auth/v1/**`, route => route.fulfill({ json: user, headers: fixtureHeaders }));
  await context.route(`${origin}/rest/v1/**`, route => {
    const url = new URL(route.request().url());
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: fixtureHeaders });
    if (route.request().method() !== "GET") return route.fulfill({ status: 403, json: { message: "Paid operations disabled in responsive QA" }, headers: fixtureHeaders });
    if (url.pathname.endsWith("/profiles")) {
      const profile = { ...user, full_name: "Responsive QA", balance: 100000, is_blocked: false };
      return route.fulfill({ json: route.request().headers().accept?.includes("object") ? profile : [profile], headers: fixtureHeaders });
    }
    if (url.pathname.endsWith("/services")) return route.fulfill({ json: JSON.parse(fs.readFileSync("tests/fixtures/packages-catalog.json", "utf8")), headers: fixtureHeaders });
    if (process.env.DASHBOARD_UPGRADE_AUDIT === "1") {
      const fixture = JSON.parse(fs.readFileSync("tests/fixtures/dashboard-workspace.json", "utf8"))[url.pathname.split("/").pop()!];
      if (fixture) {
        let found = fixture;
        for (const [field, filter] of url.searchParams) {
          if (filter?.startsWith("eq.")) found = found.filter((row: Record<string, unknown>) => String(row[field]) === filter.slice(3));
        }
        return route.fulfill({ json: route.request().headers().accept?.includes("object") ? found[0] || null : found, headers: fixtureHeaders });
      }
    }
    return route.fulfill({ json: [], headers: fixtureHeaders });
  });
  await context.routeWebSocket(/\/realtime\/v1\/websocket/, socket => {
    socket.onMessage(message => {
      try {
        const [joinRef, ref, topic] = JSON.parse(String(message));
        socket.send(JSON.stringify([joinRef, ref, topic, "phx_reply", { status: "ok", response: {} }]));
      } catch { /* No unsolicited fixture events. */ }
    });
  });
}

test("customer service search recovers from an empty result", async ({ page, context, baseURL }) => {
  await authenticate(context, baseURL!);
  const catalogueRequested = page.waitForRequest(request => request.method() === "GET" && request.url().includes("/rest/v1/services"));
  await page.goto("/dashboard/new-order?platform=instagram");
  const search = page.getByRole("searchbox", { name: "Search services" });
  await expect(search).toBeVisible({ timeout: 30000 });
  await catalogueRequested;
  await search.fill("no-service-matches-this-fixture");
  await expect(page.getByText(/No services match/)).toBeVisible();
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(search).toHaveValue("");
  await search.fill("followers");
  await expect(page.getByRole("status").filter({ hasText: /of .* services/ })).not.toHaveText(/^0 of/);
  await expect(page.locator("main article").first()).toContainText(/followers/i);
});

for (const width of [390, 1440]) {
  test(`dashboard search request budget and dialog at ${width}px`, async ({ page, context, baseURL, browserName }) => {
    test.skip(browserName !== "chromium", "Throttled journey measurement uses Chromium CDP");
    await authenticate(context, baseURL!);
    await page.setViewportSize({ width, height: 844 });
    const cdp = await context.newCDPSession(page);
    if (width === 390) {
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
    }
    let orderReads = 0, ticketReads = 0;
    await page.route("**/api/orders?limit=30", route => { orderReads++; return route.fulfill({ json: { data: [] } }); });
    await page.route("**/api/support/tickets", route => { ticketReads++; return route.fulfill({ json: { data: [] } }); });
    const mounted = page.waitForRequest(request => request.method() === "GET" && request.url().includes("/rest/v1/services"));
    await page.goto("/dashboard/new-order?platform=instagram");
    await mounted;
    const trigger = page.getByRole("button", { name: "Search orders and support tickets" });
    const started = Date.now();
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Dashboard search", exact: true });
    await expect(dialog).toBeVisible();
    const openMs = Date.now() - started;
    const search = dialog.getByPlaceholder("Search an order ID, service, or support ticket");
    await search.fill("no-matching-order");
    // Fixed observation window measures repeated requests; this is not a wait
    // for readiness or an INP measurement. All API responses are safe fixtures.
    await page.waitForTimeout(1000);
    const box = await dialog.boundingBox();
    const before = process.env.DASHBOARD_SEARCH_BASELINE === "1";
    fs.mkdirSync(outputRoot, { recursive: true });
    fs.writeFileSync(path.join(outputRoot, `search-journey-${width}.json`), JSON.stringify({ width, openMs, observationMs: 1000, orderReads, ticketReads, box, profile: width === 390 ? "4x CPU, 150ms RTT, 1.6Mbps; mocked API responses" : "unthrottled; mocked API responses", before }, null, 2));
    if (!before) {
      expect(orderReads).toBe(1);
      expect(ticketReads).toBe(1);
      await expect(dialog.getByText("No matching orders or tickets.")).toBeVisible();
      expect(box?.height).toBe(844);
      expect(box?.width).toBe(width);
      for (let index = 0; index < 8; index++) {
        await page.keyboard.press("Tab");
        await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
      }
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    if (!before) {
      await expect(trigger).toBeFocused();
      await expect.poll(() => page.evaluate(() => document.body.style.position)).not.toBe("fixed");
    }
    if (width === 390) {
      await page.getByRole("button", { name: "Open navigation", exact: true }).click();
      await expect(page.getByRole("dialog", { name: "Mobile navigation" })).toBeVisible();
      await page.screenshot({ path: path.join(outputRoot, "drawer-390.png") });
    }
  });
}

test("dashboard drawer preserves every destination and closes after query navigation", async ({ page, context, baseURL }) => {
  await authenticate(context, baseURL!);
  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto("/dashboard/new-order");
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Mobile navigation" });
  const navigation = dialog.getByRole("navigation", { name: "Dashboard navigation", exact: true });
  await expect(navigation.locator("a")).toHaveCount(22);
  const close = dialog.getByRole("button", { name: "Close menu", exact: true });
  await expect(close).toBeFocused();
  for (const label of ["New Order", "Orders", "Wallet", "Packages"]) await expect(navigation.getByRole("link", { name: label, exact: true })).toBeVisible();
  await expect(navigation.locator("details[open]")).toHaveCount(0);
  await expect(navigation.locator("summary")).toHaveCount(4);
  await navigation.locator("summary").first().focus();
  await page.keyboard.press("Enter");
  await expect(navigation.locator("details[open]")).toHaveCount(1);
  await page.keyboard.press("Enter");
  await expect(navigation.locator("details[open]")).toHaveCount(0);
  for (const summary of await navigation.locator("summary").all()) await summary.click();
  for (const label of ["New Order", "Orders", "Wallet", "Packages", "Settings", "Support"]) await expect(navigation.getByRole("link", { name: label, exact: true })).toHaveCount(1);
  for (let index = 0; index < 30; index++) {
    await page.keyboard.press("Tab");
    await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  await navigation.getByRole("link", { name: "Favourite Services", exact: true }).click();
  await expect(page).toHaveURL(/tab=favourites/);
  await expect(dialog).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.position)).not.toBe("fixed");
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(navigation.locator('[aria-current="page"]')).toHaveText("Favourite Services");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("dashboard search retries only on request and cancels when dismissed", async ({ page, context, baseURL }) => {
  await authenticate(context, baseURL!);
  let failed = true, slow = false, reads = 0;
  let releasePending!: () => void, markPending!: () => void;
  const pendingGate = new Promise<void>(resolve => { releasePending = resolve; });
  const pendingStarted = new Promise<void>(resolve => { markPending = resolve; });
  await page.route("**/api/orders?limit=30", async route => {
    reads++;
    if (slow) {
      markPending();
      await pendingGate;
      return; // The request was intentionally cancelled by dismissing the dialog.
    }
    await route.fulfill({ status: failed ? 503 : 200, json: failed ? { error: "Fixture unavailable" } : { data: [] } });
  });
  await page.route("**/api/support/tickets", route => route.fulfill({ json: { data: [] } }));
  const mounted = page.waitForRequest(request => request.method() === "GET" && request.url().includes("/rest/v1/services"));
  await page.goto("/dashboard/new-order?platform=instagram");
  await mounted;
  const trigger = page.getByRole("button", { name: "Search orders and support tickets" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Dashboard search", exact: true });
  await expect(dialog.getByRole("alert")).toContainText("Search is unavailable");
  await page.waitForTimeout(500); // Observe the absence of automatic retries.
  expect(reads).toBe(1);
  failed = false;
  await dialog.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(dialog.getByText(/Type to search your own/)).toBeVisible();
  expect(reads).toBe(2);
  await expect(dialog.getByRole("textbox")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  slow = true;
  const cancelled = page.waitForEvent("requestfailed", { predicate: request => request.url().includes("/api/orders?limit=30") });
  await page.keyboard.press("Control+k");
  await expect(dialog).toBeVisible();
  await pendingStarted;
  await page.mouse.click(2, 2);
  await expect(dialog).toHaveCount(0);
  expect((await cancelled).failure()?.errorText).toMatch(/abort|cancel/i);
  releasePending();
  await expect.poll(() => page.evaluate(() => document.body.style.position)).not.toBe("fixed");
});

for (const balance of [0, 200, 100000]) {
  test(`order review preserves the wallet split with balance ${balance}`, async ({ page, context, baseURL }) => {
    await authenticate(context, baseURL!);
    const origin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin;
    await context.route(`${origin}/rest/v1/profiles*`, route => route.fulfill({
      json: { balance }, headers: { "Access-Control-Allow-Origin": baseURL!, "Access-Control-Allow-Headers": "*" },
    }));
    const paidRequests: string[] = [];
    await context.route(/\/api\/(orders|checkout\/intent|payments\/.*order)/, route => {
      if (route.request().method() === "POST") paidRequests.push(route.request().url());
      return route.fulfill({ status: 403, json: { error: "Paid operations disabled in dashboard review QA" } });
    });
    await page.setViewportSize({ width: 390, height: 740 });
    let releaseCatalogue!: () => void;
    let markCatalogueRequested!: () => void;
    const catalogueGate = new Promise<void>(resolve => { releaseCatalogue = resolve; });
    const catalogueRequested = new Promise<void>(resolve => { markCatalogueRequested = resolve; });
    await context.route(`${origin}/rest/v1/services*`, async route => {
      if (route.request().method() !== "GET") return route.fallback();
      markCatalogueRequested();
      await catalogueGate;
      await route.fallback();
    });
    await page.goto("/dashboard/new-order?platform=instagram&service=instagram-followers&prefill=1&quantity=1000&link=https%3A%2F%2Fwww.instagram.com%2Fresponsive_qa%2F");
    const quantity = page.getByPlaceholder("Enter quantity");
    await expect(quantity).toBeVisible({ timeout: 30000 });
    // Server-rendered inputs can be visible before event handlers attach in
    // WebKit. The first client catalogue request proves effects have mounted;
    // its response stays blocked until the customer has edited the quantity.
    await catalogueRequested;
    await quantity.fill("2000");
    const catalogueResponse = page.waitForResponse(response => response.request().method() === "GET" && response.url().startsWith(`${origin}/rest/v1/services`));
    releaseCatalogue();
    await (await catalogueResponse).finished();
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await expect(quantity).toHaveValue("2000");
    await page.getByRole("button", { name: "Review Order", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Review & pay", exact: true })).toBeVisible();
    const summary = page.locator(".sr-order-payment-card");
    const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    const total = 1598;
    for (const [label, value] of [["Order total", total], ["Wallet balance", balance], ["Wallet to apply", Math.min(balance, total)], ["Remaining to pay", Math.max(0, total - balance)], ["Projected wallet after order", Math.max(0, balance - total)]] as const) {
      await expect(summary.locator("div.flex").filter({ has: page.getByText(label, { exact: true }) }).locator("strong")).toHaveText(money(value));
    }
    await expect(page.getByRole("button", { name: balance >= total ? /Place Order/ : /Pay Remaining/ })).toBeEnabled();
    expect(paidRequests).toEqual([]);
    await page.screenshot({ path: path.join(outputRoot, `order-review-balance-${balance}-390.png`), fullPage: true });
  });
}

for (const width of widths) {
  test(`authenticated layouts at ${width}px`, async ({ context, baseURL }, testInfo) => {
    const output = evidencePath(testInfo.project.name);
    const errors: string[] = [];
    test.setTimeout(600000);
    await authenticate(context, baseURL!);
    fs.mkdirSync(output, { recursive: true });
    const results = [];
    for (const route of dashboardRoutes) {
      const page = await context.newPage();
      await page.addInitScript(() => {
        const state = window as unknown as { dashboardLab: { lcp: number | null; cls: number } };
        state.dashboardLab = { lcp: null, cls: 0 };
        if (PerformanceObserver.supportedEntryTypes.includes("largest-contentful-paint")) new PerformanceObserver(list => {
          for (const entry of list.getEntries()) state.dashboardLab.lcp = entry.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        if (PerformanceObserver.supportedEntryTypes.includes("layout-shift")) new PerformanceObserver(list => {
          for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) if (!entry.hadRecentInput) state.dashboardLab.cls += entry.value;
        }).observe({ type: "layout-shift", buffered: true });
      });
      const onError = (error: Error) => errors.push(`${page.url()}: ${error.message}`);
      page.on('pageerror', onError);
      await page.setViewportSize({ width, height: width <= 480 ? 740 : 900 });
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), route).toBeLessThan(400);
      await expect(page.locator(".dashboard-shell")).toBeVisible();
      await expectRevealedContent(page);
      await page.waitForLoadState('load', { timeout: 30000 });
      const layout = await page.evaluate(() => {
        document.documentElement.style.overflowX = "visible";
        document.body.style.overflowX = "visible";
        const viewport = document.documentElement.clientWidth;
        const clippedControls = Array.from(document.querySelectorAll("main h1, main h2, main input, main select, main textarea, main button")).filter(element => {
          const box = element.getBoundingClientRect();
          if (!box.width || !box.height) return false;
          for (let parent = element.parentElement; parent && parent.tagName !== "MAIN"; parent = parent.parentElement) {
            if (["auto", "scroll"].includes(getComputedStyle(parent).overflowX)) return false;
          }
          return box.left < -1 || box.right > viewport + 1;
        }).map(element => ({ tag: element.tagName, text: element.textContent?.slice(0, 80) }));
        return { viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth,
          clippedControls,
          outside: Array.from(document.querySelectorAll('*')).filter(element => element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).overflowX === 'visible').slice(0, 25).map(element => ({ tag: element.tagName, class: element.className, text: element.textContent?.slice(0, 60), width: element.clientWidth, scroll: element.scrollWidth })) };
      });
      const lab = await page.evaluate(() => {
        const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        const state = window as unknown as { dashboardLab: { lcp: number | null; cls: number } };
        return { ...state.dashboardLab, ttfb: navigation.responseStart - navigation.requestStart };
      });
      results.push({ route, ...layout, lab });
      if ([320, 390, 768, 1440].includes(width)) {
        const name = route.split("?")[0].slice(1).replaceAll("/", "-");
        await page.screenshot({ path: path.join(output, `${name}-${width}-hero.png`) });
        await captureFullPage(page, path.join(output, `${name}-${width}.png`));
      }
      if (stage !== "before") {
        expect.soft(layout.scroll, `${route} at ${width}px`).toBeLessThanOrEqual(layout.viewport + 1);
        expect.soft(layout.clippedControls, `${route} controls/headings at ${width}px`).toEqual([]);
      }
      await page.waitForLoadState('load', { timeout: 30000 });
      page.off('pageerror', onError);
      await page.close();
    }
    fs.writeFileSync(path.join(output, `dashboard-${width}.json`), JSON.stringify(results, null, 2));
    expect(errors, "Dashboard runtime errors").toEqual([]);
  });
}

test("short landscape and 200% zoom equivalent retain readable public and dashboard controls", async ({ page, context, baseURL }) => {
  await authenticate(context, baseURL!);
  // 1280x960 at 200% browser zoom exposes a 640x480 CSS viewport. This checks
  // equivalent reflow; it does not claim a native browser-chrome zoom test.
  for (const viewport of [{ width: 820, height: 390 }, { width: 640, height: 480 }]) {
    await page.setViewportSize(viewport);
    for (const route of ["/", "/services", "/packages", "/dashboard/new-order", "/dashboard/wallet"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
      expect(size.scroll, `${route} ${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(size.viewport + 1);
    }
  }
});

for (const width of widths) {
  test(`payment instructions at ${width}px`, async ({ page, context, baseURL }, testInfo) => {
    const output = evidencePath(testInfo.project.name);
    test.skip(process.env.RESPONSIVE_PAYMENT_FIXTURE !== "1", "Requires isolated payment fixture server");
    await authenticate(context, baseURL!);
    await page.setViewportSize({ width, height: width <= 480 ? 740 : 900 });
    // Switching instruction tabs is safe. Never open a UPI link, submit a
    // transaction reference, or call an order/payment mutation in this audit.
    await page.route("**/api/**", route => route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 403, json: { error: "Paid operations disabled in responsive QA" } }));
    await page.goto("/dashboard/direct-upi?intent=33333333-3333-4333-8333-333333333333");
    const methods = page.getByRole("group", { name: "Payment method", exact: true });
    await expect(methods).toBeVisible();
    fs.mkdirSync(output, { recursive: true });
    for (const name of ["UPI", "Bank Transfer", "USDT TRC20"]) {
      await methods.getByRole("button", { name, exact: true }).click();
      const panel = page.locator("#payment-method-panel");
      await expect(panel).toBeVisible();
      if (width < 768) {
        const inputs = page.locator('main input:not([type="checkbox"]):not([type="radio"]), main select, main textarea');
        for (const input of await inputs.all()) {
          if (await input.isVisible()) expect(await input.evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
        }
      }
      const size = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      expect(size.scroll, `${name} at ${width}px`).toBeLessThanOrEqual(size.viewport + 1);
      await panel.scrollIntoViewIfNeeded();
      await expect(page.getByRole("group", { name: "Payment method", exact: true }).getByRole("button", { name, exact: true })).toHaveAttribute("aria-pressed", "true");
      if ([320, 390, 768, 1440].includes(width)) await page.screenshot({ path: path.join(output, `payment-${name.replaceAll(" ", "-")}-${width}.png`), fullPage: true });
    }
    await page.goto("/dashboard/add-funds?amount=799");
    if (width < 1024) {
      await page.getByRole("button", { name: "Show QR Code", exact: true }).click();
      const qr = page.getByRole("img", { name: /UPI QR to pay exactly/ }).last();
      await expect(qr).toBeVisible();
      await expect.poll(() => qr.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      const encodedPayment = new URL(new URL(await qr.getAttribute("src") ?? "").searchParams.get("data") ?? "");
      expect(encodedPayment.protocol).toBe("upi:");
      expect(encodedPayment.searchParams.get("am")).toBe("799.00");
      expect(await qr.locator("..").evaluate(element => getComputedStyle(element).backgroundColor)).toBe("rgb(255, 255, 255)");
      const box = await qr.boundingBox();
      expect(box?.width).toBeLessThanOrEqual(stage === "before" ? 280 : 220);
      await expect(page.getByRole("button", { name: /completed the payment/ })).toBeVisible();
      if ([320, 390, 768].includes(width)) {
        await qr.locator("..").evaluate(element => element.scrollIntoView({ block: "center" }));
        await qr.locator("..").screenshot({ path: path.join(output, `wallet-qr-${width}.png`) });
      }
    }
  });
}
