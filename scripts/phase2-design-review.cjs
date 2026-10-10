// Phase 2 public design evidence: local fixture data only, no real orders or production access.
const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const setup = require("./playwright-server-setup.cjs");

const routes = ["/support", "/reviews", "/tools", "/terms-and-conditions", "/refund-policy", "/privacy-policy"];
const widths = [390, 1440];

async function main() {
  const stop = await setup();
  const browser = await chromium.launch();
  const outDir = path.resolve("artifacts/phase2-design");
  fs.mkdirSync(outDir, { recursive: true });
  const evidence = [];
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: "block", reducedMotion: "reduce" });
      await context.addInitScript(() => Object.defineProperty(navigator, "doNotTrack", { get: () => "1" }));
      const page = await context.newPage();
      for (const route of routes) {
        const pathname = route.slice(1);
        const response = await page.goto("http://127.0.0.1:3001" + route, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.locator("h1").first().waitFor({ timeout: 15000 });
        await page.screenshot({ path: path.join(outDir, pathname + "-" + width + ".png"), animations: "disabled" });
        const data = await page.evaluate(() => ({
          title: document.title,
          canonical: document.querySelector('link[rel="canonical"]')?.href || null,
          robots: document.querySelector('meta[name="robots"]')?.content || null,
          h1: [...document.querySelectorAll("h1")].map(node => node.textContent.trim()),
          scrollWidth: document.documentElement.scrollWidth,
          pageBackground: getComputedStyle(document.body).backgroundColor,
          links: [...new Set([...document.querySelectorAll("a[href]")].map(el => el.getAttribute("href")))].sort(),
        }));
        evidence.push({ route, width, status: response?.status(), ...data });
        if (response?.status() !== 200 || data.scrollWidth > width + 1 || data.h1.length !== 1) {
          throw new Error("Render regression: " + JSON.stringify({ route, width, status: response?.status(), scrollWidth: data.scrollWidth, h1Count: data.h1.length }));
        }
      }
      await context.close();
    }
    fs.writeFileSync(path.join(outDir, "rendered-review.json"), JSON.stringify(evidence, null, 2));
    console.log("Phase 2 visual evidence: " + evidence.length + " screenshots, no overflow, one H1 per route.");
  } finally {
    await browser.close();
    await stop?.();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
