// Package only this audit's known captures, never historical artifact folders.
const fs = require('node:fs');
const path = require('node:path');
const widths = [320, 360, 375, 390, 430, 768, 1024, 1440, 1920];
const source = 'artifacts/premium-responsive/pr669-main-sync';
const target = 'docs/design/customer-workspace-pr669';
const runs = widths.map(width => ({ width, routes: JSON.parse(fs.readFileSync(path.join(source, `dashboard-${width}.json`), 'utf8')) }));
for (const run of runs) for (const row of run.routes) {
  if (row.scroll > row.viewport + 1 || row.clippedControls?.length) throw Error(`Layout failure: ${row.route} at ${run.width}`);
}
fs.mkdirSync(target, { recursive: true });
fs.writeFileSync(path.join(target, 'responsive-results.json'), JSON.stringify({
  note: 'Synthetic localhost fixtures, Chromium, reduced motion. One unthrottled navigation per route/width. No field CWV, INP, Lighthouse or paired performance claim.',
  baselineCommit: '01d49452', widths, checkedLayouts: runs.reduce((sum, run) => sum + run.routes.length, 0), runs,
}, null, 2));
for (const width of [390, 768, 1440]) for (const page of ['dashboard', 'dashboard-new-order', 'dashboard-wallet']) {
  for (const stage of ['before', 'after']) {
    const file = path.join(target, `${stage}-${page}-${width}.png`);
    if (stage === 'before' && !fs.existsSync(file)) throw Error(`Missing documented main baseline: ${file}`);
    if (stage === 'after') fs.copyFileSync(path.join(source, page === 'dashboard-new-order' ? `new-order-entry-${width}.png` : `${page}-${width}-hero.png`), file);
  }
}
console.log(`${runs.reduce((sum, run) => sum + run.routes.length, 0)} layouts packaged; 18 selected before/after screenshots.`);
