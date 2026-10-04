import { expect, test } from "./fixtures";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

test("reference order validates input and preserves selection through login", async ({ page }) => {
  await page.goto("/buy-instagram-followers-india");
  const card = page.locator("[data-service-order-card]");
  const proceed = card.getByRole("link", { name: "Continue to Secure Order" });
  await expect(card).toBeVisible();
  await expect(card.locator('strong[aria-live="polite"]')).toHaveText("\u20b979.90");
  await proceed.click();
  await expect(card.locator('[aria-invalid="true"]')).toHaveCount(1);
  await card.getByRole("button", { name: /^1,000/ }).click();
  await card.getByLabel(/Enter your Instagram/).fill("https://youtube.com/watch?v=wrong");
  await proceed.click();
  await expect(card.locator('[role="alert"]')).toContainText(/Instagram/);
  await card.getByLabel(/Enter your Instagram/).fill("https://instagram.com/socialrushcro");
  await expect(proceed).toHaveAttribute("href", /quantity=1000/);
  await proceed.click();
  await expect(page).toHaveURL(/\/login\?/);
  const destination = new URL(page.url()).searchParams.get("next")!;
  const restored = new URL(destination, "https://www.getsocialrush.com");
  expect(restored.pathname).toBe("/dashboard/new-order");
  expect(restored.searchParams.get("service")).toBe("instagram-followers");
  expect(restored.searchParams.get("quantity")).toBe("1000");
  expect(restored.searchParams.get("link")).toBe("https://instagram.com/socialrushcro");
});

for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
  test(`reference page fits ${width}px and retains crawlable SEO`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/buy-instagram-followers-india", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toHaveText("Buy Instagram Followers India");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://www.getsocialrush.com/buy-instagram-followers-india");
    await expect(page.locator("[data-service-order-card]")).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
    if (width === 390 || width === 1440) await page.screenshot({ path: `test-results/service-reference-${width}.png`, fullPage: false });
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = schemas.map(value => JSON.parse(value)).find(value => value["@type"] === "FAQPage");
    expect(faq.mainEntity).toHaveLength(13);
    for (const entry of faq.mainEntity) await expect(page.getByText(entry.acceptedAnswer.text, { exact: true })).toHaveCount(1);
  });
}

test("mobile order action clears support and can be dismissed", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/buy-instagram-followers-india", { waitUntil: "domcontentloaded" });
  await page.locator("footer").scrollIntoViewIfNeeded();
  const bar = page.locator("[data-service-mobile-action]");
  await expect(bar).toBeVisible();
  const barRect = await bar.boundingBox();
  const supportRect = await page.getByRole("link", { name: "Open SocialRUSH WhatsApp support" }).boundingBox();
  if (supportRect && barRect) expect(barRect.x + barRect.width).toBeLessThanOrEqual(supportRect.x);
  await bar.getByRole("button", { name: "Dismiss mobile order bar" }).click();
  await expect(bar).toHaveCount(0);
});

for (const service of [
  { route: "/instagram-likes", code: "instagram-likes", link: "https://instagram.com/p/TEST123/" },
  { route: "/instagram-views", code: "instagram-views", link: "https://instagram.com/reel/TEST123/" },
  { route: "/youtube-subscribers", code: "youtube-subscribers", link: "https://youtube.com/@socialrush" },
  { route: "/us/buy-youtube-views", code: "youtube-views", link: "https://youtube.com/watch?v=dQw4w9WgXcQ" },
]) {
  test(`${service.route} carries its quantity and correct destination to order review`, async ({ page }) => {
    await page.goto(service.route, { waitUntil: "domcontentloaded" });
    const card = page.locator("[data-service-order-card]");
    await expect(card).toHaveCount(1);
    await card.getByLabel("Custom quantity").fill("1000");
    await card.locator('input[inputmode="url"]').fill(service.link);
    const proceed = card.getByRole("link", { name: "Continue to Secure Order" });
    const href = await proceed.getAttribute("href");
    const destination = new URL(href!, "https://www.getsocialrush.com");
    expect(destination.searchParams.get("service")).toBe(service.code);
    expect(destination.searchParams.get("quantity")).toBe("1000");
    expect(destination.searchParams.get("link")).toBe(service.link);
    await proceed.click();
    await expect(page).toHaveURL(/\/login\?/);
    expect(new URL(page.url()).searchParams.get("next")).toBe(href);
  });
}

const baseline = path.join(os.tmpdir(), "socialrush-service-seo-baseline.json");
const servicePaths: string[] = fs.existsSync(baseline) ? Object.keys(JSON.parse(fs.readFileSync(baseline, "utf8"))) : [];
test.describe("Complete configured service-page responsive matrix", () => {
  for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
    for (let offset = 0; offset < servicePaths.length; offset += 12) {
      test(`compiled service pages ${offset + 1}-${Math.min(offset + 12, servicePaths.length)} remain usable at ${width}px`, async ({ page }) => {
      test.setTimeout(240000);
      expect(servicePaths.length, "Run the rendered SEO snapshot before this suite").toBeGreaterThan(80);
      await page.setViewportSize({ width, height: 900 });
      for (const route of servicePaths.slice(offset, offset + 12)) {
        const response = await page.goto(route, { waitUntil: "domcontentloaded" });
        expect(response?.status(), route).toBeLessThan(400);
        await expect(page.locator("h1").first(), route).toBeVisible();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${route} at ${width}px`).toBeLessThanOrEqual(1);
      }
    });
    }
  }
});
