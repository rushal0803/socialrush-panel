import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  competitorProfiles,
  competitiveOpportunities,
  buildCompetitorIntelligenceSnapshot,
} from "../../lib/seo/competitor-intelligence.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 30 keeps competitor research evidence-backed and internal", () => {
  assert.ok(competitorProfiles.length >= 4);
  for (const competitor of competitorProfiles) {
    assert.ok(competitor.evidence.length >= 1);
    for (const evidence of competitor.evidence) {
      assert.equal(evidence.sourceType, "competitor-owned");
      assert.match(evidence.sourceUrl, /^https:\/\//);
    }
  }
  const page = read("app/admin/seo/competitors/page.tsx");
  assert.match(page, /Competitor Intelligence Command Center/);
  assert.match(page, /internal research notes/i);
});

test("Phase 30 records opportunities without claiming rankings or traffic", () => {
  assert.ok(competitiveOpportunities.some((item) => item.status === "socialrush-advantage"));
  assert.ok(competitiveOpportunities.some((item) => item.status === "opportunity"));
  const source = read("lib/seo/competitor-intelligence.ts");
  assert.match(source, /not rankings, traffic estimates, quality guarantees or endorsements/);
  assert.doesNotMatch(source, /monthly visits|search volume|#1 competitor/i);
});

test("Phase 30 snapshot tracks stale evidence explicitly", () => {
  const snapshot = buildCompetitorIntelligenceSnapshot(new Date("2026-10-05T12:00:00Z"));
  assert.equal(snapshot.summary.staleEvidence, 0);
  assert.equal(snapshot.reviewedCompetitors, competitorProfiles.length);
});

test("Phase 30 checker validates evidence freshness and ownership", () => {
  const checker = read("scripts/seo-competitor-intelligence-check.ts");
  assert.match(checker, /evidence is stale/);
  assert.match(checker, /source host/);
  assert.match(checker, /unsupported performance\/ranking language/);
});
