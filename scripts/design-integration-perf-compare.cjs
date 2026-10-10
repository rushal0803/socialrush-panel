// Synthetic same-run comparisons are directional only, never field CWV.
const fs = require("node:fs");
const path = require("node:path");
const dir = "artifacts/integration-perf";
const baseline = JSON.parse(fs.readFileSync(path.join(dir,"main.json"),"utf8"));
const candidate = JSON.parse(fs.readFileSync(path.join(dir,"candidate.json"),"utf8"));
const fmt = n => n == null ? "—" : Math.round(n * 10) / 10;
const lookup = rows => new Map(rows.map(row=>[row.key,row]));
const old = lookup(baseline.summary);
const current = lookup(candidate.summary);
const focus = ["lcp","ttfb","jsBytes","transitionMs"];
const names = {lcp:"LCP (ms)",ttfb:"TTFB (ms)",jsBytes:"JS transfer bytes",transitionMs:"Navigation (ms)"};
const lines = [
"# SocialRUSH integrated redesign — paired lab comparison",
"",
"Same Ubuntu GitHub Actions runner, Node "+candidate.environment.node+", Chromium "+candidate.environment.browser+".",
"Baseline commit: "+baseline.sourceCommit+"; candidate: "+candidate.sourceCommit+".",
"",
"All measurements use the isolated fixture backend, not real Supabase or field data. Each value below is a median of "+candidate.runs+" simulated runs. Do not interpret the three-run sample as a statistical conclusion or Core Web Vitals p75.",
"",
"| Profile / route / cache | Metric | Main | Integrated | Change |",
"|---|---|---:|---:|---:|",
];
const watch=[];
for(const [key,row] of current){
 const prev=old.get(key);if(!prev) continue;
 for(const metric of focus){
   const a=prev[metric]?.median,b=row[metric]?.median;
   if(typeof a!=="number"||typeof b!=="number")continue;
   const diff=a!==0?(100*(b-a)/a):null;
   lines.push("| "+key+" | "+names[metric]+" | "+fmt(a)+" | "+fmt(b)+" | "+(diff===null?"—":((diff>0?"+":"")+fmt(diff)+"%"))+" |");
   if(metric==="lcp" && a>0 && diff>15)watch.push(key+": LCP +"+fmt(diff)+"%");
 }
}
lines.push("","## Manual review items");
if(watch.length)lines.push(...watch.map(x=>"- Investigate: "+x));
else lines.push("- No sampled route exceeded +15% median LCP in the paired lab (not proof of performance parity).");
lines.push("- Verify generated marketing screens and admin UI screenshots; inspect navigation text and touch targets.","- Before release, monitor real-user LCP/INP/CLS by template/device after a controlled rollout.","- Do not touch live wallet/payment/order systems.","");
fs.writeFileSync(path.join(dir,"summary.md"),lines.join("\n"));
console.log(lines.slice(0,8).join("\n"));
