import { expect, test } from "./fixtures";
import fs from "node:fs";
import path from "node:path";

const output = path.resolve("artifacts/service-final");
const representatives = [
  ["instagram", "/buy-instagram-followers-india"],
  ["youtube", "/youtube-subscribers"],
  ["linkedin", "/linkedin-followers"],
  ["facebook", "/buy-facebook-followers-india"],
  ["x", "/twitter-followers"],
  ["tiktok", "/tiktok-followers"],
  ["telegram", "/telegram-members"],
] as const;

for (const [platform, route] of representatives) for (const width of [390, 1440]) {
  test(`final visual and runtime review: ${platform} ${width}px`, async ({ page }) => {
    fs.mkdirSync(output, { recursive: true });
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    const requests: Record<string, number> = {};
    const analyticsEvents: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("request", request => {
      const url = new URL(request.url());
      if (url.pathname.startsWith("/api/")) requests[url.pathname] = (requests[url.pathname] ?? 0) + 1;
      if (url.pathname === "/api/analytics" && request.method() === "POST") {
        const decoded = request.postDataJSON();
        const payload = typeof decoded === "string" ? JSON.parse(decoded) : decoded;
        analyticsEvents.push(String(payload?.name ?? payload?.event ?? payload?.eventName ?? "unknown"));
      }
    });
    await page.addInitScript(() => {
      const state = window as unknown as { serviceReviewCLS: number; serviceReviewShifts: unknown[] };
      state.serviceReviewCLS = 0;
      state.serviceReviewShifts = [];
      new PerformanceObserver(list => {
        for (const item of list.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) {
          if (!item.hadRecentInput) {
            state.serviceReviewCLS += item.value ?? 0;
            const shift = item as PerformanceEntry & { value: number; sources: Array<{ node?: Element; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }> };
            state.serviceReviewShifts.push({ time: shift.startTime, value: shift.value, nodes: shift.sources?.map(source => ({ tag: source.node?.tagName, class: source.node?.className, before: source.previousRect.toJSON(), after: source.currentRect.toJSON() })) });
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible();
    const initialCLS = await page.evaluate(() => (window as unknown as { serviceReviewCLS: number }).serviceReviewCLS);
    await page.screenshot({ path: path.join(output, `${platform}-${width}-hero.png`) });
    const faq = page.locator("#main-content details").last();
    if (await faq.count()) {
      await faq.scrollIntoViewIfNeeded();
      if (!(await faq.getAttribute("open"))) await faq.locator("summary").click();
      await page.screenshot({ path: path.join(output, `${platform}-${width}-faq.png`) });
    } else if (platform === "telegram") {
      const toggle = page.getByRole("button", { name: "Is refill or support available?", exact: true });
      await toggle.scrollIntoViewIfNeeded();
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await page.screenshot({ path: path.join(output, `${platform}-${width}-faq.png`) });
    } else {
      const heading = page.locator("#main-content").getByRole("heading", { name: /FAQ|Frequently asked/i }).first();
      if (await heading.count()) {
        await heading.scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(output, `${platform}-${width}-faq.png`) });
      }
    }
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, `${platform}-${width}-footer.png`) });
    const metrics = await page.evaluate(() => ({
      supportPosition: getComputedStyle(document.querySelector('a[aria-label="Open SocialRUSH WhatsApp support"]')!).position,
      cls: (window as unknown as { serviceReviewCLS: number }).serviceReviewCLS,
      shifts: (window as unknown as { serviceReviewShifts: unknown[] }).serviceReviewShifts,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      scripts: performance.getEntriesByType("resource").filter(item => (item as PerformanceResourceTiming).initiatorType === "script").map(item => ({ name: new URL(item.name).pathname, bytes: (item as PerformanceResourceTiming).decodedBodySize })),
      images: Array.from(document.images).filter(image => image.complete && image.naturalWidth === 0).map(image => image.getAttribute("src")),
    }));
    fs.writeFileSync(path.join(output, `${platform}-${width}-runtime.json`), JSON.stringify({ route, width, initialCLS, errors, requests, analyticsEvents, ...metrics }, null, 2));
    expect(metrics.overflow).toBeLessThanOrEqual(1);
    expect(metrics.supportPosition).toBe("static");
    if (process.env.SMOKE_ANALYTICS_ENABLED !== "1") expect(requests["/api/analytics"] ?? 0).toBe(0);
    expect(initialCLS).toBeLessThanOrEqual(0.1);
    expect(metrics.cls).toBeLessThanOrEqual(0.1);
    expect(metrics.images).toEqual([]);
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1440]) test(`logged-out signup preserves selection at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/buy-instagram-followers-india");
  const card = page.locator("[data-service-order-card]");
  await card.getByLabel("Custom quantity").fill("1000");
  await card.locator('input[inputmode="url"]').fill("https://instagram.com/socialrushverify");
  const cta = card.getByRole("link", { name: "Continue to Secure Order" });
  const selection = await cta.getAttribute("href");
  await cta.click();
  await expect(page).toHaveURL(/\/login\?/);
  expect(new URL(page.url()).searchParams.get("next")).toBe(selection);
  await page.getByRole("link", { name: "Sign up", exact: true }).click();
  await expect(page).toHaveURL(/\/register\?/);
  expect(new URL(page.url()).searchParams.get("next")).toBe(selection);
  await page.getByRole("link", { name: "Login", exact: true }).last().click();
  await expect(page).toHaveURL(/\/login\?/);
  expect(new URL(page.url()).searchParams.get("next")).toBe(selection);
});
