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
    NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:3001',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'synthetic-anon', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service',
    NODE_OPTIONS: '--require=' + path.resolve('scripts/phase2-offline-transport.cjs'),
  },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
