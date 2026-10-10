const fs = require('node:fs');
const assert = require('node:assert/strict');
const before = JSON.parse(fs.readFileSync('artifacts/premium-design/before/rendered-review.json'));
const after = JSON.parse(fs.readFileSync('artifacts/premium-design/after/rendered-review.json'));
const results = [];
for (const original of before) {
  const current = after.find(row => row.route === original.route && row.width === original.width);
  assert.ok(current, `Missing route: ${original.route}`);
  for (const key of ['status', 'title', 'canonical', 'robots', 'schemas', 'h1']) assert.deepEqual(current[key], original[key], `${original.route}: ${key} changed`);
  assert.equal(current.status, 200, original.route);
  assert.equal(current.h1.length, 1, original.route);
  assert.equal(current.overflow, false, original.route);
  const removed = original.links.filter(link => !current.links.includes(link));
  assert.deepEqual(removed, [], `${original.route}: internal links removed`);
  results.push({ route: current.route, width: current.width, preserved: ['status', 'title', 'canonical', 'robots', 'schema', 'h1', 'links'], overflow: current.overflow });
}
fs.writeFileSync('artifacts/premium-design/seo-comparison.json', JSON.stringify(results, null, 2));
console.log(`PASS: ${results.length} desktop/mobile documents preserve metadata, schemas, H1s and links; no overflow.`);
