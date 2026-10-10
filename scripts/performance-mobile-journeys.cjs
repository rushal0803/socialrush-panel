// Focused PR #623 follow-up: fresh destination vs router/HTTP-warm mobile taps.
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const runs = Number(process.env.PERF_RUNS || 5);
const output = process.env.PERF_OUTPUT || 'artifacts/performance/mobile-journeys.json';
const journeys = [['/', '/services'], ['/', '/packages'], ['/services', '/buy-instagram-followers-india']];
async function measure(page, destination) {
  let link;
  if (page.url().endsWith('/')) {
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    link = page.getByRole('dialog', { name: 'Mobile navigation', exact: true }).locator(`a[href="${destination}"]`).first();
  } else link = page.locator(`[data-catalog-service="instagram-followers"] a[href="${destination}"]`).first();
  await link.scrollIntoViewIfNeeded();
  // Equal source settling on both revisions; product adds no waiting.
  await page.waitForTimeout(500);
  await page.evaluate(destination => {
    const previous = document.querySelector('h1')?.textContent;
    window.__journey = { started: null, ready: null, document: true };
    const start = event => {
      if (event.target.closest?.('a')?.pathname !== destination) return;
      if (window.__journey.started !== null) return;
      window.__journey.started = performance.now();
      const poll = () => {
        const h = document.querySelector('h1');
        let visible = h && h.textContent !== previous && h.getBoundingClientRect().height > 0;
        for (let e = h; e && visible; e = e.parentElement) visible = Number(getComputedStyle(e).opacity) >= .99;
        if (location.pathname === destination && visible) window.__journey.ready = performance.now();
        else requestAnimationFrame(poll);
      };
      requestAnimationFrame(poll);
    };
    for (const event of ['touchstart', 'pointerdown', 'click']) document.addEventListener(event, start, { capture: true, once: true });
  }, destination);
  await link.tap();
  await page.waitForURL(url => url.pathname === destination, { timeout: 60000 });
  await page.waitForFunction(() => window.__journey?.ready != null, null, { timeout: 60000 });
  return page.evaluate(() => ({ ms: window.__journey.ready - window.__journey.started, clientNavigation: window.__journey.document === true }));
}
async function main() {
  fs.mkdirSync(require('node:path').dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify({ incomplete: true }));
  const stop = await require('./playwright-server-setup.cjs')();
  const browser = await chromium.launch();
  const samples = [];
  try {
    for (const [source, destination] of journeys) for (let run = 0; run < runs; run++) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, serviceWorkers: 'block' });
      await context.addInitScript(() => Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' }));
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Page.setBypassCSP', { enabled: true });
      await cdp.send('Network.clearBrowserCache');
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await page.goto(`http://localhost:3001${source}`, { waitUntil: 'load' });
      await page.waitForTimeout(3000);
      for (const cache of ['cold-destination', 'warm-destination']) {
        if (cache === 'warm-destination') {
          await page.waitForLoadState('load');
          await page.waitForTimeout(3000);
          await page.goBack();
          await page.locator('h1').first().waitFor();
          await page.waitForTimeout(1000);
        }
        const data = await measure(page, destination);
        const sample = { source, destination, cache, run, ...data };
        samples.push(sample); console.log(JSON.stringify(sample));
        fs.writeFileSync(`${output}.partial`, JSON.stringify({ incomplete: true, samples }));
      }
      await context.close();
    }
  } finally { await browser.close(); await stop(); }
  const summary = [...new Set(samples.map(s => `${s.source}|${s.destination}|${s.cache}`))].map(key => {
    const values = samples.filter(s => `${s.source}|${s.destination}|${s.cache}` === key).map(s => s.ms).sort((a,b) => a-b);
    return { key, count: values.length, median: values[Math.ceil(values.length * .5)-1], p75: values[Math.ceil(values.length * .75)-1] };
  });
  fs.writeFileSync(output, JSON.stringify({ sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), buildId: fs.readFileSync('.next/BUILD_ID', 'utf8').trim(), environment: { node: process.version, platform: process.platform, browser: browser.version(), mobile: '390x844 touch, DPR1, 1.6Mbps down, 750Kbps up, 150ms latency, 4x CPU', serviceWorkers: 'blocked', analytics: 'DNT', timing: 'Browser touchstart capture to distinct visible heading at animation frame; real tap and browser back. Cold destination unvisited; warm after real visit/back with same router and HTTP cache. No private data.' }, runs, samples, summary }, null, 2));
  if (samples.some(s => !s.clientNavigation)) throw new Error('Document navigation replaced App Router');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
