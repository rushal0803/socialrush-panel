// Own the single Next production process directly. Playwright's shell-based
// Windows webServer teardown waits on taskkill and can hang in managed runners.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
module.exports = async function setup() {
  if (process.env.PLAYWRIGHT_BASE_URL) return; // Caller owns an external test server.
  const port = Number(process.env.SMOKE_TEST_PORT || 3001);
  const url = `http://127.0.0.1:${port}`;
  try { await fetch(url, { signal: AbortSignal.timeout(1000) }); throw new Error(`Test port already in use: ${port}`); }
  catch (error) { if (error.message.startsWith('Test port already')) throw error; }
  fs.mkdirSync('artifacts/service-final', { recursive: true });
  const output = fs.openSync(path.resolve('artifacts/service-final/smoke-server.log'), 'w');
  const server = spawn(process.execPath, ['--require', path.resolve('scripts/packages-test-backend.cjs'), require.resolve('next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    shell: false, stdio: ['ignore', output, output],
    env: { ...process.env, SUPABASE_SERVICE_ROLE_KEY: 'smoke-service-role-key' },
  });
  fs.closeSync(output);
  let spawnError;
  server.on('error', error => { spawnError = error; });
  const stop = async () => {
    if (server.exitCode !== null || server.signalCode !== null) return;
    const exited = new Promise(resolve => server.once('exit', resolve));
    server.kill('SIGTERM');
    let timer;
    try {
      await Promise.race([exited, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Owned smoke server failed to exit within 10 seconds')), 10000); })]);
    } finally { clearTimeout(timer); }
    console.log(`[smoke server] owned process ${server.pid} exited`);
  };
  try {
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      if (spawnError) throw spawnError;
      if (server.exitCode !== null) throw new Error(`Smoke server exited early: ${server.exitCode}`);
      try { if ((await fetch(url, { signal: AbortSignal.timeout(1500) })).ok) return stop; } catch {}
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    throw new Error('Smoke server did not become ready within 30 seconds');
  } catch (error) { await stop(); throw error; }
};
