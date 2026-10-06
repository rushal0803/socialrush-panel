import { expect, test } from "@playwright/test";

for (const viewport of [
  { name: "mobile", width: 320, height: 700 },
  { name: "desktop", width: 1440, height: 900 },
] as const) {
  test(`Phase 41 press page is usable on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/press");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Useful SocialRUSH resources");
    await expect(page.getByRole("link", { name: /Press or media enquiry/i })).toBeVisible();
    await expect(page.getByText("Earned coverage only.")).toBeVisible();

    const size = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(size.scroll).toBeLessThanOrEqual(size.viewport + 1);
  });
}
