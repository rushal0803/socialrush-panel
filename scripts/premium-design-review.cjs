// Local-only rendered review. Never submit orders or authenticate against production.
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const stage = process.argv[2] || 'after';
const routes = ['/', '/services', '/packages', '/pricing', '/buy-instagram-followers-india', '/youtube-views', '/linkedin-followers', '/buy-facebook-followers-india', '/tiktok-followers', '/telegram-members', '/twitter-followers', '/us/buy-instagram-followers', '/login', '/register', '/blog', '/about', '/faq', '/contact'];
async function main() {
  const stop = await require('./playwright-server-setup.cjs')();
  const browser = await chromium.launch();
  const dir = path.join('artifacts/premium-design', stage);
  fs.mkdirSync(dir, { recursive: true });
  const results = [];
  try {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' });
        window.__review = { lcp: 0, cls: 0 };
        new PerformanceObserver(list => { for (const e of list.getEntries()) window.__review.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__review.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
      });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Page.setBypassCSP', { enabled: true });
      for (const route of routes) {
        const response = await page.goto(`http://localhost:3001${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.locator('h1').first().waitFor();
        await page.waitForTimeout(1200);
        await page.screenshot({ path: path.join(dir, `${route === '/' ? 'home' : route.slice(1)}-${width}.png`), fullPage: true });
        results.push(await page.evaluate(({ route, width, status }) => ({ route, width, status, title: document.title, canonical: document.querySelector('link[rel="canonical"]')?.href, robots: document.querySelector('meta[name="robots"]')?.content, h1: [...document.querySelectorAll('h1')].map(e => e.textContent), links: [...new Set([...document.querySelectorAll('a[href]')].map(e => e.getAttribute('href')))].sort(), schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map(e => JSON.parse(e.textContent)), overflow: document.documentElement.scrollWidth > width, ...window.__review }), { route, width, status: response.status() }));
      }
      await context.close();
    }
    fs.writeFileSync(path.join(dir, 'rendered-review.json'), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results.map(({route,width,status,overflow,h1,lcp,cls}) => ({route,width,status,overflow,h1,lcp,cls})), null, 2));
  } finally { await browser.close(); await stop?.(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });


