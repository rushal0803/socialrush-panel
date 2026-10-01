import { expect, test, type Page } from "@playwright/test";

const applicationError = /application error|something went wrong|internal server error/i;

async function expectPublicRoute(page: Page, path: string, copy: RegExp) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response, `${path} should return a response`).not.toBeNull();
  expect(response!.status(), `${path} should render successfully`).toBeLessThan(400);
  await expect(page.locator("body")).toContainText(copy);
  await expect(page.locator("body")).not.toContainText(applicationError);
}

test.describe("Phase 15 full website launch audit", () => {
  test("launch-critical public routes render without page errors", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    const routes: Array<[string, RegExp]> = [
      ["/", /SocialRUSH/i],
      ["/services", /social media growth services/i],
      ["/pricing", /pricing/i],
      ["/packages", /packages/i],
      ["/about", /SocialRUSH/i],
      ["/contact", /contact/i],
      ["/faq", /frequently|questions|faq/i],
      ["/trust", /safe|safety|trust/i],
      ["/case-studies", /case studies/i],
      ["/blog", /blog|guides/i],
      ["/tools", /tools/i],
      ["/login", /Welcome back to SocialRUSH/i],
      ["/register", /Create your SocialRUSH account/i],
    ];

    for (const [path, copy] of routes) await expectPublicRoute(page, path, copy);

    expect(pageErrors, pageErrors.map(String).join("\n")).toEqual([]);
  });

  test("all published country hubs render from the shared international shell", async ({ page }) => {
    for (const path of ["/us", "/uk", "/ca", "/au", "/ae", "/sg"]) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response, `${path} should return a response`).not.toBeNull();
      expect(response!.status(), `${path} should render successfully`).toBeLessThan(400);
      await expect(page.locator("body")).toContainText(/SocialRUSH/i);
      await expect(page.locator("body")).not.toContainText(applicationError);
    }
  });

  test("priority public pages retain self-referencing canonical links", async ({ page, baseURL }) => {
    for (const path of ["/", "/services", "/pricing", "/packages", "/trust"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const href = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(href, `${path} should expose a canonical link`).toBeTruthy();
      expect(new URL(href!, baseURL).pathname).toBe(path);
    }
  });

  test("footer does not advertise disabled Razorpay checkout", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const footer = page.locator("footer");
    await expect(footer).toContainText("UPI at checkout");
    await expect(footer).toContainText("Wallet Balance");
    await expect(footer).not.toContainText(/Razorpay/i);
  });

  test("priority service routes remain usable after sitewide visual changes", async ({ page }) => {
    const paths = [
      "/buy-instagram-followers-india",
      "/youtube-subscribers",
      "/buy-facebook-followers-india",
      "/linkedin-followers",
      "/twitter-followers",
      "/telegram-members",
      "/tiktok-followers",
    ];

    for (const path of paths) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response, `${path} should return a response`).not.toBeNull();
      expect(response!.status(), `${path} should remain usable`).toBeLessThan(400);
      await expect(page.locator("body")).not.toContainText(applicationError);
      expect((await page.locator("body").innerText()).trim().length).toBeGreaterThan(200);
    }
  });
});
