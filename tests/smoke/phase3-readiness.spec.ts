import { test, expect } from "./fixtures";

// Scripted keyboard and semantic evidence, NOT a human screen-reader audit.
for (const width of [390, 1440]) test(`keyboard service form and navigation evidence ${width}`,async({page,baseURL},info)=>{
  expect(["localhost","127.0.0.1"]).toContain(new URL(baseURL!).hostname);
  await page.route("**/*",route=>route.request().method()==="GET" && new URL(route.request().url()).origin===new URL(baseURL!).origin ? route.fallback() : route.abort());
  await page.setViewportSize({width,height:1000});
  const response=await page.goto("/buy-linkedin-followers-india",{waitUntil:"networkidle"});
  expect(response?.status()).toBe(200);
  const card=page.locator("[data-service-order-card]").first();
  const qty=card.getByLabel("Custom quantity",{exact:true});
  await qty.focus();await page.keyboard.press("ControlOrMeta+A");await page.keyboard.type("1000");
  await expect(qty).toHaveValue("1000");
  await page.keyboard.press("Tab");
  const focused=await page.evaluate(()=>({tag:document.activeElement?.tagName,label:document.activeElement?.getAttribute("aria-label"),type:document.activeElement?.getAttribute("type")}));
  const publicLink=card.locator('input[inputmode="url"]');
  await publicLink.focus();await page.keyboard.type("invalid");
  const cta=card.getByRole("link",{name:"Continue to Secure Order"});
  await cta.focus();await page.keyboard.press("Enter");await expect(publicLink).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
  await info.attach("keyboard-and-semantics",{body:JSON.stringify({width,focusAfterQuantity:focused,tree:await card.ariaSnapshot(),timing:await page.evaluate(()=>performance.getEntriesByType("navigation").map(e=>e.toJSON()))}),contentType:"application/json"});
  await page.screenshot({path:info.outputPath(`linkedin-keyboard-${width}.jpg`),type:"jpeg",quality:70});
});
