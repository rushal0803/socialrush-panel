import { expect, test } from "@playwright/test";

const compactViewports = [320, 360, 390, 430] as const;
const publicRoutes = ["/", "/services", "/packages", "/pricing"] as const;

test.describe("Phase 12 mobile and accessibility safeguards", () => {
  test("public shell exposes a keyboard skip link", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await expect(skipLink).toBeFocused();
    await skipLink.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
    await expect(page.locator("#main-content")).toBeVisible();
  });

  for (const width of compactViewports) {
    test(`core public routes avoid horizontal document overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });

      for (const path of publicRoutes) {
        await page.goto(path);
        const dimensions = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          scroll: document.documentElement.scrollWidth,
        }));
        expect(dimensions.scroll, `${path} overflowed at ${width}px`).toBeLessThanOrEqual(dimensions.viewport + 1);
      }
    });
  }

  test("coarse-pointer form controls keep accessible tap height", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");

    const controls = page.locator("button, input:not([type=checkbox]):not([type=radio]), select, textarea");
    const count = await controls.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const box = await controls.nth(index).boundingBox();
      if (box) expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
