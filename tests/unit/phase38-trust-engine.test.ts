import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildPublicTrustEvidence, trustClaimGuardrails } from "../../lib/trust/trust-engine.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 38 keeps review proof conditional on permissioned completed-order evidence", () => {
  const withoutReviews = buildPublicTrustEvidence({ hasPermissionedCompletedOrderReviews: false });
  const withReviews = buildPublicTrustEvidence({ hasPermissionedCompletedOrderReviews: true });

  assert.equal(withoutReviews.some((item) => item.kind === "review"), false);
  assert.equal(withReviews.some((item) => item.id === "permissioned-completed-order-reviews"), true);
});

test("Phase 38 public reviews independently enforce completed-order and publication boundaries", () => {
  const source = read("lib/reviews/public.ts");
  assert.match(source, /orders!inner\(platform,service_name,status\)/);
  assert.match(source, /\.eq\("orders\.status", "completed"\)/);
  assert.match(source, /\.eq\("moderation_status", "approved"\)/);
  assert.match(source, /\.eq\("public_permission", true\)/);
  assert.match(source, /\.is\("removal_requested_at", null\)/);
});

test("Phase 38 distributes evidence-backed trust across conversion surfaces", () => {
  const homepage = read("components/marketing/HomepageContent.tsx");
  const servicePage = read("components/marketing/services/IndiaServiceLandingPage.tsx");
  const trustPage = read("app/trust/page.tsx");

  assert.match(homepage, /<TrustEvidencePanel \/>/);
  assert.match(servicePage, /<TrustEvidencePanel tone="light" compact \/>/);
  assert.match(trustPage, /<TrustEvidencePanel \/>/);
});

test("Phase 38 removes the unsupported historical proof component claims", () => {
  const source = read("components/GrowthProof.tsx");
  for (const marker of ["+184%", "3.6x", "96.8%", "2.4x", "99.9% platform availability", "NORTHSTAR"]) {
    assert.equal(source.includes(marker), false);
  }
  assert.match(source, /TrustEvidencePanel/);
});

test("Phase 38 codifies unsupported claim guardrails", () => {
  assert.ok(trustClaimGuardrails.prohibitedWithoutEvidence.includes("guaranteed results"));
  assert.ok(trustClaimGuardrails.prohibitedWithoutEvidence.includes("99.9% platform availability"));
  assert.ok(trustClaimGuardrails.reviewRequirements.includes("completed order"));
  assert.ok(trustClaimGuardrails.reviewRequirements.includes("public display permission"));
});
