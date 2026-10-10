import { test, expect } from "./fixtures";

test("public navigation intent warms code without fetching live route data", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  const drawer = page.getByRole("dialog", { name: "Mobile navigation", exact: true });
  const requests: string[] = [];
  page.on("request", request => requests.push(request.url()));
  await drawer.locator('a[href="/services"]').first().focus();
  await expect.poll(() => requests.some(url => url.includes("/_next/static/") && url.includes(".js"))).toBe(true);
  expect(requests.filter(url => new URL(url).pathname === "/services")).toEqual([]);
  await drawer.locator('a[href="/services"]').first().click();
  await expect(page.locator("h1")).toHaveText("Social Media Growth Services");
});

test("lazy comparison preserves selections, filters and trigger focus", async ({ page }) => {
  await page.goto("/services");
  const trigger = page.getByRole("button", { name: "Compare services", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const search = dialog.getByRole("searchbox");
  await search.fill("instagram");
  await dialog.locator('button[aria-pressed]').first().click();
  await page.keyboard.press("Escape");
  const selectedTrigger = page.getByRole("button", { name: "Compare services (1)", exact: true });
  await expect(selectedTrigger).toBeFocused();
  await selectedTrigger.click();
  await expect(search).toHaveValue("instagram");
  await expect(dialog.getByRole("link", { name: "Choose this service" })).toHaveCount(1);
});

test("directory informational sections and FAQ remain in server HTML", async ({ request }) => {
  const response = await request.get("/services");
  expect(response.status()).toBe(200);
  const html = await response.text();
  for (const text of ["Clear information before you order.", "How to Choose a Service", "Explore services by platform", "Social Media Growth Services in India", "Services FAQ", "Do I need to provide my password?"]) expect(html).toContain(text);
  expect(html).toContain('id="how-to-choose"');
  expect(html).toContain('rel="canonical"');
});

for (const path of ["/", "/services", "/packages"]) {
  test(`deferred mobile content remains reachable on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    if (path === "/services") {
      await page.locator("#how-to-choose").scrollIntoViewIfNeeded();
      await expect(page.getByRole("heading", { name: "How to Choose a Service", exact: true })).toBeVisible();
      const faq = page.locator('section[aria-labelledby="services-faq-heading"] details').first();
      await faq.locator("summary").focus();
      await page.keyboard.press("Enter");
      await expect(faq).toHaveAttribute("open", "");
    }
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(page.locator("footer")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `artifacts/performance/followup-${path.replaceAll("/", "") || "home"}-footer.png` });
    await page.evaluate(() => scrollTo(0, 0));
    await expect(page.locator("h1").first()).toBeVisible();
  });
}
