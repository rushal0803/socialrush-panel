import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeRecoveryPath, parseRecoveryItem, validateRecoveryStatus,
  recoveryPriorityScore,
} from "../../lib/seo/growth-recovery.ts";

function validInput() {
  return {
    canonical_path: "/buy-instagram-comments-india",
    workstream: "seo",
    issue_type: "discovered_not_indexed",
    priority: "high",
    title: "Review historical Google exclusion",
    details: "Search Console export dated 2026-10-10 flagged this URL.",
    evidence_source: "search_console",
    evidence_date: "2026-10-10",
  };
}

test("accepts a public canonical service URL and dated evidence", () => {
  assert.deepEqual(parseRecoveryItem(validInput()), {
    canonical_path: "/buy-instagram-comments-india",
    workstream: "seo",
    issue_type: "discovered_not_indexed",
    priority: "high",
    title: "Review historical Google exclusion",
    details: "Search Console export dated 2026-10-10 flagged this URL.",
    evidence_source: "search_console",
    evidence_date: "2026-10-10",
  });
});

test("accepts a GEO work item for an existing public content page", () => {
  const item = parseRecoveryItem({
    ...validInput(), canonical_path: "/faq",
    workstream: "geo", issue_type: "ai_answer_readiness",
    evidence_source: "geo_audit", evidence_date: "", details: "",
  });
  assert.equal(item.workstream, "geo");
  assert.equal(item.evidence_date, null);
  assert.equal(item.details, null);
});

test("rejects private, external, encoded, query and traversal paths", () => {
  for (const path of [
    "https://www.getsocialrush.com/services",
    "//attacker.example",
    "/admin/crm", "/api/cron",
    "/dashboard", "/wallet", "/account", "/checkout", "/settings", "/notifications",
    "/services?platform=instagram", "/services#top",
    "/services/../../etc", "/%2Fadmin", "/Services",
  ]) {
    assert.throws(() => normalizeRecoveryPath(path), path);
  }
  assert.equal(normalizeRecoveryPath("/buy-instagram-comments-india/"), "/buy-instagram-comments-india");
});

test("rejects fabricated or future evidence dates and invalid enums", () => {
  assert.throws(() => parseRecoveryItem({ ...validInput(), evidence_date: "2026-02-30" }));
  assert.throws(() => parseRecoveryItem({ ...validInput(), evidence_date: "2099-01-01" }));
  assert.throws(() => parseRecoveryItem({ ...validInput(), workstream: "marketing" }));
  assert.throws(() => parseRecoveryItem({ ...validInput(), priority: "urgent" }));
});

test("requires a meaningful resolution note before closure", () => {
  assert.throws(() => validateRecoveryStatus("verified", ""));
  assert.throws(() => validateRecoveryStatus("closed", "done"));
  assert.equal(validateRecoveryStatus("verified", "Confirmed index status in Google URL Inspection."), "verified");
  assert.equal(validateRecoveryStatus("in_progress", ""), "in_progress");
});

test("keeps urgent recovery work ahead of optional enhancements", () => {
  assert.ok(recoveryPriorityScore("critical") < recoveryPriorityScore("high"));
  assert.ok(recoveryPriorityScore("high") < recoveryPriorityScore("low"));
});
