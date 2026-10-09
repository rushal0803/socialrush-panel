import { test, expect } from "./fixtures";

test("packages hero is readable before JavaScript hydration", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  // Local production CSP upgrades insecure URLs; only the test transport strips
  // that directive, just as the shared smoke fixture does.
  await context.route(`${baseURL}/**`, async route => {
    if (route.request().resourceType() !== "document") return route.continue();
    const response = await route.fetch();
    const headers = response.headers();
    headers["content-security-policy"] = (headers["content-security-policy"] || "").split(";").filter(d => d.trim() !== "upgrade-insecure-requests").join(";");
    await route.fulfill({ response, headers });
  });
  await page.goto(`${baseURL}/packages`);
  const hero = page.getByRole("heading", { level: 1, name: /Your next campaign.*A package that fits/ });
  await expect(hero).toBeVisible();
  expect(await hero.evaluate(element => {
    let opacity = 1;
    for (let parent: Element | null = element; parent; parent = parent.parentElement) opacity *= Number(getComputedStyle(parent).opacity);
    return opacity;
  })).toBe(1);
  await context.close();
});

test("article revenue links remain in server-rendered HTML", async ({ request }) => {
  const response = await request.get("/blog/how-to-grow-fast-on-instagram");
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  expect(html).toContain("From research to action");
  expect(html).toContain("Primary service");
  expect(html).toContain("/buy-instagram-followers-india");
});

test("discovery and packages do not download the article-only bridge", async ({ page }) => {
  const chunks: string[] = [];
  page.on("response", response => {
    if (response.url().includes("/_next/") && response.url().split("?")[0].endsWith(".js")) chunks.push(response.url());
  });
  for (const route of ["/services", "/packages"]) {
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
  }
  // Inspect loaded script bodies rather than hashed filenames, which change
  // between builds. This catches accidental eager catalog imports in the shell.
  const scripts = await Promise.all([...new Set(chunks)].map(url => page.request.get(url).then(r => r.text())));
  expect(scripts.some(script => script.includes("From research to action"))).toBe(false);
});
