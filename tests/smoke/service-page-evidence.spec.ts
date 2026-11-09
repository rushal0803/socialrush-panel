import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const paths = ["/buy-instagram-followers-india", "/instagram-likes", "/youtube-subscribers", "/youtube-views", "/buy-facebook-followers-india", "/instagram-views", "/linkedin-followers", "/facebook-likes", "/twitter-followers", "/telegram-members"];
test.use({ viewport: { width: 390, height: 844 } });

for (const path of paths) {
  test(`service evidence and mobile layout ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://www.getsocialrush.com${path}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent || "{}")));
    const service = schemas.find(schema => schema["@type"] === "Service");
    expect(service).toBeTruthy();
    if (["/instagram-views", "/twitter-followers", "/buy-instagram-followers-india"].includes(path)) expect(service.offers).toBeUndefined();
    if (service.offers) {
      expect(service.offers.priceSpecification.price).toBe(service.offers.price);
      expect(service.offers.priceSpecification.referenceQuantity.value).toBe(1000);
    }
    if (path === "/telegram-members") {
      const faq = schemas.find(schema => schema["@type"] === "FAQPage");
      expect(faq.mainEntity).toHaveLength(9);
      for (const question of faq.mainEntity) {
        await expect(page.getByRole("button", { name: question.name, exact: true })).toBeVisible();
      }
      await page.getByRole("button", { name: "Do purchased members guarantee an active Telegram community?", exact: true }).click();
      await expect(page.getByText(faq.mainEntity[8].acceptedAnswer.text, { exact: true })).toBeVisible();
    }
    if (path === "/buy-instagram-followers-india") {
      await expect(page.locator('[data-aeo-answer="service-summary"]')).toContainText("₹999.90 per 1,000");
    }
    await page.evaluate(() => scrollTo(0, 0));
    await mkdir("artifacts/service-evidence", { recursive: true });
    await page.screenshot({ path: `artifacts/service-evidence/${path.slice(1)}.png` });
  });
}
