// Snapshot compiled HTML before UI rollout, then compare after rebuilding.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const os = require('node:os');
const inventory = JSON.parse(cp.execFileSync(process.execPath, ['scripts/service-page-inventory.cjs'], { encoding: 'utf8' }));
const snapshotPath = path.join(os.tmpdir(), 'socialrush-service-seo-baseline.json');
function extract(html) {
  const values = [];
  for (const expression of [/<title\b[^>]*>[\s\S]*?<\/title>/g, /<meta\b[^>]*(?:name="(?:description|robots)"|property="(?:og:[^"]+)")[^>]*>/g, /<link\b[^>]*rel="(?:canonical|alternate)"[^>]*>/g, /<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g]) {
    values.push(...(html.match(expression) || []));
  }
  for (const heading of html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/g)) values.push(`${heading[1]}:${heading[2].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()}`);
  return values;
}
function rendered() {
  const result = {};
  for (const route of inventory.paths) {
    const filename = path.join('.next', 'server', 'app', `${route.slice(1)}.html`);
    if (fs.existsSync(filename)) result[route] = extract(fs.readFileSync(filename, 'utf8'));
  }
  return result;
}
if (process.argv.includes('--snapshot')) {
  const data = rendered(); fs.writeFileSync(snapshotPath, JSON.stringify(data, null, 2));
  console.log(`Saved rendered SEO contracts for ${Object.keys(data).length} compiled service paths.`);
} else {
  const before = JSON.parse(fs.readFileSync(snapshotPath, 'utf8')); const after = rendered(); const failures = [];
  for (const [route, contracts] of Object.entries(before)) {
    const current = [...(after[route] || [])];
    for (const contract of contracts) {
      const index = current.indexOf(contract);
      if (index < 0) failures.push(`${route}: ${contract.slice(0, 170)}`);
      else current.splice(index, 1);
    }
  }
  if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
  else console.log(`Rendered SEO LOCK CHECK passed for ${Object.keys(before).length} service paths: metadata, canonicals, robots, alternates, schema and original headings preserved.`);
}
