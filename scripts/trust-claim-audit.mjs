#!/usr/bin/env node
import { readFileSync } from "node:fs";

const failures = [];
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

const publicSources = [
  "components/GrowthProof.tsx",
  "components/marketing/HomepageContent.tsx",
  "components/marketing/PremiumHomepage.tsx",
  "components/marketing/services/IndiaServiceLandingPage.tsx",
  "components/marketing/trust/TrustEvidencePanel.tsx",
  "app/trust/page.tsx",
];

const unsupportedHistoricalMarkers = [
  "+184%",
  "3.6x",
  "96.8%",
  "2.4x",
  "99.9% platform availability",
  "NORTHSTAR",
  "VELOCE",
  "LUMEN",
  "ARCSTONE",
  "NOVALABS",
  "MOTION",
];

for (const path of publicSources) {
  const source = read(path);
  for (const marker of unsupportedHistoricalMarkers) {
    if (source.includes(marker)) {
      failures.push(`${path}: unsupported historical proof marker returned: ${marker}`);
    }
  }
}

const reviews = read("lib/reviews/public.ts");
for (const required of [
  'orders!inner(platform,service_name,status)',
  '.eq("moderation_status", "approved")',
  '.eq("public_permission", true)',
  '.eq("orders.status", "completed")',
  '.is("removal_requested_at", null)',
]) {
  if (!reviews.includes(required)) failures.push(`lib/reviews/public.ts: missing public-review proof boundary: ${required}`);
}

const trustPanel = read("components/marketing/trust/TrustEvidencePanel.tsx");
if (!trustPanel.includes("hasPermissionedCompletedOrderReviews: reviews.length > 0")) {
  failures.push("TrustEvidencePanel: review evidence must remain conditional on live permissioned completed-order reviews.");
}

const proofContent = read("lib/trust/proof-content.ts");
if (!proofContent.includes("verifiedCustomerReviews: VerifiedCustomerReview[] = []")) {
  failures.push("proof-content: verified review placeholder must stay empty until evidence is explicitly provided.");
}
if (!proofContent.includes("anonymizedCaseStudies: AnonymizedCaseStudy[] = []")) {
  failures.push("proof-content: case-study placeholder must stay empty until evidence is explicitly provided.");
}

if (failures.length) {
  console.error("Phase 38 trust-claim audit failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log("PASS  Trust surfaces use evidence-backed claims and completed-order review boundaries.");
}
