import { expect, test } from "@playwright/test";

const publicJourney = ["/", "/services", "/packages", "/pricing", "/trust"] as const;

test.describe("Phase 13 production-readiness safeguards", () => {
  test("critical public journey renders without client-visible failure", async ({ page }) => {
    for (const path of publicJourney) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} should render successfully`).toBe(200);
      await expect(page.locator("body")).not.toContainText(/application error|internal server error/i);
      await expect(page.locator("title")).not.toHaveText("");
    }
  });

  test("primary public navigation exposes conversion and trust destinations", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) =>
      links.map((link) => (link as HTMLAnchorElement).getAttribute("href") || ""),
    );
    expect(hrefs.some((href) => href.startsWith("/services"))).toBeTruthy();
    expect(hrefs.some((href) => href.startsWith("/packages"))).toBeTruthy();
    expect(hrefs.some((href) => href.startsWith("/trust") || href.startsWith("/faq") || href.startsWith("/support"))).toBeTruthy();
  });

  test("login stays mobile-safe at compact width", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto("/login");
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport + 1);
  });
});
