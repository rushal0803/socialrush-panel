const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3003';
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(baseURL).hostname), 'Use the isolated local QA server');
  const output = path.resolve('artifacts/phase2/native-zoom');
  fs.mkdirSync(output, { recursive: true });
  const profile = fs.mkdtempSync(path.join(output, 'profile-'));
  const context = await chromium.launchPersistentContext(profile, {
    executablePath: process.env.CHROMIUM_EXECUTABLE, channel: process.env.CHROMIUM_EXECUTABLE ? undefined : 'chromium', headless: true, viewport: null, reducedMotion: 'reduce',
    args: ['--no-sandbox', '--window-size=1440,1000'],
  });
  try {
    await context.addInitScript(() => Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' }));
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(baseURL).origin && route.request().method() === 'GET' ? route.fallback() : route.abort());
    await context.route(`${baseURL}/**`, async route => {
      if (route.request().method() !== 'GET') return route.fulfill({ status: 403, json: { error: 'Mutations disabled in responsive QA' } });
      if (route.request().resourceType() !== 'document') return route.continue();
      const response = await route.fetch({ maxRedirects: 0 });
      if (response.status() >= 300 && response.status() < 400) return route.continue();
      const headers = response.headers();
      if (headers['content-security-policy']) headers['content-security-policy'] = headers['content-security-policy'].split(';').filter(x => x.trim() !== 'upgrade-insecure-requests').join(';');
      await route.fulfill({ response, headers });
    });
    const page = context.pages()[0] || await context.newPage();
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    const beforeWidth = await page.evaluate(() => window.innerWidth);
    const settings = await context.newPage();
    await settings.goto('chrome://settings/appearance');
    const zoom = await settings.evaluate(() => new Promise(resolve => {
      chrome.settingsPrivate.setDefaultZoom(2, () => chrome.settingsPrivate.getDefaultZoom(resolve));
    }));
    await settings.close();
    assert.equal(zoom, 2);
    const results = [];
    for (const route of ['/', '/buy-instagram-followers-india', '/buy-youtube-subscribers-india', '/buy-linkedin-followers-india']) {
      await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle' });
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
