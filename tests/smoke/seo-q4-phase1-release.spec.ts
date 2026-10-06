import { test, expect } from "./fixtures";
import type { Locator, Page } from "@playwright/test";

test.use({ trace: "on" });

const viewports = [
  { width: 320, height: 700 }, { width: 360, height: 760 },
  { width: 375, height: 812 }, { width: 390, height: 844 },
  { width: 412, height: 915 }, { width: 430, height: 932 },
  { width: 768, height: 1024 }, { width: 1024, height: 768 },
  { width: 1440, height: 900 },
] as const;
const correctedWidths = new Set([320, 390, 768, 1024, 1440]);
const internationalWidths = new Set([320, 390, 768, 1440]);
const planner = "/tools/social-media-growth-planner";
const calculator = "/tools/youtube-subscriber-growth-rate-calculator";

// No console errors are ignored. The shared fixture uses the real privacy
// opt-out and only adapts upgrade-insecure-requests for the loopback server.
function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

async function noOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(dimensions.document, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport + 1);
  expect(dimensions.body, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport + 1);
}

async function readableContent(page: Page) {
  const heading = page.getByRole("heading", { level: 1 }).first();
  await expect(heading).toBeVisible();
  expect((await page.locator("body").innerText()).trim().length).toBeGreaterThan(200);
  // Bounds and internal scroll dimensions detect clipping; this does not claim
  // pixel-perfect visual approval or absence of every possible overlap.
  for (const element of await page.locator("h1, main p, main h2").all()) {
    if (!await element.isVisible()) continue;
    const bounds = await element.evaluate(node => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, right: rect.right, width: document.documentElement.clientWidth,
        scroll: node.scrollWidth, client: node.clientWidth };
    });
    expect(bounds.left, `Content bounds: ${JSON.stringify(bounds)}`).toBeGreaterThanOrEqual(-1);
    expect(bounds.right, `Content bounds: ${JSON.stringify(bounds)}`).toBeLessThanOrEqual(bounds.width + 1);
    expect(bounds.scroll, `Content clipping: ${JSON.stringify(bounds)}`).toBeLessThanOrEqual(bounds.client + 1);
  }
  await noOverflow(page);
}

async function usableControl(control: Locator, minimumHeight = 44) {
  await expect(control).toBeVisible();
  await expect(control).toBeEnabled();
  await control.scrollIntoViewIfNeeded();
  const geometry = await control.evaluate(node => {
    const rect = node.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { left: rect.left, right: rect.right, height: rect.height, width: rect.width,
      viewport: document.documentElement.clientWidth,
      scroll: node.scrollWidth, client: node.clientWidth,
      unobstructed: !!hit && (hit === node || node.contains(hit)),
      blocker: hit?.outerHTML.slice(0, 220) };
  });
  expect(geometry.height, JSON.stringify(geometry)).toBeGreaterThanOrEqual(minimumHeight);
  expect(geometry.width, JSON.stringify(geometry)).toBeGreaterThanOrEqual(36);
  expect(geometry.left, JSON.stringify(geometry)).toBeGreaterThanOrEqual(-1);
  expect(geometry.right, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.viewport + 1);
  expect(geometry.scroll, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.client + 1);
  expect(geometry.unobstructed, `Control center overlapped: ${JSON.stringify(geometry)}`).toBe(true);
}

async function load(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: "load" });
  expect(response?.status(), path).toBe(200);
  await readableContent(page);
  return response!;
}

test.describe("Q4 Phase 1 SEO browser release gate", () => {
  test.afterEach(async ({ page }, info) => {
    if (info.status !== info.expectedStatus || info.title.endsWith("320x700")) {
      await info.attach("release-gate-screenshot", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
    }
  });

  for (const viewport of viewports) {
    test(`growth planner interaction ${viewport.width}x${viewport.height}`, async ({ page, request, baseURL }) => {
      await page.setViewportSize(viewport);
      const errors = collectErrors(page);
      const loopback = baseURL?.startsWith("http://") && ["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname);
      const prefetchResponses: { url: string; status: number; csp: string }[] = [];
      page.on("response", response => {
        if (response.request().headers()["rsc"] === "1" && /\/(dashboard\/new-order|login)(\?|$)/.test(response.url())) {
          prefetchResponses.push({ url: response.url(), status: response.status(), csp: response.headers()["content-security-policy"] || "" });
        }
      });
      if (loopback) {
        // APIRequestContext is not routed by the browser fixture. Verify the
        // real security policy and HTTP auth redirect are still intact.
        const raw = await request.get("/dashboard/new-order?platform=instagram&service=instagram-followers&quantity=1000&prefill=1", {
          headers: { RSC: "1", "Next-Router-Prefetch": "1" }, maxRedirects: 0,
        });
        expect(raw.status()).toBe(307);
        const destination = new URL(raw.headers()["location"]);
        expect(destination.origin).toBe(new URL(baseURL!).origin);
        expect(destination.pathname).toBe("/login");
        expect(raw.headers()["content-security-policy"]).toContain("upgrade-insecure-requests");
      }
      const response = await load(page, planner);
      const html = await response.text();
      expect(html).toContain("Smart Goal &amp; Budget Planner");
      expect(html).toContain("Make a clear, budget-aware next-step plan");
      expect(html).toContain("Loading the interactive planner");
      await expect(page.getByRole("heading", { name: "How this tool works" })).toBeVisible();
      await expect(page.getByText("Loading the interactive planner…", { exact: true })).toHaveCount(0);
      const goal = page.getByLabel("Primary goal");
      const budget = page.getByLabel("Your budget (₹)");
      const desired = page.getByLabel("Desired outcome (optional)");
      await expect(goal).toHaveValue("followers");
      await expect(budget).toHaveValue("1000");
      const youtube = page.getByRole("button", { name: /YouTube/ });
      await usableControl(youtube);
      await youtube.click();
      await expect(goal.locator('option[value="followers"]')).toHaveText("Subscribers");
      await goal.selectOption("views");
      await expect(goal).toHaveValue("views");
      await budget.fill("5000");
      await expect(budget).toHaveValue("5000");
      await desired.fill("1000");
      await expect(desired).toHaveValue("1000");
      await expect(page.locator('section[aria-live="polite"] h2')).toContainText(/YouTube.*Views/i);

      // A fresh navigation tests the supported audit-to-planner query prefill.
      await load(page, `${planner}?platform=youtube&goal=engagement&audience=2500`);
      await expect(goal).toHaveValue("engagement");
      await expect(page.getByLabel("Current account size")).toHaveValue("2500");
      await expect(youtube).toHaveClass(/border-orange-400/);
      await goal.selectOption("followers");
      await expect(goal.locator('option[value="followers"]')).toHaveText("Subscribers");
      const instagram = page.getByRole("button", { name: /Instagram/ });
      await instagram.click();
      await expect(instagram).toHaveClass(/border-orange-400/);
      await expect(goal.locator('option[value="followers"]')).toHaveText("Followers");
      const preset = page.getByRole("button", { name: "₹2,500", exact: true });
      // Compact presets are 36px; form fields and primary CTAs must be 44px.
      await usableControl(preset, 36);
      await preset.click();
      await expect(budget).toHaveValue("2500");
      await budget.fill("5000");
      await desired.fill("1000");
      const plan = page.locator('section[aria-live="polite"]');
      await expect(plan).toContainText("Your growth plan");
      await expect(plan.getByRole("heading", { level: 2 })).toContainText(/Instagram.*Followers/i);
      await expect(plan).toContainText(/1,000 units · current catalog rate ₹[\d,]+/);
      await expect(plan).toContainText(/Budget remaining\s*₹[\d,]+/);
      const cta = plan.getByRole("link", { name: "Start This Growth Plan" });
      await expect(cta).toHaveAttribute("href", /platform=instagram.*quantity=1000/);
      await expect(plan.locator("p.text-xl")).toHaveText(/₹[\d,]+/);
      for (const control of await page.locator("main input, main select, main button, main a.btn-primary, main a.btn-secondary").all()) {
        const compact = await control.evaluate(node => node.tagName === "BUTTON" && /^₹/.test(node.textContent || ""));
        await usableControl(control, compact ? 36 : 44);
      }
      await usableControl(cta);
      await readableContent(page);
      if (loopback) {
        expect(prefetchResponses.length, "Real RSC auth prefetch must execute").toBeGreaterThan(0);
        for (const response of prefetchResponses) {
          expect(response.status).toBeLessThan(400);
          expect(response.csp).not.toContain("upgrade-insecure-requests");
        }
        await test.info().attach("loopback-prefetch-responses", { body: JSON.stringify(prefetchResponses, null, 2), contentType: "application/json" });
      }
      expect(errors, errors.join("\n")).toEqual([]);
      // Do not click an ordering CTA or submit a payment/order.
    });
  }

  const corrected = [
    { path: "/social-media-growth-india", cta: "Explore current services" },
    { path: "/help-center", cta: "Choose a service" },
    { path: "/partners", cta: "Propose a collaboration" },
    { path: "/tools/creator-growth-goal-planner", cta: null },
    { path: calculator, cta: null },
  ];
  for (const viewport of viewports.filter(item => correctedWidths.has(item.width))) {
    for (const route of corrected) {
      test(`corrected public URL ${route.path} at ${viewport.width}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        const errors = collectErrors(page);
        await load(page, route.path);
        const navigation = route.cta ? page.getByRole("link", { name: route.cta, exact: true })
          : page.locator('main a[href="/tools"]').first();
        await expect(navigation).toHaveAttribute("href", /.+/);
        await usableControl(navigation);
        if (route.cta) await expect(navigation).toBeInViewport();
        else {
          await navigation.scrollIntoViewIfNeeded();
          await expect(navigation).toBeInViewport();
          const inputs = page.locator("main input, main select, main button");
          expect(await inputs.count()).toBeGreaterThan(0);
          for (const control of await inputs.all()) await usableControl(control);
        }
        await noOverflow(page);
        expect(errors, errors.join("\n")).toEqual([]);
      });
    }
  }

  for (const viewport of viewports.filter(item => internationalWidths.has(item.width))) {
    for (const market of ["us", "uk", "ca", "au", "ae", "sg"]) {
      test(`${market} YouTube subscriber responsive page at ${viewport.width}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        const errors = collectErrors(page);
        await load(page, `/${market}/buy-youtube-subscribers`);
        await expect(page.getByRole("heading", { level: 1 })).toContainText("YouTube Subscribers");
        const link = page.locator(`a[href="${calculator}"]`).first();
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute("href", calculator);
        await usableControl(page.getByRole("link", { name: "Choose a package", exact: true }));
        await usableControl(page.getByRole("link", { name: "Continue to Secure Order", exact: true }));
        await noOverflow(page);
        expect(errors, errors.join("\n")).toEqual([]);
      });
    }
  }

  test("wrong planner URL stays non-canonical and out of sitemap", async ({ page, request }) => {
    const response = await page.goto("/tools/social-media-growth-goal-planner");
    expect(response?.status()).toBe(404);
    await expect(page.locator('link[rel="canonical"][href$="/tools/social-media-growth-goal-planner"]')).toHaveCount(0);
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    const xml = await sitemap.text();
    expect(xml).not.toContain("/tools/social-media-growth-goal-planner</loc>");
    expect(xml).toContain("/tools/creator-growth-goal-planner</loc>");
  });
});
