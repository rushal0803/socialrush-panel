import { expect, test } from "@playwright/test";

const staticRoutes = [
  { path: "/buy-instagram-followers-india", target: "#packages", link: "https://instagram.com/socialrushcro" },
  { path: "/instagram-likes", target: "#packages", link: "https://www.instagram.com/p/CROTEST123/" },
  { path: "/instagram-views", target: "#packages", link: "https://www.instagram.com/reel/CROTEST123/" },
] as const;

test.describe("Phase 20 Instagram conversion path", () => {
  for (const route of staticRoutes) {
    test(`${route.path} exposes truthful quantity decisions and readiness`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route.path);
      const target = page.locator(route.target);
      await target.scrollIntoViewIfNeeded();

      const grid = target.locator("[data-cro-quantity-grid]");
      const readiness = target.locator("[data-cro-readiness]");
      await expect(grid).toBeVisible();
      await expect(readiness).toBeVisible();
      await expect(target.getByText(/Most popular|Limited time|Best seller/i)).toHaveCount(0);

      const choices = grid.locator("[data-cro-quantity-option]");
      expect(await choices.count()).toBeGreaterThanOrEqual(2);
      await choices.last().click();
      await expect(choices.last()).toHaveAttribute("aria-pressed", "true");

      const destination = target.locator('input[placeholder*="instagram.com"]').last();
      await destination.fill(route.link);
      await expect(readiness).toContainText("3/3 ready");

      const continueLink = target.getByRole("link", { name: /Continue to Secure Order/i });
      await expect(continueLink).toHaveAttribute("href", /\/dashboard\/new-order\?/);
    });
  }
});
