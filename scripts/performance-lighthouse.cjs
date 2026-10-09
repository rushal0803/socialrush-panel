// Supplemental after-only Lighthouse diagnosis. Install the pinned tool in
// ignored artifacts, not application dependencies. Its default simulation is
// different from performance-benchmark.cjs; never compare their numbers.
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('@playwright/test');
async function main() {
  const cli = path.resolve('artifacts/performance/lighthouse-runner/node_modules/lighthouse/cli/index.js');
  if (!fs.existsSync(cli)) throw new Error('Install lighthouse@13.0.1 with --prefix artifacts/performance/lighthouse-runner --no-save --package-lock=false');
  const stop = await require('./playwright-server-setup.cjs')();
  // Match the existing local smoke transport. Production CSP is unchanged.
  const proxy = http.createServer((request, response) => {
    const upstream = http.request({ hostname: '127.0.0.1', port: 3001, path: request.url, method: request.method, headers: { ...request.headers, host: 'localhost:3001' } }, incoming => {
      const headers = { ...incoming.headers };
      if (headers['content-security-policy']) headers['content-security-policy'] = headers['content-security-policy'].split(';').filter(d => d.trim() !== 'upgrade-insecure-requests').join(';');
      response.writeHead(incoming.statusCode, headers);
      incoming.pipe(response);
    });
    upstream.on('error', () => { response.writeHead(502); response.end(); });
    request.pipe(upstream);
  });
  try {
    await new Promise((resolve, reject) => { proxy.once('error', reject); proxy.listen(3002, '127.0.0.1', resolve); });
    const output = path.resolve('artifacts/performance/lighthouse-services.json');
    const args = [cli, 'http://localhost:3002/services', '--only-categories=performance', '--output=json', `--output-path=${output}`, '--save-assets', '--chrome-flags=--headless', '--extra-headers={"DNT":"1"}', '--blocked-url-patterns=*/api/analytics*', '--no-enable-error-reporting'];
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, args, { stdio: 'inherit', shell: false, env: { ...process.env, CHROME_PATH: chromium.executablePath() } });
      child.once('error', reject);
      child.once('exit', code => code === 0 ? resolve() : reject(new Error(`Lighthouse exited ${code}`)));
    });
    const result = JSON.parse(fs.readFileSync(output, 'utf8'));
    const metrics = Object.fromEntries(['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'].map(key => [key, result.audits[key]?.numericValue]));
    const diagnostics = Object.values(result.audits).filter(a => a.score !== null && a.score < 1 && a.details && a.numericValue > 0).map(a => ({ id: a.id, title: a.title, value: a.numericValue, display: a.displayValue }));
    const summary = { note: 'One after-only services run, Lighthouse default mobile simulated throttling. Separate from paired five-run CDP benchmarks; no baseline Lighthouse score or field metric claim.', version: result.lighthouseVersion, performanceScore: result.categories.performance.score, metrics, diagnostics, warnings: result.runWarnings, runtimeError: result.runtimeError };
    fs.writeFileSync('artifacts/performance/lighthouse-summary.json', JSON.stringify(summary, null, 2));
    console.log(summary);
    if (result.runtimeError) throw new Error(result.runtimeError.message);
  } finally { await new Promise(resolve => proxy.close(resolve)); await stop(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
