import { test, expect } from "./fixtures";
import fs from "node:fs";
import { randomUUID } from "node:crypto";

const target = "https://www.instagram.com/reel/quantity_qa/";
const backend = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin;

async function customer(context: import("@playwright/test").BrowserContext, baseURL: string) {
  const user = { id: "11111111-1111-4111-8111-111111111111", email: "quantity-qa@example.invalid", role: "authenticated", app_metadata: {}, user_metadata: {}, aud: "authenticated" };
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const jwt = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url")}.${Buffer.from(JSON.stringify({ sub: user.id, role: user.role, aud: user.aud, exp })).toString("base64url")}.fixture`;
  const session = { access_token: jwt, refresh_token: "fixture", expires_at: exp, expires_in: 3600, token_type: "bearer", user };
  const storageKey = `sb-${new URL(backend).hostname.split(".")[0]}-auth-token`;
  await context.addCookies([{ name: storageKey, value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`, url: baseURL }]);
  await context.addInitScript(({ storageKey, session }) => localStorage.setItem(storageKey, JSON.stringify(session)), { storageKey, session });
  await context.route(`${backend}/auth/v1/**`, route => route.fulfill({ json: user }));
  await context.route(`${backend}/rest/v1/**`, route => {
    if (route.request().method() !== "GET") return route.fulfill({ status: 403, json: { error: "Fixture writes disabled" } });
    const path = new URL(route.request().url()).pathname;
    const value = path.endsWith("/profiles") ? { ...user, full_name: "Quantity QA", balance: 100000, is_blocked: false } : null;
    const rows = path.endsWith("/services") ? JSON.parse(fs.readFileSync("tests/fixtures/packages-catalog.json", "utf8")) : value ? [value] : [];
    return route.fulfill({ json: route.request().headers().accept?.includes("object") ? value : rows });
  });
  await context.routeWebSocket(/\/realtime\/v1\/websocket/, socket => socket.onMessage(() => {}));
}

for (const width of [390, 1440]) {
  for (const earlyLink of [false, true]) {
    test(`early quantity survives hydration, pricing and ${earlyLink ? "early" : "mounted"} destination at ${width}px`, async ({ page, context, baseURL }, info) => {
      test.setTimeout(90000);
      await page.setViewportSize({ width, height: 900 });
      await context.route("**/api/display-currency", route => route.fulfill({ json: { currency: "INR" } }));
      const cdp = await context.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: width === 390 ? 6 : 1 });
      let release!: () => void;
      const gate = new Promise<void>(resolve => { release = resolve; });
      await context.route(/\/_next\/static\/.*\.js(?:\?.*)?$/, async route => { await gate; await route.continue(); });
      try {
        await page.goto("/instagram-views", { waitUntil: "commit" });
        const card = page.locator("[data-service-order-card]");
        const quantity = card.getByLabel("Custom quantity");
        const link = card.locator('input[inputmode="url"]');
        await expect(quantity).toBeEditable();
        await quantity.fill("1000");
        if (earlyLink) await link.fill(target);
        release();
        await page.waitForLoadState("networkidle");
        if (!earlyLink) await link.fill(target);
        // A subsequent React update must retain both early edits, not restore SSR defaults.
        await card.getByRole("button", { name: "Increase quantity", exact: true }).click();
        await expect(quantity).toHaveValue("1001");
        await card.getByRole("button", { name: "Decrease quantity", exact: true }).click();
        await expect(quantity).toHaveValue("1000");
        await expect(link).toHaveValue(target);
        await expect(card.getByText("1,000 units", { exact: true })).toBeVisible();
        await expect(card.locator('strong[aria-live="polite"]')).toHaveText("₹30.00");
        const proceed = card.getByRole("link", { name: "Continue to Secure Order" });
        const href = await proceed.getAttribute("href");
        const url = new URL(href!, baseURL);
        expect(Object.fromEntries(url.searchParams)).toMatchObject({ service: "instagram-views", quantity: "1000", link: target });
        await card.screenshot({ path: info.outputPath(`quantity-${width}.png`) });
        await proceed.click();
        await expect(page).toHaveURL(/\/login\?next=/);
        expect(new URL(page.url()).searchParams.get("next")).toBe(href);
        if (width === 390 && !earlyLink) {
          await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
          await customer(context, baseURL!);
          await page.goto(href!);
          await expect(page.getByRole("textbox", { name: /^Quantity/ })).toHaveValue("1000");
          await page.getByRole("button", { name: "Review Order", exact: true }).click();
          const summary = page.locator(".sr-order-payment-card");
          await expect(page.locator(".sr-order-review-card div").filter({ has: page.locator("dt").getByText("Quantity", { exact: true }) }).last().locator("dd")).toHaveText("1,000");
          await expect(summary).toContainText("₹30.00");
          // The existing server handler must retain quantity and calculate the
          // authoritative amount independently of any client-supplied price.
          const verified = await page.request.post("/api/checkout/intent", {
            headers: { Origin: baseURL! },
            data: { serviceCode: "instagram-views", quantity: 1000, link: target, clientRequestId: randomUUID(), price: 1, total_paise: 1 },
          });
          expect(verified.status()).toBe(201);
          expect((await verified.json()).data).toMatchObject({ quantity: 1000, serviceCode: "instagram-views", destinationLink: target, total_paise: 3000, currency: "INR" });
          let intent: Record<string, unknown> | undefined;
          let order: Record<string, unknown> | undefined;
          await page.route("**/api/checkout/intent", route => {
            intent = route.request().postDataJSON();
            return route.fulfill({ status: 201, json: { data: { id: "33333333-3333-4333-8333-333333333333" } } });
          });
          await page.route("**/api/orders", route => {
            order = route.request().postDataJSON();
            return route.fulfill({ status: 503, json: { error: "Fixture stopped before order creation" } });
          });
          await page.getByRole("button", { name: /Place Order/ }).click();
          await expect(page.getByText("Fixture stopped before order creation", { exact: true })).toBeVisible();
          expect(intent).toMatchObject({ serviceCode: "instagram-views", quantity: 1000, link: target });
          expect(order).toMatchObject({ intentId: "33333333-3333-4333-8333-333333333333", serviceCode: "instagram-views", quantity: 1000, link: target });
          expect(order?.clientRequestId).toBe(intent?.clientRequestId);
        }
      } finally { release(); }
    });
  }
}

for (const raw of ["", "99", "1000001"]) {
  test(`invalid early quantity ${raw || "blank"} remains invalid instead of silently becoming the minimum`, async ({ page, context }) => {
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    await context.route(/\/_next\/static\/.*\.js(?:\?.*)?$/, async route => { await gate; await route.continue(); });
    try {
      await page.goto("/instagram-views", { waitUntil: "commit" });
      const card = page.locator("[data-service-order-card]");
      const quantity = card.getByLabel("Custom quantity");
      await quantity.fill(raw);
      release();
      await page.waitForLoadState("networkidle");
      await card.locator('input[inputmode="url"]').fill(target);
      await expect(quantity).toHaveValue(raw);
      const proceed = card.getByRole("link", { name: "Continue to Secure Order" });
      await expect(proceed).toHaveAttribute("href", "#");
      await proceed.click();
      await expect(quantity).toHaveAttribute("aria-invalid", "true");
      await expect(quantity).toBeFocused();
      await expect(card.locator('strong[aria-live="polite"]')).toHaveText("—");
      await expect(page).toHaveURL(/\/instagram-views$/);
    } finally { release(); }
  });
}
