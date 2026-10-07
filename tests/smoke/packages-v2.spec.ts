import { test, expect } from "./fixtures";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
const project = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0];
const backendOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin;
const storageKey = `sb-${project}-auth-token`;
const user = { id: "11111111-1111-4111-8111-111111111111", email: "packages-test@example.invalid", role: "authenticated", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "2026-01-01T00:00:00Z" };
const jwt = `${Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: user.id, role: "authenticated", aud: "authenticated", exp: Math.floor(Date.now()/1000)+3600 })).toString("base64url")}.${Buffer.from("test-signature").toString("base64url")}`;
const session = { access_token: jwt, refresh_token: "fixture", expires_at: Math.floor(Date.now()/1000)+3600, expires_in: 3600, token_type: "bearer", user };

test.beforeEach(async ({ context }) => {
  await context.routeWebSocket(/\/realtime\/v1\/websocket/, socket => {
    socket.onMessage(message => {
      try {
        const [joinRef, ref, topic] = JSON.parse(String(message));
        socket.send(JSON.stringify([joinRef, ref, topic, "phx_reply", { status: "ok", response: {} }]));
      } catch { /* No unsolicited realtime events in package QA. */ }
    });
  });
  await context.route(`${backendOrigin}/auth/v1/**`, async route => route.fulfill({ json: user }));
  await context.route(`${backendOrigin}/rest/v1/**`, async route => {
    const url = new URL(route.request().url());
    if (url.pathname.includes("/auth/v1/user")) return route.fulfill({ json: user });
    if (url.pathname.includes("/profiles")) return route.fulfill({ json: [{ ...user, full_name: "Package QA", balance: 100000, is_blocked: false }] });
    return route.fulfill({ json: [] });
  });
});

async function authenticate(context: import("@playwright/test").BrowserContext, baseURL: string) {
  await context.addCookies([{ name: storageKey, value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`, url: baseURL }]);
  await context.addInitScript(({ storageKey, session }) => localStorage.setItem(storageKey, JSON.stringify(session)), { storageKey, session });
}

for (const width of [320,360,375,390,412,430,768,1024,1280,1440]) {
  for (const variant of ["public", "dashboard"]) {
    test(`${variant} packages fit ${width}px with reachable review`, async ({ page, context, baseURL }) => {
      if (variant === "dashboard") await authenticate(context, baseURL!);
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      const consoleErrors: string[] = [];
      page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(variant === "dashboard" ? "/dashboard/packages" : "/packages");
      await expect(page.locator("[data-package-card]").first()).toBeVisible();
      await expect(page.locator(".package-experience h1")).toHaveCount(1);
      const checkLayout = async () => {
        const result = await page.evaluate(() => {
          const root = document.querySelector(".package-experience")!;
          return { overflow: document.documentElement.scrollWidth > innerWidth, outside: [...root.querySelectorAll("button,input,article")].filter(el => { const rect = el.getBoundingClientRect(); return rect.width && (rect.left < -1 || rect.right > innerWidth+1); }).map(el => el.textContent?.slice(0,60)) };
        });
        expect(result).toEqual({ overflow: false, outside: [] });
        const contrast = await page.locator("[data-package-card] button").evaluateAll(buttons => {
          const luminance = (color: string) => {
            const rgb = color.match(/[\d.]+/g)!.slice(0,3).map(Number).map(value => { const linear = value/255; return linear <= .04045 ? linear/12.92 : ((linear+.055)/1.055)**2.4; });
            return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
          };
          return buttons.map(button => { const style = getComputedStyle(button); const a=luminance(style.color), b=luminance(style.backgroundColor); return (Math.max(a,b)+.05)/(Math.min(a,b)+.05); });
        });
        for (const ratio of contrast) expect(ratio).toBeGreaterThanOrEqual(4.5);
      };
      await checkLayout();
      await page.screenshot({ path: `artifacts/packages-v2/${variant}-${width}-top.png`, fullPage: true });
      await page.getByRole("button", { name: "Choose Growth package" }).click();
      await expect(page.locator("#package-checkout")).toBeVisible();
      await checkLayout();
      await page.locator("#package-checkout").screenshot({ path: `artifacts/packages-v2/${variant}-${width}-review.png` });
      expect(errors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    });
  }
}

test("every supported platform and live-priced service has selectable packages", async ({ page }) => {
  await page.goto("/packages");
  for (const label of ["Instagram", "YouTube", "Facebook", "LinkedIn", "X / Twitter", "TikTok", "Telegram"]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page.locator("[data-package-card]").first()).toBeVisible();
  }
  for (const code of ["youtube-comments", "youtube-watch-hours", "facebook-group-members"]) {
    await page.goto(`/packages?service=${code}`);
    await expect(page.locator("[data-package-card]")).toHaveCount(4);
    await page.getByRole("button", { name: "Choose Growth package" }).click();
    await expect(page.locator("#package-link")).toBeVisible();
  }
});

test("logged-out checkout preserves package and link through login", async ({ page }) => {
  await page.goto("/packages");
  await page.getByRole("button", { name: "Choose Growth package" }).click();
  await page.locator("#package-link").fill("https://www.instagram.com/package_qa/");
  await page.getByRole("button", { name: "Sign in & continue" }).click();
  await expect(page).toHaveURL(/\/login\?next=/);
  const pending = await page.evaluate(() => JSON.parse(localStorage.getItem("socialrush.packages.pending-order.v2")!));
  expect(pending.packageId).toContain("instagram-followers:growth:");
  expect(pending.targetLink).toContain("package_qa");
});

test("wallet checkout uses an intent; price tampering and mismatched quantities are rejected", async ({ page, context, baseURL }) => {
  await authenticate(context, baseURL!);
  await page.goto("/dashboard/packages");
  await page.getByRole("button", { name: "Choose Growth package" }).click();
  await expect(page).toHaveURL(/package=/);
  const packageId = new URL(page.url()).searchParams.get("package")!;
  const quantity = Number(packageId.split(":")[2]);
  const payload = { serviceCode: "instagram-followers", quantity, packageId, link: "https://www.instagram.com/package_qa/", clientRequestId: randomUUID(), price: 1, total_paise: 1 };
  const intent = await page.request.post("/api/checkout/intent", { data: payload, headers: { Origin: baseURL! } });
  expect(intent.status()).toBe(201);
  const result = await intent.json();
  expect(result.data.total_paise).toBe(Math.round(Math.round(quantity * 799 * 100 / 1000) * .97));
  const duplicate = await page.request.post("/api/checkout/intent", { data: payload, headers: { Origin: baseURL! } });
  expect((await duplicate.json()).data.duplicate).toBe(true);
  const invalid = await page.request.post("/api/checkout/intent", { data: { ...payload, quantity: quantity+1, clientRequestId: randomUUID() }, headers: { Origin: baseURL! } });
  expect(invalid.status()).toBe(409);
  let orderPayload: Record<string, unknown> | undefined;
  await page.route("**/api/orders", route => { orderPayload = route.request().postDataJSON(); return route.fulfill({ status: 503, json: { error: "Test stopped before paid order" } }); });
  await page.locator("#package-link").fill(payload.link);
  await page.getByRole("button", { name: "Buy with Wallet" }).click();
  await expect(page.locator("#package-checkout [role=alert]")).toHaveText("Test stopped before paid order");
  expect(orderPayload?.intentId).toBeTruthy();
});

test("insufficient wallet directs to add funds without sending an order", async ({ page, context, baseURL }) => {
  await authenticate(context, baseURL!);
  await context.route(`${backendOrigin}/rest/v1/profiles**`, route => route.fulfill({ json: [{ ...user, balance: 0 }] }));
  let writes = 0;
  await page.route("**/api/orders", route => { writes++; return route.abort(); });
  await page.goto("/dashboard/packages");
  await page.getByRole("button", { name: "Choose Growth package" }).click();
  await page.locator("#package-link").fill("https://www.instagram.com/package_qa/");
  await page.getByRole("button", { name: "Add Funds & continue" }).click();
  await expect(page).toHaveURL(/\/dashboard\/add-funds\?amount=/);
  expect(writes).toBe(0);
});

test("server validates package intents across platforms and live-only services", async ({ page, context, baseURL }) => {
  await authenticate(context, baseURL!);
  const cases = [
    ["instagram-saves", "https://www.instagram.com/p/package_qa/"],
    ["youtube-comments", "https://www.youtube.com/watch?v=abcdefghijk"],
    ["youtube-watch-hours", "https://www.youtube.com/watch?v=abcdefghijk"],
    ["facebook-group-members", "https://www.facebook.com/groups/package_qa/"],
    ["linkedin-followers", "https://www.linkedin.com/company/package-qa/"],
    ["x-followers", "https://x.com/package_qa"],
    ["tiktok-followers", "https://www.tiktok.com/@package_qa"],
    ["telegram-members", "https://t.me/package_qa"],
  ];
  for (const [serviceCode, link] of cases) {
    await page.goto(`/dashboard/packages?service=${serviceCode}`);
    await page.getByRole("button", { name: "Choose Growth package" }).click();
    await expect(page).toHaveURL(/package=/);
    const packageId = new URL(page.url()).searchParams.get("package")!;
    const response = await page.request.post("/api/checkout/intent", { data: { serviceCode, link, packageId, quantity: Number(packageId.split(":")[2]), clientRequestId: randomUUID() }, headers: { Origin: baseURL! } });
    const result = await response.json();
    expect(response.status(), `${serviceCode}: ${JSON.stringify(result)}`).toBe(201);
    expect(result.data.total_paise).toBeGreaterThan(0);
  }
});

test("a changed server total blocks the order until the customer reviews pricing", async ({ page, context, baseURL }) => {
  await authenticate(context, baseURL!);
  let orders = 0;
  await page.route("**/api/checkout/intent", route => route.fulfill({ json: { data: { id: randomUUID(), total_paise: 1 } } }));
  await page.route("**/api/orders", route => { orders++; return route.abort(); });
  await page.goto("/dashboard/packages");
  await page.getByRole("button", { name: "Choose Growth package" }).click();
  await page.locator("#package-link").fill("https://www.instagram.com/package_qa/");
  await page.getByRole("button", { name: "Buy with Wallet" }).click();
  await expect(page.locator("#package-checkout [role=alert]")).toContainText("The price has changed");
  expect(orders).toBe(0);
});

test("switching services clears service-specific checkout inputs", async ({ page, context, baseURL }) => {
  await authenticate(context, baseURL!);
  await page.goto("/dashboard/packages?service=telegram-poll-votes");
  await page.getByRole("button", { name: "Choose Growth package" }).click();
  await page.getByLabel("Poll answer number").fill("7");
  await page.locator(".package-experience aside").getByRole("button", { name: /Members/ }).click();
  await page.getByRole("button", { name: "Choose Growth package" }).click();
  await page.locator("#package-link").fill("https://t.me/package_qa");
  let payload: Record<string, unknown> | undefined;
  await page.route("**/api/checkout/intent", route => { payload = route.request().postDataJSON(); return route.fulfill({ json: { data: { id: randomUUID(), total_paise: 1 } } }); });
  await page.getByRole("button", { name: "Buy with Wallet" }).click();
  await expect(page.locator("#package-checkout [role=alert]")).toContainText("The price has changed");
  expect(payload?.pollAnswerNumber).toBeUndefined();
});

test("all supported service choices remain contained and selectable at 320px", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/packages");
  let services = 0;
  for (const platform of ["Instagram", "YouTube", "Facebook", "LinkedIn", "X / Twitter", "TikTok", "Telegram"]) {
    await page.getByRole("button", { name: platform, exact: true }).click();
    const choices = page.locator(".package-experience aside button");
    const count = await choices.count();
    for (let index=0; index<count; index++) {
      await choices.nth(index).click();
      await expect(page.locator("[data-package-card]").first()).toBeVisible();
      const overflow = await choices.evaluateAll(buttons => buttons.filter(button => {
        const bounds=button.getBoundingClientRect(), label=button.querySelector("span")!.getBoundingClientRect();
        return label.right > bounds.right-2 || label.left < bounds.left;
      }).map(button => button.textContent));
      expect(overflow).toEqual([]);
      services++;
    }
  }
  expect(services).toBe(43);
});
