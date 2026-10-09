const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3003';
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(baseURL).hostname), 'Use the isolated local QA server');
  const output = path.resolve('artifacts/premium-responsive/native-zoom');
  fs.mkdirSync(output, { recursive: true });
  const extension = path.resolve('tests/fixtures/zoom-extension');
  const profile = fs.mkdtempSync(path.join(output, 'profile-'));
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium', headless: true, viewport: null, reducedMotion: 'reduce',
    args: ['--window-size=1280,960', `--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    await context.addInitScript(() => Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' }));
    await context.route(`${baseURL}/**`, async route => {
      if (route.request().method() !== 'GET') return route.fulfill({ status: 403, json: { error: 'Mutations disabled in responsive QA' } });
      if (route.request().resourceType() !== 'document') return route.continue();
      const response = await route.fetch({ maxRedirects: 0 });
      if (response.status() >= 300 && response.status() < 400) return route.continue();
      const headers = response.headers();
      if (headers['content-security-policy']) headers['content-security-policy'] = headers['content-security-policy'].split(';').filter(x => x.trim() !== 'upgrade-insecure-requests').join(';');
      await route.fulfill({ response, headers });
    });
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    const page = context.pages()[0] || await context.newPage();
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    const beforeWidth = await page.evaluate(() => window.innerWidth);
    const zoom = await worker.evaluate(async base => {
      const tab = (await chrome.tabs.query({})).find(tab => tab.url?.startsWith(base));
      if (!tab) throw new Error('QA page tab was not found');
      await chrome.tabs.setZoom(tab.id, 2);
      return chrome.tabs.getZoom(tab.id);
    }, baseURL);
    assert.equal(zoom, 2);
    const results = [];
    for (const route of ['/', '/services', '/packages', '/login']) {
      await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle' });
      await worker.evaluate(async base => {
        const tab = (await chrome.tabs.query({})).find(tab => tab.url?.startsWith(base));
        if (!tab) throw new Error('QA page tab was not found');
        await chrome.tabs.setZoom(tab.id, 2);
      }, baseURL);
      await page.waitForFunction(width => window.innerWidth <= width * 0.55, beforeWidth);
      const layout = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight, scroll: document.documentElement.scrollWidth, pixelRatio: window.devicePixelRatio }));
      assert.ok(layout.width <= beforeWidth * 0.55, 'Native zoom must reduce the CSS viewport');
      assert.ok(layout.scroll <= layout.width + 1, `${route} overflows at native 200% zoom`);
      await page.screenshot({ path: path.join(output, `${route === '/' ? 'home' : route.slice(1)}-200.png`) });
      results.push({ route, zoom, beforeWidth, ...layout });
    }
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
    console.log('Native Chromium 200% zoom: 4 public routes passed');
  } finally { await context.close(); }
})().catch(error => { console.error(error); process.exit(1); });
