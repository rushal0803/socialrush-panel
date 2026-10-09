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
  await expect(heading).toBeVisible();
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
  await context.addInitScript(({ storageKey, session }) => localStorage.setItem(storageKey, JSON.stringify(session)), { storageKey, session });
  const fixtureHeaders = { 'Access-Control-Allow-Origin': baseURL, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'GET, OPTIONS' };
  await context.route(`${origin}/auth/v1/**`, route => route.fulfill({ json: user, headers: fixtureHeaders }));
  await context.route(`${origin}/rest/v1/**`, route => {
    const url = new URL(route.request().url());
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: fixtureHeaders });
    if (route.request().method() !== "GET") return route.fulfill({ status: 403, json: { message: "Paid operations disabled in responsive QA" }, headers: fixtureHeaders });
    if (url.pathname.endsWith("/profiles")) return route.fulfill({ json: [{ ...user, full_name: "Responsive QA", balance: 100000, is_blocked: false }], headers: fixtureHeaders });
    if (url.pathname.endsWith("/services")) return route.fulfill({ json: JSON.parse(fs.readFileSync("tests/fixtures/packages-catalog.json", "utf8")), headers: fixtureHeaders });
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
        return { viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth,
          outside: Array.from(document.querySelectorAll('*')).filter(element => element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).overflowX === 'visible').slice(0, 25).map(element => ({ tag: element.tagName, class: element.className, text: element.textContent?.slice(0, 60), width: element.clientWidth, scroll: element.scrollWidth })) };
      });
      results.push({ route, ...layout });
      if ([320, 390, 768, 1440].includes(width)) {
        const name = route.split("?")[0].slice(1).replaceAll("/", "-");
        await page.screenshot({ path: path.join(output, `${name}-${width}-hero.png`) });
        await captureFullPage(page, path.join(output, `${name}-${width}.png`));
      }
      if (stage !== "before") expect.soft(layout.scroll, `${route} at ${width}px`).toBeLessThanOrEqual(layout.viewport + 1);
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
