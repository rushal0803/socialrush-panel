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
  await expect(page.locator('a[href="/services"]:visible').first()).toBeVisible();
  await expectUsablePage(page, "/services", /Social Media Growth Services|Growth Services/i);
  await expectUsablePage(page, "/packages", /Social Media Growth Packages|Packages/i);
  await expectUsablePage(page, "/login", /Welcome back to SocialRUSH/i);
  await expectUsablePage(page, "/register", /Create your SocialRUSH account/i);

  expect(clientErrors, clientErrors.map(String).join("\n")).toEqual([]);
});

test("homepage public navigation reaches services and packages", async ({ page }) => {
  await page.goto("/");
  await page.goto("/services");
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.locator("body")).toContainText(/Growth Services/i);

  await page.goto("/packages");
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

test("production CSP retains required Supabase and Cashfree allowances without Razorpay checkout", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  const csp = response.headers()["content-security-policy"];
  expect(csp).toBeTruthy();
  expect(csp).toContain("connect-src 'self' https://*.supabase.co wss://*.supabase.co");
  expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  expect(csp).toContain("https://sdk.cashfree.com");
  expect(csp).not.toContain("razorpay.com");
});

test("former Razorpay order endpoints reject new customer payments", async ({ request }) => {
  for (const path of ["/api/payments/razorpay/order", "/api/razorpay/create-order", "/api/checkout/payment"]) {
    const response = await request.post(path, { data: {} });
    expect(response.status(), `${path} must be permanently unavailable for new payments`).toBe(410);
    await expect(response.json()).resolves.toMatchObject({
      error: "Razorpay is disabled for new payments. Use Cashfree.",
    });
  }
});

test("case studies links remain valid at supported mobile and desktop widths", async ({ page }) => {
  const viewports = [
    { width: 320, height: 800 }, { width: 360, height: 800 }, { width: 375, height: 812 },
    { width: 390, height: 844 }, { width: 414, height: 896 }, { width: 430, height: 932 },
    { width: 768, height: 900 }, { width: 1024, height: 900 }, { width: 1280, height: 900 },
    { width: 1366, height: 900 }, { width: 1440, height: 900 },
  ];

  const response = await page.goto("/case-studies", { waitUntil: "domcontentloaded" });
  expect(response?.status(), "Case Studies should render").toBeLessThan(400);

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await expect(page.getByRole("link", { name: /Explore scenarios/i })).toHaveAttribute("href", "#scenarios");
    await expect(page.getByRole("link", { name: /View services/i }).first()).toHaveAttribute("href", "/services");
    await expect(page.locator('a.cs-service-chip')).toHaveCount(13);
  }

  const expectedDestinations = [
    "/services", "/services?platform=instagram", "/services?platform=youtube", "/services?platform=facebook",
    "/buy-instagram-followers-india", "/instagram-likes", "/instagram-views", "/youtube-subscribers",
    "/youtube-views", "/youtube-likes", "/buy-facebook-followers-india", "/services?platform=linkedin", "/packages",
    "/login?next=/dashboard/new-order",
  ];
  const linkedDestinations = await page.locator('a[href]').evaluateAll((links) => links.map((link) => link.getAttribute("href")));

  for (const destination of expectedDestinations) {
    expect(linkedDestinations, `${destination} should be rendered by Case Studies`).toContain(destination);
  }
});
