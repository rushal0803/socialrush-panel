// After-only DevTools timeline capture. Separate from timing comparisons
// because tracing itself adds overhead. Import JSON into Chrome Performance.
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
async function main() {
  const stop = await require('./playwright-server-setup.cjs')();
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 1, serviceWorkers: 'block' });
    await context.addInitScript(() => Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' }));
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Page.setBypassCSP', { enabled: true });
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await cdp.send('Tracing.start', { categories: 'devtools.timeline,v8.execute,blink.user_timing,loading,disabled-by-default-devtools.timeline', transferMode: 'ReturnAsStream' });
    await page.goto('http://localhost:3001/services', { waitUntil: 'load', timeout: 120000 });
    await page.waitForTimeout(3000);
    const completed = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve));
    await cdp.send('Tracing.end');
    const { stream } = await completed;
    let trace = '';
    while (true) {
      const chunk = await cdp.send('IO.read', { handle: stream });
      trace += chunk.base64Encoded ? Buffer.from(chunk.data, 'base64').toString('utf8') : chunk.data;
      if (chunk.eof) break;
    }
    await cdp.send('IO.close', { handle: stream });
    fs.mkdirSync('artifacts/performance', { recursive: true });
    fs.writeFileSync('artifacts/performance/services-mobile-trace.json', trace);
    const events = JSON.parse(trace).traceEvents;
    const rendererThreads = new Set(events.filter(e => e.name === 'thread_name' && e.args?.name === 'CrRendererMain').map(e => `${e.pid}:${e.tid}`));
    const tasks = events.filter(e => rendererThreads.has(`${e.pid}:${e.tid}`) && e.name === 'RunTask' && e.ph === 'X' && e.dur >= 50000);
    const result = { note: 'After-only traced mobile cold services load; instrumentation overhead; not isolated hydration or before/after evidence.', traceEvents: events.length, longTasks: tasks.length, longestTaskMs: Math.max(0, ...tasks.map(e => e.dur / 1000)), totalLongTaskMs: tasks.reduce((n, e) => n + e.dur / 1000, 0) };
    fs.writeFileSync('artifacts/performance/trace-summary.json', JSON.stringify(result, null, 2));
    console.log(result);
  } finally { await browser.close(); await stop(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
