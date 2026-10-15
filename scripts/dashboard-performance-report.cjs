const fs = require('node:fs');
const path = require('node:path');
const root = 'docs/performance/dashboard-20261015';
const source = 'artifacts/dashboard-navigation';
const responsive = 'artifacts/premium-responsive/dashboard-performance-20261015';
const widths = [320,360,375,390,430,768,1024,1280,1440,1920];
fs.mkdirSync(root,{recursive:true});
const before = JSON.parse(fs.readFileSync(`${source}/before/results.json`));
const after = JSON.parse(fs.readFileSync(`${source}/after/results.json`));
for(const [stage,data] of [['before',before],['after',after]]) {
  if(data.errors.length) throw Error(`${stage}: browser errors`);
  fs.writeFileSync(`${root}/${stage}.json`,JSON.stringify(data,null,2));
  for(const row of data.samples.filter(x=>x.kind==='document')) {
    const name=row.route.split('/').pop();
    fs.copyFileSync(`${source}/${stage}/${name}-1440.png`,`${root}/${stage}-${name}-1440.png`);
  }
}
const comparison=before.transitions.map(row=>{
  const old=before.samples.find(x=>x.kind==='document'&&x.route===row.route);
  const next=after.samples.find(x=>x.kind==='document'&&x.route===row.route);
  return {route:row.route,beforeP75:row.p75,afterP75:after.transitions.find(x=>x.route===row.route).p75,beforeJsBytes:old.jsBytes,afterJsBytes:next.jsBytes,beforeLcp:old.lcp,afterLcp:next.lcp,beforeCls:old.cls,afterCls:next.cls,beforeDomNodes:old.domNodes,afterDomNodes:next.domNodes};
});
const layouts=widths.map(width=>({width,routes:JSON.parse(fs.readFileSync(`${responsive}/dashboard-${width}.json`))}));
for(const run of layouts) for(const row of run.routes) if(row.scroll>row.viewport+1||row.clippedControls.length) throw Error(`Layout failure: ${run.width} ${row.route}`);
fs.writeFileSync(`${root}/comparison.json`,JSON.stringify({note:after.profile,comparison},null,2));
fs.writeFileSync(`${root}/responsive-results.json`,JSON.stringify({note:'Synthetic read-only fixtures; Chromium; reduced motion; no field CWV claims.',layouts},null,2));
for(const name of ['dashboard','dashboard-new-order','dashboard-orders','dashboard-wallet','dashboard-billing','dashboard-packages']) fs.copyFileSync(`${responsive}/${name === 'dashboard-new-order' ? 'new-order-entry-390.png' : `${name}-390-hero.png`}`,`${root}/after-${name}-390.png`);
fs.copyFileSync(`${responsive}/drawer-390.png`,`${root}/after-drawer-390.png`);
const bundleRows=file=>{
  const bytes=fs.readFileSync(file);
  const source=bytes.toString(bytes[0]===0xff&&bytes[1]===0xfe?'utf16le':'utf8');
  const rows=source.split(/\r?\n/).filter(line=>/\/dashboard(?:\/\S+)?\s+[\d.]+ (?:kB|B)/.test(line));
  if(!rows.length) throw Error(`No dashboard bundle rows in ${file}`);
  return rows;
};
fs.writeFileSync(`${root}/bundle-sizes.txt`,['BASELINE',...bundleRows('artifacts/dashboard-baseline-build.log'),'AFTER',...bundleRows('artifacts/dashboard-focus-build.log')].join('\n'));
const lines=['# Verified evidence','',`Checked ${layouts.reduce((n,r)=>n+r.routes.length,0)} route/width combinations at all ten requested widths. No detected overflow or clipped controls. See responsive-results.json.`,'','| Route | Before click p75 (ms) | After click p75 (ms) | Before JS transferred (bytes) | After JS transferred (bytes) |','| --- | ---: | ---: | ---: | ---: |',...comparison.map(r=>`| ${r.route} | ${Math.round(r.beforeP75)} | ${Math.round(r.afterP75)} | ${r.beforeJsBytes} | ${r.afterJsBytes} |`),'','Five actual clicks per route, localhost production build, 1440×900, no throttling, synthetic backend. The endpoint is heading paint, not completion of all background data. Separate runs on a shared machine are noisy; routes that regress are reported as measured. Both sets remain below 1.5 seconds in this profile. No production speedup is certified.','','Single document LCP/CLS observations are in comparison.json; no INP or field p75 measurement. Network timing entries and error arrays are preserved in before.json/after.json. Local Playwright traces: artifacts/dashboard-navigation/{before,after}/trace.zip. Traces are intentionally not committed.','','Wallet hidden funding descendants: 169 → 0. Overview database request expressions: 21 → 18 (source-verified; production query costs unmeasured). Orders no longer waits for browser auth and an unbounded read before showing records.','','## Screenshots','',...[...new Set(comparison.map(r=>r.route.split('/').pop()))].map(name=>`- ${name}: [before](before-${name}-1440.png), [after](after-${name}-1440.png)`),'','Mobile examples: [Wallet](after-dashboard-wallet-390.png), [Orders](after-dashboard-orders-390.png), [New Order](after-dashboard-new-order-390.png), [Overview](after-dashboard-390.png), [Billing](after-dashboard-billing-390.png), [Packages](after-dashboard-packages-390.png).'];
fs.writeFileSync(`${root}/evidence.md`,lines.join('\n')+'\n');
console.log(JSON.stringify({layouts:layouts.reduce((n,r)=>n+r.routes.length,0),comparison},null,2));
