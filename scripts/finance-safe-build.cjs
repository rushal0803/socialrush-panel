// Run an ordinary production build with fixture transport and one local worker.
const { spawn } = require('node:child_process');
const path = require('node:path');
const env = { ...process.env };
for (const key of Object.keys(env)) {
  if (/^(?:SUPABASE|RAZORPAY|CASHFREE|RESEND|SMM_PROVIDER|CRON_SECRET|YOUTUBE_DATA_API|EMAIL_UNSUBSCRIBE)/.test(key)) delete env[key];
}
Object.assign(env, {
  NEXT_PUBLIC_SUPABASE_URL: 'https://finance-fixture.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'isolated-fixture-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'isolated-fixture-service-key',
  GATEWAY_REFUNDS_ENABLED: 'false',
  CIRCLE_NODE_TOTAL: '2',
  NEXT_TELEMETRY_DISABLED: '1',
  NODE_OPTIONS: `--require "${path.resolve('scripts/finance-test-network.cjs').replaceAll('\\', '/')}"`,
});
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'build'], { env, stdio: 'inherit', shell: false });
child.on('error', () => { console.error('Unable to launch isolated production build'); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
