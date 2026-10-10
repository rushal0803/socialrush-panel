import { test, expect } from "./fixtures";

const publicRoutes = ["/support", "/reviews", "/tools", "/terms-and-conditions"];

for (const width of [320, 390, 1440]) {
  test(`phase 2 public pages stay crawlable and readable at ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const path of publicRoutes) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status(), path).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(1);
    }
    expect(errors).toEqual([]);
  });
}

test("support navigation and reviews empty-state remain truthful", async ({ page }) => {
  await page.goto("/support");
  for (const route of ["/faq#delivery", "/faq#payments", "/refund-policy", "/trust", "/services", "/contact"]) {
    await expect(page.locator(`a[href="${route}"]`).first()).toBeVisible();
  }
  await page.goto("/reviews");
  await expect(page.getByRole("heading", { name: "Reviews from completed orders" })).toBeVisible();
  const empty = page.getByRole("heading", { name: "No published customer reviews yet" });
  if (await empty.count()) await expect(page.getByRole("link", { name: "Your reviews" })).toHaveAttribute("href", "/dashboard/reviews");
});

test("creator tools keep category selection and search accessible", async ({ page }) => {
  await page.goto("/tools");
  const search = page.getByRole("textbox", { name: "Search creator tools" });
  await expect(search).toBeVisible();
  await search.fill("thumbnail");
  await expect(page.getByRole("link", { name: /Preview thumbnail/i }).first()).toBeVisible();
});
