# Weekly SEO monitor recovery — 8 November 2026

## Confirmed failure

The latest four scheduled runs failed: 41438214991, 40298501028, 39228635352 and 38241547656. Inspected the latest run's actual steps and log: Node 20 rejected `--experimental-strip-types` at keyword ownership with exit code 9. The preceding production health and full-sitemap checks passed, but ten subsequent checks were skipped. A green sitemap check did not establish a complete monitoring run.

## Change

Use Node 24 LTS, which supports the existing TypeScript commands. Run independent checks unless the workflow is cancelled, preserving each failure as a failed step and job. Capture each command's output with Bash pipefail and retain all available logs for 14 days even on failure. No continue-on-error, write credentials, deployment, indexing submissions or production mutations are added. Existing weekly schedule and checks remain intact.

## Validation

All eight TypeScript monitoring commands ran successfully on Node 24.22.1 locally. A fresh production full-sitemap audit passed 174/174 checks with zero warnings (172 page URLs plus two sitemap assertions). This checks public technical signals, not Google indexing or AI citations. Node fetch in this managed environment requires NODE_USE_ENV_PROXY=1; that local networking requirement is not injected into GitHub-hosted runners.

The draft PR and manually dispatched branch workflow must supply exact-head hosted evidence before release. CI and Vercel results are recorded in the PR description after completion. No application code changes; previous application smoke/build results cannot substitute for this branch's checks.

## Performance triage (read-only)

The existing aggregate mixed public and private pages. Last-28-day stored mobile service-detail navigate events at release 35fcaf731447 show LCP p75 2292ms (970 events), TTFB 978.5ms (1026), INP 192ms (566), CLS 0.0002 (819). Mobile admin-orders back-forward shows LCP 4638ms (215 events), TTFB 4193ms (228), CLS 0.1933 (166). These observational cohorts do not establish causality, exclude all bots, or prove a CrUX pass.

Priority public page cohorts, same release/device/navigation/window:

| Page | LCP p75 ms (events) | TTFB p75 ms (events) | INP p75 ms (events) |
|---|---|---|---|
| Instagram Followers India | 2148 (266) | 972.75 (280) | 208 (137) |
| Instagram Likes | 2342 (116) | 1153.25 (124) | 168 (63) |
| YouTube Subscribers | 2380 (365) | 1022.5 (387) | 184 (227) |
| YouTube Views | 1650 (8) | 703 (9) | 162 (8) |
| LinkedIn Followers | 1918 (12) | 544 (13) | 120 (6) |

LinkedIn and YouTube Views have small samples. Instagram Followers interaction traces are the next justified performance investigation; no speculative caching, auth, catalog or checkout changes are included. No before/after improvement is claimed.

## Safety and remaining work

PR #744 remains draft at 2736c825f92970f1bfbbf410f6f781ad8bf2d9be. Its exact-head workflow 42465642518 executed browser smoke and customer fixture checks successfully; optional visual/performance checks were skipped. Protected Vercel preview dpl_5pEgXQiNU2fd7zTdnMwHLdYdhCSD matches that source SHA. Authenticated HTML verification of the priority pages is separate from mobile visual QA and real-order validation. Existing consolidated draft #747 remains the proposed foundation candidate; this workflow repair is separate and does not silently expand that release.

Branch-protection required-check configuration could not be read: GitHub integration returned HTTP 403. Report observed check conclusions without claiming knowledge of every owner-configured release requirement. Google/Bing indexing, query demand, AI citations and clean organic paid-order revenue remain unverified. All changes remain draft and require explicit owner approval to merge. No production, payment, order, catalog, database or crawler-policy changes.
