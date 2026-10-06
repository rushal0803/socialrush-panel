import { buildInternationalSeoSnapshot } from "../lib/seo/international-integrity.ts";

const snapshot = buildInternationalSeoSnapshot();
const failures = [...snapshot.issues];

if (snapshot.summary.markets < 6) {
  failures.push(`expected the six established international markets, found ${snapshot.summary.markets}`);
}

for (const market of snapshot.markets) {
  if (market.serviceCount < 1) {
    failures.push(`${market.hubPath}: market hub has no explicitly published localized service pages`);
  }
}

if (snapshot.xDefaultPolicy.enabled || snapshot.xDefaultPolicy.fallbackPath !== null) {
  failures.push("x-default must remain disabled until a genuinely neutral equivalent fallback page exists");
}

if (failures.length) {
  console.error("Phase 40 international SEO integrity check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `PASS  ${snapshot.summary.markets} markets, ${snapshot.summary.localizedServicePages} localized service pages and ${snapshot.summary.equivalentServiceClusters} reciprocal service clusters are internally consistent.`,
  );
  console.log("PASS  Unsupported country/service combinations remain unpublished and x-default is intentionally withheld.");
}
