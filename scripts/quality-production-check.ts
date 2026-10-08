import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { runProductionQualityMonitor } from "../lib/monitoring/quality.ts";

const outputPath = process.env.QUALITY_REPORT_PATH || join(process.cwd(), "artifacts", "quality-monitor", "report.json");
const snapshot = await runProductionQualityMonitor({
  origin: process.env.QUALITY_BASE_URL || undefined,
});

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(snapshot, null, 2) + "\n", "utf8");

console.log(`SocialRUSH Phase 47 quality monitor: ${snapshot.overall.toUpperCase()}`);
console.log(`Checked ${snapshot.summary.total} signals: ${snapshot.summary.healthy} healthy, ${snapshot.summary.warning} warning, ${snapshot.summary.critical} critical.`);

for (const check of snapshot.checks) {
  const latency = check.latencyMs === null ? "n/a" : `${check.latencyMs}ms`;
  console.log(`${check.state.toUpperCase().padEnd(8)} ${check.label} [${check.target}] ${latency} — ${check.message}`);
}

console.log(`Report: ${outputPath}`);
console.log(snapshot.note);

if (snapshot.overall === "critical") {
  process.exitCode = 1;
}
