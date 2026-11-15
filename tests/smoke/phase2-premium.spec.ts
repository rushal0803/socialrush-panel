import { expect, test } from "./fixtures";

const routes = [
  { name: "home", path: "/" },
  { name: "instagram", path: "/buy-instagram-followers-india" },
  { name: "youtube", path: "/buy-youtube-subscribers-india" },
  { name: "linkedin", path: "/buy-linkedin-followers-india" },
];
test.use({ contextOptions: { reducedMotion: "reduce" } });
test.beforeEach(async ({ page, baseURL }) => {
  expect(["localhost", "127.0.0.1"], "Use isolated loopback fixtures only").toContain(new URL(baseURL!).hostname);
  await page.route("**/*", route => {
    const request = route.request();
    if (request.method() !== "GET" || new URL(request.url()).origin !== new URL(baseURL!).origin) return route.abort();
    return route.fallback();
  });
});

for (const width of [320, 390, 1440]) for (const route of routes) {
  test(`${route.name} reflows and exposes accessible controls at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    const response = await page.goto(route.path, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(/^https:\/\/www\.getsocialrush\.com/);
    await info.attach("viewport", { body: JSON.stringify({ route: route.path, width, canonical, title: await page.title() }), contentType: "application/json" });
    await page.screenshot({ path: info.outputPath(`${route.name}-${width}.jpg`), type: "jpeg", quality: 70 });
    await info.attach("viewport-image", { path: info.outputPath(`${route.name}-${width}.jpg`), contentType: "image/jpeg" });
    if (route.name !== "home") {
      const card = page.locator("[data-service-order-card]").first();
      await card.scrollIntoViewIfNeeded();
      const quantity = card.getByLabel("Custom quantity", { exact: true });
      await quantity.fill("1000");
      await expect(quantity).toHaveValue("1000");
      await expect(card.getByText("1,000 units", { exact: true })).toBeVisible();
      await card.getByRole("link", { name: "Continue to Secure Order" }).click();
      // The invalid public link prevents navigation and receives focus.
      const link = card.locator('input[inputmode="url"]');
      await expect(link).toBeFocused();
      await expect(link).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("[data-service-mobile-action]")).toHaveCount(0);
      await expect(card.getByRole("link", { name: "Refund eligibility" })).toBeVisible();
    }
  });
}

test("homepage search and categories retain the query and provide a recoverable empty state", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Search services" });
  await search.fill("YouTube");
  const cards = page.locator("#discovery-results [data-catalog-service]");
  await expect.poll(() => cards.count()).toBeGreaterThan(0);
  for (const code of await cards.evaluateAll(elements => elements.map(element => element.getAttribute("data-catalog-service")))) expect(code).toMatch(/^youtube-/);
  await page.getByRole("group", { name: "Filter by platform" }).getByRole("button", { name: "LinkedIn", exact: true }).click();
  await expect(search).toHaveValue("YouTube");
  await expect(page.getByRole("heading", { name: "No services match these filters." })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters", exact: true }).first().click();
  await expect(search).toHaveValue("");
  await page.getByLabel("Service category", { exact: true }).selectOption("likes");
  await expect.poll(() => cards.count()).toBeGreaterThan(0);
  for (const code of await cards.evaluateAll(elements => elements.map(element => element.getAttribute("data-catalog-service")))) expect(code).toContain("likes");
  await search.focus(); await page.keyboard.press("Tab");
  await expect(page.getByLabel("Service category", { exact: true })).toBeFocused();
});

test("quantity, summary and login handoff use unchanged catalog arithmetic; invalid text is retained", async ({ page }) => {
  await page.goto("/buy-instagram-followers-india");
  const card = page.locator("[data-service-order-card]").first();
  const quantity = card.getByLabel("Custom quantity", { exact: true });
  await quantity.fill("1000");
  await card.locator('input[inputmode="url"]').fill("https://www.instagram.com/synthetic_phase2/");
  const next = card.getByRole("link", { name: "Continue to Secure Order" });
  await expect(next).toHaveAttribute("href", /quantity=1000/);
  await expect(next).toHaveAttribute("href", /link=https/);
  await expect(card.getByText("₹999.90", { exact: true }).first()).toBeVisible();
  for (const value of ["", "99", "1000001", "1.5", "-100"]) {
    await quantity.fill(value);
    await next.click();
    await expect(quantity).toHaveValue(value);
    await expect(quantity).toHaveAttribute("aria-invalid", "true");
    await expect(quantity).toBeFocused();
    await expect(next).toHaveAttribute("href", "#");
  }
});

test("quantity and public link typed before hydration survive JavaScript loading", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/_next/static/**/*.js*", async route => { await gate; await route.fallback(); });
  try {
    await page.goto("/buy-instagram-followers-india", { waitUntil: "commit" });
    const card = page.locator("[data-service-order-card]").first();
    const quantity = card.getByLabel("Custom quantity", { exact: true });
    await quantity.fill("1000");
    await card.locator('input[inputmode="url"]').fill("https://www.instagram.com/synthetic_early/");
    release();
    await page.waitForLoadState("networkidle");
    await expect(quantity).toHaveValue("1000");
    await expect(card.getByRole("link", { name: "Continue to Secure Order" })).toHaveAttribute("href", /quantity=1000.*synthetic_early/);
  } finally { release(); }
});

// Each route retains the normal 30s budget. Four sequential audits previously
// exhausted one shared timeout under contention, aborting the final navigation.
for (const route of routes) test(`scoped automated accessibility audit covers ${route.name}`, async ({ page }, info) => {
    await page.goto(route.path, { waitUntil: "networkidle" });
    await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
    const selector = route.name === "home" ? "#services" : "[data-service-order-card]";
    await page.locator(selector).first().scrollIntoViewIfNeeded();
    const result = await page.evaluate(async selector => {
      const axe = (window as unknown as { axe: { run: (context: string, options: object) => Promise<{ violations: unknown[] }> } }).axe;
      return axe.run(selector, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } });
    }, selector);
    await info.attach(`axe-${route.name}`, { body: JSON.stringify(result), contentType: "application/json" });
    expect(result.violations, route.path).toEqual([]);
});
