const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { NextRequest, NextResponse } = require('next/server');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const load = require('../helpers/isolated-module.cjs');
const methods = load('lib/payments/methods.ts');
const availability = load('lib/payments/cashfree-availability.ts', { './methods': methods });
const security = load('lib/security/request.ts', { 'server-only': {}, 'next/server': { NextResponse } });
const request = body => new NextRequest('https://qa.invalid/api/payments/cashfree/order', {
  method: 'POST', headers: { origin: 'https://qa.invalid', 'content-type': 'application/json' }, body: JSON.stringify(body),
});
function walletRoute({ enabled = availability, flags = methods, user = { id: 'synthetic-user' } } = {}) {
  const calls = { provider: 0, auth: 0, db: 0 };
  const route = load('app/api/payments/cashfree/order/route.ts', {
    crypto, 'next/server': { NextResponse }, '@/lib/payments/cashfree-availability': enabled,
    '@/lib/payments/methods': flags, '@/lib/security/request': security,
    '@/lib/payments/cashfree': { CashfreeApiError: class extends Error {}, cashfreeMode: () => 'sandbox', cashfreeRequest: async () => { calls.provider++; throw Error('Unexpected provider'); } },
    '@/lib/supabase/server': { createClient: async () => { calls.auth++; return { auth: { getUser: async () => ({ data: { user } }) }, from: () => { calls.db++; throw Error('Unexpected DB'); } }; } },
  });
  return { route, calls };
}
test('all disabled gateway methods deny before auth, DB, provider or body parsing', async () => {
  assert.equal(availability.cashfreeNewPaymentsEnabled(), false);
  for (const method of ['upi', 'card', 'netbanking', 'international_card', 'wallet', 'unknown']) {
    const { route, calls } = walletRoute();
    const response = await route.POST(request({ amount: 100, method }));
    assert.equal(response.status, 409); assert.equal((await response.json()).code, 'PAYMENT_METHOD_DISABLED');
    assert.deepEqual(calls, { provider: 0, auth: 0, db: 0 });
  }
});
test('requested disabled method remains denied if another gateway method is enabled (stub only)', async () => {
  const { route, calls } = walletRoute({ enabled: { cashfreeNewPaymentsEnabled: () => true } });
  assert.equal((await route.POST(request({ amount: 100, method: 'upi' }))).status, 409);
  assert.equal(calls.provider, 0); assert.equal(calls.db, 0);
});
test('enabled-path preconditions reject cross-origin, non-JSON, anonymous and invalid amounts without provider calls', async () => {
  const enabled = { cashfreeNewPaymentsEnabled: () => true };
  const { route, calls } = walletRoute({ enabled });
  const cross = request({ amount: 100, method: 'upi' }); cross.headers.set('origin', 'https://attacker.invalid');
  assert.equal((await route.POST(cross)).status, 403);
  const badType = request({}); badType.headers.set('content-type', 'text/plain');
  assert.equal((await route.POST(badType)).status, 415);
  for (const amount of [0, -1, 500001, 'NaN']) assert.equal((await route.POST(request({ amount, method: 'card' }))).status, 422);
  const anonymous = walletRoute({ enabled, user: null });
  assert.equal((await anonymous.route.POST(request({ amount: 100, method: 'upi' }))).status, 401);
  assert.equal(calls.provider, 0); assert.equal(calls.db, 0);
});
test('provider adapter blocks create-order calls before credentials/fetch; preserves GET reconciliation', async () => {
  let fetches = 0;
  const provider = load('lib/payments/cashfree.ts', { 'server-only': {}, crypto, './cashfree-availability': availability }, {
    process: { env: { CASHFREE_APP_ID: 'synthetic', CASHFREE_SECRET_KEY: 'synthetic', CASHFREE_ENV: 'sandbox' } },
    fetch: async () => { fetches++; return { ok: true, json: async () => ({ order_id: 'synthetic-order' }) }; },
  });
  for (const path of ['/orders', '/orders/', '/orders?test=1']) await assert.rejects(provider.cashfreeRequest(path, { method: 'post' }), /new payments are disabled/);
  assert.equal(fetches, 0);
  const result = await provider.cashfreeRequest('/orders/synthetic-order');
  assert.equal(result.order_id, 'synthetic-order'); assert.equal(fetches, 1);
});
test('webhook HMAC rejects tampered payloads and missing credentials without network access', () => {
  const secret = 'synthetic-only-secret', timestamp = '1234567890', body = '{"synthetic":true}';
  const provider = load('lib/payments/cashfree.ts', { 'server-only': {}, crypto, './cashfree-availability': availability }, { process: { env: { CASHFREE_SECRET_KEY: secret } } });
  const signature = crypto.createHmac('sha256', secret).update(timestamp + body).digest('base64');
  assert.equal(provider.verifyCashfreeWebhook(body, timestamp, signature), true);
  assert.equal(provider.verifyCashfreeWebhook(body + ' ', timestamp, signature), false);
  assert.equal(provider.verifyCashfreeWebhook(body, timestamp, ''), false);
});
const recovery = load('lib/auth/recovery-session.ts');
function authFixture(overrides = {}) {
  const calls = [];
  const auth = {
    setSession: async () => { calls.push('session'); return { error: null }; },
    exchangeCodeForSession: async () => { calls.push('code'); return { error: null }; },
    verifyOtp: async () => { calls.push('otp'); return { error: null }; },
    getUser: async () => { calls.push('user'); return { data: { user: { id: 'synthetic-user' } }, error: null }; }, ...overrides,
  };
  return { calls, auth };
}
test('fragment/code/token-hash flows scrub credentials before client creation and require verified user', async () => {
  for (const [location, exchange] of [[{ hash: '#access_token=synthetic&refresh_token=synthetic&type=recovery', search: '' }, 'session'], [{ hash: '', search: '?code=synthetic' }, 'code'], [{ hash: '', search: '?token_hash=synthetic&type=recovery' }, 'otp']]) {
    const { calls, auth } = authFixture();
    assert.equal(await recovery.recoverSession(location, () => calls.push('scrub'), () => { calls.push('client'); return auth; }), true);
    assert.deepEqual(calls, ['scrub', 'client', exchange, 'user']);
  }
});
test('missing, expired, malformed, wrong-type or mixed recovery credentials fail without fallback to an existing session', async () => {
  for (const location of [{ hash: '', search: '' }, { hash: '#access_token=x&type=recovery', search: '' }, { hash: '#access_token=x&refresh_token=y&type=signup', search: '' }, { hash: '#error_code=otp_expired', search: '?code=x' }, { hash: '#access_token=x&refresh_token=y&type=recovery', search: '?code=x' }, { hash: '', search: '?token_hash=x&type=signup' }]) {
    let clients = 0, scrubbed = 0;
    assert.equal(await recovery.recoverSession(location, () => scrubbed++, () => { clients++; return authFixture().auth; }), false);
    assert.equal(clients, 0); assert.equal(scrubbed, 1);
  }
  for (const overrides of [{ exchangeCodeForSession: async () => ({ error: Error('expired or replayed') }) }, { getUser: async () => ({ data: { user: null }, error: null }) }, { getUser: async () => { throw Error('network'); } }]) {
    assert.equal(await recovery.recoverSession({ hash: '', search: '?code=x' }, () => {}, () => authFixture(overrides).auth), false);
  }
});
function callback({ user = { id: 'synthetic-user' }, userError = null, exchangeError = null } = {}) {
  const auth = authFixture({ getUser: async () => ({ data: { user }, error: userError }), exchangeCodeForSession: async () => ({ error: exchangeError }) }).auth;
  const destinations = load('lib/auth/destination.ts');
  return load('app/auth/callback/route.ts', {
    '@supabase/ssr': { createServerClient: (_url, _key, options) => { options.cookies.setAll([{ name: 'synthetic-cookie', value: 'fixture', options: { httpOnly: true } }]); return { auth }; } },
    'next/server': { NextResponse }, '@/lib/auth/ensure-profile': { ensureUserProfile: async () => ({ role: 'customer' }) },
    '@/lib/supabase/config': { getSupabaseConfig: () => ({ url: 'https://qa.invalid', key: 'synthetic' }) },
    '@/lib/referrals/claim-referral': { claimReferralForUser: async () => {} }, '@/lib/referrals/code': { normalizeReferralCode: () => null },
    '@/lib/auth/destination': destinations,
  });
}
test('SSR recovery preserves cookies and private headers; failed user validation never takes success redirect', async () => {
  const route = callback();
  for (const query of ['?code=fixture&next=/reset-password', '?token_hash=fixture&type=recovery']) {
    const response = await route.GET(new NextRequest('https://qa.invalid/auth/callback' + query));
    assert.equal(response.headers.get('location'), 'https://qa.invalid/reset-password');
    assert.match(response.headers.get('set-cookie'), /synthetic-cookie/);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  }
  for (const args of [{ user: null }, { userError: Error('expired') }, { exchangeError: Error('replay') }]) {
    const response = await callback(args).GET(new NextRequest('https://qa.invalid/auth/callback?code=x&next=/reset-password'));
    assert.match(response.headers.get('location'), /\/login\?authError=/);
  }
  const handoff = await route.GET(new NextRequest('https://qa.invalid/auth/callback?next=/reset-password'));
  assert.equal(handoff.headers.get('location'), 'https://qa.invalid/auth/recovery');
});
test('callback cannot redirect to an external next destination', async () => {
  const response = await callback().GET(new NextRequest('https://qa.invalid/auth/callback?code=x&next=https://attacker.invalid/'));
  assert.equal(new URL(response.headers.get('location')).origin, 'https://qa.invalid');
});
test('server password mutation denies absent sessions before updateUser', async () => {
  let updates = 0;
  const redirect = url => { throw Error('REDIRECT:' + url); };
  const actions = load('app/auth/actions.ts', {
    'next/headers': { headers: async () => new Headers() }, 'next/navigation': { redirect }, 'next/cache': { revalidatePath: () => {} },
    '@/lib/auth/site-url': { getSiteUrl: () => 'https://qa.invalid', absoluteUrl: (path, origin) => new URL(path, origin).href },
    '@/lib/supabase/server': { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: null }, error: null }), updateUser: async () => { updates++; return { error: null }; } } }) },
  });
  const form = new FormData(); form.set('password', 'synthetic-password'); form.set('confirmation', 'synthetic-password');
  await assert.rejects(actions.resetPassword(form), /REDIRECT:.*forgot-password/); assert.equal(updates, 0);
});
test('negative and zero daily chart values render distinct signs with bounded magnitude bars', () => {
  const revenue = load('lib/analytics/revenue-dashboard.ts');
  assert.equal(revenue.revenueBarWidth(-100, 100), 100); assert.equal(revenue.revenueBarWidth(50, 100), 50);
  assert.equal(revenue.revenueBarWidth(0, 100), 0); assert.equal(revenue.revenueBarWidth(-100, 0), 0);
  const dashboard = revenue.buildVerifiedRevenueDashboard({ paidOrders: [], refunds: [{ amount: 100, created_at: '2026-11-14T12:00:00Z' }] });
  const Panel = load('components/admin/RevenueIntelligencePanel.tsx', { 'react/jsx-runtime': require('react/jsx-runtime'), '@/lib/analytics/revenue-dashboard': revenue }).default;
  const html = renderToStaticMarkup(React.createElement(Panel, { dashboard }));
  assert.match(html, /-₹100/); assert.match(html, /\(loss\)/); assert.match(html, /bg-rose-500/); assert.match(html, /width:100%/);
  assert.equal(dashboard.daily[0].net, -100);
});

test('reset page awaits Next15 query parameters and guards anonymous rendering', async () => {
  const redirect = url => { throw Error('REDIRECT:' + url); };
  for (const user of [null, { id: 'synthetic-user' }]) {
    const Page = load('app/reset-password/page.tsx', {
      'react/jsx-runtime': require('react/jsx-runtime'),
      '@/components/AuthShell': { default: ({ children }) => children, __esModule: true },
      '@/components/AuthMessage': { default: ({ error }) => React.createElement('p', null, error), __esModule: true },
      '@/app/auth/actions': { resetPassword: '/synthetic-action' }, 'next/navigation': { redirect },
      '@/lib/supabase/server': { createClient: async () => ({ auth: { getUser: async () => ({ data: { user }, error: null }) } }) },
    }).default;
    if (!user) await assert.rejects(Page({ searchParams: Promise.resolve({}) }), /REDIRECT:.*forgot-password/);
    else assert.match(renderToStaticMarkup(await Page({ searchParams: Promise.resolve({ error: 'Synthetic validation message' }) })), /Synthetic validation message/);
  }
});

test('StrictMode effect replay exchanges recovery credentials once and only active effect navigates', async () => {
  let effect, scrubs = 0, navigations = 0;
  const ref = { current: null }, { calls, auth } = authFixture();
  const Page = load('app/auth/recovery/page.tsx', {
    'react/jsx-runtime': require('react/jsx-runtime'),
    react: { useRef: () => ref, useState: () => ['', () => {}], useEffect: fn => { effect = fn; } },
    'next/navigation': { useRouter: () => ({ replace: () => navigations++ }) },
    'next/link': { default: 'a', __esModule: true }, '@/lib/auth/recovery-session': recovery,
    '@/lib/supabase/client': { createClient: () => ({ auth }) },
  }, { window: { location: { hash: '#access_token=x&refresh_token=y&type=recovery', search: '' }, history: { state: null, replaceState: () => scrubs++ } } }).default;
  Page(); const cleanup = effect(); cleanup(); effect();
  await ref.current; await new Promise(resolve => setImmediate(resolve));
  assert.equal(scrubs, 1); assert.deepEqual(calls, ['session', 'user']); assert.equal(navigations, 1);
});

test('invalid Cashfree webhook signature never constructs an admin client', async () => {
  let admins = 0;
  const route = load('app/api/payments/cashfree/webhook/route.ts', {
    'next/server': { NextResponse }, '@/lib/payments/cashfree': { verifyCashfreeWebhook: () => false },
    '@/lib/supabase/admin': { createAdminClient: () => { admins++; throw Error('Unexpected admin'); } },
  });
  assert.equal((await route.POST(request({}))).status, 401); assert.equal(admins, 0);
});

test('historical signed webhook settlement validates order and payment identity; never gates reconciliation by new-payment flags', async () => {
  for (const direct of [false, true]) for (const mismatch of ['order', 'payment', 'currency', null]) {
    let settlements = 0, providerCalls = 0;
    const orderId = 'synthetic-provider-order';
    const admin = {
      from: table => ({ select() { return this; }, eq() { return this; }, async maybeSingle() {
        return { data: table === 'cashfree_checkout_intent_payments' ? (direct ? { required_top_up_paise: 10000, status: 'pending' } : null) : { amount: 100, status: 'pending', payment_method: 'cashfree' } };
      } }),
      rpc: async () => { settlements++; return { error: null }; },
    };
    const route = load('app/api/payments/cashfree/webhook/route.ts', {
      'next/server': { NextResponse }, '@/lib/supabase/admin': { createAdminClient: () => admin },
      '@/lib/payments/cashfree': {
        verifyCashfreeWebhook: () => true,
        cashfreeRequest: async path => { providerCalls++; return path.endsWith('/payments')
          ? [{ cf_payment_id: 'synthetic-payment', payment_status: 'SUCCESS', is_captured: true, order_id: mismatch === 'payment' ? 'wrong' : orderId, payment_currency: 'INR', order_currency: mismatch === 'currency' ? 'USD' : 'INR', payment_amount: 100, order_amount: 100 }]
          : { order_id: mismatch === 'order' ? 'wrong' : orderId, order_currency: 'INR', order_status: 'PAID', order_amount: 100 }; },
      },
    });
    const req = request({ data: { order: { order_id: orderId }, payment: { cf_payment_id: 'synthetic-payment', payment_status: 'SUCCESS' } } });
    for (const name of ['x-webhook-timestamp', 'x-webhook-signature', 'x-webhook-version']) req.headers.set(name, 'synthetic');
    assert.equal((await route.POST(req)).status, mismatch ? 409 : 200);
    assert.equal(settlements, mismatch ? 0 : 1); assert.equal(providerCalls, 2);
  }
});
