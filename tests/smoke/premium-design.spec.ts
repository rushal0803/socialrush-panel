import { test, expect } from "./fixtures";

const widths = [320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1920];
const routes = ["/", "/services", "/packages", "/login", "/register", "/buy-instagram-followers-india", "/us/buy-instagram-followers", "/blog"];

for (const width of widths) {
  test(`premium presentation remains usable at ${width}px`, async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const route of routes) {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), { message: route }).toBeLessThanOrEqual(1);
    }
    expect(errors).toEqual([]);
  });
}

test("hero actions, sample labels and keyboard focus are understandable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("complementary", { name: "SocialRUSH workspace preview with illustrative sample data" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Check Price & Start", exact: true })).toHaveAttribute("href", "#order-demo");
  await expect(page.getByRole("link", { name: "Browse Services", exact: true }).first()).toHaveAttribute("href", "#services");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.goto("/login");
  await page.locator('input[name="email"]').focus();
  await expect(page.locator('input[name="email"]')).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /Forgot password/i })).toBeFocused();
});

test("login feature heading retains accessible contrast on its light surface", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login");
  const ratio = await page.getByRole("complementary", { name: "SocialRUSH account features" }).evaluate(aside => {
    const luminance = (color: string) => {
      const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => {
        const channel = value / 255;
        return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
      });
      return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
    };
    const foreground = luminance(getComputedStyle(aside.querySelector("h2")!).color);
    const background = luminance(getComputedStyle(aside).backgroundColor);
    return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
  });
  expect(ratio).toBeGreaterThanOrEqual(3);
});
