const fs = require('node:fs');
const [beforeFile, afterFile, beforeNavFile, afterNavFile, output = 'docs/performance/mobile-followup.md'] = process.argv.slice(2);
if (!afterNavFile) throw new Error('Usage: performance-mobile-report.cjs before-loads after-loads before-journeys after-journeys [output]');
const [before, after, beforeNav, afterNav] = [beforeFile, afterFile, beforeNavFile, afterNavFile].map(file => JSON.parse(fs.readFileSync(file, 'utf8')));
for (const [loads, journeys] of [[before, beforeNav], [after, afterNav]]) {
  if (loads.sourceCommit !== journeys.sourceCommit || loads.buildId !== journeys.buildId) throw new Error('Document and journey measurements must use the same application revision and build');
}
for (const [a,b] of [[before, after], [beforeNav, afterNav]]) {
  if (a.incomplete || b.incomplete || a.runs !== b.runs || JSON.stringify(a.environment) !== JSON.stringify(b.environment)) throw new Error('Incomplete or unmatched measurement environments');
  if (a.summary.length !== b.summary.length || b.summary.some(s => !a.summary.find(r => r.key === s.key && r.count === s.count))) throw new Error('Unmatched route coverage/sample counts');
}
if ([beforeNav, afterNav].some(r => r.samples.some(s => !s.clientNavigation))) throw new Error('A tap replaced the App Router document');
const round = n => Number(n).toFixed(0);
const group = (r, path, cache) => r.summary.find(s => s.key === `mobile-4g|${path}|${cache}`);
const pair = (path, cache, metric, percentile = 'median') => `${round(group(before,path,cache)[metric][percentile])} → ${round(group(after,path,cache)[metric][percentile])}`;
const percentile = (values, p) => values.sort((a,b) => a-b)[Math.ceil(values.length*p)-1];
const task = (report, path, p) => percentile(report.samples.filter(s => s.profile === 'mobile-4g' && s.route === path && s.cache === 'cold').map(s => Math.max(0,...s.longTasks)),p);
const lines = ['# PR #623: focused mobile follow-up', '', `Prior PR application baseline: \`${before.sourceCommit}\`. Optimized application: \`${after.sourceCommit}\`.`, '', 'Five samples per condition on the same Windows runner, Node, Chromium, fixture backend, viewport and throttling. Mobile: 390×844, DPR1, 1.6 Mbps down / 750 Kbps up, 150 ms latency, 4× CPU. The follow-up uses a fresh paired baseline, not the older report as a control. No private or live financial latency is measured.', '', '## Mobile document loads', '', 'Milliseconds, except JavaScript transfer in bytes. Arrows show prior PR → follow-up. Cold browser cache / warm server; warm is repeat HTTP-cache document load.', '', '| Page | Cold TTFB median | Cold LCP median | Cold LCP p75 | Warm LCP median | Warm LCP p75 | Cold JS median bytes | Cold CLS p75 |', '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |'];
for (const path of ['/', '/services', '/packages']) lines.push(`| ${path} | ${pair(path,'cold','ttfb')} | ${pair(path,'cold','lcp')} | ${pair(path,'cold','lcp','p75')} | ${pair(path,'warm','lcp')} | ${pair(path,'warm','lcp','p75')} | ${pair(path,'cold','jsBytes')} | ${group(before,path,'cold').cls.p75.toFixed(4)} → ${group(after,path,'cold').cls.p75.toFixed(4)} |`);
lines.push('', '## Mobile client navigation', '', 'Real touchscreen taps on the mobile drawer or the directory card. Browser touchstart capture → first animation frame with a distinct, fully visible destination heading. This excludes automation-driver round trips but includes touch gesture time, network waiting and rendering. It differs from the old report’s Node-side click timer. Cold destination is unvisited in a fresh context; warm follows a real visit and browser back in the same context, retaining HTTP and Router caches. Source settling is identical on both sides, with no waiting added to the product.', '', '| Journey | Destination cache | Median | p75 | Final p75 ≤ 1 s? |', '| --- | --- | ---: | ---: | --- |');
for (const row of afterNav.summary) {
  const old = beforeNav.summary.find(s => s.key === row.key);
  const [source, destination, cache] = row.key.split('|');
  lines.push(`| ${source} → ${destination} | ${cache} | ${round(old.median)} → ${round(row.median)} | ${round(old.p75)} → ${round(row.p75)} | ${row.p75 <= 1000 ? 'Yes' : 'No'} |`);
}
lines.push('', 'All taps retained the App Router document sentinel. Warm results describe these five trials, not guaranteed cached server data or global real-user performance.', '', '## Repeated main-thread samples', '', 'Largest observed long task per cold load, summarized across five samples. This is not isolated hydration cost. Trace events provide diagnosis separately and have instrumentation overhead.', '', '| Page | Largest task median | Largest task p75 |', '| --- | ---: | ---: |');
for (const path of ['/', '/services', '/packages']) lines.push(`| ${path} | ${round(task(before,path,.5))} → ${round(task(after,path,.5))} | ${round(task(before,path,.75))} → ${round(task(after,path,.75))} |`);
const notesFile = require('node:path').join(require('node:path').dirname(output), 'mobile-followup-notes.md');
if (fs.existsSync(notesFile)) lines.push('', fs.readFileSync(notesFile,'utf8'));
fs.writeFileSync(output, lines.join('\n')+'\n');
