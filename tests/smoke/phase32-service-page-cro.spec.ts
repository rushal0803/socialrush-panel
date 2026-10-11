import { expect, test } from "./fixtures";

test.describe("Phase 32 service-page CRO system", () => {
  test("static catalog service exposes inline exact-service builder", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/services/facebook-shares");

    const heroCta = page.locator("[data-service-primary-cta='inline-builder']");
    await expect(heroCta).toBeVisible();
    await expect(heroCta).toHaveAttribute("href", "#order-builder");

    const cro = page.locator("[data-service-cro-mode='inline-builder']");
    await cro.scrollIntoViewIfNeeded();
    await expect(cro).toBeVisible();
    await expect(cro.locator("[data-service-order-card]")).toBeVisible();

    const choices = cro.locator("[data-cro-quantity-option]");
    expect(await choices.count()).toBeGreaterThanOrEqual(2);
    await choices.last().click();
    await expect(choices.last()).toHaveAttribute("aria-pressed", "true");
  });

  test("protected live-fact service avoids stale static price and hands off to live order", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/services/twitter-likes");

    await expect(page.getByText("Live pricing in secure order", { exact: true }).first()).toBeVisible();
    await expect(page.locator("[data-service-order-card]")).toHaveCount(0);

    const heroCta = page.locator("[data-service-primary-cta='live-dashboard']");
    await expect(heroCta).toBeVisible();
    await expect(heroCta).toHaveAttribute("href", /\/dashboard\/new-order\?platform=x&service=twitter-likes/);

    const liveHandoff = page.locator("[data-service-live-handoff]");
    await liveHandoff.scrollIntoViewIfNeeded();
    await expect(liveHandoff).toBeVisible();
    await expect(liveHandoff).toHaveAttribute("href", /\/dashboard\/new-order\?platform=x&service=twitter-likes/);
  });
});

test.describe("Phase 5 protected catalog landing journeys", () => {
  for (const route of ["/services/tiktok-likes", "/services/telegram-post-views", "/services/twitter-crypto-retweets"]) {
    test(`${route} shows a guarded 390px mobile order path`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), route).toBeLessThan(400);
      await expect(page.locator("h1").first()).toBeVisible();

      const inline = page.locator("#order-builder");
      const unavailable = page.getByText("This service is currently unavailable", { exact: true });
      if (await inline.count()) {
        await expect(inline.locator("[data-service-order-card]")).toBeVisible();
        await expect(page.getByRole("link", { name: "Start Order", exact: true })).toHaveAttribute("href", "#order-builder");
        await page.locator("footer").scrollIntoViewIfNeeded();
        const mobile = page.locator("[data-service-mobile-action]");
        await expect(mobile).toBeVisible();
        await expect(mobile.getByRole("link")).toHaveAttribute("href", "#order-builder");
      } else {
        await expect(unavailable).toBeVisible();
        await expect(page.locator("[data-service-order-card]")).toHaveCount(0);
        await expect(page.locator("[data-service-mobile-action]")).toHaveCount(0);
        await expect(page.getByRole("link", { name: "Start Order", exact: true })).toHaveCount(0);
        await expect(page.getByText("Live pricing and availability are not confirmed.", { exact: false })).toBeVisible();
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test("specialty comments cannot accidentally use the generic inline builder", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto("/services/twitter-crypto-custom-comments", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("#order-builder")).toHaveCount(0);
    if (await page.getByText("This service is currently unavailable", { exact: true }).count()) {
      await expect(page.locator("[data-service-mobile-action]")).toHaveCount(0);
    } else {
      await expect(page.getByRole("link", { name: "Start Order", exact: true })).toHaveAttribute("href", /\/dashboard\/new-order\?/);
    }
  });
});
