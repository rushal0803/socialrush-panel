import { expect, test } from "@playwright/test";

const missingCoverageRoutes = [
  "/about",
  "/contact",
  "/blog",
  "/login",
  "/register",
  "/admin/login",
  "/us",
  "/uk",
  "/ca",
  "/au",
  "/ae",
  "/sg",
  "/linkedin-followers",
  "/youtube-subscribers",
  "/telegram-members",
  "/twitter-followers",
  "/facebook-likes",
  "/tiktok-followers",
] as const;

const completionViewports = [
  { name: "small-phone", width: 320, height: 700 },
  { name: "tablet-portrait", width: 768, height: 1024 },
] as const;

async function expectNoDocumentOverflow(page: import("@playwright/test").Page, path: string) {
  await page.goto(path);
  await expect(page.locator("body")).not.toHaveText("");
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll, `${path} overflowed horizontally`).toBeLessThanOrEqual(dimensions.viewport + 1);
}

test.describe("Phase 22 responsive completion matrix", () => {
  for (const viewport of completionViewports) {
    test(`previously uncovered public/auth/country routes avoid overflow on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      for (const path of missingCoverageRoutes) {
        await expectNoDocumentOverflow(page, path);
      }
    });
  }

  test("representative pages remain usable in tablet landscape", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 600 });

    for (const path of ["/", "/packages", "/login", "/us", "/linkedin-followers"] as const) {
      await page.goto(path);
      await expect(page.locator("body")).not.toHaveText("");
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scroll, `${path} overflowed in landscape`).toBeLessThanOrEqual(dimensions.viewport + 1);
    }
  });

  test("auth controls keep mobile-safe sizing across customer and admin auth", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });

    for (const path of ["/login", "/register", "/admin/login"] as const) {
      await page.goto(path);
      const controls = page.locator("button, input:not([type=checkbox]):not([type=radio]), select, textarea");
      const count = await controls.count();
      expect(count, `${path} should expose interactive controls`).toBeGreaterThan(0);

      for (let index = 0; index < count; index += 1) {
        const control = controls.nth(index);
        const box = await control.boundingBox();
        if (!box) continue;
        expect(box.height, `${path} control ${index} tap height`).toBeGreaterThanOrEqual(44);

        const tagName = await control.evaluate((element) => element.tagName);
        if (["INPUT", "SELECT", "TEXTAREA"].includes(tagName)) {
          const fontSize = await control.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
          expect(fontSize, `${path} control ${index} mobile font size`).toBeGreaterThanOrEqual(16);
        }
      }
    }
  });

  test("country hub CTA and platform directory remain reachable on a 320px phone", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/us");

    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    const primaryCta = page.getByRole("link", { name: /explore.*services/i }).first();
    await expect(primaryCta).toBeVisible();
    expect((await primaryCta.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);

    const services = page.locator("#services");
    await services.scrollIntoViewIfNeeded();
    await expect(services).toBeInViewport();
  });
});
