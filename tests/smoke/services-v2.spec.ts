import { test, expect } from "./fixtures";
import { loadEnvConfig } from "@next/env";
import type { BrowserContext } from "@playwright/test";

loadEnvConfig(process.cwd());
const backend = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
const user = { id: "11111111-1111-4111-8111-111111111111", email: "packages-test@example.invalid", role: "authenticated", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "2026-01-01T00:00:00Z" };
async function authenticate(context: BrowserContext, baseURL: string) {
  const key = `sb-${backend.hostname.split(".")[0]}-auth-token`;
  const jwt = [Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"), Buffer.from(JSON.stringify({ sub: user.id, role: "authenticated", aud: "authenticated", exp: Math.floor(Date.now()/1000)+3600 })).toString("base64url"), Buffer.from("test-signature").toString("base64url")].join(".");
  const session = { access_token: jwt, refresh_token: "fixture", expires_at: Math.floor(Date.now()/1000)+3600, expires_in: 3600, token_type: "bearer", user };
  await context.addCookies([{ name: key, value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`, url: baseURL }]);
  await context.addInitScript(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), { key, session });
  await context.route(`${backend.origin}/auth/v1/**`, route => route.fulfill({ json: user }));
  await context.route(`${backend.origin}/rest/v1/**`, route => route.fulfill({ json: route.request().url().includes("profiles") ? [{ ...user, full_name: "Services QA", balance: 100000, is_blocked: false }] : [] }));
  await context.routeWebSocket(/\/realtime\/v1\/websocket/, socket => socket.onMessage(message => { try { const [joinRef, ref, topic] = JSON.parse(String(message)); socket.send(JSON.stringify([joinRef, ref, topic, "phx_reply", { status: "ok", response: {} }])); } catch { /* Isolated QA has no realtime changes. */ } }));
}

for (const width of [320,360,375,390,412,430,600,768,1024,1280,1440]) {
  test(`services catalogue and comparison fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto("/services");
    await expect(page.locator("h1")).toHaveText("Social Media Growth Services");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://www.getsocialrush.com/services");
    const cards = page.locator("[data-catalog-service]");
    await expect(cards.first()).toBeVisible();
    const categories = page.locator('[aria-label="Service type filters"]');
    await expect(categories.getByRole("button", { name: "All", exact: true })).toHaveCount(1);
    expect(await cards.first().evaluate(el => el.getBoundingClientRect().height)).toBeLessThan(440);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `artifacts/services-v2/${width}-hero.png` });
    await cards.first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: `artifacts/services-v2/${width}-cards.png` });
    const order = cards.first().getByRole("link", { name: /^Order / });
    await order.hover();
    const contrast = await order.evaluate(element => {
      const luminance = (color: string) => {
        const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => {
          const linear = value / 255;
          return linear <= .04045 ? linear / 12.92 : ((linear + .055) / 1.055) ** 2.4;
        });
        return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
      };
      const style = getComputedStyle(element);
      const text = luminance(style.color), background = luminance(style.backgroundColor);
      return (Math.max(text, background) + .05) / (Math.min(text, background) + .05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
    await cards.first().getByText("Before you order", { exact: true }).click();
    await expect(cards.first().locator("details")).toHaveAttribute("open", "");
    const compare = page.getByRole("button", { name: "Compare services", exact: true });
    expect(await compare.evaluate(el => getComputedStyle(el).position)).not.toBe("fixed");
    await compare.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const choices = dialog.locator('button[aria-pressed]');
    await choices.nth(0).click(); await choices.nth(1).click();
    await expect(dialog.getByRole("link", { name: "Choose this service" })).toHaveCount(2);
    expect(await dialog.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `artifacts/services-v2/${width}-compare.png` });
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Compare services (2)", exact: true })).toBeFocused();
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `artifacts/services-v2/${width}-footer.png` });
    expect(errors).toEqual([]);
  });
}

for (const signedIn of [false,true]) for (const platform of ["instagram","youtube","facebook","linkedin","x","tiktok","telegram"]) {
  test(`${signedIn ? "signed-in" : "guest"} ${platform} order CTA retains service and quantity`, async ({ page, context, baseURL }) => {
    if (signedIn) await authenticate(context, baseURL!);
    await page.goto(`/services?platform=${platform}`);
    const card = page.locator("[data-catalog-service]").first();
    await expect(card).toBeVisible();
    const code = await card.getAttribute("data-catalog-service");
    const order = card.getByRole("link", { name: /^Order / });
    const href = await order.getAttribute("href");
    const target = new URL(href!, baseURL);
    expect(target.searchParams.get("platform")).toBe(platform);
    expect(target.searchParams.get("service")).toBe(code);
    expect(Number(target.searchParams.get("quantity"))).toBeGreaterThan(0);
    await order.click();
    if (signedIn) await expect(page).toHaveURL(/\/dashboard\/new-order/);
    else {
      await expect(page).toHaveURL(/\/login\?next=/);
      const next = new URL(new URL(page.url()).searchParams.get("next")!, baseURL);
      expect(next.searchParams.get("service")).toBe(code);
      expect(next.searchParams.get("quantity")).toBe(target.searchParams.get("quantity"));
    }
  });
}

test("search, real categories, missing health and saved activity remain usable", async ({ page }) => {
  await page.route("**/api/service-health", route => route.fulfill({ json: { data: {} } }));
  await page.addInitScript(() => {
    localStorage.setItem("sr_recent_services_v1", JSON.stringify([{ code: "instagram-likes", viewedAt: Date.now() }]));
    localStorage.setItem("sr_continue_order_v1", JSON.stringify({ serviceCode: "instagram-likes", quantity: 250, updatedAt: Date.now() }));
  });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/services?platform=instagram&type=all");
  await expect(page.getByRole("link", { name: "Continue Order", exact: true })).toHaveAttribute("href", /quantity=250/);
  await expect(page.getByRole("region", { name: "Your recent SocialRUSH activity" })).toBeVisible();
  const search = page.getByRole("searchbox", { name: "Search services", exact: true });
  await search.fill("likes");
  await expect(page.locator("[data-catalog-service]")).toHaveCount(1);
  await expect(page.locator("[data-catalog-service]")).toHaveAttribute("data-catalog-service", "instagram-likes");
  await expect(page.locator("[data-catalog-service]").getByText(/Available|Stable/)).toHaveCount(0);
  await search.fill("zzzz-no-service");
  await expect(page.getByText("No services match your filters.")).toBeVisible();
  await page.getByRole("button", { name: "Reset filters", exact: true }).click();
  await expect(search).toHaveValue("");
  await page.screenshot({ path: "artifacts/services-v2/320-saved-activity.png" });
});
