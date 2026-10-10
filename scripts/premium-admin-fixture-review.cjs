// Local CI admin layout visual verification only. Never run against production.
const { chromium, expect } = require("@playwright/test");
const { mkdirSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");
const start = require("./playwright-server-setup.cjs");
require("@next/env").loadEnvConfig(process.cwd());

const base = "http://localhost:3001";
const user = { id: "11111111-1111-4111-8111-111111111111", email: "admin-qa@example.invalid",
  role: "authenticated", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "2026-01-01T00:00:00Z" };
const encode = value => Buffer.from(JSON.stringify(value)).toString("base64url");
const expires_at = Math.floor(Date.now() / 1000) + 3600;
const token = [encode({alg:"HS256",typ:"JWT"}),encode({sub:user.id,role:"authenticated",aud:"authenticated",exp:expires_at}),"dGVzdA"].join(".");
const session = { access_token: token, refresh_token: "fixture", expires_at, expires_in: 3600, token_type: "bearer", user };
const backend = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
const key = `sb-${backend.hostname.split(".")[0]}-auth-token`;

async function main() {
  if (process.env.ADMIN_QA_FIXTURE !== "1" || !/^(http:\/\/localhost:3001|http:\/\/127\.0\.0\.1:3001)$/.test(base)) {
    throw Error("Admin fixture review must run only against the isolated localhost QA backend");
  }
  const stop = await start();
  const browser = await chromium.launch();
  const outDir = resolve("artifacts/premium-integration-admin");
  mkdirSync(outDir, {recursive:true});
  const results = [];
  try {
    // Preserve auth: an anonymous browser is denied the real admin interface.
    const anonymous = await browser.newPage();
    await anonymous.goto(base + "/admin/dashboard", {waitUntil:"domcontentloaded",timeout:60000});
    if (!new URL(anonymous.url()).pathname.startsWith("/admin/login")) {
      throw Error("Anonymous admin route did not redirect to login");
    }
    await anonymous.close();
    for (const width of [390,1440]) {
      const context = await browser.newContext({viewport:{width,height:900},serviceWorkers:"block",reducedMotion:"reduce"});
      // The server preload does not intercept browser requests. Keep client
      // authentication and read-only data inside this same synthetic fixture.
      await context.route(`${backend.origin}/**`, async route => {
        const request = route.request();
        const path = new URL(request.url()).pathname;
        if (!path.startsWith("/auth/v1/") && !path.startsWith("/rest/v1/")) {
          return backend.origin === base ? route.continue() : route.abort("blockedbyclient");
        }
        const headers = { "Access-Control-Allow-Origin": base, "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET, OPTIONS" };
        if (request.method() === "OPTIONS") return route.fulfill({status:204,headers});
        if (request.method() !== "GET") return route.fulfill({status:403,headers,json:{message:"Writes disabled in admin visual fixture"}});
        let json = path.startsWith("/auth/v1/") ? user : [];
        if (path.endsWith("/profiles")) {
          const profile = {...user,full_name:"Admin QA",role:"admin",balance:100000,is_blocked:false};
          json = request.headers().accept?.includes("object") ? profile : [profile];
        }
        return route.fulfill({json,headers});
      });
      await context.routeWebSocket(/\/realtime\/v1\/websocket/, socket => socket.onMessage(message => {
        try { const [join,ref,topic] = JSON.parse(String(message)); socket.send(JSON.stringify([join,ref,topic,"phx_reply",{status:"ok",response:{}}])); } catch { /* No live changes in synthetic fixture. */ }
      }));
      await context.addCookies([{name:key,value:"base64-"+encode(session),url:base}]);
      await context.addInitScript(({key,session}) => {
        localStorage.setItem(key,JSON.stringify(session));
        Object.defineProperty(navigator,"doNotTrack",{configurable:true,get:()=>"1"});
      },{key,session});
      const page = await context.newPage();
      const response = await page.goto(base+"/admin/dashboard",{waitUntil:"domcontentloaded",timeout:60000});
      const pathname = new URL(page.url()).pathname;
      if (response?.status() !== 200 || !pathname.startsWith("/admin/dashboard")) {
        throw Error("Fixture admin dashboard failed to render: "+JSON.stringify({status:response?.status(),pathname,width}));
      }
      await expect(page.getByRole("heading",{name:"Operations Dashboard",exact:true})).toBeVisible();
      await expect(page.locator(".admin-shell main .animate-pulse, .admin-shell main [aria-busy='true']")).toHaveCount(0);
      if (width >= 1024) {
        await page.getByRole("navigation",{name:"Admin sections",exact:true}).waitFor({timeout:15000});
        for (const name of ["Manage","Growth & SEO","Customers & settings"]) {
          await page.getByRole("heading",{name,exact:true}).first().waitFor();
        }
      } else {
        const toggle=page.getByRole("button",{name:"Open admin menu"});
        await toggle.click();
        await page.getByRole("navigation",{name:"Admin sections on mobile"}).waitFor({timeout:10000});
        await page.getByRole("button",{name:"Close menu",exact:true}).click();
      }
      const audit=await page.evaluate(() => ({
        heading:document.querySelector("h1")?.textContent?.trim()??null,
        overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
        adminNavLinks:[...document.querySelectorAll("a[href^='/admin/']")].length,
        fullName:document.querySelector(".admin-header")?.textContent?.includes("Admin QA")??false,
        pageBackground:getComputedStyle(document.querySelector(".admin-shell")).backgroundColor
      }));
      if(audit.overflow>1 || audit.adminNavLinks<5 || !audit.fullName)throw Error("Admin layout regression "+JSON.stringify({width,audit}));
      await page.screenshot({path:resolve(outDir,"admin-"+width+".png"),animations:"disabled"});
      results.push({width,status:response.status(),pathname,...audit});
      await context.close();
    }
    writeFileSync(resolve(outDir,"admin-layout-audit.json"),JSON.stringify({fixture:true,origin:base,results},null,2));
    console.log("Authenticated admin fixture: 2 screenshots, mobile drawer, desktop groups and anonymous redirect PASS");
  } finally { await browser.close(); await stop?.(); }
}
main().catch(e=>{ console.error(e); process.exitCode=1; });
