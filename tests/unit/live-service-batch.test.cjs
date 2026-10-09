const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// Exercise the actual server loader with an isolated transport. No credentials,
// real database access, or application auth bypass is part of this unit test.
function load(file, dependencies) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  } }, { filename: file });
  return exports;
}
function fixture() {
  let requests = 0;
  let failed = false;
  const row = { id: 1, code: 'instagram-followers', name: 'Instagram Real Followers', platform: 'Instagram', rate: '799', min: 100, max: 100000, status: 'active', is_active: true, accepts_new_orders: true, health_status: 'stable' };
  const rows = [row, { ...row, id: 2, rate: '999' }, { ...row, code: 'wrong-platform', platform: 'YouTube' }, { ...row, code: 'paused', health_status: 'paused' }, { ...row, code: 'inactive', is_active: false }, { ...row, code: 'closed', accepts_new_orders: false }, { ...row, code: 'x-followers', platform: 'Twitter / X' }];
  const codes = ['instagram-followers', 'wrong-platform', 'paused', 'inactive', 'closed', 'x-followers', 'missing', 'static-fallback'];
  const services = codes.map(code => ({ code, name: code, platform: code === 'x-followers' ? 'x' : 'instagram', requiresLiveCatalogFacts: code !== 'static-fallback', pricePer1000: 5, minQuantity: 10, maxQuantity: 100, deliveryTime: 'Catalog delivery', refillPolicy: 'Catalog refill', qualityType: 'Catalog', isActive: true, importantInstruction: 'Catalog instructions' }));
  const client = { from(table) {
    assert.equal(table, 'services'); requests++;
    let selected = [...rows];
    const builder = {
      select() { return this; },
      eq(field, value) { selected = selected.filter(row => row[field] === value); return this; },
      in(field, values) { selected = selected.filter(row => values.includes(row[field])); return this; },
      ilike(field, pattern) { selected = selected.filter(row => pattern.startsWith('%') ? String(row[field]).toLowerCase().includes(pattern.slice(1, -1).toLowerCase()) : String(row[field]).toLowerCase() === pattern.toLowerCase()); return this; },
      order(field, options) { assert.equal(options.ascending, true); selected.sort((a,b) => a[field] - b[field]); return this; },
      limit(n) { selected = selected.slice(0, n); return this; },
      maybeSingle() { return Promise.resolve({ data: failed ? null : selected[0] || null, error: failed ? new Error('Unavailable') : null }); },
      then(resolve, reject) { return Promise.resolve({ data: failed ? null : selected, error: failed ? new Error('Unavailable') : null }).then(resolve, reject); },
    };
    return builder;
  } };
  const helpers = load('lib/seo/live-service-row.ts', {});
  const loader = load('lib/seo/live-service.ts', { 'server-only': {}, '@/lib/supabase/admin': { createAdminClient: () => client }, '@/lib/smm-service-catalog': { activeSmmServices: services }, './live-service-row': helpers });
  return { loader, services, row, requests: () => requests, fail: () => { failed = true; } };
}
test('one fresh batch preserves every individual result, including live-only failures and defaults', async () => {
  const f = fixture();
  const individual = await Promise.all(f.services.map(s => f.loader.getLiveServiceFacts(s.platform, s.name, s.code)));
  assert.equal(f.requests(), f.services.length);
  const batch = await f.loader.getLiveServiceFactsBatch(f.services);
  assert.equal(f.requests(), f.services.length + 1);
  f.services.forEach((s, i) => assert.deepEqual(batch.get(s.code), individual[i]));
  assert.equal(batch.get('missing'), null);
  assert.equal(batch.get('inactive'), null);
  assert.equal(batch.get('closed'), null);
  assert.equal(batch.get('wrong-platform'), null);
  assert.equal(batch.get('paused').available, false);
  f.row.rate = '899';
  assert.equal((await f.loader.getLiveServiceFactsBatch(f.services)).get('instagram-followers').rate, 899);
  assert.equal(f.requests(), f.services.length + 2);
});
test('query failure preserves static fallback while never inventing live-only price or availability', async () => {
  const f = fixture(); f.fail();
  const batch = await f.loader.getLiveServiceFactsBatch(f.services);
  assert.equal(batch.get('instagram-followers'), null);
  assert.equal(batch.get('static-fallback').rate, 5);
  const empty = await f.loader.getLiveServiceFactsBatch([]);
  assert.equal(empty.size, 0);
  assert.equal(f.requests(), 1);
});
