// Production-build lab measurements. Never use fixture sessions against a live site.
const { chromium } = require('@playwright/test');
const { loadEnvConfig } = require('@next/env');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
loadEnvConfig(process.cwd());
const base = process.env.PERF_BASE_URL || 'http://localhost:3001';
const local = ['localhost', '127.0.0.1'].includes(new URL(base).hostname);
const runs = Number(process.env.PERF_RUNS || 5);
const out = process.env.PERF_OUTPUT || 'artifacts/performance/results.json';
const routes = process.env.PERF_ROUTES ? JSON.parse(process.env.PERF_ROUTES) : ['/', '/services', '/packages', '/dashboard', '/dashboard/wallet', '/dashboard/order-summary?service=instagram-followers&quantity=1000&link=https%3A%2F%2Fwww.instagram.com%2Fperformance_qa%2F'];
const profiles = process.env.PERF_PROFILES ? process.env.PERF_PROFILES.split(',') : ['desktop', 'mobile-4g'];

async function authenticate(context) {
  const origin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
  const key = `sb-${new URL(origin).hostname.split('.')[0]}-auth-token`;
  const user = { id: '11111111-1111-4111-8111-111111111111', email: 'performance-qa@example.invalid', role: 'authenticated', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '2026-01-01T00:00:00Z' };
  const expires_at = Math.floor(Date.now() / 1000) + 3600;
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const session = { access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, role: 'authenticated', aud: 'authenticated', exp: expires_at })}.dGVzdA`, refresh_token: 'fixture', expires_at, expires_in: 3600, token_type: 'bearer', user };
  await context.addCookies([{ name: key, value: `base64-${encode(session)}`, url: base }]);
  await context.addInitScript(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), { key, session });
  await context.route(`${origin}/**`, route => {
    const request = route.request();
    const headers = { 'Access-Control-Allow-Origin': base, 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' };
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (request.method() !== 'GET') return route.fulfill({ status: 403, json: { message: 'Writes disabled in performance lab' }, headers });
    const pathname = new URL(request.url()).pathname;
    const json = pathname.includes('/auth/') ? user : pathname.endsWith('/profiles') ? [{ ...user, full_name: 'Performance QA', balance: 100000, is_blocked: false }] : pathname.endsWith('/services') ? JSON.parse(fs.readFileSync('tests/fixtures/packages-catalog.json', 'utf8')) : [];
    return route.fulfill({ json, headers });
  });
  await context.routeWebSocket(/\/realtime\/v1\/websocket/, socket => socket.onMessage(message => {
    try { const [join, ref, topic] = JSON.parse(String(message)); socket.send(JSON.stringify([join, ref, topic, 'phx_reply', { status: 'ok', response: {} }])); } catch {}
  }));
}

async function main() {
  let stop;
  if (local && !process.env.PERF_BASE_URL) stop = await require('./playwright-server-setup.cjs')();
  const browser = await chromium.launch({ headless: true });
  const samples = [];
  fs.mkdirSync(path.dirname(out), { recursive: true });
  // A failed rerun must not leave a stale completed report at its output path.
  fs.writeFileSync(out, JSON.stringify({ incomplete: true, startedAt: new Date().toISOString(), checkpoint: `${out}.partial` }, null, 2));
  const record = sample => {
    samples.push(sample);
    fs.writeFileSync(`${out}.partial`, JSON.stringify({ incomplete: true, samples }, null, 2));
  };
  try {
    for (const profile of profiles) {
      for (const route of routes.filter(route => local || !route.startsWith('/dashboard'))) {
        for (let run = 0; run < runs; run++) {
          const context = await browser.newContext({ viewport: profile === 'desktop' ? { width: 1440, height: 900 } : { width: 390, height: 844 }, isMobile: profile !== 'desktop', deviceScaleFactor: 1, serviceWorkers: 'block' });
          await context.addInitScript(() => {
            Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' });
            window.__perf = { lcp: null, cls: 0, longTasks: [] };
            new PerformanceObserver(list => { for (const e of list.getEntries()) {
              window.__perf.lcp = e.startTime;
              window.__perf.lcpElement = { tag: e.element?.tagName, text: e.element?.textContent?.slice(0, 100), size: e.size, renderTime: e.renderTime, loadTime: e.loadTime };
            } }).observe({ type: 'largest-contentful-paint', buffered: true });
            new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
            new PerformanceObserver(list => { for (const e of list.getEntries()) window.__perf.longTasks.push(e.duration); }).observe({ type: 'longtask', buffered: true });
          });
          if (route.startsWith('/dashboard')) await authenticate(context);
          const page = await context.newPage();
          const cdp = await context.newCDPSession(page);
          await cdp.send('Network.enable');
          // localhost is a trusted lab origin; production CSP remains unchanged.
          if (local) await cdp.send('Page.setBypassCSP', { enabled: true });
          if (profile !== 'desktop') {
            await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
            await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
          }
          for (const cache of ['cold', 'warm']) {
            await cdp.send('Network.setCacheDisabled', { cacheDisabled: cache === 'cold' });
            if (cache === 'cold') await cdp.send('Network.clearBrowserCache');
            const response = await page.goto(base + route, { waitUntil: 'load', timeout: 120000 });
            await page.locator('h1').first().waitFor({ timeout: 30000 });
            await page.waitForTimeout(3000);
            const data = await page.evaluate(() => {
              const nav = performance.getEntriesByType('navigation')[0];
              const resources = performance.getEntriesByType('resource');
              return { finalPath: location.pathname, ttfb: nav.responseStart - nav.startTime, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null, ...window.__perf, jsBytes: resources.filter(r => /\.js(?:\?|$)/.test(r.name)).reduce((n, r) => n + r.transferSize, 0), imageBytes: resources.filter(r => r.initiatorType === 'img').reduce((n, r) => n + r.transferSize, 0), requestCount: resources.length + 1, resources: resources.map(r => ({ url: new URL(r.name).pathname, ms: r.duration, bytes: r.transferSize })).sort((a,b) => b.bytes - a.bytes).slice(0, 10), api: resources.filter(r => r.name.includes('/api/')).map(r => ({ url: new URL(r.name).pathname, ms: r.duration })) };
            });
            record({ profile, route, cache, run, status: response.status(), ...data });
            console.log(profile, route, cache, run, JSON.stringify({ ttfb: data.ttfb, lcp: data.lcp, jsBytes: data.jsBytes }));
          }
          // Real App Router click; fail if a document navigation replaces the page.
          if (route === '/') {
            await page.evaluate(() => window.__transitionDocument = true);
            const link = page.locator('a[href="/services"]').filter({ visible: true }).first();
            await link.evaluate(element => element.addEventListener('click', () => { window.__transitionClick = performance.now(); }, { once: true, capture: true }));
            const started = performance.now();
            await link.click();
            const clickMs = performance.now() - started;
            await page.waitForURL('**/services');
            await page.locator('main h1').first().waitFor();
            await page.waitForFunction(() => {
              const h = document.querySelector('main h1');
              if (!h) return false;
              for (let e = h; e; e = e.parentElement) if (Number(getComputedStyle(e).opacity) < .99) return false;
              return true;
            });
            const transition = await page.evaluate(() => ({ clientNavigation: window.__transitionDocument === true, renderMs: performance.now() - window.__transitionClick, navigationResources: performance.getEntriesByType('resource').filter(r => r.startTime >= window.__transitionClick).map(r => ({ path: new URL(r.name).pathname, ms: r.duration, bytes: r.transferSize })) }));
            record({ profile, route: '/ -> /services', cache: 'warm-transition', run, transitionMs: performance.now() - started, clickMs, ...transition });
          }
          await context.close();
        }
      }
    }
  } finally { await browser.close(); if (stop) await stop(); }
  const percentile = (values, p) => { const sorted = values.sort((a,b) => a-b); return sorted[Math.ceil(sorted.length * p) - 1]; };
  const groups = new Map();
  for (const row of samples) { const key = `${row.profile}|${row.route}|${row.cache}`; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(row); }
  const summary = [...groups].map(([key, rows]) => ({ key, count: rows.length, ...Object.fromEntries(['ttfb', 'fcp', 'lcp', 'cls', 'jsBytes', 'imageBytes', 'requestCount', 'transitionMs'].map(metric => { const values = rows.map(r => r[metric]).filter(v => typeof v === 'number'); return [metric, values.length ? { median: percentile([...values], .5), p75: percentile([...values], .75) } : null]; })) }));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), buildId: local ? fs.readFileSync('.next/BUILD_ID', 'utf8').trim() : null, base, runs, environment: { node: process.version, platform: process.platform, browser: browser.version(), mobile: '390x844, 1.6Mbps down, 750Kbps up, 150ms RTT, 4x CPU', privateData: local ? 'isolated synthetic backend; not production API latency' : 'public routes only', observationMs: 3000, serviceWorker: 'blocked', analytics: 'DNT enabled', note: 'Cold browser cache, warm server cache. LCP/CLS lab samples are not field p75 or INP. No hydration estimate inferred from load time.' }, summary, samples }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
