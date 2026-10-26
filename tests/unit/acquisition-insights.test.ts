import assert from "node:assert/strict";
import test from "node:test";
import { acquisitionAttention, summarizeAcquisitionDiscovery } from "../../lib/crm/acquisition-insights.ts";

test("discovery funnel counts invalid search results without treating them as customers", () => {
  const results = summarizeAcquisitionDiscovery([
    { status: "completed", search_count: 1, discovered_count: 10, staged_count: 0, invalid_count: 10, metadata: { names_extracted: 0 } },
    { status: "completed", search_count: 3, discovered_count: 20, staged_count: 3, invalid_count: 15, metadata: { names_extracted: 2, fallback_seed_query: "India startups" } },
  ]);
  assert.deepEqual(results, {
    runs: 2, searches: 4, results: 30, candidates: 3, invalid: 25, zeroSeedRuns: 1, fallbackRuns: 1, failedRuns: 0, yieldPercent: 10,
  });
  assert.match(acquisitionAttention(results), /zero|no usable company/i);
});
test("no-runs and missing metadata are handled safely without division by zero", () => {
  const empty = summarizeAcquisitionDiscovery([]);
  assert.equal(empty.yieldPercent, 0);
  assert.match(acquisitionAttention(empty), /No discovery runs/);
  const incomplete = summarizeAcquisitionDiscovery([{ status: "partial", metadata: null }]);
  assert.equal(incomplete.failedRuns, 1);
  assert.equal(incomplete.zeroSeedRuns, 0);
  assert.equal(incomplete.results, 0);
});
test("zero seeds are only counted for a run that actually received search results", () => {
  const result = summarizeAcquisitionDiscovery([{ discovered_count: 0, metadata: { names_extracted: 0 } }]);
  assert.equal(result.zeroSeedRuns, 0);
});
