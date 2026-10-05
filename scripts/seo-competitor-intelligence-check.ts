import {
  competitorProfiles,
  competitiveOpportunities,
  competitorEvidenceAgeDays,
  competitorReviewWindowDays,
} from "../lib/seo/competitor-intelligence.ts";

const failures: string[] = [];
const competitorIds = new Set<string>();
const domains = new Set<string>();
const evidenceIds = new Set<string>();

for (const competitor of competitorProfiles) {
  if (competitorIds.has(competitor.id)) failures.push(`duplicate competitor id: ${competitor.id}`);
  competitorIds.add(competitor.id);
  if (domains.has(competitor.domain)) failures.push(`duplicate competitor domain: ${competitor.domain}`);
  domains.add(competitor.domain);

  for (const evidence of competitor.evidence) {
    if (evidenceIds.has(evidence.id)) failures.push(`duplicate evidence id: ${evidence.id}`);
    evidenceIds.add(evidence.id);

    let url: URL;
    try {
      url = new URL(evidence.sourceUrl);
    } catch {
      failures.push(`${evidence.id}: invalid source URL`);
      continue;
    }
    if (url.protocol !== "https:") failures.push(`${evidence.id}: source URL must use HTTPS`);
    if (!(url.hostname === competitor.domain || url.hostname.endsWith("." + competitor.domain))) {
      failures.push(`${evidence.id}: source host ${url.hostname} does not match ${competitor.domain}`);
    }
    if (evidence.sourceType !== "competitor-owned") {
      failures.push(`${evidence.id}: only competitor-owned evidence is allowed in the Phase 30 registry`);
    }
    const age = competitorEvidenceAgeDays(evidence.reviewedAt);
    if (!Number.isFinite(age)) failures.push(`${evidence.id}: reviewedAt is invalid`);
    if (age > competitorReviewWindowDays) failures.push(`${evidence.id}: evidence is stale at ${age} days`);

    if (/\b(rank(?:ing)?|traffic|monthly visits|search volume|conversion rate)\b/i.test(evidence.observation)) {
      failures.push(`${evidence.id}: unsupported performance/ranking language is not allowed`);
    }
  }
}

for (const opportunity of competitiveOpportunities) {
  if (!opportunity.socialRushPath.startsWith("/")) {
    failures.push(`${opportunity.id}: SocialRUSH path must be root-relative`);
  }
  for (const competitorId of opportunity.relatedCompetitorIds) {
    if (!competitorIds.has(competitorId)) {
      failures.push(`${opportunity.id}: unknown competitor reference ${competitorId}`);
    }
  }
}

if (failures.length) {
  console.error("Phase 30 competitor intelligence check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`PASS  ${competitorProfiles.length} competitor profiles and ${evidenceIds.size} evidence items are current and internally consistent.`);
}
