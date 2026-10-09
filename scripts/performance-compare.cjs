const fs = require('node:fs');
const [beforeFile, afterFile, outputFile] = process.argv.slice(2);
if (!beforeFile || !afterFile) throw new Error('Usage: node scripts/performance-compare.cjs before.json after.json [comparison.json]');
const before = JSON.parse(fs.readFileSync(beforeFile, 'utf8'));
const after = JSON.parse(fs.readFileSync(afterFile, 'utf8'));
for (const report of [before, after]) {
  if (report.incomplete) throw new Error('Incomplete benchmark checkpoint cannot be compared');
  const badPages = report.samples.filter(row => row.status !== undefined && (row.status !== 200 || row.finalPath !== new URL(row.route, report.base).pathname));
  if (badPages.length) throw new Error(`Unexpected HTTP status or redirected route: ${badPages.map(row => row.route).join(', ')}`);
}
if (before.runs !== after.runs || JSON.stringify(before.environment) !== JSON.stringify(after.environment) || before.base !== after.base) throw new Error('Comparisons require identical browser, conditions, run count and server URL');
const metrics = ['ttfb', 'fcp', 'lcp', 'cls', 'jsBytes', 'imageBytes', 'requestCount', 'transitionMs'];
const comparison = after.summary.map(row => {
  const baseline = before.summary.find(item => item.key === row.key);
  if (!baseline || baseline.count !== row.count) throw new Error(`Missing equivalent baseline: ${row.key}`);
  return { key: row.key, count: row.count, ...Object.fromEntries(metrics.map(metric => {
    if (!row[metric] || !baseline[metric]) return [metric, null];
    const start = baseline[metric].median, end = row[metric].median;
    return [metric, { before: baseline[metric], after: row[metric], medianChange: end - start, percentChange: start ? Math.round((end / start - 1) * 1000) / 10 : null }];
  })) };
});
if (comparison.length !== before.summary.length) throw new Error('Route coverage differs');
for (const row of comparison) console.log(row.key, JSON.stringify(Object.fromEntries(metrics.filter(m => row[m]).map(m => [m, { before: row[m].before.median, after: row[m].after.median, percent: row[m].percentChange }]))));
// Timing is diagnostic: noisy CI runner load should not become an absolute gate.
// Transfer growth gets a repeatable relative budget with a small-byte tolerance.
const regressions = comparison.filter(row => row.key.endsWith('|cold') && row.jsBytes && row.jsBytes.medianChange > 5000 && row.jsBytes.percentChange > 10);
const invalidTransitions = after.samples.filter(row => row.cache === 'warm-transition' && !row.clientNavigation);
const result = { environment: after.environment, comparison, regressions: regressions.map(r => r.key), invalidTransitions };
if (outputFile) fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
if (regressions.length || invalidTransitions.length) process.exitCode = 1;
