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
