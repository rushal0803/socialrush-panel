import { expect, test, type Page } from "@playwright/test";

const applicationError = /application error|something went wrong|internal server error/i;

async function expectUsablePage(page: Page, path: string, criticalText: RegExp) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response, `${path} should return a response`).not.toBeNull();
  expect(response!.status(), `${path} should not fail`).toBeLessThan(400);
  await expect(page.locator("body")).toContainText(criticalText);
  await expect(page.locator("body")).not.toContainText(applicationError);
  expect((await page.locator("body").innerText()).trim()).not.toBe("");
}

test("public routes render meaningful content without application errors", async ({ page }) => {
  const clientErrors: Error[] = [];
  page.on("pageerror", (error) => clientErrors.push(error));

  await expectUsablePage(page, "/", /SocialRUSH/i);
  await expect(page.locator('a[href="/services"]').first()).toBeVisible();
  await expectUsablePage(page, "/services", /Social Media Growth Services|Growth Services/i);
  await expectUsablePage(page, "/packages", /Social Media Growth Packages|Packages/i);
  await expectUsablePage(page, "/login", /Welcome back to SocialRUSH/i);
  await expectUsablePage(page, "/register", /Create your SocialRUSH account/i);

  expect(clientErrors, clientErrors.map(String).join("\n")).toEqual([]);
});

test("homepage public navigation reaches services and packages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /services/i }).first().click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.locator("body")).toContainText(/Growth Services/i);

  await page.getByRole("link", { name: /packages/i }).first().click();
  await expect(page).toHaveURL(/\/packages$/);
  await expect(page.locator("body")).toContainText(/Packages/i);
});

test("authentication forms are available", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator('form input[name="email"]')).toBeVisible();
  await expect(page.locator('form input[name="password"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Login", exact: true })).toBeVisible();

  await page.goto("/register");
  await expect(page.locator('form input[name="fullName"]')).toBeVisible();
  await expect(page.locator('form input[name="email"]')).toBeVisible();
  await expect(page.locator('form input[name="password"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Account", exact: true })).toBeVisible();
});

test("unauthenticated dashboard routes redirect to login", async ({ page }) => {
  for (const path of ["/dashboard/new-order", "/dashboard/orders", "/dashboard/add-funds", "/dashboard/account"]) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response, `${path} should redirect`).not.toBeNull();
    await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(path)}`));
    await expect(page.locator('form input[name="email"]')).toBeVisible();
  }
});

test("production CSP retains required Supabase, Razorpay, and inline-style allowances", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  const csp = response.headers()["content-security-policy"];
  expect(csp).toBeTruthy();
  expect(csp).toContain("connect-src 'self' https://*.supabase.co wss://*.supabase.co");
  expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  expect(csp).toContain("https://checkout.razorpay.com");
  expect(csp).toContain("https://api.razorpay.com");
});
