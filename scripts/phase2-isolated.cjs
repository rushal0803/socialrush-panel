// Reproducible local-only build/server with synthetic transport and no inherited credentials.
const { spawn } = require('node:child_process');
const path = require('node:path');
const mode = process.argv[2];
if (!['build', 'serve'].includes(mode)) throw new Error('Usage: node scripts/phase2-isolated.cjs build|serve [port]');
const port = Number(process.argv[3] || 3105);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Use an unprivileged local port');
const args = ['--require', path.resolve('scripts/packages-test-backend.cjs'), require.resolve('next/dist/bin/next'), mode === 'build' ? 'build' : 'start'];
if (mode === 'serve') args.push('--hostname', '127.0.0.1', '--port', String(port));
const child = spawn(process.execPath, args, {
  stdio: 'inherit',
  env: {
    PATH: process.env.PATH, NEXT_TELEMETRY_DISABLED: '1', VERCEL_ENV: 'development',
    // Match the browser authority exactly; retain production CSP unchanged.
    NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:' + port,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'synthetic-anon', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service',
    // Whitelisted in-memory fixture modes only; never inherit provider secrets.
    ...Object.fromEntries(['RESPONSIVE_PAYMENT_FIXTURE', 'DASHBOARD_UPGRADE_AUDIT'].filter(name => process.env[name] === '1').map(name => [name, '1'])),
    NODE_OPTIONS: '--require=' + path.resolve('scripts/phase2-offline-transport.cjs') + ' --require=' + path.resolve('scripts/phase4-no-dotenv.cjs'),
  },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
