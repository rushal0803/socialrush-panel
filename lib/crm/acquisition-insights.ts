export type AcquisitionDiscoveryRun = {
  status?: string | null;
  search_count?: number | null;
  discovered_count?: number | null;
  staged_count?: number | null;
  invalid_count?: number | null;
  metadata?: unknown;
};

function nonnegativeNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function detail(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

/** Read-only funnel summary; results are search results, not contacted or paying leads. */
export function summarizeAcquisitionDiscovery(runs: AcquisitionDiscoveryRun[]) {
  const result = {
    runs: runs.length,
    searches: 0,
    results: 0,
    candidates: 0,
    invalid: 0,
    zeroSeedRuns: 0,
    fallbackRuns: 0,
    failedRuns: 0,
    yieldPercent: 0,
  };
  for (const run of runs) {
    const data = detail(run.metadata);
    result.searches += nonnegativeNumber(run.search_count);
    result.results += nonnegativeNumber(run.discovered_count);
    result.candidates += nonnegativeNumber(run.staged_count);
    result.invalid += nonnegativeNumber(run.invalid_count);
    if (run.status === "failed" || run.status === "partial") result.failedRuns++;
    if (data.fallback_seed_query) result.fallbackRuns++;
    // Only count a zero-seed run when the provider returned results.
    if (nonnegativeNumber(run.discovered_count) > 0 && Number(data.names_extracted) === 0) result.zeroSeedRuns++;
  }
  result.yieldPercent = result.results
    ? Math.round((result.candidates / result.results) * 1000) / 10
    : 0;
  return result;
}

export function acquisitionAttention(summary: ReturnType<typeof summarizeAcquisitionDiscovery>) {
  if (summary.runs === 0) return "No discovery runs in this period. Check the scheduled job and API configuration.";
  if (summary.zeroSeedRuns > 0) {
    return String(summary.zeroSeedRuns) + " runs had search results but no usable company seeds. Prioritize source quality and official-company matching.";
  }
  if (summary.candidates === 0) return "Discovery produced no new candidate records. Inspect domain resolution and eligibility diagnostics.";
  return "Searches are producing candidates. Improve research quality and track enquiries and paid conversions before increasing volume.";
}
