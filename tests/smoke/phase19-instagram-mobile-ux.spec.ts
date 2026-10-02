import { expect, test } from "@playwright/test";

const viewports = [320, 360, 390, 430] as const;
const routes = [
  { path: "/buy-instagram-followers-india", target: "#packages", name: "Instagram Followers" },
  { path: "/instagram-likes", target: "#packages", name: "Instagram Likes" },
  { path: "/instagram-views", target: "#packages", name: "Instagram Views" },
  { path: "/buy-instagram-comments-india", target: "#order", name: "Instagram Comments" },
  { path: "/buy-instagram-saves-india", target: "#order", name: "Instagram Saves" },
  { path: "/buy-instagram-shares-india", target: "#order", name: "Instagram Shares" },
] as const;

test.describe("Phase 19 Instagram mobile-first UX", () => {
  for (const width of viewports) {
    test(`canonical Instagram money pages avoid document overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      for (const route of routes) {
        await page.goto(route.path);
        await expect(page.locator("h1").first()).toBeVisible();
        const dimensions = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          scroll: document.documentElement.scrollWidth,
        }));
        expect(dimensions.scroll, `${route.path} overflowed at ${width}px`).toBeLessThanOrEqual(dimensions.viewport + 1);
      }
    });
  }

  test("mobile order dock clears WhatsApp and hides at the order builder", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/buy-instagram-followers-india");

    const dock = page.locator('a[href="#packages"]').filter({ hasText: "Start order" });
    const whatsapp = page.getByRole("link", { name: "Open SocialRUSH WhatsApp support" });
    await expect(dock).toBeVisible();
    await expect(whatsapp).toBeVisible();

    const dockBox = await dock.boundingBox();
    const whatsappBox = await whatsapp.boundingBox();
    expect(dockBox).not.toBeNull();
    expect(whatsappBox).not.toBeNull();
    if (dockBox && whatsappBox) {
      expect(dockBox.x + dockBox.width).toBeLessThanOrEqual(whatsappBox.x);
      expect(dockBox.height).toBeGreaterThanOrEqual(44);
      expect(whatsappBox.height).toBeGreaterThanOrEqual(44);
    }

    await dock.click();
    await expect(page.locator("#packages")).toBeInViewport();
    await expect(dock).toBeHidden();
  });

  for (const route of routes) {
    test(`${route.name} order inputs stay at 16px or larger on mobile`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route.path);
      const target = page.locator(route.target);
      await target.scrollIntoViewIfNeeded();
      const inputs = target.locator("input, select, textarea");
      const count = await inputs.count();
      expect(count, `${route.path} should expose an order control`).toBeGreaterThan(0);
      for (let index = 0; index < count; index += 1) {
        const size = await inputs.nth(index).evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
        expect(size, `${route.path} mobile control font size`).toBeGreaterThanOrEqual(16);
      }
    });
  }
});
