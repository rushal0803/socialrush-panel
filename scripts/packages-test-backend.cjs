// Test process only: replace Supabase transport, never application logic.
// Launch with node --require ./scripts/packages-test-backend.cjs ...
const rows = require('../tests/fixtures/packages-catalog.json');
const originalFetch = globalThis.fetch;
const intents = new Map();
const user = { id: '11111111-1111-4111-8111-111111111111', email: 'packages-test@example.invalid', role: 'authenticated', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '2026-01-01T00:00:00Z' };
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input.url || input.toString());
  const backendOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : null;
  const backendPath = url.pathname.startsWith('/auth/v1/') || url.pathname.startsWith('/rest/v1/');
  if (!backendPath || (!url.hostname.endsWith('.supabase.co') && url.origin !== backendOrigin)) return originalFetch(input, init);
  const headers = new Headers(init?.headers || input.headers);
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Content-Range': '0-0/1' } });
  if (url.pathname.includes('/auth/v1/user')) {
    const token = (headers.get('authorization') || '').replace('Bearer ', '');
    try { if (JSON.parse(Buffer.from(token.split('.')[1], 'base64url')).sub === user.id) return json(user); } catch {}
    return json({ message: 'Not authenticated' }, 401);
  }
  if (url.pathname.endsWith('/rest/v1/services')) {
    let found = rows;
    for (const field of ['id', 'code', 'platform']) {
      const filter = url.searchParams.get(field);
      if (filter?.startsWith('eq.')) found = found.filter(row => String(row[field]) === filter.slice(3));
    }
    return json(headers.get('accept')?.includes('object') ? found[0] || null : found);
  }
  if (url.pathname.endsWith('/rest/v1/profiles')) return json({ ...user, full_name: 'Package QA', balance: 100000, is_blocked: false });
  if (url.pathname.endsWith('/rest/v1/checkout_intents')) {
    if ((init?.method || 'GET') === 'POST') {
      const body = JSON.parse(init.body);
      const row = { ...body, id: '22222222-2222-4222-8222-222222222222', created_at: new Date().toISOString() };
      intents.set(body.client_request_id, row);
      return json(row, 201);
    }
    const key = url.searchParams.get('client_request_id')?.slice(3);
    const row = intents.get(key);
    return json(headers.get('accept')?.includes('object') ? row || null : row ? [row] : []);
  }
  // Test backend never reaches a real wallet/order RPC.
  if (url.pathname.includes('/rpc/') || (init?.method && init.method !== 'GET')) return json({ message: 'Paid operations disabled in package QA' }, 403);
  return json(headers.get('accept')?.includes('object') ? null : []);
};

// Next middleware has a separate Edge VM and transport. Give it the same
// isolated backend, while keeping its cookie parsing and auth checks intact.
const edge = require('next/dist/compiled/edge-runtime');
const OriginalEdgeRuntime = edge.EdgeRuntime;
Object.defineProperty(edge, 'EdgeRuntime', { configurable: true, value: class extends OriginalEdgeRuntime {
  constructor(options) {
    super({ ...options, extend(context) {
      context.fetch = async (input, init) => {
        const response = await globalThis.fetch(input, init);
        return new context.Response(await response.text(), { status: response.status, headers: Object.fromEntries(response.headers) });
      };
      return options.extend ? options.extend(context) : context;
    } });
  }
} });
