const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
// Supplemental destination-warm measurements; no before/after claims.
async function main() {
  const stop = await require('./playwright-server-setup.cjs')();
  const browser = await chromium.launch();
  const samples = [];
  try {
    for (const profile of ['desktop', 'mobile-4g']) {
      const context = await browser.newContext({ viewport: profile === 'desktop' ? { width: 1440, height: 900 } : { width: 390, height: 844 }, isMobile: profile !== 'desktop', deviceScaleFactor: 1, serviceWorkers: 'block' });
      await context.addInitScript(() => Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' }));
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Page.setBypassCSP', { enabled: true });
      if (profile !== 'desktop') {
        await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      }
      for (const route of ['/services', '/packages', '/login']) {
        await page.goto(`http://localhost:3001${route}`, { waitUntil: 'networkidle' });
        await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
        for (let run = 0; run < 5; run++) {
          // Use the real mobile drawer, avoiding links inside collapsed footer
          // accordions. Drawer opening is excluded from route latency.
          let link;
          if (profile !== 'desktop') {
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
            link = page.getByRole('dialog', { name: 'Mobile navigation', exact: true }).locator(`a[href="${route}"]`).first();
          } else {
            link = page.locator(`a[href="${route}"]:not(footer *)`).filter({ visible: true }).first();
          }
          await link.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          await page.evaluate(() => window.__warmDocument = true);
          const started = performance.now();
          await link.click();
          await page.waitForURL(url => url.pathname === route);
          await page.locator('h1').first().waitFor();
          await page.waitForFunction(() => {
            const h = document.querySelector('h1');
            if (!h) return false;
            for (let p = h; p; p = p.parentElement) if (Number(getComputedStyle(p).opacity) < .99) return false;
            return true;
          });
          const sample = { profile, route, run, ms: performance.now() - started, clientNavigation: await page.evaluate(() => window.__warmDocument === true) };
          samples.push(sample); console.log(JSON.stringify(sample));
          await page.goBack({ waitUntil: 'load' });
          await page.locator('h1').first().waitFor();
        }
      }
      await context.close();
    }
  } finally { await browser.close(); await stop(); }
  const summary = [...new Set(samples.map(s => `${s.profile}|${s.route}`))].map(key => {
    const values = samples.filter(s => `${s.profile}|${s.route}` === key).map(s => s.ms).sort((a,b) => a-b);
    return { key, median: values[2], p75: values[3] };
  });
  fs.mkdirSync(path.resolve('artifacts/performance'), { recursive: true });
  fs.writeFileSync('artifacts/performance/warm-navigation.json', JSON.stringify({ note: 'After-only, destination HTTP cache warmed by prior visits, real Link clicks, synthetic server. Does not establish before/after improvement.', samples, summary }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
